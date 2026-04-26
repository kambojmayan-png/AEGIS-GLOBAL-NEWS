import { NextRequest, NextResponse } from 'next/server';

// ── In-memory cache (15-minute TTL per Integration.md spec) ──────────────────
const cache: Record<string, { data: unknown; timestamp: number }> = {};
const CACHE_TTL = 15 * 60 * 1000;

interface ArticleInput {
  title: string;
  description?: string;
  source?: { name: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles, region } = body as { articles: ArticleInput[]; region: string };

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'Missing articles array' }, { status: 400 });
    }

    // Cache key: region + first 3 titles
    const cacheKey = `${region}::${articles.slice(0, 3).map((a) => a.title).join('|')}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...(cached.data as object), cached: true });
    }

    const headlines = articles
      .slice(0, 10)
      .map((a, i) => `${i + 1}. ${a.title}`)
      .join('\n');

    // ── PRIMARY: Groq Llama 3.3 70B (Integration.md spec) ────────────────────
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
            temperature: 0.7,
            max_tokens: 600,
            messages: [
              {
                role: 'system',
                content:
                  'You are an elite news intelligence analyst. Always respond with valid JSON only — no markdown, no explanation, just the JSON object.',
              },
              {
                role: 'user',
                content: `Analyze these trending headlines from ${region} and respond with this exact JSON structure:
{
  "summary": "2-sentence overview of what is trending and why it matters",
  "themes": [
    {"topic": "theme name", "sentiment": "Positive"},
    {"topic": "theme name", "sentiment": "Neutral"},
    {"topic": "theme name", "sentiment": "Negative"}
  ],
  "signal_alert": "The single most geopolitically significant story in one sentence"
}

Headlines:
${headlines}`,
              },
            ],
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const rawText: string = groqData?.choices?.[0]?.message?.content ?? '';
          // Strip any accidental markdown fences
          const cleaned = rawText.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const result = {
              ...parsed,
              aiPowered: true,
              model: 'llama-3.3-70b-versatile',
              provider: 'Groq',
            };
            cache[cacheKey] = { data: result, timestamp: Date.now() };
            return NextResponse.json(result);
          }
        } else {
          const errData = await groqRes.json().catch(() => ({}));
          console.warn('Groq API error:', groqRes.status, errData);
        }
      } catch (groqErr) {
        console.warn('Groq summarize fetch error:', groqErr);
      }
    }

    // ── SECONDARY: Gemini fallback (if GEMINI_API_KEY present) ───────────────
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const modelsToTry = ['gemini-2.0-flash', 'gemini-flash-latest'];
      for (const modelName of modelsToTry) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const genai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await genai.models.generateContent({
            model: modelName,
            contents: `Analyze these trending headlines from ${region}. Respond ONLY with valid JSON:\n{"summary":"2 sentences","themes":[{"topic":"...","sentiment":"Positive/Neutral/Negative"}],"signal_alert":"1 sentence"}\n\nHeadlines:\n${headlines}`,
          });
          const text = response.text?.trim() ?? '';
          const jsonMatch = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim().match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = { ...JSON.parse(jsonMatch[0]), aiPowered: true, model: modelName, provider: 'Gemini' };
            cache[cacheKey] = { data: result, timestamp: Date.now() };
            return NextResponse.json(result);
          }
        } catch (e: unknown) {
          if (String(e).includes('429') || String(e).includes('quota')) continue;
          break;
        }
      }
    }

    // ── FALLBACK: No AI available ─────────────────────────────────────────────
    const mockResult = {
      summary: `${articles.length} intelligence reports retrieved from ${region}. Add GROQ_API_KEY to .env.local to enable Llama 3.3 70B AI-powered analysis.`,
      themes: [
        { topic: 'General News', sentiment: 'Neutral' },
        { topic: 'Regional Affairs', sentiment: 'Neutral' },
        { topic: 'International', sentiment: 'Neutral' },
      ],
      signal_alert: 'AI digest unavailable — configure GROQ_API_KEY in .env.local.',
      aiPowered: false,
      model: 'none',
    };
    cache[cacheKey] = { data: mockResult, timestamp: Date.now() };
    return NextResponse.json(mockResult);
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json({ error: 'Summarization failed' }, { status: 500 });
  }
}
