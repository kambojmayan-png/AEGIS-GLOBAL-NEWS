import { NextRequest, NextResponse } from 'next/server';
import { analyzeArticles } from '@/lib/gemini';
import { AnalyzedArticle } from '@/types';

/**
 * POST /api/analyze
 * Runs AI analysis (Groq → Gemini fallback) on a batch of raw articles.
 * Returns enriched articles with:
 *   - summary, genre, reliability_score, sentiment, veracity, _aiValidated
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body as { articles: AnalyzedArticle[] };

    if (!articles || !Array.isArray(articles)) {
      return NextResponse.json({ error: 'Missing or invalid articles array' }, { status: 400 });
    }

    if (articles.length === 0) {
      return NextResponse.json({ articles: [], aiPowered: false });
    }

    // Run AI batch analysis
    const analyses = await analyzeArticles(articles);
    const aiPowered = analyses.length > 0;

    // Merge AI analysis onto each article
    const analyzed: AnalyzedArticle[] = articles.map((article, i) => {
      const ai = analyses[i];
      return {
        ...article,
        id: article.id || Math.random().toString(36).substring(2, 9),
        // Use AI results if available, else fall back to existing or defaults
        summary:           ai?.summary           || article.summary  || article.description || '',
        genre:             ai?.genre             || article.genre    || 'General News',
        reliability_score: ai?.reliability_score ?? article.reliability_score ?? 55,
        sentiment:         ai?.sentiment         ?? article.sentiment         ?? 0,
        veracity:          ai?.veracity          || article.veracity,
        // Mark as AI-validated if we got an AI response for this article
        _aiValidated:      aiPowered ? true : article._aiValidated,
      };
    });

    return NextResponse.json({ articles: analyzed, aiPowered });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[analyze] Error:', msg);
    // Return the raw articles unchanged rather than a blank screen
    return NextResponse.json(
      { error: `Analysis failed: ${msg}`, articles: [], aiPowered: false },
      { status: 500 }
    );
  }
}
