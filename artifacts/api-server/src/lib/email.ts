import { Resend } from "resend";

let resend: Resend | null = null;

export function initEmail() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("[Email] API key not set, email disabled");
    return;
  }

  resend = new Resend(apiKey);
  console.log("[Email] Initialized");
}

export async function sendWelcomeEmail(email: string, name?: string) {
  if (!resend) {
    console.log("[Email] Resend not initialized, skipping welcome email");
    return;
  }

  try {
    await resend.emails.send({
      from: "ReportFlow <noreply@reportflow.app>",
      to: email,
      subject: "Welcome to ReportFlow!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ReportFlow</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 12px 12px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hi${name ? ` ${name}` : ""},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Thanks for signing up for ReportFlow! I'm excited to help you streamline your client reporting workflow.
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Here's how to get started:
              </p>
              <ol style="color: #333; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                <li>Add your first client in the dashboard</li>
                <li>Create a report with your metrics (manual entry or CSV upload)</li>
                <li>Share the report with your client via a public link</li>
              </ol>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                If you have any questions, just reply to this email — I'm here to help!
              </p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Best,<br>The ReportFlow Team
              </p>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              © ${new Date().getFullYear()} ReportFlow. All rights reserved.
            </p>
          </body>
        </html>
      `,
    });
    console.log(`[Email] Welcome email sent to ${email}`);
  } catch (err) {
    console.error("[Email] Failed to send welcome email:", err);
  }
}

export async function sendReportToClient(clientEmail: string, reportTitle: string, reportUrl: string, fromName: string) {
  if (!resend) {
    console.log("[Email] Resend not initialized, skipping report email");
    return;
  }

  try {
    await resend.emails.send({
      from: `${fromName} via ReportFlow <noreply@reportflow.app>`,
      to: clientEmail,
      subject: `Your ${reportTitle} is ready`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f9f9f9; padding: 30px; border-radius: 12px;">
              <h2 style="color: #333; margin-top: 0;">Your report is ready!</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hi,
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                <strong>${reportTitle}</strong> has been generated and is ready for you to view.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${reportUrl}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Report
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                Or copy this link: ${reportUrl}
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Sent via ReportFlow
              </p>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`[Email] Report email sent to ${clientEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send report email:", err);
  }
}