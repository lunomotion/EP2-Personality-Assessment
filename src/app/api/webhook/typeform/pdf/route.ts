import { NextRequest, NextResponse } from 'next/server';
import { processTypeformData } from '@/lib/assessment-processor';
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

// Helper to generate PDF
async function generatePdf(email: string): Promise<Buffer> {
  const puppeteer = await import('puppeteer-core');

  let browser;

  // Check if running in production (Vercel/serverless) or development
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Serverless environment - use @sparticuz/chromium
    const chromium = await import('@sparticuz/chromium');

    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 1200, height: 800 },
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    // Docker environment - use installed Chromium
    browser = await puppeteer.default.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    });
  } else {
    // Development - try to use local Chrome installation
    const executablePath = process.platform === 'win32'
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : process.platform === 'darwin'
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/google-chrome';

    browser = await puppeteer.default.launch({
      executablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  const page = await browser.newPage();

  // Get the base URL for the report
  // Use INTERNAL_BASE_URL for Docker (container-to-container), fallback to public URL
  const baseUrl = process.env.INTERNAL_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  // Navigate to the report page
  const reportUrl = `${baseUrl}/report?email=${encodeURIComponent(email)}&print=true`;
  console.log('📄 Generating PDF for:', reportUrl);

  await page.goto(reportUrl, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait for content to load
  await page.waitForSelector('.pdf-page', { timeout: 10000 });

  // Wait for all images to load
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  });

  // Additional wait to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0',
    },
  });

  await browser.close();

  return Buffer.from(pdf);
}

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json();

    // Check query params
    const returnBase64 = request.nextUrl.searchParams.get('format') === 'base64';
    const emailParam = request.nextUrl.searchParams.get('email');

    console.log('📥 Received Typeform webhook (PDF endpoint)');

    // Validate webhook structure
    if (!webhookData.form_response) {
      console.error('Invalid webhook payload: missing form_response');
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Process the assessment data
    const reportData = processTypeformData(webhookData);

    // Use email from query param if provided, otherwise use extracted email
    if (emailParam) {
      reportData.email = emailParam;
      console.log('📧 Using email from query parameter:', emailParam);
    }

    // Validate email is present
    if (!reportData.email) {
      console.error('No email found in webhook data');
      console.error('Answers:', JSON.stringify(webhookData.form_response.answers, null, 2));
      console.error('Hidden fields:', JSON.stringify(webhookData.form_response.hidden, null, 2));
      return NextResponse.json(
        { error: 'No email found in form submission' },
        { status: 400 }
      );
    }

    console.log('✅ Processed assessment for:', reportData.email);
    console.log('   Animal Type:', reportData.animalType);
    console.log('   Risk Level:', reportData.riskLevel);
    console.log('   Reward Level:', reportData.rewardLevel);

    // Try to save to database if configured
    const prisma = await getPrisma();

    if (prisma && reportData.email) {
      try {
        await prisma.report.upsert({
          where: { email: reportData.email.toLowerCase() },
          update: {
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
          },
          create: {
            email: reportData.email.toLowerCase(),
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
          },
        });
        console.log('💾 Saved report to database for:', reportData.email);
      } catch (dbError) {
        console.error('Database error, falling back to in-memory:', dbError);
        reportStore.set(reportData.email.toLowerCase(), reportData);
      }
    } else if (reportData.email) {
      // Fall back to in-memory store
      reportStore.set(reportData.email.toLowerCase(), reportData);
      console.log('💾 Stored report in memory for:', reportData.email);
    }

    // Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBuffer = await generatePdf(reportData.email);
    console.log('✅ PDF generated successfully');

    // Return as base64 JSON if requested
    if (returnBase64) {
      return NextResponse.json({
        success: true,
        email: reportData.email,
        animalType: reportData.animalType,
        pdf: pdfBuffer.toString('base64'),
        filename: `EP2-Report-${reportData.email.split('@')[0]}.pdf`,
      });
    }

    // Return PDF as binary response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EP2-Report-${reportData.email.split('@')[0]}.pdf"`,
        'X-Report-Email': reportData.email,
        'X-Report-Animal-Type': reportData.animalType,
      },
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Failed to process webhook and generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
