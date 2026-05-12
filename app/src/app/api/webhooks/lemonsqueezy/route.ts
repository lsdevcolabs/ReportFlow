import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const LEMON_SQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

interface LemonSqueezyEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      email?: string;
      name?: string;
    };
  };
  data: {
    id: string;
    attributes: {
      customer_id?: number;
      subscription_id?: number;
      status?: string;
      product_id?: number;
      variant_id?: number;
      user_name?: string;
      user_email?: string;
      ends_at?: string;
      trial_ends_at?: string;
      active?: boolean;
    };
  };
}

function verifySignature(payload: string, signature: string): boolean {
  if (!LEMON_SQUEEZY_WEBHOOK_SECRET) {
    console.warn("LEMONSQUEEZY_WEBHOOK_SECRET not set - skipping signature verification");
    return true;
  }

  const hmac = crypto.createHmac("sha256", LEMON_SQUEEZY_WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

function getPlanFromVariantId(variantId: number): string {
  const STARTER_VARIANT_ID = parseInt(process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || "0", 10);
  const PRO_VARIANT_ID = parseInt(process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "0", 10);

  if (variantId === STARTER_VARIANT_ID) return "starter";
  if (variantId === PRO_VARIANT_ID) return "pro";
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
  };
  return statusMap[status] || "inactive";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const signature = req.headers.get("X-Signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const rawBody = await req.text();
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: LemonSqueezyEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const customData = event.meta.custom_data || {};

    const userId = customData.user_id ||
      (event.data.attributes.user_email
        ? await getUserIdByEmail(event.data.attributes.user_email)
        : null);

    if (!userId) {
      console.error("[Lemon Squeezy Webhook] No user ID found in event");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const plan = getPlanFromVariantId(event.data.attributes.variant_id || 0);
        const subscriptionStatus = getSubscriptionStatus(event.data.attributes.status || "");

        await db
          .update(users)
          .set({
            plan,
            lsCustomerId: event.data.attributes.customer_id?.toString(),
            lsSubscriptionId: event.data.id,
            subscriptionStatus,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Lemon Squeezy] Subscription ${eventName}: user=${userId}, plan=${plan}, status=${subscriptionStatus}`);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        await db
          .update(users)
          .set({
            plan: "free",
            subscriptionStatus: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Lemon Squeezy] Subscription ${eventName}: user=${userId} downgraded to free`);
        break;
      }

      case "subscription_resumed": {
        const plan = getPlanFromVariantId(event.data.attributes.variant_id || 0);

        await db
          .update(users)
          .set({
            plan,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        console.log(`[Lemon Squeezy] Subscription resumed: user=${userId}, plan=${plan}`);
        break;
      }

      default:
        console.log(`[Lemon Squeezy] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/webhooks/lemonsqueezy]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return user?.id || null;
}