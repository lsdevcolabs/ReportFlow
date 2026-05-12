import React from "react";
import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, reportsTable, clientsTable, userProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;
  next();
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  clientName: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 10,
    color: "#9ca3af",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f9fafb",
  },
  notesText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#374151",
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
  },
  tableLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  tableValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
  },
});

function formatNumber(num: number | null | undefined): string {
  if (num == null) return "-";
  return num.toLocaleString();
}

function formatCurrency(num: number | null | undefined): string {
  if (num == null) return "-";
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function formatPercent(num: number | null | undefined): string {
  if (num == null) return "-";
  return `${num}%`;
}

interface ReportPDFProps {
  report: any;
  client: any;
}

function ReportPDF({ report, client }: ReportPDFProps) {
  const data = report.data || {};
  
  const hasTraffic = data.organicTraffic != null || data.paidTraffic != null;
  const totalTraffic = (data.organicTraffic || 0) + (data.paidTraffic || 0);
  
  const format = new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const startDate = report.dateRangeStart ? format.format(new Date(report.dateRangeStart)) : '';
  const endDate = report.dateRangeEnd ? format.format(new Date(report.dateRangeEnd)) : '';
  const clientName = client?.name || 'Client';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.dateRange}>{startDate} - {endDate}</Text>
        </View>

        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <View style={styles.notes}>
              <Text style={styles.notesText}>{data.notes}</Text>
            </View>
          </View>
        )}

        {hasTraffic && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Traffic</Text>
                <Text style={styles.metricValue}>{formatNumber(totalTraffic)}</Text>
              </View>
              
              {data.conversions != null && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Conversions</Text>
                  <Text style={styles.metricValue}>{formatNumber(data.conversions)}</Text>
                </View>
              )}
              
              {data.spend != null && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Ad Spend</Text>
                  <Text style={styles.metricValue}>{formatCurrency(data.spend)}</Text>
                </View>
              )}
              
              {data.roas != null && (
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>ROAS</Text>
                  <Text style={styles.metricValue}>{data.roas}x</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>
          <View style={styles.table}>
            {data.impressions != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Ad Impressions</Text>
                <Text style={styles.tableValue}>{formatNumber(data.impressions)}</Text>
              </View>
            )}
            {data.clicks != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Ad Clicks</Text>
                <Text style={styles.tableValue}>{formatNumber(data.clicks)}</Text>
              </View>
            )}
            {data.ctr != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Click-Through Rate</Text>
                <Text style={styles.tableValue}>{formatPercent(data.ctr)}</Text>
              </View>
            )}
            {data.conversionRate != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Conversion Rate</Text>
                <Text style={styles.tableValue}>{formatPercent(data.conversionRate)}</Text>
              </View>
            )}
            {data.socialFollowers != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Social Followers</Text>
                <Text style={styles.tableValue}>{formatNumber(data.socialFollowers)}</Text>
              </View>
            )}
            {data.socialEngagement != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Social Engagement</Text>
                <Text style={styles.tableValue}>{formatPercent(data.socialEngagement)}</Text>
              </View>
            )}
            {data.emailSubscribers != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Email Subscribers</Text>
                <Text style={styles.tableValue}>{formatNumber(data.emailSubscribers)}</Text>
              </View>
            )}
            {data.emailOpenRate != null && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Email Open Rate</Text>
                <Text style={styles.tableValue}>{formatPercent(data.emailOpenRate)}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.footer}>Generated by ReportFlow</Text>
      </Page>
    </Document>
  );
}

router.get("/reports/:reportId/pdf", requireAuth, async (req: any, res): Promise<void> => {
  const reportId = parseInt(req.params.reportId);
  if (isNaN(reportId)) {
    res.status(400).json({ error: "Invalid reportId" });
    return;
  }

  try {
    const [report] = await db
      .select()
      .from(reportsTable)
      .where(and(eq(reportsTable.id, reportId), eq(reportsTable.userId, req.userId)));

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const [client] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, report.clientId));

    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }

    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));

    const canExportPdf = profile?.plan === "starter" || profile?.plan === "pro";
    if (!canExportPdf) {
      res.status(403).json({ 
        error: "PLAN_LIMIT_REACHED",
        message: "PDF export is available on Starter and Pro plans only.",
        upgradeUrl: "/settings"
      });
      return;
    }

    const pdfBuffer = await renderToBuffer(ReportPDF({
      report,
      client
    }));

    const filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) {
    req.log.error({ err }, "Failed to generate PDF");
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;