import type { ReportData } from '@/types/report';

/**
 * Generate HTML email template for EP2 Assessment Report
 * @param reportData - The processed report data
 * @param reportUrl - Full URL to view the online report
 * @returns HTML string for the email
 */
export function generateEmailTemplate(
  reportData: ReportData,
  reportUrl: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your EP2 Assessment Report is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header Gradient Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #16213e 0%, #533483 50%, #e94560 100%);"></td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #1a1a2e;">
                Your EP2 Report is Ready!
              </h1>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; color: #555;">
                Thank you for completing the Entrepreneurial Pursuit Assessment! Your personalized report is now ready and waiting for you.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #555;">
                Click the button below to view your full results online, or check out the PDF attached to this email.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="background-color: #533483; border-radius: 8px;">
                    <a href="${reportUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                      View My Report
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #888;">
                We're excited to support you on your entrepreneurial journey!
              </p>
            </td>
          </tr>

          <!-- Footer Gradient Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #16213e 0%, #533483 50%, #e94560 100%);"></td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                Praxia Insights
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
