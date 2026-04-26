import { NextRequest, NextResponse } from 'next/server';
import { getRippleEffects } from '@/lib/gemini';
import { getMockRippleEffect } from '@/lib/mock-data';
import { COUNTRIES } from '@/data/countries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, articleTitle, articleSummary } = body;

    if (!country || !articleTitle) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const countryName = COUNTRIES[country]?.name || country;

    // Try AI analysis
    const aiEffects = await getRippleEffects(articleTitle, articleSummary || '', countryName);

    if (aiEffects.length > 0) {
      // Enrich with coordinates
      const enriched = aiEffects.map((e) => ({
        ...e,
        lat: COUNTRIES[e.code]?.lat || 0,
        lng: COUNTRIES[e.code]?.lng || 0,
      }));

      return NextResponse.json({
        sourceCountry: country,
        affectedCountries: enriched,
        aiPowered: true,
      });
    }

    // Fallback to mock
    const mock = getMockRippleEffect(country);
    return NextResponse.json({
      sourceCountry: country,
      ...mock,
      aiPowered: false,
    });
  } catch (error) {
    console.error('Ripple API error:', error);
    return NextResponse.json({ error: 'Ripple analysis failed' }, { status: 500 });
  }
}
