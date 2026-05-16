import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";



const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  header: {
    borderTopWidth: 4,
    borderTopColor: "#2563eb",
    paddingTop: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    objectFit: "contain",
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInitial: {
    fontSize: 20,
    fontWeight: 700,
    color: "#ffffff",
  },
  clientName: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#e0f2fe",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 600,
    color: "#0369a1",
    textTransform: "uppercase",
  },
  dateRange: {
    fontSize: 10,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 120,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiLabel: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4,
  },
  kpiChange: {
    fontSize: 9,
    color: "#22c55e",
  },
  kpiChangeNegative: {
    fontSize: 9,
    color: "#ef4444",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricItem: {
    width: "23%",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0f172a",
  },
  channelTable: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: 10,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tableCell: {
    fontSize: 10,
    color: "#334155",
  },
  tableCellValue: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0f172a",
  },
  notesBox: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  notesText: {
    fontSize: 10,
    color: "#334155",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  poweredBy: {
    fontSize: 8,
    color: "#94a3b8",
  },
});

interface MetricsData {
  summary?: {
    sessions: number;
    conversions: number;
    revenue?: number;
    previousSessions?: number;
    previousConversions?: number;
  };
  channelBreakdown?: Array<{ channel: string; sessions: number; percentage?: number }>;
  weeklyTrend?: Array<{ week: string; sessions: number; conversions: number }>;
  customMetrics?: Array<{ label: string; value: string; change?: string; changeType?: string }>;
  notes?: string;
}

interface ReportPDFProps {
  report: {
    id: string;
    title: string;
    status?: string | null;
    dateRangeStart: string;
    dateRangeEnd: string;
    metricsData?: unknown;
  };
  client: {
    name: string;
    logoUrl?: string | null;
    brandColor?: string | null;
  };
  agency?: {
    name: string | null;
    website: string | null;
    logoUrl: string | null;
    brandColor: string | null;
  };
  whiteLabel?: boolean;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
}

function calculateChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function ReportPDFDocument({ report, client, agency, whiteLabel }: ReportPDFProps) {
  const brandColor = client.brandColor || "#2563eb";
  const metricsData = (report.metricsData || {}) as MetricsData;
  const clientName = client.name || "Client";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {client.logoUrl ? (
              <Image src={client.logoUrl} style={styles.logo} />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: brandColor }]}>
                <Text style={styles.logoInitial}>{clientName.charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.title}>{report.title}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{report.status || "draft"}</Text>
            </View>
            <Text style={styles.dateRange}>{formatDateRange(report.dateRangeStart, report.dateRangeEnd)}</Text>
          </View>
        </View>

        {metricsData.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Sessions</Text>
                <Text style={styles.kpiValue}>{formatNumber(metricsData.summary.sessions)}</Text>
                {metricsData.summary.previousSessions !== undefined && (() => {
                  const change = calculateChange(metricsData.summary.sessions, metricsData.summary.previousSessions!);
                  return (
                    <Text style={change >= 0 ? styles.kpiChange : styles.kpiChangeNegative}>
                      {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs previous
                    </Text>
                  );
                })()}
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Conversions</Text>
                <Text style={styles.kpiValue}>{formatNumber(metricsData.summary.conversions)}</Text>
                {metricsData.summary.previousConversions !== undefined && (() => {
                  const change = calculateChange(metricsData.summary.conversions, metricsData.summary.previousConversions!);
                  return (
                    <Text style={change >= 0 ? styles.kpiChange : styles.kpiChangeNegative}>
                      {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs previous
                    </Text>
                  );
                })()}
              </View>
              {metricsData.summary.revenue !== undefined && (
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Revenue</Text>
                  <Text style={styles.kpiValue}>${formatNumber(metricsData.summary.revenue)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {metricsData.channelBreakdown && metricsData.channelBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Channel Breakdown</Text>
            <View style={styles.channelTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Channel</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Sessions</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1 }]}>% of Total</Text>
              </View>
              {metricsData.channelBreakdown.map((channel, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{channel.channel}</Text>
                  <Text style={[styles.tableCellValue, { flex: 1 }]}>{formatNumber(channel.sessions)}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{channel.percentage || 0}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {metricsData.customMetrics && metricsData.customMetrics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Metrics</Text>
            <View style={styles.metricsGrid}>
              {metricsData.customMetrics.map((metric, index) => (
                <View key={index} style={styles.metricItem}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>{metric.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {metricsData.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{metricsData.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          {whiteLabel && agency?.name ? (
            <Text style={styles.footerText}>Generated by {agency.name}{agency?.website ? ` · ${agency.website}` : ''}</Text>
          ) : (
            <Text style={styles.footerText}>Generated with ReportFlow · reportflow.io</Text>
          )}
          <Text style={styles.poweredBy}>Page {1}</Text>
        </View>
      </Page>
    </Document>
  );
}