import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";

const DODO_API_KEY = process.env.DODO_PAYMENTS_API_KEY || "";

// These can be either a full Dodo checkout URL or a bare product ID
const PLAN_PRODUCTS: Record<string, string> = {
  starter: process.env.DODO_STARTER_PRODUCT_ID || "",
  pro: process.env.DODO_PRO_PRODUCT_ID || "",
};

interface DodoCheckoutResponse {
  checkout_url: string;
  payment_id?: string;
}

/**
 * If the product config value is a full checkout URL
 * (e.g. https://test.checkout.dodopayments.com/buy/pdt_xxx?quantity=1),
 * extract the base URL and append user metadata as query params.
 */
function buildDirectCheckoutUrl(
  productValue: string,
  email: string,
  name: string,
  userId: string,
  appUrl: string
): string {
  try {
    // Strip existing query params and rebuild cleanly
    const base = productValue.split("?")[0];
    const url = new URL(base);
    url.searchParams.set("email", email);
    url.searchParams.set("fullName", name);
    url.searchParams.set("redirect_url", `${appUrl}/dashboard`);
    url.searchParams.set("metadata_user_id", userId);
    return url.toString();
  } catch {
    return productValue;
  }
}

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = clerkUser.id;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    // Ensure user exists in database
    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

    const user = await ensureUserExists(userId, email, name);
    if (!user) {
      return NextResponse.json({ error: "User initialization failed" }, { status: 500 });
    }

    const body = await req.json();
    const { plan } = body;

    const productValue = PLAN_PRODUCTS[plan] || "";
    if (!plan || !productValue) {
      return NextResponse.json(
        { error: "Invalid plan or plan not configured." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reportflow-two.vercel.app";
    const userName = user.name || user.email.split("@")[0];

    // ──────────────────────────────────────────────────────────────────
    // CASE 1: Product value is a full Dodo checkout URL
    // e.g. https://test.checkout.dodopayments.com/buy/pdt_xxx
    // Just redirect to it directly with user metadata — no API call needed.
    // ──────────────────────────────────────────────────────────────────
    if (productValue.startsWith("http")) {
      const checkoutUrl = buildDirectCheckoutUrl(
        productValue,
        user.email,
        userName,
        userId,
        appUrl
      );
      console.log(`[POST /api/checkout] Direct URL checkout for plan=${plan}`);
      return NextResponse.json({ checkoutUrl });
    }

    // ──────────────────────────────────────────────────────────────────
    // CASE 2: Product value is a bare product ID — use the Dodo API
    // ──────────────────────────────────────────────────────────────────
    if (!DODO_API_KEY || DODO_API_KEY === "your_api_key_here") {
      return NextResponse.json(
        { error: "Payment API key not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Determine environment: test if API key starts with test prefix or has "test" in it
    const isTestKey = DODO_API_KEY.toLowerCase().includes("test") || 
                      process.env.NODE_ENV === "development";
    const baseUrl = isTestKey
      ? "https://test.dodopayments.com"
      : "https://dodopayments.com";

    const checkoutPayload = {
      product_cart: [{ product_id: productValue, quantity: 1 }],
      customer: { email: user.email, name: userName },
      return_url: `${appUrl}/dashboard`,
      metadata: { user_id: userId },
    };

    const dodoResponse = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    if (!dodoResponse.ok) {
      const errorData = await dodoResponse.text();
      console.error("[POST /api/checkout] Dodo API error:", errorData);

      // Fallback: build a direct checkout URL using the product ID
      const fallbackUrl = `${isTestKey ? "https://test.checkout.dodopayments.com" : "https://checkout.dodopayments.com"}/buy/${productValue}?email=${encodeURIComponent(user.email)}&fullName=${encodeURIComponent(userName)}&redirect_url=${encodeURIComponent(appUrl + "/dashboard")}&metadata_user_id=${userId}`;
      return NextResponse.json({
        checkoutUrl: fallbackUrl,
        warning: "API call failed, used direct link fallback.",
      });
    }

    const checkoutData: DodoCheckoutResponse = await dodoResponse.json();
    return NextResponse.json({
      checkoutUrl: checkoutData.checkout_url,
      paymentId: checkoutData.payment_id,
    });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
