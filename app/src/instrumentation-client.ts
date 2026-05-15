import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  allowUrls: [/https:\/\/.*\.reportflow\.app/, /https:\/\/reportflow\.app/],
  denyUrls: [/localhost/, /\.local/],
  enabled: process.env.NODE_ENV !== "test",
  environment: process.env.NODE_ENV || "development",
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
