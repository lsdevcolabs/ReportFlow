import * as Sentry from "@sentry/node";

let isInitialized = false;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.log("[Sentry] DSN not set, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  isInitialized = true;
  console.log("[Sentry] Initialized");
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  if (!isInitialized) {
    console.error("[Sentry] Not initialized, cannot capture:", error.message);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

export { Sentry };