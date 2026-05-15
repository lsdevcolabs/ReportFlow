import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;

    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Report not found" },
        { status: 404 }
      );
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, report.clientId))
      .limit(1);

    return NextResponse.json({ report: { ...report, client } });
  } catch (error) {
    console.error("[GET /api/reports/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;
    const body = await req.json();

    const { title, dateRangeStart, dateRangeEnd, metricsData, isPublic, status, shareToken } = body;

    const [existingReport] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .limit(1);

    if (!existingReport) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Report not found" },
        { status: 404 }
      );
    }

    const [updatedReport] = await db
      .update(reports)
      .set({
        title,
        dateRangeStart: dateRangeStart ? new Date(dateRangeStart) : undefined,
        dateRangeEnd: dateRangeEnd ? new Date(dateRangeEnd) : undefined,
        metricsData: metricsData || undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
        status: status || undefined,
        shareToken: shareToken || undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .returning();

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error("[PUT /api/reports/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;

    const [deletedReport] = await db
      .delete(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)))
      .returning();

    if (!deletedReport) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/reports/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}