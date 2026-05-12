export type Plan = "free" | "starter" | "pro";

export const PLAN_LIMITS = {
  free: {
    maxClients: 1,
    maxReports: 3,
    whiteLabel: false,
    pdfExport: false,
    shareableLinks: true,
    customNotes: false,
  },
  starter: {
    maxClients: 5,
    maxReports: Infinity,
    whiteLabel: false,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
  },
  pro: {
    maxClients: Infinity,
    maxReports: Infinity,
    whiteLabel: true,
    pdfExport: true,
    shareableLinks: true,
    customNotes: true,
  },
} as const;

export type PlanLimits = typeof PLAN_LIMITS.free;
export type PlanFeature = keyof PlanLimits;

export function canPerformAction(plan: Plan, action: PlanFeature): boolean {
  return PLAN_LIMITS[plan][action];
}

export function getMaxClients(plan: Plan): number {
  return PLAN_LIMITS[plan].maxClients;
}

export function getMaxReports(plan: Plan): number {
  return PLAN_LIMITS[plan].maxReports;
}

export function canExportPdf(plan: Plan): boolean {
  return PLAN_LIMITS[plan].pdfExport;
}

export function canUseWhiteLabel(plan: Plan): boolean {
  return PLAN_LIMITS[plan].whiteLabel;
}

export const PRICING = {
  starter: { monthly: 9, annual: 79 },
  pro: { monthly: 29, annual: 249 },
} as const;