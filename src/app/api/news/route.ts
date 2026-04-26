import { NextRequest, NextResponse } from 'next/server';
import { fetchGlobalHeadlines, fetchCountryHeadlines, fetchStateNews } from '@/lib/newsapi';
import { getMockArticles } from '@/lib/mock-data';
import { COUNTRIES } from '@/data/countries';

/**
 * Cache strategy:
 *   - Successful live fetch  → 6-hour TTL (don't re-burn quota)
 *   - Rate-limited response  → 30-min TTL (retry when quota resets)
 *   - Error / empty          → 5-min TTL (retry soon)
 */
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const TTL_SUCCESS     = 6  * 60 * 60 * 1000;  // 6 hours
const TTL_RATELIMITED = 30 * 60 * 1000;        // 30 min
const TTL_ERROR       = 5  * 60 * 1000;        // 5 min

export async function GET(request: NextRequest) {
  const sp       = request.nextUrl.searchParams;
  const country  = sp.get('country')?.toUpperCase() || '';
  const state    = sp.get('state') || '';
  const category = sp.get('category') || '';
  const bust     = sp.get('bust') === '1';

  const cacheKey = `${country}|${state}|${category}`;
  if (bust) { delete cache[cacheKey]; }

  const cached = cache[cacheKey];
  if (cached) {
    const age = Date.now() - cached.timestamp;
    const data = cached.data as Record<string, unknown>;
    // Use the TTL stored on the cache entry itself
    const ttl = (data._ttl as number) ?? TTL_SUCCESS;
    if (age < ttl) {
      console.log(`[news] cache HIT (${Math.round(age / 1000)}s old): ${cacheKey}`);
      return NextResponse.json({ ...(cached.data as object), fromCache: true });
    }
  }

  console.log(`[news] cache MISS → fetch: ${cacheKey}`);
  const countryName = country ? (COUNTRIES[country]?.name ?? country) : '';

  try {
    let result;
    if (state && country) {
      result = await fetchStateNews(state, country, countryName);
    } else if (country) {
      result = await fetchCountryHeadlines(country, countryName, category || undefined);
    } else {
      result = await fetchGlobalHeadlines(category || undefined);
    }

    // ── Rate limited? Serve country-specific mock with amber warning ────────────
    const isRateLimited =
      result.status === 'rateLimited' ||
      (result as unknown as { rateLimited?: boolean }).rateLimited === true;


    if (isRateLimited) {
      console.warn(`[news] 429 rate limited → serving mock for ${country}`);
      const mockArticles = getMockArticles(country || 'US');
      const mockData = {
        country:      country || 'GLOBAL',
        state:        state || null,
        countryName:  countryName || 'Global',
        articles:     mockArticles,
        source:       'mock',
        totalResults: mockArticles.length,
        filterInfo: {
          fetched: 0, scored: 0, aiValidated: false, threshold: 0, fallback: true,
          message: `⚠️ Live news paused (rate limit) — showing cached news for ${countryName}`,
        },
        _ttl: TTL_RATELIMITED,
      };
      cache[cacheKey] = { data: mockData, timestamp: Date.now() };
      return NextResponse.json(mockData);
    }

    // ── Map articles to frontend shape ──────────────────────────────────────────
    const mappedArticles = result.articles.map((a) => ({
      title:        a.title,
      description:  a.description  || '',
      content:      a.content      || '',
      url:          a.url,
      image:        a.urlToImage,
      publishedAt:  a.publishedAt,
      source:       { name: a.source?.name || 'Unknown', url: a.url },
      _score:       a._score,
      _aiValidated: a._aiValidated,
    }));

    const ttl         = mappedArticles.length > 0 ? TTL_SUCCESS : TTL_ERROR;
    const responseData = {
      country:      country || 'GLOBAL',
      state:        state || null,
      countryName:  countryName || 'Global',
      articles:     mappedArticles,
      source:       mappedArticles.length > 0 ? 'newsapi' : 'empty',
      totalResults: result.totalResults,
      filterInfo:   result.filterInfo,
      _ttl:         ttl,
    };

    cache[cacheKey] = { data: responseData, timestamp: Date.now() };
    console.log(`[news] → ${mappedArticles.length} articles | ${result.filterInfo?.message ?? ''}`);
    return NextResponse.json(responseData);

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[news] EXCEPTION for ${cacheKey}:`, msg);

    // On exception, serve mock rather than blank screen
    const mockArticles = getMockArticles(country || 'US');
    return NextResponse.json({
      country:      country || 'GLOBAL',
      state:        state || null,
      countryName,
      articles:     mockArticles,
      source:       'mock',
      totalResults: mockArticles.length,
      filterInfo: {
        fetched: 0, scored: 0, aiValidated: false, threshold: 0, fallback: true,
        message: `Error: ${msg}`,
      },
    });
  }
}
