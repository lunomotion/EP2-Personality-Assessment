import { NextRequest, NextResponse } from 'next/server';
import { getScoringConfig, getContentConfig } from '@/lib/scoring-config-loader';
import { runScoringEngine } from '@/lib/scoring-engine';
import type { ReportData } from '@/types/report';

// In-memory store for development when database is not configured
const reportStore = new Map<string, ReportData>();

const isDatabaseConfigured = () => !!process.env.DATABASE_URL;

async function getPrisma() {
  if (!isDatabaseConfigured()) return null;
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

interface SubmitBody {
  answers: Record<string, string | number | string[]>;
  firstName: string;
  lastName: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitBody = await request.json();
    const { answers, firstName, lastName, email } = body;

    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, firstName, lastName' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const [scoringConfig, contentConfig] = await Promise.all([
      getScoringConfig(),
      getContentConfig(),
    ]);

    if (!scoringConfig || !contentConfig) {
      return NextResponse.json(
        { error: 'Scoring configuration not available' },
        { status: 500 }
      );
    }

    // Extract form-only refs before scoring
    const driverKey = String(answers.select_driver || 'Boss');
    const aoi1Key = String(answers.select_aoi1 || 'Tech');
    const aoi2Key = String(answers.select_aoi2 || 'Digital');
    const strategyKey = String(answers.select_strategy || 'Creator');

    // Build answer map for scoring engine (exclude form-only refs)
    const formOnlyRefs = new Set([
      'user_name', 'user_email',
      'select_driver', 'select_aoi1', 'select_aoi2', 'select_strategy',
    ]);

    const scoringAnswers = new Map<string, string | number>();
    for (const [key, value] of Object.entries(answers)) {
      if (formOnlyRefs.has(key)) continue;
      // For array values (rank-order), join with comma
      if (Array.isArray(value)) {
        scoringAnswers.set(key, value.join(','));
      } else {
        scoringAnswers.set(key, value);
      }
    }

    // Run scoring engine
    const result = runScoringEngine(scoringAnswers, scoringConfig);

    // Look up content
    const animalContent = contentConfig.animals.find(
      (a) => a.key === result.animalType
    );
    const riskContent = contentConfig.riskLevels.find(
      (r) => r.key === result.riskLevel
    );
    const rewardContent = contentConfig.rewardLevels.find(
      (r) => r.key === result.rewardLevel
    );
    const driverContent = contentConfig.drivers.find(
      (d) => d.key === driverKey
    );
    const aoi1Content = contentConfig.aois.find(
      (a) => a.key === aoi1Key
    );
    const aoi2Content = contentConfig.aois.find(
      (a) => a.key === aoi2Key
    );
    const strategyContent = contentConfig.strategies.find(
      (s) => s.key === strategyKey
    );

    const name = `${firstName} ${lastName}`;

    const reportData: ReportData = {
      name,
      email,
      reportDate: new Date().toLocaleDateString(),

      animalType: result.animalType as ReportData['animalType'],
      personalityTitle: animalContent?.title || result.animalType,
      personalityText: animalContent?.description || '',
      traits: animalContent?.traits || [],

      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      riskCategory: riskContent?.title || result.riskLevel,
      riskText: riskContent?.description || '',

      rewardLevel: result.rewardLevel,
      rewardScore: result.rewardScore,
      rewardCategory: rewardContent?.title || result.rewardLevel,
      rewardText: rewardContent?.description || '',

      driverKey: driverKey as ReportData['driverKey'],
      driverTitle: driverContent?.title || driverKey,
      driverDescription: driverContent?.description || '',
      driverQuestions: driverContent?.questions || [],

      aoi1Key: aoi1Key as ReportData['aoi1Key'],
      aoi1Title: aoi1Content?.title || aoi1Key,
      aoi1Description: aoi1Content?.description || '',
      aoi1Businesses: aoi1Content?.businesses || [],

      aoi2Key: aoi2Key as ReportData['aoi2Key'],
      aoi2Title: aoi2Content?.title || aoi2Key,
      aoi2Description: aoi2Content?.description || '',
      aoi2Businesses: aoi2Content?.businesses || [],

      strategyKey: strategyKey as ReportData['strategyKey'],
      strategyTitle: strategyContent?.title || strategyKey,
      strategyDescription: strategyContent?.description || '',
      strategyActions: strategyContent?.actions || [],
    };

    // Save to database
    const prisma = await getPrisma();
    const normalizedEmail = email.toLowerCase();

    if (prisma) {
      try {
        const dbFields = {
          name: reportData.name,
          animalType: reportData.animalType,
          personalityTitle: reportData.personalityTitle,
          personalityText: reportData.personalityText,
          traits: reportData.traits,
          riskLevel: reportData.riskLevel,
          riskScore: reportData.riskScore,
          riskCategory: reportData.riskCategory,
          riskText: reportData.riskText,
          rewardLevel: reportData.rewardLevel,
          rewardScore: reportData.rewardScore,
          rewardCategory: reportData.rewardCategory,
          rewardText: reportData.rewardText,
          driverKey: reportData.driverKey,
          driverTitle: reportData.driverTitle,
          driverDescription: reportData.driverDescription,
          driverQuestions: reportData.driverQuestions,
          aoi1Key: reportData.aoi1Key,
          aoi1Title: reportData.aoi1Title,
          aoi1Description: reportData.aoi1Description,
          aoi1Businesses: reportData.aoi1Businesses,
          aoi2Key: reportData.aoi2Key,
          aoi2Title: reportData.aoi2Title,
          aoi2Description: reportData.aoi2Description,
          aoi2Businesses: reportData.aoi2Businesses,
          strategyKey: reportData.strategyKey,
          strategyTitle: reportData.strategyTitle,
          strategyDescription: reportData.strategyDescription,
          strategyActions: reportData.strategyActions,
          rawData: undefined,
          scoringMethod: 'native-form',
          rawAnswers: answers,
        };

        await prisma.report.upsert({
          where: { email: normalizedEmail },
          update: dbFields,
          create: {
            email: normalizedEmail,
            ...dbFields,
          },
        });
        console.log('Saved native form report for:', email);
      } catch (dbError) {
        console.error('Database error, falling back to in-memory:', dbError);
        reportStore.set(normalizedEmail, reportData);
      }
    } else {
      reportStore.set(normalizedEmail, reportData);
      console.log('Stored native form report in memory for:', email);
    }

    return NextResponse.json({
      success: true,
      reportUrl: `/report?email=${encodeURIComponent(normalizedEmail)}`,
    });
  } catch (error) {
    console.error('Error processing assessment submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
