import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function initPostHog() {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) {
    console.log("[PostHog] API key not set, analytics disabled");
    return;
  }

  client = new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST || "https://app.posthog.com",
  });
}

export function capture(userId: string, event: string, properties?: Record<string, any>) {
  if (!client) {
    return;
  }

  try {
    client.capture({
      distinctId: userId,
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[PostHog] capture error:", err);
  }
}

export const AnalyticsEvents = {
  CLIENT_CREATED: "client_created",
  REPORT_CREATED: "report_created",
  REPORT_SHARED: "report_shared",
  PDF_DOWNLOADED: "pdf_downloaded",
  UPGRADE_CLICKED: "upgrade_clicked",
  CSV_UPLOADED: "csv_uploaded",
  SHARE_LINK_COPIED: "share_link_copied",
} as const;