import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { reports, clients, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { isEmailDeliveryAllowed } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";
import { sendEmail } from "@/lib/email";
import { ReportEmail } from "@/components/emails/ReportEmail";
import { render } from "@react-email/render";
import { z } from "zod";
import { trackReportSent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const SendReportSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(300),
  message: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get user plan
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = (user.plan || "free") as Plan;

    // Check if email delivery is allowed on this plan
    if (!isEmailDeliveryAllowed(plan)) {
      return NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: "Email delivery requires a Starter or Pro plan.",
          upgradeUrl: "/upgrade",
        },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await req.json();
    const parsed = SendReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { to, subject, message } = parsed.data;

    // Fetch report with client data
    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Report must be published to send
    if (!report.isPublic || !report.shareToken) {
      return NextResponse.json(
        {
          error: "REPORT_NOT_PUBLISHED",
          message:
            "Report must be published before sending. Please publish the report first.",
        },
        { status: 400 }
      );
    }

    // Fetch client data
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, report.clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Build share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reportflow.app";
    const shareUrl = `${baseUrl}/r/${report.shareToken}`;

    // Format date range
    const dateRange = `${new Date(report.dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${new Date(report.dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

    // Get metrics from report data
    const metricsData = report.metricsData as any;
    const metrics = metricsData?.summary
      ? {
          sessions: metricsData.summary.sessions,
          conversions: metricsData.summary.conversions,
          revenue: metricsData.summary.revenue,
          previousSessions: metricsData.summary.previousSessions,
        }
      : undefined;

    // Determine from name based on white-label settings
    const isWhiteLabel = plan === "pro" && !!user.agencyName;
    const fromName = isWhiteLabel ? user.agencyName : "ReportFlow";

    // Render email template to HTML
    const emailHtml = await render(
      ReportEmail({
        reportTitle: report.title,
        clientName: client.name,
        dateRange,
        shareUrl,
        brandColor: client.brandColor || "#2563EB",
        message,
        metrics,
        agencyName: user.agencyName || undefined,
        isWhiteLabel,
      })
    );

    // Send email
    const success = await sendEmail({
      to,
      subject,
      html: emailHtml,
    });

    if (!success) {
      return NextResponse.json(
        { error: "EMAIL_SEND_FAILED", message: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    // Update report with last sent info
    await db
      .update(reports)
      .set({
        lastSentAt: new Date(),
        lastSentTo: to,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));

    // Track analytics
    trackReportSent(userId, id);

    return NextResponse.json({ success: true, message: "Report sent successfully!" });
  } catch (error) {
    console.error("[POST /api/reports/[id]/send]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
