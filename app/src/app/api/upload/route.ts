import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/clerk-auth";
import Papa from "papaparse";
import { z } from "zod";

const uploadSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  data: z.string().min(1, "CSV data is required"),
});

interface ParsedRow {
  [key: string]: string | number | undefined;
}

interface ParseResult {
  sessions?: number;
  conversions?: number;
  revenue?: number;
  channelBreakdown?: Array<{ channel: string; sessions: number; percentage: number }>;
  weeklyTrend?: Array<{ week: string; sessions: number; conversions: number }>;
  customMetrics?: Array<{ label: string; value: string; change: string; changeType: "positive" | "negative" | "neutral" }>;
  notes?: string;
}

function parseCSVData(csvData: string): ParseResult {
  const result: ParseResult = {
    channelBreakdown: [],
    weeklyTrend: [],
    customMetrics: [],
  };

  const parsed = Papa.parse<ParsedRow>(csvData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`CSV parsing error: ${parsed.errors[0].message}`);
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim());

  const summaryRow = rows.find((r) => r.type === "summary" || r.category === "summary");
  if (summaryRow) {
    result.sessions = Number(summaryRow.sessions || summaryRow.visits || 0);
    result.conversions = Number(summaryRow.conversions || summaryRow.goals || 0);
    result.revenue = Number(summaryRow.revenue || summaryRow.sales || 0);
  } else {
    const sessionsCol = headers.find((h) => h.includes("session") || h.includes("visit"));
    const conversionsCol = headers.find((h) => h.includes("conversion") || h.includes("goal"));
    const revenueCol = headers.find((h) => h.includes("revenue") || h.includes("sale"));

    if (sessionsCol) {
      result.sessions = rows.reduce((sum, row) => sum + (Number(row[sessionsCol] || 0) || 0), 0);
    }
    if (conversionsCol) {
      result.conversions = rows.reduce((sum, row) => sum + (Number(row[conversionsCol] || 0) || 0), 0);
    }
    if (revenueCol) {
      result.revenue = rows.reduce((sum, row) => sum + (Number(row[revenueCol] || 0) || 0), 0);
    }
  }

  const channelRow = rows.find((r) => r.type === "channel" || r.category === "channel");
  if (channelRow) {
    const channelNameCol = Object.keys(channelRow).find((k) =>
      k.toLowerCase().includes("channel") || k.toLowerCase().includes("source")
    );
    const sessionsCol = Object.keys(channelRow).find((k) =>
      k.toLowerCase().includes("session") || k.toLowerCase().includes("visit")
    );

    if (channelNameCol && sessionsCol) {
      const totalSessions = rows
        .filter((r) => r.category === "channel" || r.type === "channel")
        .reduce((sum, row) => sum + (Number(row[sessionsCol] || 0) || 0), 0);

      for (const row of rows.filter((r) => r.category === "channel" || r.type === "channel")) {
        const sessions = Number(row[sessionsCol] || 0) || 0;
        result.channelBreakdown!.push({
          channel: String(row[channelNameCol] || "Unknown"),
          sessions,
          percentage: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
        });
      }
    }
  }

  const weeklyRow = rows.find((r) => r.type === "weekly" || r.category === "weekly");
  if (weeklyRow) {
    const weekCol = Object.keys(weeklyRow).find((k) => k.toLowerCase().includes("week") || k.toLowerCase().includes("date"));
    const sessionsCol = Object.keys(weeklyRow).find((k) => k.toLowerCase().includes("session") || k.toLowerCase().includes("visit"));
    const conversionsCol = Object.keys(weeklyRow).find((k) => k.toLowerCase().includes("conversion") || k.toLowerCase().includes("goal"));

    for (const row of rows.filter((r) => r.category === "weekly" || r.type === "weekly")) {
      result.weeklyTrend!.push({
        week: weekCol ? String(row[weekCol] || "") : "",
        sessions: sessionsCol ? Number(row[sessionsCol] || 0) || 0 : 0,
        conversions: conversionsCol ? Number(row[conversionsCol] || 0) || 0 : 0,
      });
    }
  }

  const metricsRow = rows.find((r) => r.type === "custom" || r.category === "metric");
  if (metricsRow) {
    const labelCol = Object.keys(metricsRow).find((k) => k.toLowerCase().includes("label") || k.toLowerCase().includes("name"));
    const valueCol = Object.keys(metricsRow).find((k) => k.toLowerCase().includes("value"));
    const changeCol = Object.keys(metricsRow).find((k) => k.toLowerCase().includes("change"));

    for (const row of rows.filter((r) => r.category === "metric" || r.type === "custom")) {
      const value = valueCol ? String(row[valueCol] || "") : "";
      const change = changeCol ? String(row[changeCol] || "") : "";
      let changeType: "positive" | "negative" | "neutral" = "neutral";

      if (change.toLowerCase().includes("+") || change.toLowerCase().includes("up") || change.toLowerCase().includes("increase")) {
        changeType = "positive";
      } else if (change.toLowerCase().includes("-") || change.toLowerCase().includes("down") || change.toLowerCase().includes("decrease")) {
        changeType = "negative";
      }

      result.customMetrics!.push({
        label: labelCol ? String(row[labelCol] || "") : "",
        value,
        change,
        changeType,
      });
    }
  }

  const notesRow = rows.find((r) => r.type === "notes" || r.category === "notes");
  if (notesRow) {
    const notesCol = Object.keys(notesRow).find((k) => k.toLowerCase().includes("note") || k.toLowerCase().includes("summary"));
    if (notesCol) {
      result.notes = String(notesRow[notesCol] || "");
    }
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = uploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { data } = validation.data;

    const parsed = parseCSVData(data);

    return NextResponse.json({
      success: true,
      metrics: parsed,
    });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse CSV data" },
      { status: 400 }
    );
  }
}