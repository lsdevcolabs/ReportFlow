import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, reportsTable, clientsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreateReportBody, UpdateReportBody } from "@workspace/api-zod";
import crypto from "crypto";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

async function enrichReport(report: any, db: any) {
  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.id, report.clientId));
  return {
    ...report,
    clientName: client?.name ?? "",
    clientEmail: client?.email ?? "",
    clientProjectType: client?.projectType ?? "",
    clientBrandColor: client?.brandColor ?? null,
  };
}

router.get("/reports", requireAuth, async (req: any, res) => {
  try {
    const clientId = req.query.clientId ? parseInt(req.query.clientId) : undefined;

    let query = db
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
      .leftJoin(clientsTable, eq(reportsTable.clientId, clientsTable.id));

    const conditions = [eq(reportsTable.userId, req.userId)];
    if (clientId) conditions.push(eq(reportsTable.clientId, clientId));

    const reports = await (query as any).where(and(...conditions));
    res.json(reports);
  } catch (err) {
    req.log.error({ err }, "Failed to list reports");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports", requireAuth, async (req: any, res) => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const isPublic = parsed.data.isPublic ?? false;
    const shareToken = isPublic ? crypto.randomBytes(16).toString("hex") : null;

    const [report] = await db
      .insert(reportsTable)
      .values({
        ...parsed.data,
        userId: req.userId,
        isPublic,
        shareToken,
      })
      .returning();

    const enriched = await enrichReport(report, db);
    res.status(201).json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/shared/:shareToken", async (req, res) => {
  try {
    const [report] = await db
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
      .where(
        and(
          eq(reportsTable.shareToken, req.params.shareToken),
          eq(reportsTable.isPublic, true),
        ),
      );

    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    (req as any).log.error({ err }, "Failed to get shared report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/:reportId", requireAuth, async (req: any, res) => {
  const reportId = parseInt(req.params.reportId);
  if (isNaN(reportId)) return res.status(400).json({ error: "Invalid reportId" });

  try {
    const [report] = await db
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
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, req.userId)));

    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Failed to get report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/reports/:reportId", requireAuth, async (req: any, res) => {
  const reportId = parseInt(req.params.reportId);
  if (isNaN(reportId)) return res.status(400).json({ error: "Invalid reportId" });

  const parsed = UpdateReportBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const existing = await db
      .select()
      .from(reportsTable)
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, req.userId)));

    if (!existing[0]) return res.status(404).json({ error: "Report not found" });

    const updateData: any = { ...parsed.data };
    if (parsed.data.isPublic === true && !existing[0].shareToken) {
      updateData.shareToken = crypto.randomBytes(16).toString("hex");
    }
    if (parsed.data.isPublic === false) {
      updateData.shareToken = null;
    }

    const [report] = await db
      .update(reportsTable)
      .set(updateData)
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, req.userId)))
      .returning();

    const enriched = await enrichReport(report, db);
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to update report");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/reports/:reportId", requireAuth, async (req: any, res) => {
  const reportId = parseInt(req.params.reportId);
  if (isNaN(reportId)) return res.status(400).json({ error: "Invalid reportId" });

  try {
    await db
      .delete(reportsTable)
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, req.userId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete report");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
