import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/article-summary
 * On-demand per-article AI summarization.
 * Provider chain: Groq (Llama 3.3 70B) → Gemini → description fallback
 * Uses 15-minute in-memory cache to reduce API consumption.
 */

const cache: Record<string, { data: unknown; ts: number }> = {};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content } = body as {
      title: string;
      description?: string;
      content?: string;
    };

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Article title is required' }, { status: 400 });
    }

    // Cache check (keyed on title)
    const cacheKey = `summary::${title.slice(0, 120)}`;
    const cached   = cache[cacheKey];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ ...(cached.data as object), cached: true });
    }

    // Compose the article text for the prompt
    const articleText = [
      `Title: ${title}`,
      description ? `Description: ${description}` : '',
      content     ? `Content excerpt: ${content.substring(0, 800)}` : '',
    ].filter(Boolean).join('\n');

    // ── Provider 1: Groq (Llama 3.3 70B) ────────────────────────────────────
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 350,
            messages: [
              {
                role: 'system',
                content:
                  'You are a concise news analyst. Summarize news articles in exactly 3-5 sentences. ' +
                  'Focus on key facts, who is involved, and why it matters globally. ' +
                  'Write in plain English — no bullet points, no markdown.',
              },
              {
                role: 'user',
                content: `Summarize this news article in 3-5 sentences:\n\n${articleText}`,
              },
            ],
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const summary  = groqData?.choices?.[0]?.message?.content?.trim();
          if (summary) {
            const result = { summary, aiPowered: true, model: 'llama-3.3-70b-versatile', provider: 'Groq' };
            cache[cacheKey] = { data: result, ts: Date.now() };
            return NextResponse.json(result);
          }
        } else {
          const err = await groqRes.json().catch(() => ({}));
          console.warn('[article-summary] Groq error:', groqRes.status, err?.error?.message ?? '');
        }
      } catch (e) {
        console.warn('[article-summary] Groq fetch error:', String(e).slice(0, 80));
      }
    }

    // ── Provider 2: Gemini fallback ──────────────────────────────────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const genai    = new GoogleGenAI({ apiKey: geminiKey });
        const prompt   = `Summarize this news article in 3–5 concise sentences. Plain text only, no markdown.\n\n${articleText}`;
        const response = await genai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
        const summary  = response.text?.trim();
        if (summary) {
          const result = { summary, aiPowered: true, model: 'gemini-2.0-flash', provider: 'Gemini' };
          cache[cacheKey] = { data: result, ts: Date.now() };
          return NextResponse.json(result);
        }
      } catch (e) {
        console.warn('[article-summary] Gemini error:', String(e).slice(0, 80));
      }
    }

    // ── Fallback: truncated description ─────────────────────────────────────
    const fallback = description
      ? description.substring(0, 400)
      : 'AI summary unavailable. Add GROQ_API_KEY to .env.local for Groq-powered summaries.';

    return NextResponse.json({
      summary:    fallback,
      aiPowered:  false,
      model:      'none',
      provider:   'fallback',
    });

  } catch (error) {
    console.error('[article-summary] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Summarization failed', summary: '', aiPowered: false },
      { status: 500 }
    );
  }
}
