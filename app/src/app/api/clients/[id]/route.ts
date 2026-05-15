import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);

    if (!client) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("[GET /api/clients/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;
    const body = await req.json();

    const { name, email, website, industry, brandColor, logoUrl, logoData } = body;

    const [existingClient] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);

    if (!existingClient) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Client not found" },
        { status: 404 }
      );
    }

    let newLogoUrl = existingClient.logoUrl;

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
        newLogoUrl = blob.url;
      } catch (e) {
        console.error("Logo upload failed:", e);
      }
    } else if (logoUrl !== undefined) {
      newLogoUrl = logoUrl || null;
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
        name,
        email: email || null,
        website: website || null,
        industry: industry || null,
        brandColor: brandColor || null,
        logoUrl: newLogoUrl,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error("[PUT /api/clients/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = params;

    const [deletedClient] = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();

    if (!deletedClient) {
      return NextResponse.json(
        { error: "NOT_FOUND", message: "Client not found" },
        { status: 404 }
      );
    }

    revalidatePath("/dashboard", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/clients/[id]]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}