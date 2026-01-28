import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getFormConfig, invalidateFormConfigCache } from '@/lib/form-config-loader';

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function GET() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getFormConfig();
    if (!config) {
      return NextResponse.json({ error: 'Form config not found' }, { status: 404 });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading form config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prisma = await getPrisma();
  if (!prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.sections !== undefined) updateData.sections = body.sections;
    if (body.resultsPage !== undefined) updateData.resultsPage = body.resultsPage;
    if (body.backgroundImage !== undefined) updateData.backgroundImage = body.backgroundImage;
    if (body.isLive !== undefined) updateData.isLive = body.isLive;

    const updated = await prisma.formConfig.update({
      where: { id: 'default' },
      data: {
        ...updateData,
        version: { increment: 1 },
      },
    });

    invalidateFormConfigCache();

    return NextResponse.json({
      success: true,
      version: updated.version,
    });
  } catch (error) {
    console.error('Error updating form config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
