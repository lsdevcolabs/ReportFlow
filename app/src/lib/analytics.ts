import { PostHog } from "posthog-node";

const posthogClient = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      flushAt: 20,
      flushInterval: 10000,
    })
  : null;

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(
  event: string,
  properties?: EventProperties
): void {
  if (!posthogClient) {
    console.warn("[PostHog] Not configured - event not tracked:", event);
    return;
  }

  try {
    posthogClient.capture({
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[PostHog] Failed to track event:", error);
  }
}

export function trackPageView(
  url: string,
  properties?: EventProperties
): void {
  trackEvent("page_view", {
    url,
    ...properties,
  });
}

export function trackUserSignedUp(
  userId: string,
  method?: string
): void {
  trackEvent("user_signed_up", {
    userId,
    method,
  });
}

export function trackClientCreated(
  userId: string,
  clientCount: number
): void {
  trackEvent("client_created", {
    userId,
    clientCount,
  });
}

export function trackReportCreated(
  userId: string,
  clientId: string
): void {
  trackEvent("report_created", {
    userId,
    clientId,
  });
}

export function trackReportShared(
  userId: string,
  reportId: string
): void {
  trackEvent("report_shared", {
    userId,
    reportId,
  });
}

export function trackPlanUpgraded(
  userId: string,
  fromPlan: string,
  toPlan: string
): void {
  trackEvent("plan_upgraded", {
    userId,
    fromPlan,
    toPlan,
  });
}

export function trackPdfExported(
  userId: string,
  reportId: string
): void {
  trackEvent("pdf_exported", {
    userId,
    reportId,
  });
}

export function trackReportSent(
  userId: string,
  reportId: string
): void {
  trackEvent("report_sent", {
    userId,
    reportId,
  });
}

export function trackAiSummaryGenerated(
  userId: string,
  reportId: string
): void {
  trackEvent("ai_summary_generated", {
    userId,
    reportId,
  });
}

export function shutdownAnalytics(): void {
  if (posthogClient) {
    posthogClient.shutdown();
  }
}