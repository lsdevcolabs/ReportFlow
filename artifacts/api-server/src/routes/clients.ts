import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, clientsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreateClientBody, UpdateClientBody } from "@workspace/api-zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

router.get("/clients", requireAuth, async (req: any, res) => {
  try {
    const clients = await db
      .select({
        id: clientsTable.id,
        userId: clientsTable.userId,
        name: clientsTable.name,
        email: clientsTable.email,
        projectType: clientsTable.projectType,
        brandColor: clientsTable.brandColor,
        logoUrl: clientsTable.logoUrl,
        createdAt: clientsTable.createdAt,
        reportCount: sql<number>`(
          SELECT COUNT(*) FROM reports WHERE reports.client_id = ${clientsTable.id}
        )`.mapWith(Number),
      })
      .from(clientsTable)
      .where(eq(clientsTable.userId, req.userId));
    res.json(clients);
  } catch (err) {
    req.log.error({ err }, "Failed to list clients");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clients", requireAuth, async (req: any, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const [client] = await db
      .insert(clientsTable)
      .values({ ...parsed.data, userId: req.userId })
      .returning();
    res.status(201).json({ ...client, reportCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create client");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/clients/:clientId", requireAuth, async (req: any, res) => {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) return res.status(400).json({ error: "Invalid clientId" });

  try {
    const [client] = await db
      .select({
        id: clientsTable.id,
        userId: clientsTable.userId,
        name: clientsTable.name,
        email: clientsTable.email,
        projectType: clientsTable.projectType,
        brandColor: clientsTable.brandColor,
        logoUrl: clientsTable.logoUrl,
        createdAt: clientsTable.createdAt,
        reportCount: sql<number>`(
          SELECT COUNT(*) FROM reports WHERE reports.client_id = ${clientsTable.id}
        )`.mapWith(Number),
      })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, req.userId)));

    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  } catch (err) {
    req.log.error({ err }, "Failed to get client");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/clients/:clientId", requireAuth, async (req: any, res) => {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) return res.status(400).json({ error: "Invalid clientId" });

  const parsed = UpdateClientBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const [client] = await db
      .update(clientsTable)
      .set(parsed.data)
      .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, req.userId)))
      .returning();

    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ ...client, reportCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to update client");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clients/:clientId", requireAuth, async (req: any, res) => {
  const clientId = parseInt(req.params.clientId);
  if (isNaN(clientId)) return res.status(400).json({ error: "Invalid clientId" });

  try {
    await db
      .delete(clientsTable)
      .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, req.userId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete client");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
