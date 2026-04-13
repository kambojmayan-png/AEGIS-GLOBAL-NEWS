import { NextRequest, NextResponse } from 'next/server';
import { getCounterPerspective } from '@/lib/gemini';
import { getMockCounterPerspective } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleTitle, articleSummary, sourceCountry } = body;

    if (!articleTitle) {
      return NextResponse.json({ error: 'Missing articleTitle' }, { status: 400 });
    }

    // Try AI analysis
    const perspective = await getCounterPerspective(
      articleTitle,
      articleSummary || '',
      sourceCountry || 'Unknown'
    );

    if (perspective.region !== 'N/A' && perspective.region !== 'Error') {
      return NextResponse.json({ ...perspective, aiPowered: true });
    }

    // Fallback to mock
    const mock = getMockCounterPerspective();
    return NextResponse.json({ ...mock, aiPowered: false });
  } catch (error) {
    console.error('Counter-perspective API error:', error);
    return NextResponse.json({ error: 'Counter-perspective analysis failed' }, { status: 500 });
  }
}
