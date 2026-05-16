import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { trackPlanUpgraded } from "@/lib/analytics";

const DODO_WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || "";

interface DodoWebhookPayload {
  event: string;
  data: {
    id: string;
    type: string;
    attributes: {
      status?: string;
      customer?: {
        id: string;
        email?: string;
      };
      subscription?: {
        id: string;
        status?: string;
        variant_id?: number;
        product_name?: string;
        variant_name?: string;
        price?: number;
      };
      payment?: {
        id: string;
        status?: string;
      };
    };
  };
}

function getPlanFromProductName(productName: string, variantName: string, price: number): string {
  const name = (productName + " " + variantName).toLowerCase();
  if (name.includes("pro") || price >= 2900) return "pro";
  if (name.includes("starter") || price >= 900) return "starter";
  return "free";
}

function getSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "active",
    past_due: "past_due",
    unpaid: "past_due",
    cancelled: "cancelled",
    expired: "cancelled",
    paused: "inactive",
    on_hold: "inactive",
    failed: "past_due",
  };
  return statusMap[status] || "inactive";
}

export async function POST(req: NextRequest) {
  // Always return 200 immediately — process webhook in background
  // This prevents Dodo from retrying and ensures fast response times

  if (!process.env.DATABASE_URL || !DODO_WEBHOOK_SECRET) {
    return new NextResponse(null, { status: 200 });
  }

  const rawBody = await req.text();

  // Verify webhook signature
  try {
    const webhook = new Webhook(DODO_WEBHOOK_SECRET);
    await webhook.verify(rawBody, {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
    });
  } catch (verificationError) {
    console.error("[Dodo Webhook] Signature verification failed:", verificationError);
    return new NextResponse(null, { status: 200 });
  }

  // Process webhook asynchronously (fire-and-forget)
  processWebhook(rawBody).catch((err) => {
    console.error("[Dodo Webhook] Background processing error:", err);
  });

  return new NextResponse(null, { status: 200 });
}

async function processWebhook(rawBody: string): Promise<void> {
  const payload: DodoWebhookPayload = JSON.parse(rawBody);
  const event = payload.event;
  const data = payload.data;

  // Extract user ID from email
  let userId: string | null = null;

  if (data.attributes.customer?.email) {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.attributes.customer.email.toLowerCase()))
      .limit(1);
    userId = user?.id || null;
  }

  if (!userId) {
    console.error("[Dodo Webhook] No user found for event:", event);
    return;
  }

  console.log(`[Dodo Webhook] Processing event: ${event} for user: ${userId}`);

  switch (event) {
    case "payment.succeeded": {
      const payment = data.attributes.payment;
      if (payment && payment.status === "succeeded") {
        await db
          .update(users)
          .set({
            dodoPaymentId: payment.id,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Payment succeeded: user=${userId}, paymentId=${payment.id}`);
      }
      break;
    }

    case "subscription.active":
    case "subscription.renewed": {
      const subscription = data.attributes.subscription;
      if (subscription && subscription.status === "active") {
        const plan = getPlanFromProductName(
          subscription.product_name || "",
          subscription.variant_name || "",
          subscription.price || 0
        );

        const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const previousPlan = currentUser?.plan || "free";

        await db
          .update(users)
          .set({
            plan,
            dodoCustomerId: data.attributes.customer?.id,
            dodoSubscriptionId: subscription.id,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        if (plan !== previousPlan) {
          trackPlanUpgraded(userId, previousPlan, plan);
        }

        console.log(`[Dodo Webhook] Subscription ${event}: user=${userId}, plan=${plan}, status=active`);
      }
      break;
    }

    case "subscription.plan_changed": {
      const subscription = data.attributes.subscription;
      if (subscription) {
        const plan = getPlanFromProductName(
          subscription.product_name || "",
          subscription.variant_name || "",
          subscription.price || 0
        );

        await db
          .update(users)
          .set({
            plan,
            dodoCustomerId: data.attributes.customer?.id,
            dodoSubscriptionId: subscription.id,
            subscriptionStatus: getSubscriptionStatus(subscription.status || "active"),
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Subscription ${event}: User ${userId} -> plan=${plan}, status=${subscription.status}`);
      }
      break;
    }

    case "subscription.cancelled": {
      const subscription = data.attributes.subscription;
      if (subscription) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Subscription cancelled: user=${userId}`);
      }
      break;
    }

    case "subscription.expired": {
      const subscription = data.attributes.subscription;
      if (subscription) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "inactive",
            plan: "free",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Subscription expired: user=${userId} downgraded to free`);
      }
      break;
    }

    case "subscription.on_hold": {
      const subscription = data.attributes.subscription;
      if (subscription) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Subscription on_hold: user=${userId}`);
      }
      break;
    }

    case "payment.failed": {
      const payment = data.attributes.payment;
      if (payment) {
        await db
          .update(users)
          .set({
            subscriptionStatus: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Payment failed: user=${userId}, paymentId=${payment.id}`);
      }
      break;
    }

    default:
      console.log(`[Dodo Webhook] Unhandled event type: ${event}`);
  }
}
