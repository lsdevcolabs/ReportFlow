import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserById } from "@/lib/auth";
import { generateWithGemini } from "@/lib/gemini";
import { canPerformAction } from "@/lib/plans";
import { trackAiSummaryGenerated } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await getUserById(userId);

  if (!user) {
    return Response.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (!canPerformAction(user.plan as import("@/lib/plans").Plan, "aiSummary")) {
    return Response.json(
      {
        error: "PLAN_LIMIT_REACHED",
        message: "AI summary generation is available on Starter and Pro plans.",
        upgradeUrl: "/upgrade",
      },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { clientId, title, dateRangeStart, dateRangeEnd, metricsData } = body;

  if (!clientId) {
    return Response.json(
      { error: "VALIDATION_ERROR", message: "clientId is required" },
      { status: 400 }
    );
  }

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  const clientName = client?.name || "Client";
  const m = metricsData || {};

  const dateStart = dateRangeStart
    ? new Date(dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "N/A";
  const dateEnd = dateRangeEnd
    ? new Date(dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "N/A";

  const customMetricsList = (m?.customMetrics ?? [])
    .filter((km: any) => km.label && km.value)
    .map((km: any) => `- ${km.label}: ${km.value}${km.change ? ` (${km.change})` : ""}`)
    .join("\n");

  const prompt = `
You are a professional digital marketing analyst writing an executive summary for a client performance report.

RULES:
- Write exactly 3 to 5 sentences. No more, no less.
- Use the exact numbers provided. Do not invent or round numbers unless they are already rounded.
- Tone: professional, positive, and client-friendly. Clients read this — make them feel their investment is working.
- If a metric shows a decline (negative % change), acknowledge it briefly and frame it constructively, e.g. "We are actively optimizing X to address the decline."
- Do NOT use bullet points, headers, bold text, or any markdown formatting.
- Output ONLY the paragraph. No preamble like "Here is your summary:" or "Sure!".
- End the last sentence with a forward-looking statement about the next steps or what to focus on next period.

REPORT DATA:
Report Title: ${title ?? "Performance Report"}
Client: ${clientName}
Reporting Period: ${dateStart} to ${dateEnd}

TRAFFIC:
- Organic Traffic: ${m?.summary?.organicTraffic ?? "N/A"}${m?.summary?.previousOrganic ? ` (previous period: ${m.summary.previousOrganic})` : ""}
- Paid Traffic: ${m?.summary?.paidTraffic ?? "N/A"}
- Total Sessions: ${(m?.summary?.organicTraffic ?? 0) + (m?.summary?.paidTraffic ?? 0)}

CONVERSIONS:
- Conversions: ${m?.summary?.conversions ?? "N/A"}${m?.summary?.previousConversions ? ` (previous period: ${m.summary.previousConversions})` : ""}
- Revenue: ${m?.summary?.revenue ? `$${m.summary.revenue}` : "N/A"}
- Bounce Rate: ${m?.summary?.bounceRate ? `${m.summary.bounceRate}%` : "N/A"}

PAID ADS:
- Ad Spend: ${m?.summary?.adSpend ? `$${m.summary.adSpend}` : "N/A"}
- ROAS: ${m?.summary?.roas ? `${m.summary.roas}x` : "N/A"}
- CTR: ${m?.summary?.ctr ? `${m.summary.ctr}%` : "N/A"}

${customMetricsList ? `CUSTOM METRICS:\n${customMetricsList}` : ""}

Write the executive summary paragraph now:
`.trim();

  try {
    const summary = await generateWithGemini(prompt);

    trackAiSummaryGenerated(userId, "new");

    return Response.json(
      { summary },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[generate-summary] Error:", error.message);

    return Response.json(
      {
        error: "AI_UNAVAILABLE",
        message:
          error.message.includes("All API keys")
            ? "AI generation is temporarily unavailable due to rate limits. Please try again in a few minutes."
            : "Something went wrong generating the summary. Please try again.",
      },
      { status: 503 }
    );
  }
}
