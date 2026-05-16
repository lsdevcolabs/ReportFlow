import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk-auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isAiSummaryAllowed } from "@/lib/plan-limits";
import type { Plan } from "@/lib/plan-limits";
import { getUserById } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = (user.plan || "free") as Plan;

    // Check if AI summary is allowed
    if (!isAiSummaryAllowed(plan)) {
      return NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: "AI-generated summaries require a Starter or Pro plan.",
          upgradeUrl: "/upgrade",
        },
        { status: 403 }
      );
    }

    if (!anthropic) {
      return NextResponse.json(
        { error: "AI_NOT_CONFIGURED", message: "AI service is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { clientId, title, dateRangeStart, dateRangeEnd, metricsData } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "clientId is required" },
        { status: 400 }
      );
    }

    // Fetch client
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    const clientName = client?.name || "the client";

    // Build the prompt
    const dateRange = dateRangeStart && dateRangeEnd
      ? `${new Date(dateRangeStart).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${new Date(dateRangeEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
      : "the selected period";

    let metricsContext = "";
    if (metricsData?.summary) {
      const s = metricsData.summary;
      metricsContext += `\n- Total sessions: ${s.sessions ?? "N/A"}`;
      metricsContext += `\n- Conversions: ${s.conversions ?? "N/A"}`;
      if (s.revenue) metricsContext += `\n- Revenue: $${s.revenue.toLocaleString()}`;
      if (s.previousSessions) {
        const change = s.sessions
          ? Math.round(((s.sessions - s.previousSessions) / s.previousSessions) * 100)
          : null;
        metricsContext += `\n- Previous period sessions: ${s.previousSessions}`;
        if (change !== null) metricsContext += `\n- Session change: ${change >= 0 ? "+" : ""}${change}%`;
      }
    }
    if (metricsData?.channelBreakdown?.length) {
      metricsContext += "\n\nChannel breakdown:";
      for (const ch of metricsData.channelBreakdown) {
        metricsContext += `\n- ${ch.channel}: ${ch.sessions} sessions`;
      }
    }
    if (metricsData?.customMetrics?.length) {
      metricsContext += "\n\nAdditional metrics:";
      for (const m of metricsData.customMetrics) {
        metricsContext += `\n- ${m.label}: ${m.value}`;
        if (m.change) metricsContext += ` (${m.change})`;
      }
    }

    const prompt = `You are a marketing analyst writing an executive summary for a client report.

Client: ${clientName}
Report period: ${dateRange}
Report title: ${title || "Performance Report"}

Performance data:${metricsContext}

Write a concise, professional executive summary (3-5 sentences) that:
1. Highlights the key performance outcomes
2. Notes significant trends or changes compared to the previous period
3. Uses a positive, professional tone appropriate for client communication
4. Avoids jargon — keep it accessible

Do not include a greeting or sign-off. Just write the summary paragraph directly.`;

    // Stream the response
    const stream = await anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    // Create a ReadableStream for the response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("[AI Summary Stream Error]", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[POST /api/reports/generate-summary]", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
