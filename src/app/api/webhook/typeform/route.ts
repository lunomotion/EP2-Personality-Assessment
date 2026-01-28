import { NextRequest, NextResponse } from 'next/server';
import { processTypeformData } from '@/lib/assessment-processor';
import { parseTypeformAnswers } from '@/lib/answer-parser';
import { getScoringConfig, getContentConfig } from '@/lib/scoring-config-loader';
import { runScoringEngine } from '@/lib/scoring-engine';
import type { ReportData } from '@/types/report';

// In-memory store for development when database is not configured
const reportStore = new Map<string, ReportData>();

// Helper to check if database is configured
const isDatabaseConfigured = () => !!process.env.DATABASE_URL;

// Dynamic import of Prisma (only when database is configured)
async function getPrisma() {
  if (!isDatabaseConfigured()) return null;
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();

    console.log('Received Typeform webhook');

    // Validate webhook structure
    if (!webhookData.form_response) {
      console.error('Invalid webhook payload: missing form_response');
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Parse raw answers for storage
    const rawAnswers = Object.fromEntries(parseTypeformAnswers(webhookData));

    // Try server-side scoring first
    let reportData: ReportData;
    let scoringMethod = 'typeform';

    const [scoringConfig, contentConfig] = await Promise.all([
      getScoringConfig(),
      getContentConfig(),
    ]);

    if (scoringConfig && contentConfig) {
      // Server-side scoring path
      const answerMap = parseTypeformAnswers(webhookData);
      const result = runScoringEngine(answerMap, scoringConfig);

      // Look up content from DB
      const animalContent = contentConfig.animals.find(
        (a) => a.key === result.animalType
      );
      const riskContent = contentConfig.riskLevels.find(
        (r) => r.key === result.riskLevel
      );
      const rewardContent = contentConfig.rewardLevels.find(
        (r) => r.key === result.rewardLevel
      );

      // For driver, AOIs, and strategy, fall back to Typeform variables
      // since those are single-select answers, not scored
      const fallback = processTypeformData(webhookData);

      const driverContent = contentConfig.drivers.find(
        (d) => d.key === fallback.driverKey
      );
      const aoi1Content = contentConfig.aois.find(
        (a) => a.key === fallback.aoi1Key
      );
      const aoi2Content = contentConfig.aois.find(
        (a) => a.key === fallback.aoi2Key
      );
      const strategyContent = contentConfig.strategies.find(
        (s) => s.key === fallback.strategyKey
      );

      reportData = {
        name: fallback.name,
        email: fallback.email,
        reportDate: new Date().toLocaleDateString(),

        animalType: result.animalType as ReportData['animalType'],
        personalityTitle: animalContent?.title || fallback.personalityTitle,
        personalityText: animalContent?.description || fallback.personalityText,
        traits: animalContent?.traits || fallback.traits,

        riskLevel: result.riskLevel,
        riskScore: result.riskScore,
        riskCategory: riskContent?.title || fallback.riskCategory,
        riskText: riskContent?.description || fallback.riskText,

        rewardLevel: result.rewardLevel,
        rewardScore: result.rewardScore,
        rewardCategory: rewardContent?.title || fallback.rewardCategory,
        rewardText: rewardContent?.description || fallback.rewardText,

        driverKey: fallback.driverKey,
        driverTitle: driverContent?.title || fallback.driverTitle,
        driverDescription: driverContent?.description || fallback.driverDescription,
        driverQuestions: driverContent?.questions || fallback.driverQuestions,

        aoi1Key: fallback.aoi1Key,
        aoi1Title: aoi1Content?.title || fallback.aoi1Title,
        aoi1Description: aoi1Content?.description || fallback.aoi1Description,
        aoi1Businesses: aoi1Content?.businesses || fallback.aoi1Businesses,

        aoi2Key: fallback.aoi2Key,
        aoi2Title: aoi2Content?.title || fallback.aoi2Title,
        aoi2Description: aoi2Content?.description || fallback.aoi2Description,
        aoi2Businesses: aoi2Content?.businesses || fallback.aoi2Businesses,

        strategyKey: fallback.strategyKey,
        strategyTitle: strategyContent?.title || fallback.strategyTitle,
        strategyDescription: strategyContent?.description || fallback.strategyDescription,
        strategyActions: strategyContent?.actions || fallback.strategyActions,
      };

      scoringMethod = 'server';
      console.log('Server-scored assessment for:', reportData.email);
    } else {
      // Fallback to existing Typeform-based processing
      reportData = processTypeformData(webhookData);
      console.log('Typeform-scored assessment for:', reportData.email);
    }

    console.log('  Animal Type:', reportData.animalType);
    console.log('  Risk Level:', reportData.riskLevel);
    console.log('  Reward Level:', reportData.rewardLevel);
    console.log('  Driver:', reportData.driverKey);
    console.log('  AOIs:', reportData.aoi1Key, reportData.aoi2Key);
    console.log('  Strategy:', reportData.strategyKey);
    console.log('  Scoring Method:', scoringMethod);

    // Try to save to database if configured
    const prisma = await getPrisma();

    if (prisma && reportData.email) {
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
          rawData: webhookData,
          scoringMethod,
          rawAnswers,
        };

        await prisma.report.upsert({
          where: { email: reportData.email.toLowerCase() },
          update: dbFields,
          create: {
            email: reportData.email.toLowerCase(),
            ...dbFields,
          },
        });
        console.log('Saved report to database for:', reportData.email);
      } catch (dbError) {
        console.error('Database error, falling back to in-memory:', dbError);
        reportStore.set(reportData.email.toLowerCase(), reportData);
      }
    } else if (reportData.email) {
      // Fall back to in-memory store
      reportStore.set(reportData.email.toLowerCase(), reportData);
      console.log('Stored report in memory for:', reportData.email);
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment processed successfully',
      reportUrl: `/report?email=${encodeURIComponent(reportData.email)}`,
      summary: {
        email: reportData.email,
        animalType: reportData.animalType,
        riskLevel: reportData.riskLevel,
        rewardLevel: reportData.rewardLevel,
        scoringMethod,
      }
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a report by email
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase();

  // Try database first if configured
  const prisma = await getPrisma();

  if (prisma) {
    try {
      const dbReport = await prisma.report.findUnique({
        where: { email: normalizedEmail },
      });

      if (dbReport) {
        // Convert database record to ReportData format
        const reportData: ReportData = {
          name: dbReport.name,
          email: dbReport.email,
          reportDate: dbReport.createdAt.toLocaleDateString(),
          animalType: dbReport.animalType as ReportData['animalType'],
          personalityTitle: dbReport.personalityTitle,
          personalityText: dbReport.personalityText,
          traits: dbReport.traits,
          riskLevel: dbReport.riskLevel as ReportData['riskLevel'],
          riskScore: dbReport.riskScore,
          riskCategory: dbReport.riskCategory,
          riskText: dbReport.riskText,
          rewardLevel: dbReport.rewardLevel as ReportData['rewardLevel'],
          rewardScore: dbReport.rewardScore,
          rewardCategory: dbReport.rewardCategory,
          rewardText: dbReport.rewardText,
          driverKey: dbReport.driverKey as ReportData['driverKey'],
          driverTitle: dbReport.driverTitle,
          driverDescription: dbReport.driverDescription,
          driverQuestions: dbReport.driverQuestions,
          aoi1Key: dbReport.aoi1Key as ReportData['aoi1Key'],
          aoi1Title: dbReport.aoi1Title,
          aoi1Description: dbReport.aoi1Description,
          aoi1Businesses: dbReport.aoi1Businesses,
          aoi2Key: dbReport.aoi2Key as ReportData['aoi2Key'],
          aoi2Title: dbReport.aoi2Title,
          aoi2Description: dbReport.aoi2Description,
          aoi2Businesses: dbReport.aoi2Businesses,
          strategyKey: dbReport.strategyKey as ReportData['strategyKey'],
          strategyTitle: dbReport.strategyTitle,
          strategyDescription: dbReport.strategyDescription,
          strategyActions: dbReport.strategyActions,
        };

        return NextResponse.json(reportData);
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
    }
  }

  // Fall back to in-memory store
  const report = reportStore.get(normalizedEmail);

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(report);
}
