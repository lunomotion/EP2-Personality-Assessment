import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/scoring-config-loader';

export async function GET() {
  try {
    const config = await prisma.scoringConfig.findUnique({
      where: { id: 'default' },
    });
    if (!config) {
      return NextResponse.json({ error: 'No scoring config found' }, { status: 404 });
    }
    return NextResponse.json(config);
  } catch (err) {
    console.error('Error fetching scoring config:', err);
    return NextResponse.json({ error: 'Failed to fetch scoring config' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.riskQuestions !== undefined) updateData.riskQuestions = body.riskQuestions;
    if (body.rewardQuestions !== undefined) updateData.rewardQuestions = body.rewardQuestions;
    if (body.fourTypesQuestions !== undefined) updateData.fourTypesQuestions = body.fourTypesQuestions;
    if (body.tieBreakerConfig !== undefined) updateData.tieBreakerConfig = body.tieBreakerConfig;
    if (body.riskThresholds !== undefined) updateData.riskThresholds = body.riskThresholds;
    if (body.rewardThresholds !== undefined) updateData.rewardThresholds = body.rewardThresholds;
    if (body.surveyQuestions !== undefined) updateData.surveyQuestions = body.surveyQuestions;

    updateData.version = { increment: 1 };

    const updated = await prisma.scoringConfig.update({
      where: { id: 'default' },
      data: updateData,
    });

    invalidateCache();

    return NextResponse.json(updated);
  } catch (err) {
    console.error('Error updating scoring config:', err);
    return NextResponse.json({ error: 'Failed to update scoring config' }, { status: 500 });
  }
}
