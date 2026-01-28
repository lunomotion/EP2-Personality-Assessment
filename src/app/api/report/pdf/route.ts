import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  try {
    // Dynamic imports for serverless compatibility
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
    await page.waitForSelector('.report-section', { timeout: 10000 });

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
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    await browser.close();

    // Convert Uint8Array to Buffer for response
    const pdfBuffer = Buffer.from(pdf);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="EP2-Report-${email.split('@')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
