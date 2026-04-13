/**
 * AI Analysis Library — Groq Llama 3.3 70B (primary) + Gemini Flash (fallback)
 *
 * Features:
 *   - analyzeArticles: veracity, genre, reliability_score, sentiment, summary
 *   - getTrendingInsights: trending themes from a set of articles
 *
 * Error handling: Fail-open — if both AI providers fail, return [] (never crash).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Groq helper (OpenAI-compatible REST API)
// ─────────────────────────────────────────────────────────────────────────────

async function groqChat(prompt: string, systemPrompt?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini fallback
// ─────────────────────────────────────────────────────────────────────────────

async function geminiChat(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const { GoogleGenAI } = await import('@google/genai');
  const genai = new GoogleGenAI({ apiKey });

  for (const model of ['gemini-2.0-flash', 'gemini-flash-latest']) {
    try {
      const response = await genai.models.generateContent({ model, contents: prompt });
      return response.text?.trim() ?? '';
    } catch (e: unknown) {
      if (String(e).includes('429') || String(e).includes('quota')) continue;
      throw e;
    }
  }
  throw new Error('All Gemini models quota exhausted');
}

/** Try Groq first, fall back to Gemini, return `fallback` string if both fail */
async function generate(prompt: string, systemPrompt?: string, fallback = '[]'): Promise<string> {
  try {
    if (process.env.GROQ_API_KEY) return await groqChat(prompt, systemPrompt);
  } catch (e) {
    console.warn('[ai] Groq failed, trying Gemini:', String(e).slice(0, 120));
  }
  try {
    if (process.env.GEMINI_API_KEY) return await geminiChat(prompt);
  } catch (e) {
    console.warn('[ai] Gemini failed:', String(e).slice(0, 120));
  }
  console.warn('[ai] All AI providers failed — returning fallback');
  return fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported types
// ─────────────────────────────────────────────────────────────────────────────

export interface AIAnalysis {
  summary:           string;
  veracity:          'VERIFIED' | 'UNVERIFIED' | 'SENSATIONALIST';
  genre:             string;
  reliability_score: number;
  sentiment:         number; // -1.0 to 1.0
}

export interface TrendingInsight {
  topic:        string;
  mentions:     number;
  sentiment:    number;
  veracity_mix: string;
  summary:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// analyzeArticles — batch AI analysis with veracity + confidence scores
// ─────────────────────────────────────────────────────────────────────────────

export async function analyzeArticles(
  articles: { title: string; description: string; content: string; source: { name: string } }[]
): Promise<AIAnalysis[]> {
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) return [];
  if (articles.length === 0) return [];

  const systemPrompt =
    'You are an elite news intelligence analyst. Respond ONLY with a valid JSON array — no markdown, no explanation, no preamble.';

  const prompt = `Analyze each news article and return a JSON array (one object per article) with exactly these fields:
- "summary": 2-sentence executive TL;DR (factual, no opinion)
- "veracity": "VERIFIED" (credible source + specific claims) | "UNVERIFIED" (unconfirmed/speculation) | "SENSATIONALIST" (exaggerated/clickbait)
- "genre": specific category string (e.g. "Monetary Policy", "Geopolitical Tension", "Public Health", "Tech Innovation", "Climate Crisis")
- "reliability_score": integer 0-100 (based on: source reputation, claim specificity, neutrality, verifiable facts)
- "sentiment": float -1.0 (very negative) to 1.0 (very positive)

Articles:
${articles.map((a, i) =>
  `[${i}] Source: ${a.source.name}\nTitle: ${a.title}\nDescription: ${a.description || 'N/A'}\nContent: ${a.content?.substring(0, 300) || 'N/A'}`
).join('\n\n')}

Return ONLY the JSON array. No markdown.`;

  try {
    const text    = await generate(prompt, systemPrompt, '[]');
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    const parsed: AIAnalysis[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Validate and clamp values for safety
    return parsed.map((item) => ({
      summary:           typeof item.summary === 'string' ? item.summary : '',
      veracity:          ['VERIFIED', 'UNVERIFIED', 'SENSATIONALIST'].includes(item.veracity)
                           ? item.veracity : 'UNVERIFIED',
      genre:             typeof item.genre === 'string' ? item.genre : 'General News',
      reliability_score: Math.max(0, Math.min(100, Math.round(Number(item.reliability_score) || 50))),
      sentiment:         Math.max(-1, Math.min(1, Number(item.sentiment) || 0)),
    }));
  } catch (error) {
    console.error('[ai] analyzeArticles error:', error);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// getTrendingInsights — extract trending themes from article set
// ─────────────────────────────────────────────────────────────────────────────

export async function getTrendingInsights(
  articles: { title: string; description: string; source: { name: string } }[],
  location: string
): Promise<TrendingInsight[]> {
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) return [];
  if (articles.length === 0) return [];

  const prompt = `Analyze these ${articles.length} articles from ${location} and return the top 5 trending themes as a JSON array.

Each object must have:
- "topic": 2-4 word theme name
- "mentions": estimated global mention count (realistic integer 100-50000)
- "sentiment": float -1.0 to 1.0
- "veracity_mix": e.g. "70% Verified, 20% Unverified, 10% Sensationalist"
- "summary": one sentence on why this theme is trending in ${location}

Articles:
${articles.slice(0, 20).map((a, i) => `[${i}] "${a.title}" — ${a.source.name}: ${a.description || 'N/A'}`).join('\n')}

Respond ONLY with a valid JSON array.`;

  try {
    const text    = await generate(prompt, undefined, '[]');
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error('[ai] getTrendingInsights error:', error);
    return [];
  }
}
