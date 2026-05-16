import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { addMonths } from "date-fns";
import { checkReportLimit } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";

/**
 * POST /api/reports/[id]/duplicate
 * Duplicates a report for the next period:
 * - Same client, same structure
 * - Title auto-incremented (Q1 → Q2, January → February, etc.)
 * - Date range advanced by 1 month
 * - All metric values cleared to zero/empty
 * - Status set to draft, isPublic false
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { id } = params;

    // Fetch the original report — ownership check included
    const [original] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .limit(1);

    if (!original) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Report not found" },
        { status: 404 }
      );
    }

    // Check user's plan and report limits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const plan = (user?.plan || "free") as Plan;
    const reportLimit = await checkReportLimit(userId, plan);

    if (!reportLimit.allowed) {
      return NextResponse.json(
        {
          error: "PLAN_LIMIT_REACHED",
          message: reportLimit.upgradeMessage,
          upgradeUrl: reportLimit.upgradeUrl,
        },
        { status: 403 }
      );
    }

    // Clone the report with cleared metrics and advanced dates
    const newId = nanoid(10);
    const newShareToken = nanoid(10);
    const clearedMetrics = clearMetricValues(original.metricsData);
    const newTitle = incrementReportTitle(original.title);

    const [newReport] = await db
      .insert(reports)
      .values({
        id: newId,
        clientId: original.clientId,
        userId: original.userId,
        title: newTitle,
        dateRangeStart: addMonths(new Date(original.dateRangeStart), 1),
        dateRangeEnd: addMonths(new Date(original.dateRangeEnd), 1),
        metricsData: clearedMetrics,
        shareToken: newShareToken,
        isPublic: false,
        status: "draft",
      })
      .returning();

    return NextResponse.json({ report: newReport }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reports/[id]/duplicate]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: Auto-increment report title for the next period
// ---------------------------------------------------------------------------
function incrementReportTitle(title: string): string {
  // Quarter pattern: Q1 2026 → Q2 2026, Q4 2026 → Q1 2027
  const quarterMatch = title.match(/Q([1-4])\s+(\d{4})/);
  if (quarterMatch) {
    let q = parseInt(quarterMatch[1]);
    let y = parseInt(quarterMatch[2]);
    if (q === 4) {
      q = 1;
      y++;
    } else {
      q++;
    }
    return title.replace(/Q[1-4]\s+\d{4}/, `Q${q} ${y}`);
  }

  // Month name pattern: January 2026 → February 2026, December 2026 → January 2027
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  for (let i = 0; i < months.length; i++) {
    const regex = new RegExp(`${months[i]}\\s+(\\d{4})`);
    const monthMatch = title.match(regex);
    if (monthMatch) {
      let y = parseInt(monthMatch[1]);
      let m = i;
      if (m === 11) {
        m = 0;
        y++;
      } else {
        m++;
      }
      return title.replace(regex, `${months[m]} ${y}`);
    }
  }

  // Week pattern: Week 12 → Week 13
  const weekMatch = title.match(/Week\s+(\d+)/i);
  if (weekMatch) {
    const nextWeek = parseInt(weekMatch[1]) + 1;
    return title.replace(/Week\s+\d+/i, `Week ${nextWeek}`);
  }

  // Fallback — append (Copy)
  return title + " (Copy)";
}

// ---------------------------------------------------------------------------
// Helper: Clear all numeric metric values but preserve labels/structure
// ---------------------------------------------------------------------------
function clearMetricValues(metricsData: any): any {
  if (!metricsData || typeof metricsData !== "object") {
    return {};
  }

  return {
    ...metricsData,
    summary: metricsData.summary
      ? Object.fromEntries(
          Object.entries(metricsData.summary).map(([k, v]) =>
            typeof v === "number" ? [k, 0] : [k, v]
          )
        )
      : {},
    channelBreakdown: (metricsData.channelBreakdown || []).map((ch: any) => ({
      ...ch,
      sessions: 0,
      percentage: 0,
    })),
    weeklyTrend: (metricsData.weeklyTrend || []).map((w: any) => ({
      ...w,
      sessions: 0,
      conversions: 0,
    })),
    customMetrics: (metricsData.customMetrics || []).map((m: any) => ({
      ...m,
      value: "",
      change: "",
      changeType: "neutral",
    })),
    notes: "",
  };
}
