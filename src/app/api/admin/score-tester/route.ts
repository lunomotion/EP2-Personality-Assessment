import { NextRequest, NextResponse } from 'next/server';
import { getScoringConfig } from '@/lib/scoring-config-loader';
import { runScoringEngine } from '@/lib/scoring-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const answers: Record<string, string | number> = body.answers;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Missing answers object' }, { status: 400 });
    }

    const config = await getScoringConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'No scoring config found. Run the seed script first.' },
        { status: 404 }
      );
    }

    const answerMap = new Map(Object.entries(answers));
    const result = runScoringEngine(answerMap, config);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Score tester error:', err);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
