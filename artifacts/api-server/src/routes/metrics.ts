import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, reportsTable, clientsTable } from "@workspace/db";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { clientsTable as ct, reportsTable as rt } from "@workspace/db";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

router.get("/metrics/dashboard", requireAuth, async (req: any, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals] = await db
      .select({
        totalClients: sql<number>`COUNT(DISTINCT ${clientsTable.id})`.mapWith(Number),
        totalReports: sql<number>`COUNT(DISTINCT ${reportsTable.id})`.mapWith(Number),
      })
      .from(clientsTable)
      .leftJoin(reportsTable, and(
        eq(reportsTable.clientId, clientsTable.id),
        eq(reportsTable.userId, req.userId),
      ))
      .where(eq(clientsTable.userId, req.userId));

    const [monthlyCount] = await db
      .select({
        reportsThisMonth: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.userId, req.userId),
          gte(reportsTable.createdAt, startOfMonth),
        ),
      );

    const [sharedCount] = await db
      .select({
        sharedReports: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.userId, req.userId),
          eq(reportsTable.isPublic, true),
        ),
      );

    const recentReports = await db
      .select({
        id: reportsTable.id,
        clientId: reportsTable.clientId,
        userId: reportsTable.userId,
        title: reportsTable.title,
        dateRangeStart: reportsTable.dateRangeStart,
        dateRangeEnd: reportsTable.dateRangeEnd,
        data: reportsTable.data,
        shareToken: reportsTable.shareToken,
        isPublic: reportsTable.isPublic,
        createdAt: reportsTable.createdAt,
        clientName: clientsTable.name,
        clientEmail: clientsTable.email,
        clientProjectType: clientsTable.projectType,
        clientBrandColor: clientsTable.brandColor,
      })
      .from(reportsTable)
      .leftJoin(clientsTable, eq(reportsTable.clientId, clientsTable.id))
      .where(eq(reportsTable.userId, req.userId))
      .orderBy(desc(reportsTable.createdAt))
      .limit(5);

    res.json({
      totalClients: totals?.totalClients ?? 0,
      totalReports: totals?.totalReports ?? 0,
      reportsThisMonth: monthlyCount?.reportsThisMonth ?? 0,
      sharedReports: sharedCount?.sharedReports ?? 0,
      recentReports,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard metrics");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/metrics/reports-over-time", requireAuth, async (req: any, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const rows = await db
      .select({
        date: sql<string>`DATE(${reportsTable.createdAt})`.as("date"),
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.userId, req.userId),
          gte(reportsTable.createdAt, thirtyDaysAgo),
        ),
      )
      .groupBy(sql`DATE(${reportsTable.createdAt})`)
      .orderBy(sql`DATE(${reportsTable.createdAt})`);

    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get reports over time");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
