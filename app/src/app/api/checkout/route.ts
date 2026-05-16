import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    // Extract product ID if productValue is a URL
    let productId = productValue;
    if (productValue.includes("/buy/")) {
      productId = productValue.split("/buy/")[1].split("?")[0];
    } else if (productValue.startsWith("http")) {
      // Fallback if URL is different but we still need an ID (though unlikely for Dodo)
      const url = new URL(productValue);
      productId = url.pathname.split("/").pop() || productValue;
    }

    if (!DODO_API_KEY || DODO_API_KEY === "your_api_key_here") {
      return NextResponse.json(
        { error: "Payment API key not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Determine environment: check explicit clues first
    let isTestEnv = DODO_API_KEY.toLowerCase().includes("test") || 
                    process.env.NODE_ENV === "development" ||
                    productValue.includes("test") ||
                    productId.includes("test");
    
    let baseUrl = isTestEnv ? "https://test.dodopayments.com" : "https://live.dodopayments.com";

    const checkoutPayload = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: user.email, name: userName },
      return_url: `${appUrl}/dashboard`,
      metadata: { user_id: userId },
    };

    let dodoResponse = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DODO_API_KEY}`,
      },
      body: JSON.stringify(checkoutPayload),
    });

    // If Unauthorized, we might have guessed the wrong environment for the API key
    if (dodoResponse.status === 401 || dodoResponse.status === 403) {
      isTestEnv = !isTestEnv;
      baseUrl = isTestEnv ? "https://test.dodopayments.com" : "https://live.dodopayments.com";
      dodoResponse = await fetch(`${baseUrl}/checkouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DODO_API_KEY}`,
        },
        body: JSON.stringify(checkoutPayload),
      });
    }

    if (!dodoResponse.ok) {
      const errorData = await dodoResponse.text();
      console.error("[POST /api/checkout] Dodo API error:", dodoResponse.status, errorData);

      // We still use a direct fallback just in case the API is down
      const fallbackUrl = `${isTestEnv ? "https://test.checkout.dodopayments.com" : "https://checkout.dodopayments.com"}/buy/${productId}?quantity=1&email=${encodeURIComponent(user.email)}&customer_name=${encodeURIComponent(userName)}&redirect_url=${encodeURIComponent(appUrl + "/dashboard")}&metadata_user_id=${userId}`;
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
  } catch (error: any) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json({ error: "Internal server error", details: error?.message || String(error) }, { status: 500 });
  }
}
