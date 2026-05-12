import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkClientLimit } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";

async function getAuthUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs");
    const { userId } = auth();
    return userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ clients: [] });
    }

    const userClients = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));

    return NextResponse.json({ clients: userClients });
  } catch (error) {
    console.error("[GET /api/clients]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { ensureUserExists } = await import("@/lib/auth");
    const user = await ensureUserExists(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, website, industry, brandColor } = body;

    if (!name) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Name is required" },
        { status: 400 }
      );
    }

    const clientLimit = await checkClientLimit(userId, user.plan as Plan);

    if (!clientLimit.allowed) {
      return NextResponse.json(
        {
          error: "LIMIT_EXCEEDED",
          message: clientLimit.upgradeMessage,
          upgradeUrl: clientLimit.upgradeUrl,
        },
        { status: 403 }
      );
    }

    const [newClient] = await db
      .insert(clients)
      .values({
        name,
        email: email || null,
        website: website || null,
        industry: industry || null,
        brandColor: brandColor || "#2563EB",
        userId,
      })
      .returning();

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}