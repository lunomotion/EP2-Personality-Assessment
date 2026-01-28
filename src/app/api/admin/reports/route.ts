import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const email = url.searchParams.get('email') || undefined;
    const animalType = url.searchParams.get('animalType') || undefined;
    const scoringMethod = url.searchParams.get('scoringMethod') || undefined;

    const where: Record<string, unknown> = {};
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (animalType) {
      where.animalType = animalType;
    }
    if (scoringMethod) {
      where.scoringMethod = scoringMethod;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          animalType: true,
          riskLevel: true,
          rewardLevel: true,
          driverKey: true,
          strategyKey: true,
          scoringMethod: true,
          createdAt: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
