import { shutdownAnalytics } from "./analytics";
import { initSentry } from "./sentry";

if (process.env.NODE_ENV === "production") {
  initSentry();
}

process.on("beforeExit", () => {
  shutdownAnalytics();
});

export {};