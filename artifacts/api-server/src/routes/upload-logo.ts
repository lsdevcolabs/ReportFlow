import { Router } from "express";
import { getAuth } from "@clerk/express";
import crypto from "node:crypto";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

router.post("/upload-logo", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { image, fileName, contentType } = req.body;

    if (!image || !fileName) {
      res.status(400).json({ error: "Image data and filename required" });
      return;
    }

    if (contentType && !ALLOWED_TYPES.includes(contentType)) {
      res.status(400).json({ 
        error: "Invalid file type", 
        message: `Allowed types: ${ALLOWED_TYPES.join(", ")}` 
      });
      return;
    }

    const imageBuffer = Buffer.from(image, "base64");
    
    if (imageBuffer.length > MAX_SIZE) {
      res.status(400).json({ 
        error: "File too large", 
        message: "Maximum file size is 2MB" 
      });
      return;
    }

    const ext = fileName.split(".").pop() || "png";
    const safeFileName = `${crypto.randomBytes(8).toString("hex")}.${ext}`;

    const blobUrl = `/logos/${req.userId}/${safeFileName}`;
    
    (req as any).log.info({ 
      fileName, 
      size: imageBuffer.length, 
      contentType 
    }, "Logo upload (mock)");

    res.json({
      url: blobUrl,
      message: "Logo uploaded successfully"
    });
  } catch (err) {
    req.log.error({ err }, "Failed to upload logo");
    res.status(500).json({ error: "Failed to upload logo" });
  }
});

export default router;