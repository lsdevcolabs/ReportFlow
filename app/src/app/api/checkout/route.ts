import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || "";
const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";

const PLAN_VARIANTS: Record<string, string> = {
  starter: process.env.LEMONSQUEEZY_STARTER_VARIANT_ID || "",
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "",
};

interface LemonSqueezyCheckout {
  data: {
    id: string;
    attributes: {
      url: string;
    };
  };
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs");
    const { userId } = auth();
    return userId;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL || !process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then(rows => rows[0] || null);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !PLAN_VARIANTS[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'starter' or 'pro'." },
        { status: 400 }
      );
    }

    const variantId = PLAN_VARIANTS[plan];
    if (!variantId) {
      return NextResponse.json(
        { error: "Plan variant not configured" },
        { status: 500 }
      );
    }

    const checkoutPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
          },
          custom_data: {
            user_id: userId,
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LEMONSQUEEZY_API_KEY}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!lsResponse.ok) {
      const errorText = await lsResponse.text();
      console.error("[POST /api/checkout] Lemon Squeezy error:", errorText);
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    const checkoutData: LemonSqueezyCheckout = await lsResponse.json();
    const checkoutUrl = checkoutData.data.attributes.url;

    return NextResponse.json({
      checkoutUrl,
    });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}