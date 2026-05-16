import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkClientLimit } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { CreateClientSchema } from "@/lib/validations";
import { trackClientCreated } from "@/lib/analytics";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();
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
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = clerkUser.id;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress;
    const clerkName = clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : null;

    const { ensureUserExists } = await import("@/lib/auth");
    const user = await ensureUserExists(userId, clerkEmail, clerkName);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = CreateClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, website, industry, brandColor, logoData } = parsed.data;

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

    let logoUrl: string | null = null;

    if (logoData && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const imageBuffer = base64ToBuffer(logoData);
        if (imageBuffer.length > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "File too large. Maximum size is 2MB." },
            { status: 400 }
          );
        }
        const extension = logoData.match(/^data:image\/(\w+);/)?.[1] || "png";
        const filename = `client-logos/temp-${nanoid()}.${extension}`;
        
        const blob = await put(filename, imageBuffer, {
          access: "public",
          contentType: `image/${extension}`,
        });
        logoUrl = blob.url;
      } catch (e) {
        console.error("Logo upload failed:", e);
      }
    }

    const [newClient] = await db
      .insert(clients)
      .values({
        name,
        email: email || null,
        website: website || null,
        industry: industry || null,
        brandColor: brandColor || "#2563EB",
        logoUrl,
        userId,
      })
      .returning();

    trackClientCreated(userId, clientLimit.current + 1);
    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}