import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const SentryConfig: NextConfig = {
  sentry: {
    hideSourceMaps: true,
    autoInstrumentServerFunctions: true,
  },
};

export default withSentryConfig(SentryConfig);