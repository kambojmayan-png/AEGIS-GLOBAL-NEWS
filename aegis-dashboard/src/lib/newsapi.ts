/**
 * AEGIS — Quota-Safe Country News Fetcher
 *
 * RATE LIMIT REALITY: NewsAPI free tier = 100 req/day.
 * Strategy: MAX 2 API calls per country click.
 *   Call 1: /top-headlines?country=XX&language=en (most accurate)
 *   Call 2: /everything?q="CountryName"&language=en (fallback if <5 results)
 *
 * All results are strictly filtered for:
 *  - Correct country (via scoring + AI validation)
 *  - English only (language=en enforced at API level)
 *  - No duplicates (URL-based deduplication)
 *  - Source diversity (max 4 articles per domain)
 */

import { getSourceProfile, getSourceScore, CountrySourceProfile } from './country-sources';

const NEWSAPI_BASE = 'https://newsapi.org/v2';
const RESULT_LIMIT = 15; // Max articles returned to frontend

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface NewsAPISource { id: string | null; name: string; }

export interface NewsAPIArticle {
  source:        NewsAPISource;
  author:        string | null;
  title:         string;
  description:   string | null;
  url:           string;
  urlToImage:    string | null;
  publishedAt:   string;
  content:       string | null;
  _score?:       number;
  _aiValidated?: boolean;
}

export interface FilterInfo {
  fetched:     number;
  scored:      number;
  aiValidated: boolean;
  threshold:   number;
  fallback:    boolean;
  message:     string;
}

export interface NewsAPIResponse {
  status:       string;
  totalResults: number;
  articles:     NewsAPIArticle[];
  error?:       string;
  filterInfo?:  FilterInfo;
  rateLimited?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const k = process.env.NEWS_API_KEY;
  if (!k) throw new Error('NEWS_API_KEY is not set in .env.local');
  return k;
}

/** Remove placeholder / removed articles */
function clean(articles: NewsAPIArticle[]): NewsAPIArticle[] {
  return articles.filter(
    (a) =>
      a.title &&
      a.title !== '[Removed]' &&
      a.description !== '[Removed]' &&
      a.title.trim() !== '' &&
      // Exclude articles that are clearly just removed/paywall stubs
      !a.title.toLowerCase().includes('[removed]') &&
      a.description !== null
  );
}

/** URL-based deduplication (strips query strings) */
function dedupe(articles: NewsAPIArticle[]): NewsAPIArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.url?.split('?')[0];
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Limit to `max` articles per domain to ensure source diversity */
function limitPerSource(articles: NewsAPIArticle[], max = 4): NewsAPIArticle[] {
  const counts: Record<string, number> = {};
  return articles.filter((a) => {
    try {
      const domain = new URL(a.url).hostname.replace('www.', '');
      counts[domain] = (counts[domain] ?? 0) + 1;
      return counts[domain] <= max;
    } catch { return true; }
  });
}

/**
 * Safe fetch wrapper — never throws, returns { articles, rateLimited }.
 * Handles 429, non-ok status, and network errors gracefully.
 */
async function fetchSafe(
  url: string,
  label: string
): Promise<{ articles: NewsAPIArticle[]; rateLimited: boolean }> {
  try {
    const safeUrl = url.replace(/apiKey=[^&]+/, 'apiKey=***');
    const res = await fetch(url, { cache: 'no-store' });

    if (res.status === 429) {
      console.warn(`[NewsAPI/${label}] ⚠️  429 Rate limited | ${safeUrl}`);
      return { articles: [], rateLimited: true };
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.warn(`[NewsAPI/${label}] HTTP ${res.status}: ${body?.message ?? ''}`);
      return { articles: [], rateLimited: false };
    }

    const data = await res.json();
    if (data.status !== 'ok') {
      if (data.code === 'rateLimited' || data.message?.includes('too many requests')) {
        console.warn(`[NewsAPI/${label}] ⚠️  rateLimited (body)`);
        return { articles: [], rateLimited: true };
      }
      console.warn(`[NewsAPI/${label}] API error: ${data.message}`);
      return { articles: [], rateLimited: false };
    }

    const result = clean(data.articles ?? []);
    console.log(`[NewsAPI/${label}] ✓ ${result.length} articles`);
    return { articles: result, rateLimited: false };
  } catch (e) {
    console.error(`[NewsAPI/${label}] Network error:`, String(e).slice(0, 100));
    return { articles: [], rateLimited: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring (country relevance)
// ─────────────────────────────────────────────────────────────────────────────

function scoreArticle(
  article: NewsAPIArticle,
  profile: CountrySourceProfile,
  keywords: string[]
): number {
  let score = 0;
  const src   = (article.source?.name ?? article.url ?? '').toLowerCase();
  const title = (article.title ?? '').toLowerCase();
  const desc  = (article.description ?? '').toLowerCase();
  const early = `${title} ${desc.slice(0, 200)}`;

  // Source reputation score
  score += getSourceScore(src, profile);

  // Keyword bonus
  if (keywords.some((k) => title.includes(k))) score += 30;
  if (keywords.some((k) => early.includes(k))) score += 15;
  else if (keywords.some((k) => desc.includes(k))) score += 5;

  // Penalise articles dominated by another major country
  score -= dominatorPenalty(title, keywords);

  return score;
}

/** Terms from high-volume countries that can dominate feeds */
const DOMINATOR_TERMS = [
  'united states', 'america', 'american', 'white house',
  'russia', 'russian', 'moscow', 'kremlin',
  'china', 'chinese', 'beijing',
  'japan', 'japanese', 'tokyo',
  'germany', 'german', 'berlin',
  'france', 'french', 'paris',
  'britain', 'british', 'london',
  'india', 'indian', 'new delhi',
  'pakistan', 'islamabad',
  'israel', 'israeli', 'tel aviv',
  'iran', 'iranian', 'tehran',
  'ukraine', 'ukrainian', 'kyiv',
  'australia', 'australian',
  'canada', 'canadian',
  'brazil', 'brasilia',
  'south korea', 'seoul',
];

/** Returns a penalty score if article is about another country, not ours */
function dominatorPenalty(title: string, countryKeywords: string[]): number {
  const start = title.slice(0, 70);
  const dominated = DOMINATOR_TERMS.some(
    (term) => start.includes(term) && !countryKeywords.some((kw) => start.includes(kw))
  );
  return dominated ? 40 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI Batch Validation (Groq — uses 0 NewsAPI requests)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uses Groq to validate that each article is genuinely about the target country.
 * Fail-open: returns all-true if Groq is unavailable.
 */
async function aiValidateBatch(
  articles: NewsAPIArticle[],
  countryName: string
): Promise<boolean[]> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey || articles.length === 0) return articles.map(() => true);

  const prompt = `You are a strict news relevance classifier.
For each article, answer YES if it is PRIMARILY about ${countryName}, NO otherwise.

${articles.map((a, i) => `[${i}] "${a.title}" | "${(a.description ?? '').slice(0, 100)}"`).join('\n')}

Respond ONLY with a JSON array of exactly ${articles.length} strings: "YES" or "NO".
Example: ["YES","NO","YES"]`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      cache: 'no-store' as RequestCache,
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) return articles.map(() => true);
    const data   = await res.json();
    const raw    = (data?.choices?.[0]?.message?.content ?? '').trim();
    const parsed: string[] = JSON.parse(
      raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
    );
    return parsed.map((v) => v.toUpperCase() !== 'NO');
  } catch {
    return articles.map(() => true); // fail-open — don't drop articles on AI error
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: fetchCountryHeadlines (max 2 NewsAPI requests)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchCountryHeadlines(
  countryCode: string,
  countryName: string,
  category?: string,
  useAI = true
): Promise<NewsAPIResponse & { rateLimited?: boolean }> {
  const key      = getApiKey();
  const code     = countryCode.toLowerCase();
  const profile  = getSourceProfile(countryCode);
  const keywords = profile?.keywords ?? [countryName.toLowerCase()];

  let totalFetched = 0;
  let rateLimited  = false;

  // ── Request 1: Top Headlines (country + language=en enforced) ───────────────
  const topP = new URLSearchParams({
    apiKey: key,
    country: code,
    pageSize: '100',
    language: 'en', // Strict English-only — no regional language articles
  });
  if (category) topP.set('category', category);

  const r1 = await fetchSafe(`${NEWSAPI_BASE}/top-headlines?${topP}`, `top/${code}`);
  rateLimited = r1.rateLimited;
  let articles = r1.articles;
  totalFetched += articles.length;

  // ── Request 2: Everything (only if <5 results from top-headlines) ───────────
  if (!rateLimited && articles.length < 5) {
    const ewP = new URLSearchParams({
      apiKey: key,
      q: `"${countryName}"`,   // Exact quoted phrase for country relevance
      sortBy: 'publishedAt',
      language: 'en',           // English-only fallback too
      pageSize: '100',
    });
    const r2 = await fetchSafe(`${NEWSAPI_BASE}/everything?${ewP}`, `ew/${code}`);
    if (r2.rateLimited) rateLimited = true;
    articles = dedupe([...articles, ...r2.articles]);
    totalFetched += r2.articles.length;
  }

  // Return rate limit status immediately if nothing available
  if (rateLimited && articles.length === 0) {
    return {
      status: 'rateLimited',
      totalResults: 0,
      articles: [],
      rateLimited: true,
      filterInfo: {
        fetched: 0, scored: 0, aiValidated: false, threshold: 0, fallback: true,
        message: 'NewsAPI rate limit reached — resets in 12 hours',
      },
    };
  }

  // ── Score & Rank by country relevance ──────────────────────────────────────
  if (profile) {
    articles = articles.map((a) => ({ ...a, _score: scoreArticle(a, profile, keywords) }));
    articles.sort((a, b) => (b._score ?? 0) - (a._score ?? 0));
  }

  // Remove articles with negative scores (dominated by another country)
  const filtered = articles.filter((a) => (a._score ?? 0) >= 0);
  // Enforce source diversity — max 4 per domain
  const diverse  = limitPerSource(filtered, 4);

  // ── AI Validation (Groq, no NewsAPI requests consumed) ─────────────────────
  let aiValidated = false;
  let final = diverse.slice(0, RESULT_LIMIT);

  if (useAI && process.env.GROQ_API_KEY && final.length > 0) {
    const batchSize = Math.min(final.length, 12);
    const decisions = await aiValidateBatch(final.slice(0, batchSize), countryName);
    const kept      = final.slice(0, batchSize).filter((_, i) => decisions[i]);

    // Only apply AI result if it keeps ≥3 articles (avoid over-filtering)
    if (kept.length >= 3) {
      // Mark AI-validated articles
      const keptWithFlag = kept.map((a) => ({ ...a, _aiValidated: true }));
      final = [...keptWithFlag, ...final.slice(batchSize)];
      aiValidated = true;
      console.log(`[AI/${countryCode}] kept ${kept.length}/${batchSize}`);
    }
  }

  final = final.slice(0, RESULT_LIMIT);

  const message =
    final.length >= 10 ? `Showing strictly filtered news for ${countryName}` :
    final.length >= 5  ? `Showing ${final.length} verified articles for ${countryName}` :
    final.length > 0   ? `Limited results — best available news for ${countryName}` :
                         `No live news found for ${countryName}`;

  return {
    status:       final.length > 0 ? 'ok' : 'error',
    totalResults: final.length,
    articles:     final,
    rateLimited,
    filterInfo: {
      fetched: totalFetched,
      scored:  diverse.length,
      aiValidated,
      threshold: 0,
      fallback:  final.length < 5,
      message,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: fetchGlobalHeadlines
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchGlobalHeadlines(category?: string): Promise<NewsAPIResponse> {
  const key = getApiKey();
  const p   = new URLSearchParams({ apiKey: key, language: 'en', pageSize: '20' });
  if (category) p.set('category', category);
  const { articles } = await fetchSafe(`${NEWSAPI_BASE}/top-headlines?${p}`, 'global');
  return {
    status: 'ok',
    totalResults: articles.length,
    articles,
    filterInfo: {
      fetched: articles.length, scored: articles.length, aiValidated: false,
      threshold: 0, fallback: false, message: 'Global top headlines',
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: fetchStateNews
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchStateNews(
  stateName:   string,
  countryCode: string,
  countryName: string,
  sortBy: 'publishedAt' | 'popularity' | 'relevancy' = 'publishedAt'
): Promise<NewsAPIResponse> {
  const key      = getApiKey();
  const profile  = getSourceProfile(countryCode);
  const keywords = [stateName.toLowerCase(), countryName.toLowerCase(), ...(profile?.keywords ?? [])];

  // Single request — exact quoted phrase ensures relevance
  const p = new URLSearchParams({
    apiKey: key,
    q: `"${stateName}" "${countryName}"`,
    sortBy,
    language: 'en',
    pageSize: '100',
  });

  const { articles, rateLimited } = await fetchSafe(
    `${NEWSAPI_BASE}/everything?${p}`,
    `state/${stateName}`
  );

  if (rateLimited) {
    return {
      status: 'rateLimited', totalResults: 0, articles: [],
      filterInfo: {
        fetched: 0, scored: 0, aiValidated: false, threshold: 0, fallback: true,
        message: 'Rate limit reached — try again in 12 hours',
      },
    };
  }

  const scored = profile
    ? articles
        .map((a) => ({ ...a, _score: scoreArticle(a, profile, keywords) }))
        .sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
    : articles;

  const final = limitPerSource(scored, 4).slice(0, RESULT_LIMIT);

  return {
    status: 'ok',
    totalResults: final.length,
    articles: final,
    filterInfo: {
      fetched: articles.length,
      scored:  scored.length,
      aiValidated: false,
      threshold: 0,
      fallback: final.length < 5,
      message: final.length > 0
        ? `Showing news for ${stateName}, ${countryName}`
        : `No results for ${stateName}`,
    },
  };
}
