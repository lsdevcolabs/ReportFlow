import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, clients, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { canUseWhiteLabel } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Service not configured" },
        { status: 500 }
      );
    }

    const { shareToken } = params;

    const result = await db
      .select({
        report: reports,
        client: {
          id: clients.id,
          name: clients.name,
          logoUrl: clients.logoUrl,
          brandColor: clients.brandColor,
        },
        user: {
          plan: users.plan,
          agencyName: users.agencyName,
          agencyWebsite: users.agencyWebsite,
          agencyLogoUrl: users.agencyLogoUrl,
          agencyBrandColor: users.agencyBrandColor,
        },
      })
      .from(reports)
      .innerJoin(clients, eq(reports.clientId, clients.id))
      .innerJoin(users, eq(reports.userId, users.id))
      .where(
        and(
          eq(reports.shareToken, shareToken),
          eq(reports.isPublic, true)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Report not found or not publicly available" },
        { status: 404 }
      );
    }

    const { report, client, user } = result[0];
    const plan = user.plan as "free" | "starter" | "pro";
    const whiteLabel = canUseWhiteLabel(plan);

    return NextResponse.json({
      report: {
        id: report.id,
        title: report.title,
        templateType: report.templateType,
        status: report.status,
        dateRangeStart: report.dateRangeStart.toISOString(),
        dateRangeEnd: report.dateRangeEnd.toISOString(),
        shareToken: report.shareToken,
        isPublic: report.isPublic,
        metricsData: report.metricsData as Record<string, unknown>,
        client,
        agency: {
          name: user.agencyName,
          website: user.agencyWebsite,
          logoUrl: user.agencyLogoUrl,
          brandColor: user.agencyBrandColor,
          whiteLabel,
        },
      },
    });
  } catch (error) {
    console.error("[GET /api/reports/public/[shareToken]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}