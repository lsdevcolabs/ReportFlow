import { db } from "./db";
import { clients, reports } from "./db/schema";
import { eq, and } from "drizzle-orm";

type Plan = "free" | "starter" | "pro";

export type { Plan };

const PLAN_LIMITS: Record<Plan, { maxClients: number; maxReports: number; whiteLabel: boolean; pdfExport: boolean }> = {
  free: { maxClients: 1, maxReports: 3, whiteLabel: false, pdfExport: true },
  starter: { maxClients: 5, maxReports: Infinity, whiteLabel: false, pdfExport: true },
  pro: { maxClients: Infinity, maxReports: Infinity, whiteLabel: true, pdfExport: true },
};

export interface PlanLimitResult {
  allowed: boolean;
  current: number;
  max: number;
  upgradeMessage?: string;
  upgradeUrl?: string;
}

export async function checkClientLimit(userId: string, plan: Plan): Promise<PlanLimitResult> {
  const maxClients = PLAN_LIMITS[plan].maxClients;

  if (maxClients === Infinity) {
    return { allowed: true, current: 0, max: Infinity };
  }

  const result = await db
    .select({ count: clients.id })
    .from(clients)
    .where(eq(clients.userId, userId));

  const currentCount = result.length;

  if (currentCount >= maxClients) {
    return {
      allowed: false,
      current: currentCount,
      max: maxClients,
      upgradeMessage: `You've reached the maximum of ${maxClients} clients on your ${plan} plan.`,
      upgradeUrl: "/upgrade",
    };
  }

  return { allowed: true, current: currentCount, max: maxClients };
}

export async function checkReportLimit(userId: string, plan: Plan): Promise<PlanLimitResult> {
  const maxReports = PLAN_LIMITS[plan].maxReports;

  if (maxReports === Infinity) {
    return { allowed: true, current: 0, max: Infinity };
  }

  const result = await db
    .select({ count: reports.id })
    .from(reports)
    .where(eq(reports.userId, userId));

  const currentCount = result.length;

  if (currentCount >= maxReports) {
    return {
      allowed: false,
      current: currentCount,
      max: maxReports,
      upgradeMessage: `You've reached the maximum of ${maxReports} reports on your ${plan} plan.`,
      upgradeUrl: "/upgrade",
    };
  }

  return { allowed: true, current: currentCount, max: maxReports };
}

export async function checkClientReportLimit(
  userId: string,
  plan: Plan,
  clientId: string
): Promise<PlanLimitResult> {
  const maxReports = PLAN_LIMITS[plan].maxReports;

  if (maxReports === Infinity) {
    return { allowed: true, current: 0, max: Infinity };
  }

  const result = await db
    .select({ count: reports.id })
    .from(reports)
    .where(and(eq(reports.userId, userId), eq(reports.clientId, clientId)));

  const currentCount = result.length;

  if (currentCount >= maxReports) {
    return {
      allowed: false,
      current: currentCount,
      max: maxReports,
      upgradeMessage: `You've reached the maximum of ${maxReports} reports for this client on your ${plan} plan.`,
      upgradeUrl: "/upgrade",
    };
  }

  return { allowed: true, current: currentCount, max: maxReports };
}

export function isWhiteLabelAllowed(plan: Plan): boolean {
  return PLAN_LIMITS[plan].whiteLabel;
}

export function isPdfExportAllowed(plan: Plan): boolean {
  return PLAN_LIMITS[plan].pdfExport;
}

export function isCustomNotesAllowed(plan: Plan): boolean {
  return PLAN_LIMITS[plan].whiteLabel; // Using whiteLabel as proxy for custom notes
}