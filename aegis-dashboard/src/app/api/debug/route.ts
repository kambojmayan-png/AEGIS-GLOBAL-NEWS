import { NextResponse } from 'next/server';

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEWS_API_KEY: process.env.NEWS_API_KEY
        ? `✅ SET (${process.env.NEWS_API_KEY.slice(0, 8)}...${process.env.NEWS_API_KEY.slice(-4)})`
        : '❌ NOT SET',
      GROQ_API_KEY: process.env.GROQ_API_KEY
        ? `✅ SET (${process.env.GROQ_API_KEY.slice(0, 8)}...${process.env.GROQ_API_KEY.slice(-4)})`
        : '❌ NOT SET',
    },
    newsapi_india: null as unknown,
    newsapi_us: null as unknown,
    groq: null as unknown,
  };

  const newsKey = process.env.NEWS_API_KEY;

  // ── Test NewsAPI: India ───────────────────────────────────────────────────
  if (newsKey) {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?country=in&pageSize=3&apiKey=${newsKey}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        results.newsapi_india = {
          status: '✅ WORKING',
          totalResults: data.totalResults,
          articles: data.articles?.slice(0, 3).map((a: { title: string; source: { name: string } }) => ({
            title: a.title?.slice(0, 80),
            source: a.source?.name,
          })),
        };
      } else {
        results.newsapi_india = {
          status: '❌ FAILED',
          httpCode: res.status,
          error: data.message || data.code,
          fix: res.status === 426
            ? 'Free key blocked on non-localhost — use localhost:3000 only'
            : res.status === 401
            ? 'Invalid API key'
            : res.status === 429
            ? '100 req/day limit hit — wait until tomorrow'
            : 'Unknown error',
        };
      }
    } catch (e) {
      results.newsapi_india = { status: '❌ NETWORK ERROR', error: String(e) };
    }

    // ── Test NewsAPI: USA ─────────────────────────────────────────────────
    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=3&apiKey=${newsKey}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        results.newsapi_us = {
          status: '✅ WORKING',
          totalResults: data.totalResults,
          articles: data.articles?.slice(0, 3).map((a: { title: string; source: { name: string } }) => ({
            title: a.title?.slice(0, 80),
            source: a.source?.name,
          })),
        };
      } else {
        results.newsapi_us = {
          status: '❌ FAILED',
          httpCode: res.status,
          error: data.message || data.code,
        };
      }
    } catch (e) {
      results.newsapi_us = { status: '❌ NETWORK ERROR', error: String(e) };
    }
  } else {
    results.newsapi_india = { status: '❌ KEY NOT SET' };
    results.newsapi_us = { status: '❌ KEY NOT SET' };
  }

  // ── Test Groq ─────────────────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Reply with exactly: AEGIS_GROQ_OK' }],
        }),
        cache: 'no-store' as RequestCache,
      });

      const data = await res.json();
      if (res.ok && data.choices?.[0]?.message?.content) {
        results.groq = {
          status: '✅ WORKING',
          model: 'llama-3.3-70b-versatile',
          response: data.choices[0].message.content.trim(),
          tokensUsed: data.usage?.total_tokens,
        };
      } else {
        results.groq = {
          status: '❌ FAILED',
          httpCode: res.status,
          error: data?.error?.message || JSON.stringify(data?.error ?? {}),
          fix: res.status === 401
            ? 'Invalid Groq key — get one at console.groq.com'
            : res.status === 429
            ? 'Rate limit — wait 1 min (30 RPM)'
            : 'Unknown error',
        };
      }
    } catch (e) {
      results.groq = { status: '❌ NETWORK ERROR', error: String(e) };
    }
  } else {
    results.groq = { status: '❌ KEY NOT SET' };
  }

  return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
}
