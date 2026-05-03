import { Router } from "express";
import crypto from "node:crypto";
import { getAuth } from "@clerk/express";
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import { db, subscriptionsTable, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function initLS() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) throw new Error("LEMONSQUEEZY_API_KEY is not set");
  lemonSqueezySetup({ apiKey, onError: (e) => console.error("[LemonSqueezy]", e) });
}

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

function getVariantIdForPlan(plan: string): string | null {
  if (plan === "starter") return process.env.LEMONSQUEEZY_STARTER_VARIANT_ID ?? null;
  if (plan === "pro") return process.env.LEMONSQUEEZY_PRO_VARIANT_ID ?? null;
  return null;
}

function getPlanForVariantId(variantId: string): string | null {
  if (variantId === process.env.LEMONSQUEEZY_STARTER_VARIANT_ID) return "starter";
  if (variantId === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return "pro";
  return null;
}

function getAppBaseUrl(): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0]}`;
  return process.env.APP_URL ?? "http://localhost:80";
}

// POST /api/billing/checkout
router.post("/billing/checkout", requireAuth, async (req: any, res): Promise<void> => {
  const { plan } = req.body as { plan?: string };

  if (!plan || !["starter", "pro"].includes(plan)) {
    res.status(400).json({ error: "plan must be 'starter' or 'pro'" });
    return;
  }

  const variantId = getVariantIdForPlan(plan);
  if (!variantId) {
    res.status(500).json({ error: `LEMONSQUEEZY_${plan.toUpperCase()}_VARIANT_ID is not configured` });
    return;
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) {
    res.status(500).json({ error: "LEMONSQUEEZY_STORE_ID is not configured" });
    return;
  }

  try {
    initLS();

    const auth = getAuth(req);
    const userEmail = (auth?.sessionClaims?.email as string) ?? undefined;

    const baseUrl = getAppBaseUrl();

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: userEmail,
        custom: { user_id: req.userId },
      },
      productOptions: {
        redirectUrl: `${baseUrl}/dashboard`,
        enabledVariants: [parseInt(variantId, 10)],
      },
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
      },
    });

    if (error || !data?.data?.attributes?.url) {
      req.log.error({ error }, "Failed to create LS checkout");
      res.status(500).json({ error: "Failed to create checkout" });
      return;
    }

    res.json({ checkoutUrl: data.data.attributes.url });
  } catch (err) {
    req.log.error({ err }, "Billing checkout error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/billing/portal
router.get("/billing/portal", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, req.userId));

    if (!sub) {
      res.status(404).json({ error: "No active subscription found" });
      return;
    }

    initLS();

    const { data, error } = await getSubscription(sub.lsSubscriptionId);

    if (error || !data?.data?.attributes) {
      req.log.error({ error }, "Failed to fetch LS subscription");
      res.status(500).json({ error: "Failed to fetch subscription" });
      return;
    }

    const portalUrl = (data.data.attributes as any).urls?.customer_portal;
    if (!portalUrl) {
      res.status(500).json({ error: "Portal URL not available" });
      return;
    }

    res.json({ portalUrl });
  } catch (err) {
    req.log.error({ err }, "Billing portal error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/billing/subscription
router.get("/billing/subscription", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, req.userId));

    res.json(sub ?? null);
  } catch (err) {
    req.log.error({ err }, "Billing subscription fetch error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/billing/webhook  — raw body required, registered before express.json() in app.ts
router.post("/billing/webhook", async (req: any, res): Promise<void> => {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    res.status(500).send("Webhook secret not configured");
    return;
  }

  const rawBody: Buffer = req.body;
  if (!Buffer.isBuffer(rawBody)) {
    res.status(400).send("Raw body required");
    return;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from((req.headers["x-signature"] as string) ?? "", "utf8");

  try {
    if (!crypto.timingSafeEqual(digest, signature)) {
      res.status(401).send("Invalid signature");
      return;
    }
  } catch {
    res.status(401).send("Invalid signature");
    return;
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    res.status(400).send("Invalid JSON");
    return;
  }

  const eventName: string = payload?.meta?.event_name;
  const attrs = payload?.data?.attributes;
  const lsSubscriptionId = String(payload?.data?.id ?? "");
  const userId: string | undefined = payload?.meta?.custom_data?.user_id;

  res.status(200).send("OK");

  try {
    if (eventName === "subscription_created" || eventName === "subscription_updated") {
      if (!userId || !lsSubscriptionId) return;

      const variantId = String(attrs?.variant_id ?? "");
      const plan = getPlanForVariantId(variantId) ?? "starter";
      const status: string = attrs?.status ?? "active";

      await db
        .insert(subscriptionsTable)
        .values({
          userId,
          lsSubscriptionId,
          lsCustomerId: String(attrs?.customer_id ?? ""),
          lsVariantId: variantId,
          lsOrderId: String(attrs?.order_id ?? ""),
          plan,
          status,
          renewsAt: attrs?.renews_at ? new Date(attrs.renews_at) : null,
          endsAt: attrs?.ends_at ? new Date(attrs.ends_at) : null,
          trialEndsAt: attrs?.trial_ends_at ? new Date(attrs.trial_ends_at) : null,
        })
        .onConflictDoUpdate({
          target: subscriptionsTable.lsSubscriptionId,
          set: {
            plan,
            status,
            lsVariantId: variantId,
            renewsAt: attrs?.renews_at ? new Date(attrs.renews_at) : null,
            endsAt: attrs?.ends_at ? new Date(attrs.ends_at) : null,
            trialEndsAt: attrs?.trial_ends_at ? new Date(attrs.trial_ends_at) : null,
            updatedAt: new Date(),
          },
        });

      // Sync plan onto user_profiles
      if (["active", "on_trial"].includes(status)) {
        await db
          .insert(userProfilesTable)
          .values({ userId, plan, onboardingComplete: true })
          .onConflictDoUpdate({
            target: userProfilesTable.userId,
            set: { plan, onboardingComplete: true },
          });
      } else if (["cancelled", "expired"].includes(status)) {
        await db
          .update(userProfilesTable)
          .set({ plan: "free" })
          .where(eq(userProfilesTable.userId, userId));
      }
    }
  } catch (err) {
    req.log.error({ err, eventName }, "Webhook DB error");
  }
});

export default router;
