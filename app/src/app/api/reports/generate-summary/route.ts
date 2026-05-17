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

RULES for the Summary:
- Provide a highly structured and professional summary using Markdown formatting.
- Structure your response into exactly three sections:
  1. **Executive Overview**: A brief introductory paragraph summarizing overall performance.
  2. **Key Highlights**: A bulleted list of 3-4 significant metrics or wins (use bold text for the metric names).
  3. **Strategic Outlook**: A short, forward-looking conclusion or recommendation for the next period.
- Use the exact numbers provided in the data. Do not invent or hallucinate data.
- Tone: professional, positive, and client-friendly. Clients read this — make them feel their investment is working.
- If a metric shows a decline, acknowledge it briefly and frame it constructively.
- Do NOT include any filler preamble like "Here is your summary". Output the markdown directly.

REPORT CONTEXT:
Report Title: ${title ?? "Performance Report"}
Client: ${clientName}
Reporting Period: ${dateStart} to ${dateEnd}

PERFORMANCE METRICS (JSON DATA):
${JSON.stringify(m, null, 2)}

Write the structured executive summary now:
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
        message: error.message || "Something went wrong generating the summary. Please try again.",
      },
      { status: 503 }
    );
  }
}
