import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [total, byAnimalType, recent] = await Promise.all([
      prisma.report.count(),
      prisma.report.groupBy({
        by: ['animalType'],
        _count: { id: true },
        orderBy: { animalType: 'asc' },
      }),
      prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          animalType: true,
          riskLevel: true,
          rewardLevel: true,
          scoringMethod: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      total,
      byAnimalType: byAnimalType.map((g) => ({
        animalType: g.animalType,
        count: g._count.id,
      })),
      recent,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
