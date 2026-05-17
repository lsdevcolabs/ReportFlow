import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 80,
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
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  agencyLogo: {
    width: 60,
    height: 40,
    objectFit: "contain",
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
    width: "30%",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 9,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 18,
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
    flex: 1,
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
    flex: 1,
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0f172a",
    flex: 1,
  },
  notesBox: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 4,
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
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerLogo: {
    width: 16,
    height: 16,
    objectFit: "contain",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 10,
  },
});

interface ReportPDFProps {
  report: {
    id: string;
    title: string;
    templateType?: string | null;
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

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
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

// Render a KPI card
function KpiCard({ label, value, prevValue, currentValue }: { label: string; value: string; prevValue?: number; currentValue?: number }) {
  const hasChange = prevValue != null && currentValue != null && prevValue > 0;
  const change = hasChange ? calculateChange(currentValue!, prevValue!) : 0;

  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {hasChange && (
        <Text style={change >= 0 ? styles.kpiChange : styles.kpiChangeNegative}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs previous
        </Text>
      )}
    </View>
  );
}

// Render a table of data
function DataTable({ columns, rows }: { columns: { key: string; label: string }[]; rows: Record<string, unknown>[] }) {
  if (!rows || rows.length === 0) return null;

  return (
    <View style={styles.channelTable}>
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <Text key={col.key} style={styles.tableHeaderCell}>{col.label}</Text>
        ))}
      </View>
      {rows.map((row, idx) => (
        <View key={idx} style={styles.tableRow}>
          {columns.map((col, colIdx) => (
            <Text key={col.key} style={colIdx === 0 ? styles.tableCellBold : styles.tableCell}>
              {row[col.key] != null ? String(row[col.key]) : "-"}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

// Render a set of metric fields from data
function MetricCards({ fields, data }: { fields: { key: string; label: string; type: string }[]; data: Record<string, unknown> }) {
  const numericFields = fields.filter((f) => f.type === "number" || f.type === "currency" || f.type === "percentage");
  const validFields = numericFields.filter((f) => data[f.key] != null && data[f.key] !== "");
  if (validFields.length === 0) return null;

  return (
    <View style={styles.kpiGrid}>
      {validFields.map((field) => {
        const val = data[field.key];
        let displayVal: string;
        if (field.type === "currency") {
          displayVal = formatCurrency(Number(val));
        } else if (field.type === "percentage") {
          displayVal = `${val}%`;
        } else {
          displayVal = formatNumber(Number(val));
        }

        const prevVal = data[`prev_${field.key}`];
        const prevNum = prevVal != null ? Number(prevVal) : undefined;
        const currNum = Number(val);

        return <KpiCard key={field.key} label={field.label} value={displayVal} prevValue={prevNum} currentValue={currNum} />;
      })}
    </View>
  );
}

// Notes section
function NotesSection({ data, noteKeys }: { data: Record<string, unknown>; noteKeys: string[] }) {
  const entries = noteKeys.filter((key) => data[key]);
  if (entries.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notes & Summary</Text>
      {entries.map((key) => (
        <View key={key} style={styles.notesBox}>
          <Text style={styles.notesLabel}>
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()}
          </Text>
          <Text style={styles.notesText}>{String(data[key])}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportPDFDocument({ report, client, agency, whiteLabel }: ReportPDFProps) {
  const brandColor = client.brandColor || "#2563eb";
  const md = (report.metricsData || {}) as Record<string, any>;
  const clientName = client.name || "Client";
  const templateType = report.templateType || "general";

  // Define template-specific fields
  const getFields = () => {
    switch (templateType) {
      case "seo":
        return {
          hero: [
            { key: "organicSessions", label: "Organic Sessions", type: "number" },
            { key: "googleImpressions", label: "Google Impressions", type: "number" },
            { key: "googleClicks", label: "Google Clicks", type: "number" },
            { key: "avgPosition", label: "Avg Position", type: "number" },
            { key: "ctr", label: "CTR", type: "percentage" },
            { key: "organicConversions", label: "Organic Conversions", type: "number" },
          ],
          extraMetrics: [
            { key: "totalBacklinks", label: "Total Backlinks", type: "number" },
            { key: "newBacklinks", label: "New Backlinks", type: "number" },
            { key: "referringDomains", label: "Referring Domains", type: "number" },
            { key: "domainAuthority", label: "Domain Authority", type: "number" },
          ],
          tableKey: "keywordRows",
          tableColumns: [
            { key: "keyword", label: "Keyword" },
            { key: "currentPosition", label: "Position" },
            { key: "previousPosition", label: "Prev Position" },
            { key: "searchVolume", label: "Volume" },
            { key: "status", label: "Status" },
          ],
          tableTitle: "Keyword Rankings",
          noteKeys: ["executiveSummary", "keyWins", "issues", "actionPlan"],
        };
      case "paidAds":
        return {
          hero: [
            { key: "totalAdSpend", label: "Total Ad Spend", type: "currency" },
            { key: "totalConversions", label: "Total Conversions", type: "number" },
            { key: "overallRoas", label: "Overall ROAS", type: "number" },
            { key: "overallCpa", label: "Overall CPA", type: "currency" },
            { key: "totalRevenue", label: "Total Revenue", type: "currency" },
            { key: "totalImpressions", label: "Total Impressions", type: "number" },
          ],
          extraMetrics: [
            { key: "googleSpend", label: "Google Spend", type: "currency" },
            { key: "googleConversions", label: "Google Conversions", type: "number" },
            { key: "googleRoas", label: "Google ROAS", type: "number" },
            { key: "metaSpend", label: "Meta Spend", type: "currency" },
            { key: "metaConversions", label: "Meta Conversions", type: "number" },
            { key: "metaRoas", label: "Meta ROAS", type: "number" },
          ],
          tableKey: "campaignRows",
          tableColumns: [
            { key: "campaignName", label: "Campaign" },
            { key: "platform", label: "Platform" },
            { key: "spend", label: "Spend" },
            { key: "impressions", label: "Impressions" },
            { key: "clicks", label: "Clicks" },
            { key: "conversions", label: "Conversions" },
            { key: "roas", label: "ROAS" },
            { key: "status", label: "Status" },
          ],
          tableTitle: "Campaign Performance",
          noteKeys: ["executiveSummary", "topCampaign", "budgetRecommendation", "creativeNotes"],
        };
      case "socialMedia":
        return {
          hero: [
            { key: "totalFollowers", label: "Total Followers", type: "number" },
            { key: "totalReach", label: "Total Reach", type: "number" },
            { key: "totalImpressions", label: "Total Impressions", type: "number" },
            { key: "totalEngagements", label: "Total Engagements", type: "number" },
            { key: "engagementRate", label: "Engagement Rate", type: "percentage" },
            { key: "postsPublished", label: "Posts Published", type: "number" },
          ],
          extraMetrics: [],
          tableKey: "contentRows",
          tableColumns: [
            { key: "postDescription", label: "Post" },
            { key: "platform", label: "Platform" },
            { key: "contentType", label: "Type" },
            { key: "reach", label: "Reach" },
            { key: "engagements", label: "Engagements" },
          ],
          tableTitle: "Content Performance",
          noteKeys: ["executiveSummary", "topContentHighlight", "growthObservations", "contentStrategy"],
        };
      default:
        return {
          hero: [
            { key: "totalSessions", label: "Total Sessions", type: "number" },
            { key: "totalConversions", label: "Total Conversions", type: "number" },
            { key: "totalRevenue", label: "Total Revenue", type: "currency" },
            { key: "bounceRate", label: "Bounce Rate", type: "percentage" },
          ],
          extraMetrics: [
            { key: "organicTraffic", label: "Organic Traffic", type: "number" },
            { key: "paidTraffic", label: "Paid Traffic", type: "number" },
            { key: "directTraffic", label: "Direct Traffic", type: "number" },
            { key: "referralTraffic", label: "Referral Traffic", type: "number" },
            { key: "leads", label: "Leads", type: "number" },
            { key: "conversionRate", label: "Conversion Rate", type: "percentage" },
          ],
          tableKey: "channels",
          tableColumns: [
            { key: "name", label: "Channel" },
            { key: "sessions", label: "Sessions" },
          ],
          tableTitle: "Channel Breakdown",
          noteKeys: ["executiveSummary", "highlights", "recommendations"],
        };
    }
  };

  const fields = getFields();
  const tableRows = md[fields.tableKey] as Record<string, unknown>[] | undefined;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.header, { borderTopColor: brandColor }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
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
            {whiteLabel && agency?.logoUrl && (
              <Image src={agency.logoUrl} style={styles.agencyLogo} />
            )}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{report.status || "draft"}</Text>
            </View>
            <Text style={styles.dateRange}>{formatDateRange(report.dateRangeStart, report.dateRangeEnd)}</Text>
          </View>
        </View>

        {/* Hero KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <MetricCards fields={fields.hero} data={md} />
        </View>

        {/* Extra Metrics */}
        {fields.extraMetrics.length > 0 && fields.extraMetrics.some((f) => md[f.key] != null && md[f.key] !== "") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Metrics</Text>
            <MetricCards fields={fields.extraMetrics} data={md} />
          </View>
        )}

        {/* Data Table */}
        {tableRows && tableRows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{fields.tableTitle}</Text>
            <DataTable columns={fields.tableColumns} rows={tableRows} />
          </View>
        )}

        {/* Notes */}
        <NotesSection data={md} noteKeys={fields.noteKeys} />

        {/* Footer */}
        <View style={styles.footer} fixed>
          {whiteLabel && agency?.name ? (
            <View style={styles.footerLeft}>
              {agency.logoUrl && (
                <Image src={agency.logoUrl} style={styles.footerLogo} />
              )}
              <Text style={styles.footerText}>Generated by {agency.name}{agency.website ? ` · ${agency.website}` : ''}</Text>
            </View>
          ) : (
            <Text style={styles.footerText}>Generated with ReportFlow · reportflow.io</Text>
          )}
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}