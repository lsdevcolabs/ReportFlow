import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reports, clients, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserById } from "@/lib/auth";
import { generateWithGemini } from "@/lib/gemini";
import { canPerformAction } from "@/lib/plans";
import { trackAiSummaryGenerated } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  const [result] = await db
    .select({ report: reports, client: clients })
    .from(reports)
    .leftJoin(clients, eq(reports.clientId, clients.id))
    .where(
      and(
        eq(reports.id, params.id),
        eq(reports.userId, userId)
      )
    );

  if (!result) {
    return Response.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
  }

  const { report, client } = result;
  const m = report.metricsData as any;

  const dateStart = report.dateRangeStart
    ? new Date(report.dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "N/A";
  const dateEnd = report.dateRangeEnd
    ? new Date(report.dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "N/A";

  // Pre-calculate total sessions
  const totalSessions =
    (m?.summary?.organicTraffic ?? 0) + (m?.summary?.paidTraffic ?? 0);

  // Pre-calculate session % change vs previous period
  const prevOrganic = m?.summary?.previousOrganic ?? 0;
  const currOrganic = m?.summary?.organicTraffic ?? 0;
  const sessionChange =
    prevOrganic > 0
      ? `${(((currOrganic - prevOrganic) / prevOrganic) * 100).toFixed(1)}% ${currOrganic >= prevOrganic ? "increase" : "decrease"} vs previous period`
      : "N/A";

  // Pre-calculate CPA
  const adSpend = m?.summary?.adSpend ?? 0;
  const conversions = m?.summary?.conversions ?? 0;
  const cpa =
    adSpend > 0 && conversions > 0
      ? "$" + (adSpend / conversions).toFixed(2) + " per conversion"
      : "N/A";

  // Template-specific context hint so AI knows which angle to lead with
  const templateContextMap: Record<string, string> = {
    general: "This is a general marketing report. Lead with the most impressive overall metric.",
    seo: "This is an SEO report. Lead with organic traffic growth, keyword rankings, or domain authority improvements.",
    paidAds: "This is a Paid Ads report. Lead with ROAS, ad spend efficiency, or conversion volume. Emphasize ROI.",
    socialMedia: "This is a Social Media report. Lead with follower growth, engagement rate, or reach. Emphasize audience growth.",
  };
  const templateContext =
    templateContextMap[report.templateType ?? "general"] ??
    templateContextMap["general"];

  // Build custom metrics list — only include rows that have both label and value
  const customMetricsList = (m?.customMetrics ?? [])
    .filter((km: any) => km.label?.trim() && km.value?.toString().trim())
    .map((km: any) =>
      `- ${km.label}: ${km.value}${km.change ? ` (${km.change})` : ""}`
    )
    .join("\n");

  const prompt = `
You are a senior digital marketing analyst at a top-tier agency. You are writing the executive summary section of a professional client performance report. This will be read directly by the client — it must be polished, data-driven, and reflect the work of an expert.

OUTPUT FORMAT — FOLLOW THIS EXACTLY:
Write exactly 4 sentences as a single plain paragraph. No bullet points. No headers. No markdown. No bold. No line breaks between sentences.

Each sentence has a specific role:
SENTENCE 1 (Overall Performance): State the single most impressive result of this period with exact numbers. Frame it positively and confidently.
SENTENCE 2 (Channel Breakdown): Explain where the results came from — organic traffic, paid ads, social, or whichever channels have data. Include specific numbers for each channel mentioned.
SENTENCE 3 (Conversions & Efficiency): Highlight what the traffic achieved in terms of leads, sales, conversions, or cost efficiency. Use CPA, ROAS, conversion rate, or revenue if available.
SENTENCE 4 (Forward-Looking Recommendation): Give ONE specific, actionable recommendation for next period based directly on the numbers. Name the exact action — not "we will optimize" but "we recommend increasing ad spend on [channel] given the [X] ROAS" or "we recommend publishing 3 additional blog posts per week to sustain the [X]% organic growth trend."

STRICT RULES:
- Every sentence must include at least one real number from the data below. If a metric is N/A or missing, skip it entirely.
- Never start any sentence with "I", "We", "This report", "In this period", or "In conclusion".
- Never use filler phrases like "It is worth noting", "As we can see", "Overall speaking", or "In summary".
- Never fabricate numbers. Use only the exact numbers from the data provided below.
- The final output must read as if written by a human expert analyst, not generated by AI.

REPORT DATA:
Template Type: ${report.templateType ?? "general"}
Report Title: ${report.title ?? "Performance Report"}
Client Name: ${client?.name ?? "the client"}
Reporting Period: ${dateStart} to ${dateEnd}

TRAFFIC METRICS:
- Organic Traffic (this period): ${m?.summary?.organicTraffic ?? "N/A"}
- Organic Traffic (previous period): ${m?.summary?.previousOrganic ?? "N/A"}
- Paid Traffic: ${m?.summary?.paidTraffic ?? "N/A"}
- Total Sessions: ${totalSessions > 0 ? totalSessions : "N/A"}
- Sessions vs Previous Period: ${sessionChange}

CONVERSION METRICS:
- Total Conversions: ${m?.summary?.conversions ?? "N/A"}
- Conversions (previous period): ${m?.summary?.previousConversions ?? "N/A"}
- Revenue Generated: ${m?.summary?.revenue ? "$" + m.summary.revenue : "N/A"}
- Bounce Rate: ${m?.summary?.bounceRate ? m.summary.bounceRate + "%" : "N/A"}

PAID ADS METRICS:
- Total Ad Spend: ${m?.summary?.adSpend ? "$" + m.summary.adSpend : "N/A"}
- ROAS (Return on Ad Spend): ${m?.summary?.roas ? m.summary.roas + "x" : "N/A"}
- Click-Through Rate: ${m?.summary?.ctr ? m.summary.ctr + "%" : "N/A"}
- Cost Per Action (CPA): ${cpa}

${customMetricsList ? `ADDITIONAL METRICS:\n${customMetricsList}` : ""}

${templateContext}

Now write the 4-sentence executive summary paragraph:
`.trim();

  try {
    const summary = await generateWithGemini(prompt);

    trackAiSummaryGenerated(userId, params.id);

    return Response.json(
      { summary },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("[generate-summary] Error:", error.message);

    return Response.json(
      {
        error: "AI_UNAVAILABLE",
        message: error.message || "Something went wrong generating the summary. Please try again.",
      },
      { status: 503 }
    );
  }
}
