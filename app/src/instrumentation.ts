import * as Sentry from "@sentry/nextjs";
import { shutdownAnalytics } from "./lib/analytics";

export async function register() {
  if (process.env.NODE_ENV === "production") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      denyUrls: [/localhost/, /\.local/],
      environment: process.env.NODE_ENV || "development",
    });
  }
}

process.on("beforeExit", () => {
  shutdownAnalytics();
});
