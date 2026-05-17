import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { clients, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * If a logo URL is a base64 data URI, upload it to Vercel Blob,
 * update the DB record, and return the public Blob URL.
 * Otherwise, returns the URL as-is.
 */
export async function resolveLogoUrl(
  logoUrl: string | null | undefined,
  entityType: "client" | "agency",
  entityId: string
): Promise<string | null> {
  if (!logoUrl) return null;

  // If it's already a proper URL (not base64), return it as-is
  if (!logoUrl.startsWith("data:")) return logoUrl;

  // It's a base64 data URI — upload to Vercel Blob
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // No blob token, return the base64 as-is (fallback)
    return logoUrl;
  }

  try {
    const match = logoUrl.match(/^data:image\/([\w+.-]+);base64,(.+)$/s);
    if (!match) return logoUrl;

    const [, ext, b64] = match;
    const buffer = Buffer.from(b64, "base64");
    const extension = ext === "svg+xml" ? "svg" : ext;
    const filename = `${entityType}-logos/${nanoid()}.${extension}`;

    const blob = await put(filename, buffer, {
      access: "public",
      contentType: `image/${ext}`,
    });

    // Update the DB with the new Blob URL
    if (entityType === "client") {
      await db.update(clients).set({ logoUrl: blob.url }).where(eq(clients.id, entityId));
    } else {
      await db.update(users).set({ agencyLogoUrl: blob.url }).where(eq(users.id, entityId));
    }

    console.log(`[resolveLogoUrl] Migrated ${entityType} ${entityId} logo to Blob: ${blob.url}`);
    return blob.url;
  } catch (err) {
    console.error(`[resolveLogoUrl] Failed to upload ${entityType} logo to Blob:`, err);
    // Return the base64 as-is on failure — better than null
    return logoUrl;
  }
}
