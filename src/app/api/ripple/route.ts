import { NextRequest, NextResponse } from 'next/server';
import { getRippleEffects } from '@/lib/gemini';
import { getMockRippleEffect } from '@/lib/mock-data';
import { COUNTRIES } from '@/data/countries';

/**
 * POST /api/ripple
 * Given a news article + its source country, predicts which other countries
 * will feel the geopolitical / economic ripple effect.
 *
 * Body: { title: string; summary: string; countryCode: string }
 * Returns: { ripples: { code, name, lat, lng, impact, description }[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, summary, countryCode } = body as {
      title: string;
      summary: string;
      countryCode: string;
    };

    if (!title || !countryCode) {
      return NextResponse.json(
        { error: 'Missing required fields: title, countryCode' },
        { status: 400 }
      );
    }

    const sourceCountry =
      COUNTRIES[countryCode.toUpperCase()]?.name ?? countryCode;

    // Try live AI analysis first ────────────────────────────────────────────
    let rippleItems: { code: string; impact: number; description: string }[] = [];
    const hasAI = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    if (hasAI) {
      try {
        rippleItems = await getRippleEffects(title, summary || title, sourceCountry);
      } catch (e) {
        console.warn('[ripple] AI failed, falling back to mock:', String(e).slice(0, 100));
      }
    }

    // Fallback to mock data ─────────────────────────────────────────────────
    if (!rippleItems || rippleItems.length === 0) {
      const mock = getMockRippleEffect(countryCode.toUpperCase(), title);

      rippleItems = mock.affectedCountries.map((c) => ({
        code: c.code,
        impact: c.impact,
        description: c.description,
      }));
    }

    // Enrich with lat/lng from COUNTRIES lookup ─────────────────────────────
    const ripples = rippleItems
      .map((item) => {
        const info = COUNTRIES[item.code.toUpperCase()];
        if (!info) return null; // skip unknown codes
        return {
          code:        item.code.toUpperCase(),
          name:        info.name,
          lat:         info.lat,
          lng:         info.lng,
          impact:      Math.max(0, Math.min(1, item.impact)),
          description: item.description,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ ripples, aiPowered: !!hasAI });

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[ripple] Error:', msg);
    return NextResponse.json(
      { error: `Ripple analysis failed: ${msg}`, ripples: [] },
      { status: 500 }
    );
  }
}
