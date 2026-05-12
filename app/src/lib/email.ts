import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM || "ReportFlow <noreply@reportflow.app>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!resend) {
    console.warn("[Resend] API key not configured - email not sent");
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("[Resend] Failed to send email:", result.error);
      return false;
    }

    console.log(`[Resend] Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Resend] Error sending email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to ReportFlow!</h1>
      <p>Hi ${name},</p>
      <p>Thanks for joining ReportFlow. You can now create beautiful client reports in minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://reportflow.app"}/dashboard"
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Go to Dashboard
        </a>
      </p>
      <p>Here's what you can do:</p>
      <ul>
        <li>Add your first client</li>
        <li>Create a report with your metrics</li>
        <li>Share it with a public link</li>
      </ul>
      <p>If you have any questions, just reply to this email.</p>
      <p>Best,<br>The ReportFlow Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to ReportFlow!",
    html,
    text: `Welcome to ReportFlow! Hi ${name}, Thanks for joining. Go to your dashboard to get started: ${process.env.NEXT_PUBLIC_APP_URL || "https://reportflow.app"}/dashboard`,
  });
}

export async function sendUpgradeConfirmation(email: string, plan: string): Promise<boolean> {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">You're all set!</h1>
      <p>Your ReportFlow subscription has been upgraded to <strong>${plan}</strong>.</p>
      <p>You now have access to:</p>
      <ul>
        ${plan === "starter" ? "<li>5 clients</li><li>Unlimited reports</li><li>PDF export</li><li>Custom notes</li>" : ""}
        ${plan === "pro" ? "<li>Unlimited clients</li><li>Unlimited reports</li><li>PDF export</li><li>Custom notes</li><li>White-label branding</li>" : ""}
      </ul>
      <p style="margin: 24px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://reportflow.app"}/dashboard"
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Start Using Your New Features
        </a>
      </p>
      <p>Thank you for your support!</p>
      <p>Best,<br>The ReportFlow Team</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `ReportFlow upgrade to ${plan} confirmed`,
    html,
  });
}