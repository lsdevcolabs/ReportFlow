import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../lib/email";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

const VALID_PLANS = ["free", "starter", "pro"] as const;
type Plan = (typeof VALID_PLANS)[number];

router.get("/user/profile", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));
    res.json(profile ?? null);
  } catch (err) {
    req.log.error({ err }, "Failed to get user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/user/profile", requireAuth, async (req: any, res): Promise<void> => {
  const { plan, email, name } = req.body as { plan: Plan; email?: string; name?: string };
  if (!plan || !VALID_PLANS.includes(plan)) {
    res.status(400).json({ error: "Invalid plan. Must be one of: free, starter, pro" });
    return;
  }

  try {
    const [existingProfile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));

    const isNewUser = !existingProfile;

    const [profile] = await db
      .insert(userProfilesTable)
      .values({ userId: req.userId, plan, onboardingComplete: true })
      .onConflictDoUpdate({
        target: userProfilesTable.userId,
        set: { plan, onboardingComplete: true },
      })
      .returning();

    if (isNewUser && email) {
      sendWelcomeEmail(email, name).catch((err) => {
        req.log.error({ err }, "Failed to send welcome email");
      });
    }

    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to save user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
