import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";
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

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = clerkUser.id;

    if (!process.env.DATABASE_URL || !process.env.LEMONSQUEEZY_API_KEY) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    // Ensure user exists in database
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    
    const user = await ensureUserExists(userId, email, name);

    if (!user) {
      return NextResponse.json({ error: "User initialization failed" }, { status: 500 });
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
    
    // FALLBACK: If Store ID is not configured or Variant ID looks like a UUID (checkout link),
    // we can return a direct checkout URL with the user_id appended as a query parameter.
    // This allows testing even if the API configuration is incomplete.
    const isUuid = variantId.includes("-") && variantId.length > 10;
    if (!LEMONSQUEEZY_STORE_ID || LEMONSQUEEZY_STORE_ID === "..." || isUuid) {
      console.log("[POST /api/checkout] Using fallback direct checkout link");
      
      // If variantId is just a UUID, we assume it's a checkout link ID
      // The base URL is usually your-store.lemonsqueezy.com/checkout/buy/
      // We'll try to construct it or use the one provided.
      const baseUrl = "https://lsdevco.lemonsqueezy.com/checkout/buy/";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutUrl = `${baseUrl}${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(user.email)}&checkout[redirect]=${encodeURIComponent(appUrl + "/dashboard")}`;
      
      return NextResponse.json({ checkoutUrl });
    }

    const checkoutPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
            custom: {
              user_id: userId,
            },
          },
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
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
      const errorData = await lsResponse.json();
      console.error("[POST /api/checkout] Lemon Squeezy error:", JSON.stringify(errorData));
      
      // Fallback if API fails (e.g. invalid store/variant ID)
      const baseUrl = "https://lsdevco.lemonsqueezy.com/checkout/buy/";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const checkoutUrl = `${baseUrl}${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(user.email)}&checkout[redirect]=${encodeURIComponent(appUrl + "/dashboard")}`;
      
      return NextResponse.json({ 
        checkoutUrl,
        warning: "API call failed, used direct link fallback. Check console for details." 
      });
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