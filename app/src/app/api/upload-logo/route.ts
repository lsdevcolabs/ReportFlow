import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const uploadSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  dataUrl: z.string().min(1, "Image data is required").startsWith("data:image/", "Must be a valid image"),
});

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/[\w+.-]+;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
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

    if (!process.env.DATABASE_URL || !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    }

    const body = await req.json();
    const validation = uploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { clientId, dataUrl } = validation.data;

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const imageBuffer = base64ToBuffer(dataUrl);

    if (imageBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB." },
        { status: 400 }
      );
    }

    const extension = dataUrl.match(/^data:image\/([\w+.-]+);/)?.[1] || "png";
    const filename = `client-logos/${clientId}/${nanoid()}.${extension}`;

    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: `image/${extension}`,
    });

    await db
      .update(clients)
      .set({ logoUrl: blob.url, updatedAt: new Date() })
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)));

    return NextResponse.json({
      success: true,
      logoUrl: blob.url,
    });
  } catch (error) {
    console.error("[POST /api/upload-logo]", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}