import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { currentUser } from "@clerk/nextjs/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { isPdfExportAllowed } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";
import { ReportPDFDocument } from "@/components/reports/report-pdf";
import { trackPdfExported } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = clerkUser.id;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress;
    const clerkName = clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null;

    const { ensureUserExists } = await import("@/lib/auth");
    const user = await ensureUserExists(userId, clerkEmail, clerkName);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!isPdfExportAllowed(user.plan as Plan)) {
      return NextResponse.json(
        {
          error: "PLAN_LIMIT_EXCEEDED",
          message: "PDF export is only available on Starter and Pro plans.",
          upgradeUrl: "/upgrade",
        },
        { status: 403 }
      );
    }

    const reportId = params.id;

    const [result] = await db
      .select({
        report: reports,
        client: {
          id: clients.id,
          name: clients.name,
          logoUrl: clients.logoUrl,
          brandColor: clients.brandColor,
        },
      })
      .from(reports)
      .innerJoin(clients, eq(reports.clientId, clients.id))
      .where(and(eq(reports.id, reportId), eq(reports.userId, userId)))
      .limit(1);

    if (!result) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const { report, client } = result;

    const plan = user.plan as "free" | "starter" | "pro";

    // BUG 1 FIX: Pre-compute channel breakdown percentages
    const rawMetrics = report.metricsData as Record<string, any>;
    const channelBreakdown = rawMetrics?.channelBreakdown as Array<{ channel: string; sessions: number; percentage?: number }> | undefined;
    if (channelBreakdown && channelBreakdown.length > 0) {
      const totalSessions = channelBreakdown.reduce((sum: number, ch: any) => sum + (ch.sessions || 0), 0);
      for (const ch of channelBreakdown) {
        ch.percentage = totalSessions > 0 ? Math.round((ch.sessions / totalSessions) * 100) : 0;
      }
      rawMetrics.channelBreakdown = channelBreakdown;
    }

    const pdfBuffer = await renderToBuffer(
      ReportPDFDocument({
        report: {
          id: report.id,
          title: report.title,
          status: report.status || "draft",
          dateRangeStart: report.dateRangeStart.toISOString(),
          dateRangeEnd: report.dateRangeEnd.toISOString(),
          metricsData: rawMetrics,
        },
        client,
        agency: {
          name: user.agencyName,
          website: user.agencyWebsite,
          logoUrl: user.agencyLogoUrl,
          brandColor: user.agencyBrandColor,
        },
        whiteLabel: plan === "pro",
      })
    );

    trackPdfExported(userId, report.id);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[POST /api/reports/[id]/pdf]", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}