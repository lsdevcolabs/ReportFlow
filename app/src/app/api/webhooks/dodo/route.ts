import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    if (!DODO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const rawBody = await req.text();
    
    // Verify webhook signature using standard-webhooks
    const webhook = new Webhook(DODO_WEBHOOK_SECRET);
    const signature = req.headers.get("webhook-signature") || "";
    
    try {
      await webhook.verify(rawBody, {
        "webhook-id": req.headers.get("webhook-id") || "",
        "webhook-signature": signature,
        "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
      });
    } catch (verificationError) {
      console.error("[Dodo Webhook] Signature verification failed:", verificationError);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: DodoWebhookPayload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    // Extract user ID from metadata or email
    let userId: string | null = null;
    
    // Try to get user from email first
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`[Dodo Webhook] Processing event: ${event} for user: ${userId}`);

    switch (event) {
      case "payment.succeeded": {
        const payment = data.attributes.payment;
        if (payment && payment.status === "succeeded") {
          // Update user with payment information
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
              dodoSubscriptionId: subscription.id,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Dodo Webhook] Subscription plan changed: user=${userId}, newPlan=${plan}`);
        }
        break;
      }

      case "subscription.on_hold":
      case "subscription.failed": {
        const subscription = data.attributes.subscription;
        if (subscription) {
          await db
            .update(users)
            .set({
              subscriptionStatus: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Dodo Webhook] Subscription ${event}: user=${userId}, status=past_due`);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        await db
          .update(users)
          .set({
            plan: "free",
            subscriptionStatus: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Dodo Webhook] Subscription ${event}: user=${userId} downgraded to free`);
        break;
      }

      case "subscription.updated": {
        const subscription = data.attributes.subscription;
        if (subscription) {
          const plan = getPlanFromProductName(
            subscription.product_name || "",
            subscription.variant_name || "",
            subscription.price || 0
          );
          const subscriptionStatus = getSubscriptionStatus(subscription.status || "");

          await db
            .update(users)
            .set({
              plan,
              dodoSubscriptionId: subscription.id,
              subscriptionStatus,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`[Dodo Webhook] Subscription updated: user=${userId}, plan=${plan}, status=${subscriptionStatus}`);
        }
        break;
      }

      default:
        console.log(`[Dodo Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/webhooks/dodo]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}