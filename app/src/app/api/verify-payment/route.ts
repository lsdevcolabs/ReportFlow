import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";

/**
 * POST /api/verify-payment
 * Checks the Lemon Squeezy API for subscriptions matching the user's email,
 * and updates the plan in the database accordingly.
 * This is needed because LS webhooks can't reach localhost during development.
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

    if (!LEMONSQUEEZY_API_KEY || LEMONSQUEEZY_API_KEY === "...") {
      return NextResponse.json({ error: "Lemon Squeezy not configured" }, { status: 500 });
    }

    // Step 1: Find customer by email
    const customerRes = await fetch(
      `https://api.lemonsqueezy.com/v1/customers?filter[email]=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
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
        message: "No Lemon Squeezy customer found for this email" 
      });
    }

    // Step 2: Find subscriptions for this customer
    const customerId = customers[0].id;
    const subRes = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions?filter[customer_id]=${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
          Accept: "application/vnd.api+json",
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
    
    // Determine plan from product/variant name
    let plan = "free";
    if (productName.includes("pro") || variantName.includes("pro")) {
      plan = "pro";
    } else if (productName.includes("starter") || variantName.includes("starter")) {
      plan = "starter";
    } else if (status === "active" || status === "trialing") {
      // If we can't determine the plan from name, check price
      const price = activeSub.attributes.first_subscription_item?.price || 0;
      if (price >= 2900) {
        plan = "pro";
      } else if (price >= 900) {
        plan = "starter";
      }
    }

    // Map LS status to our status
    const statusMap: Record<string, string> = {
      active: "active",
      trialing: "active",
      past_due: "past_due",
      unpaid: "past_due",
      cancelled: "cancelled",
      expired: "cancelled",
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
        lsCustomerId: customerId,
        lsSubscriptionId: subscriptionId,
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
