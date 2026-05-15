import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY || "";
const isTestMode = process.env.NODE_ENV === "development" || 
  (process.env.DODO_STARTER_PRODUCT_ID || "").includes("test") ||
  (process.env.DODO_PRO_PRODUCT_ID || "").includes("test");
const DODO_ENVIRONMENT = isTestMode ? "test_mode" : "live_mode";

/**
 * POST /api/verify-payment
 * Checks the Dodo Payments API for payments and subscriptions matching the user's email,
 * and updates the plan in the database accordingly.
 * This is needed because Dodo Payments webhooks can't reach localhost during development.
 */
export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    if (!DODO_API_KEY || DODO_API_KEY === "...") {
      return NextResponse.json({ error: "Dodo Payments not configured" }, { status: 500 });
    }

    // Step 1: Try to find customer by email using Dodo Payments API
    const customerRes = await fetch(
      `https://${DODO_ENVIRONMENT === 'test_mode' ? 'test.' : ''}dodopayments.com/customers?email=${encodeURIComponent(email)}`,
      {
        headers: {
          "Authorization": `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!customerRes.ok) {
      console.error("[verify-payment] Failed to fetch customers:", await customerRes.text());
      return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 });
    }

    const customerData = await customerRes.json();
    const customers = customerData.data || [];

    if (customers.length === 0) {
      return NextResponse.json({ 
        updated: false, 
        plan: "free",
        message: "No Dodo Payments customer found for this email" 
      });
    }

    const customerId = customers[0].id;

    // Step 2: Find subscriptions for this customer
    const subRes = await fetch(
      `https://${DODO_ENVIRONMENT === 'test_mode' ? 'test.' : ''}dodopayments.com/subscriptions?customer_id=${customerId}`,
      {
        headers: {
          "Authorization": `Bearer ${DODO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!subRes.ok) {
      console.error("[verify-payment] Failed to fetch subscriptions:", await subRes.text());
      return NextResponse.json({ error: "Failed to check subscriptions" }, { status: 500 });
    }

    const subData = await subRes.json();
    const subscriptions = subData.data || [];

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        updated: false, 
        plan: "free",
        message: "No subscriptions found" 
      });
    }

    // Step 3: Find the most recent active subscription
    const activeSub = subscriptions.find(
      (sub: any) => sub.attributes.status === "active" || sub.attributes.status === "trialing"
    ) || subscriptions[0]; // fallback to latest

    const status = activeSub.attributes.status;
    const productName = activeSub.attributes.product_name?.toLowerCase() || "";
    const variantName = activeSub.attributes.variant_name?.toLowerCase() || "";
    const subscriptionId = activeSub.id;
    const paymentId = activeSub.attributes.payment?.id;
    
    // Determine plan from product/variant name
    let plan = "free";
    if (productName.includes("pro") || variantName.includes("pro")) {
      plan = "pro";
    } else if (productName.includes("starter") || variantName.includes("starter")) {
      plan = "starter";
    } else if (status === "active" || status === "trialing") {
      // If we can't determine the plan from name, check price
      const price = activeSub.attributes.price || 0;
      if (price >= 2900) {
        plan = "pro";
      } else if (price >= 900) {
        plan = "starter";
      }
    }

    // Map Dodo status to our status
    const statusMap: Record<string, string> = {
      active: "active",
      trialing: "active",
      past_due: "past_due",
      unpaid: "past_due",
      cancelled: "cancelled",
      expired: "cancelled",
      on_hold: "inactive",
      failed: "past_due",
      paused: "inactive",
    };
    const subscriptionStatus = statusMap[status] || "inactive";

    // Only set plan if subscription is active
    if (subscriptionStatus !== "active") {
      plan = "free";
    }

    // Step 4: Update the database
    await db
      .update(users)
      .set({
        plan,
        dodoCustomerId: customerId,
        dodoSubscriptionId: subscriptionId,
        dodoPaymentId: paymentId,
        subscriptionStatus,
        updatedAt: new Date(),
      })
      .where(eq(users.id, clerkUser.id));

    console.log(`[verify-payment] Updated user ${clerkUser.id}: plan=${plan}, status=${subscriptionStatus}`);

    return NextResponse.json({
      updated: true,
      plan,
      subscriptionStatus,
      message: `Plan updated to ${plan}`,
    });
  } catch (error) {
    console.error("[POST /api/verify-payment]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
