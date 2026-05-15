import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { checkReportLimit } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ reports: [] });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (clientId) {
      const [client] = await db
        .select()
        .from(clients)
        .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
        .limit(1);

      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      const filteredReports = await db
        .select()
        .from(reports)
        .where(and(eq(reports.clientId, clientId), eq(reports.userId, userId)))
        .orderBy(desc(reports.createdAt));

      return NextResponse.json({ reports: filteredReports });
    }

    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));

    return NextResponse.json({ reports: userReports });
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const { clientId, title, dateRangeStart, dateRangeEnd, metricsData, isPublic } = body;

    if (!clientId || !title) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "clientId and title are required" },
        { status: 400 }
      );
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const reportLimit = await checkReportLimit(userId, user.plan as Plan);

    if (!reportLimit.allowed) {
      return NextResponse.json(
        {
          error: "LIMIT_EXCEEDED",
          message: reportLimit.upgradeMessage,
          upgradeUrl: reportLimit.upgradeUrl,
        },
        { status: 403 }
      );
    }

    const shareToken = nanoid(10);

    const [newReport] = await db
      .insert(reports)
      .values({
        clientId,
        userId,
        title,
        dateRangeStart: new Date(dateRangeStart),
        dateRangeEnd: new Date(dateRangeEnd),
        metricsData: metricsData || {},
        shareToken,
        isPublic: isPublic || false,
        status: isPublic ? "published" : "draft",
      })
      .returning();

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ report: newReport }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reports]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}