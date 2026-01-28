import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/scoring-config-loader';

type ContentType = 'animals' | 'risk-levels' | 'reward-levels' | 'drivers' | 'aois' | 'strategies';

const VALID_TYPES: ContentType[] = ['animals', 'risk-levels', 'reward-levels', 'drivers', 'aois', 'strategies'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  try {
    let data: unknown;
    switch (type) {
      case 'animals':
        data = await prisma.animalTypeContent.findMany({ orderBy: { key: 'asc' } });
        break;
      case 'risk-levels':
        data = await prisma.riskLevelContent.findMany({ orderBy: { key: 'asc' } });
        break;
      case 'reward-levels':
        data = await prisma.rewardLevelContent.findMany({ orderBy: { key: 'asc' } });
        break;
      case 'drivers':
        data = await prisma.driverContent.findMany({ orderBy: { key: 'asc' } });
        break;
      case 'aois':
        data = await prisma.aOIContent.findMany({ orderBy: { key: 'asc' } });
        break;
      case 'strategies':
        data = await prisma.strategyContent.findMany({ orderBy: { key: 'asc' } });
        break;
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(`Error fetching ${type} content:`, err);
    return NextResponse.json({ error: `Failed to fetch ${type}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as ContentType)) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // body should be { key: string, ...fields }
    if (!body.key) {
      return NextResponse.json({ error: 'Missing key field' }, { status: 400 });
    }

    let updated: unknown;
    switch (type) {
      case 'animals':
        updated = await prisma.animalTypeContent.update({
          where: { key: body.key },
          data: {
            title: body.title,
            description: body.description,
            traits: body.traits,
          },
        });
        break;
      case 'risk-levels':
        updated = await prisma.riskLevelContent.update({
          where: { key: body.key },
          data: { title: body.title, description: body.description },
        });
        break;
      case 'reward-levels':
        updated = await prisma.rewardLevelContent.update({
          where: { key: body.key },
          data: { title: body.title, description: body.description },
        });
        break;
      case 'drivers':
        updated = await prisma.driverContent.update({
          where: { key: body.key },
          data: {
            title: body.title,
            description: body.description,
            questions: body.questions,
          },
        });
        break;
      case 'aois':
        updated = await prisma.aOIContent.update({
          where: { key: body.key },
          data: {
            title: body.title,
            description: body.description,
            businesses: body.businesses,
          },
        });
        break;
      case 'strategies':
        updated = await prisma.strategyContent.update({
          where: { key: body.key },
          data: {
            title: body.title,
            description: body.description,
            actions: body.actions,
          },
        });
        break;
    }

    invalidateCache();
    return NextResponse.json(updated);
  } catch (err) {
    console.error(`Error updating ${type} content:`, err);
    return NextResponse.json({ error: `Failed to update ${type}` }, { status: 500 });
  }
}
