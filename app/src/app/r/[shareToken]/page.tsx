import type { Metadata } from "next";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import PublicReportClient from "./public-report-client";

export const dynamic = "force-dynamic";

// BUG 6 FIX: Dynamic OG meta tags for link previews in Slack, WhatsApp, email, etc.
export async function generateMetadata({
  params,
}: {
  params: { shareToken: string };
}): Promise<Metadata> {
  const defaultMeta: Metadata = {
    title: "Report Not Found | ReportFlow",
    description: "This report does not exist or is no longer available.",
  };

  try {
    if (!process.env.DATABASE_URL) return defaultMeta;

    const { shareToken } = params;

    const result = await db
      .select({
        title: reports.title,
        dateRangeStart: reports.dateRangeStart,
        dateRangeEnd: reports.dateRangeEnd,
        metricsData: reports.metricsData,
        isPublic: reports.isPublic,
        clientName: clients.name,
      })
      .from(reports)
      .innerJoin(clients, eq(reports.clientId, clients.id))
      .where(
        and(eq(reports.shareToken, shareToken), eq(reports.isPublic, true))
      )
      .limit(1);

    if (result.length === 0) return defaultMeta;

    const report = result[0];
    const metrics = report.metricsData as Record<string, any> | null;
    const sessions = metrics?.summary?.sessions;

    const startDate = new Date(report.dateRangeStart);
    const endDate = new Date(report.dateRangeEnd);
    const dateRange = `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    const description = sessions
      ? `${dateRange} · ${Number(sessions).toLocaleString()} sessions`
      : `Client performance report · ${dateRange}`;

    return {
      title: `${report.title} | ${report.clientName}`,
      description,
      openGraph: {
        title: report.title,
        description: `Client performance report for ${report.clientName} · ${dateRange}`,
        siteName: "ReportFlow",
        type: "article",
      },
      twitter: {
        card: "summary",
        title: report.title,
        description: `Client performance report for ${report.clientName} · ${dateRange}`,
      },
    };
  } catch (error) {
    console.error("[generateMetadata] Error:", error);
    return defaultMeta;
  }
}

export default function PublicReportPage({
  params,
}: {
  params: { shareToken: string };
}) {
  return <PublicReportClient shareToken={params.shareToken} />;
}