export type Plan = "free" | "starter" | "pro";

export const PLAN_LIMITS = {
  free: {
    maxClients: 1,
    maxReports: 3,
    whiteLabel: false,
    pdfExport: false,
    shareableLinks: true,
    customNotes: false,
    emailDelivery: false,
    aiSummary: false,
  },
  starter: {
    maxClients: 5,
    maxReports: Infinity,
    whiteLabel: false,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
    emailDelivery: true,
    aiSummary: true,
  },
  pro: {
    maxClients: Infinity,
    maxReports: Infinity,
    whiteLabel: true,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
    emailDelivery: true,
    aiSummary: true,
  },
} as const;

export type PlanLimits = typeof PLAN_LIMITS.free;
export type PlanFeature = keyof PlanLimits;

/**
 * Check if a plan allows a specific action
 */
export function canPerformAction(plan: Plan, action: PlanFeature): boolean {
  return PLAN_LIMITS[plan][action] as boolean;
}

/**
 * Get max clients for a plan
 */
export function getMaxClients(plan: Plan): number {
  return PLAN_LIMITS[plan].maxClients as number;
}

/**
 * Get max reports for a plan
 */
export function getMaxReports(plan: Plan): number {
  return PLAN_LIMITS[plan].maxReports as number;
}

/**
 * Check if user can export PDF
 */
export function canExportPdf(plan: Plan): boolean {
  return PLAN_LIMITS[plan].pdfExport as boolean;
}

/**
 * Check if user can use white label
 */
export function canUseWhiteLabel(plan: Plan): boolean {
  return PLAN_LIMITS[plan].whiteLabel as boolean;
}

/**
 * Check if user can add more clients
 */
export function canAddClient(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxClients;
}

/**
 * Check if user can create more reports
 */
export function canCreateReport(plan: Plan, currentCount: number): boolean {
  const max = PLAN_LIMITS[plan].maxReports;
  return max === Infinity || currentCount < max;
}

/**
 * Get feature availability message for upgrade prompts
 */
export function getUpgradeMessage(feature: PlanFeature): string {
  const messages: Record<PlanFeature, string> = {
    maxClients: "Upgrade to add more clients",
    maxReports: "Upgrade to create unlimited reports",
    whiteLabel: "Upgrade to Pro for white-label reports",
    pdfExport: "Upgrade to Starter for PDF export",
    shareableLinks: "Shareable links are available on all plans",
    customNotes: "Upgrade to Starter for custom notes",
    emailDelivery: "Upgrade to Starter to send reports via email",
    aiSummary: "Upgrade to Starter for AI-generated summaries",
  };
  return messages[feature];
}

// Pricing (USD) — displayed on pricing page
export const PRICING = {
  starter: { monthly: 9, annual: 79 },
  pro: { monthly: 29, annual: 249 },
} as const;