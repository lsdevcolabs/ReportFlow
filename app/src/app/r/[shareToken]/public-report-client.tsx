"use client";

import { useEffect, useState } from "react";
import { FileBarChart, AlertCircle, ExternalLink, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ReportData {
  id: string;
  title: string;
  status: string;
  templateType?: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  shareToken: string;
  isPublic: boolean;
  metricsData: Record<string, unknown>;
  client: {
    id: string;
    name: string;
    logoUrl: string | null;
    brandColor: string;
  };
  agency?: {
    name: string | null;
    website: string | null;
    logoUrl: string | null;
    brandColor: string | null;
    whiteLabel: boolean;
  };
}

type ApiResponse = { report: ReportData } | { error: string };

export default function PublicReportClient({ shareToken }: { shareToken: string }) {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/public/${shareToken}?t=${Date.now()}`, { cache: "no-store" });
        const data: ApiResponse = await res.json();

        if (!res.ok || "error" in data) {
          setError("error" in data ? data.error : "Failed to load report");
          return;
        }

        setReport(data.report);
      } catch {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    if (shareToken) {
      fetchReport();
    }
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-xl font-semibold mb-2">Report Not Found</h1>
            <p className="text-muted-foreground text-center mb-4">
              {error || "This report doesn't exist or the link is invalid."}
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandColor = report.client.brandColor || "#2563EB";
  const md = report.metricsData || {};
  const templateType = report.templateType || "general";

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Helper to render a metric value with optional previous period change
  const renderMetricCard = (label: string, value: string, prevValue?: number, currentValue?: number) => (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {prevValue != null && currentValue != null && prevValue > 0 && (
          <p className={`text-xs mt-1 ${calculateChange(currentValue, prevValue) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {calculateChange(currentValue, prevValue) >= 0 ? "+" : ""}
            {calculateChange(currentValue, prevValue).toFixed(1)}% vs previous
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderMetricSection = (fields: Array<{ key: string; label: string; type: string }>, data: Record<string, unknown>, maxCards?: number, gridClass?: string) => {
    const numericFields = fields.filter((f) => f.type === "number" || f.type === "currency" || f.type === "percentage");
    const displayFields = maxCards ? numericFields.slice(0, maxCards) : numericFields;

    return (
      <div className={gridClass || "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {displayFields.map((field) => {
          const val = data[field.key];
          if (val == null || val === "") return null;

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

          return renderMetricCard(field.label, displayVal, prevNum, currNum);
        })}
      </div>
    );
  };

  // Helper to render a dynamic table
  const renderDynamicTable = (rows: Record<string, unknown>[], columns: { key: string; label: string }[]) => {
    if (!rows || rows.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              {columns.map((col) => (
                <th key={col.key} className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    {row[col.key] != null ? String(row[col.key]) : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Helper to render notes section
  const renderNotes = (notesData: Record<string, unknown>, noteKeys: string[]) => {
    const hasNotes = noteKeys.some((key) => notesData[key]);
    if (!hasNotes) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {noteKeys.map((key) => {
            const val = notesData[key];
            if (!val) return null;
            return (
              <div key={key}>
                <p className="text-sm font-medium mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                  {String(val)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  // Get template-specific field definitions for rendering
  const getTemplateFields = () => {
    // Import template configs for field labels
    // We use hardcoded field lists here to avoid importing the full template config
    switch (templateType) {
      case "seo":
        return {
          heroFields: [
            { key: "organicSessions", label: "Organic Sessions", type: "number" },
            { key: "googleImpressions", label: "Google Impressions", type: "number" },
            { key: "googleClicks", label: "Google Clicks", type: "number" },
            { key: "avgPosition", label: "Average Position", type: "number" },
            { key: "ctr", label: "CTR", type: "percentage" },
            { key: "organicConversions", label: "Organic Conversions", type: "number" },
          ],
          keywordColumns: [
            { key: "keyword", label: "Keyword" },
            { key: "currentPosition", label: "Position" },
            { key: "previousPosition", label: "Prev Position" },
            { key: "searchVolume", label: "Volume" },
            { key: "urlRanking", label: "URL" },
            { key: "status", label: "Status" },
          ],
          noteKeys: ["executiveSummary", "keyWins", "issues", "actionPlan"],
        };
      case "paidAds":
        return {
          heroFields: [
            { key: "totalAdSpend", label: "Total Ad Spend", type: "currency" },
            { key: "totalConversions", label: "Total Conversions", type: "number" },
            { key: "overallRoas", label: "Overall ROAS", type: "number" },
            { key: "overallCpa", label: "Overall CPA", type: "currency" },
            { key: "totalRevenue", label: "Total Revenue", type: "currency" },
            { key: "totalImpressions", label: "Total Impressions", type: "number" },
          ],
          campaignColumns: [
            { key: "campaignName", label: "Campaign" },
            { key: "platform", label: "Platform" },
            { key: "spend", label: "Spend" },
            { key: "impressions", label: "Impressions" },
            { key: "clicks", label: "Clicks" },
            { key: "conversions", label: "Conversions" },
            { key: "cpa", label: "CPA" },
            { key: "roas", label: "ROAS" },
            { key: "status", label: "Status" },
          ],
          noteKeys: ["executiveSummary", "topCampaign", "budgetRecommendation", "creativeNotes"],
        };
      case "socialMedia":
        return {
          heroFields: [
            { key: "totalFollowers", label: "Total Followers", type: "number" },
            { key: "totalReach", label: "Total Reach", type: "number" },
            { key: "totalImpressions", label: "Total Impressions", type: "number" },
            { key: "totalEngagements", label: "Total Engagements", type: "number" },
            { key: "engagementRate", label: "Engagement Rate", type: "percentage" },
            { key: "postsPublished", label: "Posts Published", type: "number" },
          ],
          contentColumns: [
            { key: "postDescription", label: "Post" },
            { key: "platform", label: "Platform" },
            { key: "contentType", label: "Type" },
            { key: "reach", label: "Reach" },
            { key: "engagements", label: "Engagements" },
            { key: "engagementRate", label: "Eng. Rate" },
            { key: "linkClicks", label: "Link Clicks" },
          ],
          noteKeys: ["executiveSummary", "topContentHighlight", "growthObservations", "contentStrategy"],
        };
      default: // general
        return {
          heroFields: [
            { key: "totalSessions", label: "Total Sessions", type: "number" },
            { key: "totalConversions", label: "Total Conversions", type: "number" },
            { key: "totalRevenue", label: "Total Revenue", type: "currency" },
            { key: "bounceRate", label: "Bounce Rate", type: "percentage" },
          ],
          channelColumns: [
            { key: "name", label: "Channel" },
            { key: "sessions", label: "Sessions" },
          ],
          noteKeys: ["executiveSummary", "highlights", "recommendations"],
        };
    }
  };

  const templateFields = getTemplateFields();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div
            className="px-6 sm:px-10 py-8 sm:py-12 border-b"
            style={{ borderTopColor: brandColor, borderTopWidth: 4 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                {report.client.logoUrl ? (
                  <img
                    src={report.client.logoUrl}
                    alt={report.client.name}
                    className="h-12 w-12 object-contain shrink-0"
                  />
                ) : (
                  <div
                    className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    {report.client.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{report.client.name}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{report.title}</h1>
                </div>
              </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDateRange(report.dateRangeStart, report.dateRangeEnd)}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant={report.status === "published" ? "default" : "secondary"}>
                {report.status}
              </Badge>
            </div>
          </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Hero KPI Cards */}
            {renderMetricSection(templateFields.heroFields, md, 4)}

            {/* Template-specific sections */}

            {/* General: Channel Breakdown */}
            {templateType === "general" && Boolean(md.channels) && Array.isArray(md.channels) && (md.channels as unknown[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Channel Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={md.channels as Array<{ name: string; sessions: number }>}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip formatter={(value) => formatNumber(value as number)} />
                        <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                          {(md.channels as Array<{ name: string; sessions: number }>).map((_, index) => (
                            <Cell key={index} fill={brandColor} fillOpacity={1 - index * 0.15} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General: Traffic Breakdown */}
            {templateType === "general" && (
              <>
                {renderMetricSection(
                  [
                    { key: "organicTraffic", label: "Organic Traffic", type: "number" },
                    { key: "paidTraffic", label: "Paid Traffic", type: "number" },
                    { key: "directTraffic", label: "Direct Traffic", type: "number" },
                    { key: "referralTraffic", label: "Referral Traffic", type: "number" },
                    { key: "socialTraffic", label: "Social Traffic", type: "number" },
                    { key: "emailTraffic", label: "Email Traffic", type: "number" },
                  ],
                  md
                )}
                {renderMetricSection(
                  [
                    { key: "leads", label: "Leads / Form Submissions", type: "number" },
                    { key: "ecommerceTransactions", label: "E-commerce Transactions", type: "number" },
                    { key: "revenueGenerated", label: "Revenue Generated", type: "currency" },
                    { key: "conversionRate", label: "Conversion Rate", type: "percentage" },
                    { key: "costPerConversion", label: "Cost Per Conversion", type: "currency" },
                  ],
                  md
                )}
              </>
            )}

            {/* SEO: Keyword Rankings Table */}
            {templateType === "seo" && Boolean(md.keywordRows) && Array.isArray(md.keywordRows) && (md.keywordRows as unknown[]).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDynamicTable(
                    md.keywordRows as Record<string, unknown>[],
                    templateFields.keywordColumns!
                  )}
                </CardContent>
              </Card>
            )}

            {/* SEO: Technical Health & Backlinks */}
            {templateType === "seo" && (
              <>
                {renderMetricSection(
                  [
                    { key: "lcp", label: "LCP", type: "text" },
                    { key: "cls", label: "CLS", type: "text" },
                    { key: "inp", label: "INP", type: "text" },
                    { key: "pagesIndexed", label: "Pages Indexed", type: "number" },
                    { key: "speedMobile", label: "Mobile Speed", type: "number" },
                    { key: "speedDesktop", label: "Desktop Speed", type: "number" },
                  ],
                  md
                )}
                {renderMetricSection(
                  [
                    { key: "totalBacklinks", label: "Total Backlinks", type: "number" },
                    { key: "newBacklinks", label: "New Backlinks", type: "number" },
                    { key: "referringDomains", label: "Referring Domains", type: "number" },
                    { key: "domainAuthority", label: "Domain Authority", type: "number" },
                    { key: "domainRating", label: "Domain Rating", type: "number" },
                  ],
                  md
                )}
              </>
            )}

            {/* Paid Ads: Google vs Meta comparison */}
            {templateType === "paidAds" && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Google Ads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderMetricSection(
                        [
                          { key: "googleSpend", label: "Spend", type: "currency" },
                          { key: "googleImpressions", label: "Impressions", type: "number" },
                          { key: "googleClicks", label: "Clicks", type: "number" },
                          { key: "googleConversions", label: "Conversions", type: "number" },
                          { key: "googleRoas", label: "ROAS", type: "number" },
                        ],
                        md,
                        undefined,
                        "grid grid-cols-2 sm:grid-cols-3 gap-4"
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Meta Ads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderMetricSection(
                        [
                          { key: "metaSpend", label: "Spend", type: "currency" },
                          { key: "metaImpressions", label: "Impressions", type: "number" },
                          { key: "metaClicks", label: "Clicks", type: "number" },
                          { key: "metaConversions", label: "Conversions", type: "number" },
                          { key: "metaRoas", label: "ROAS", type: "number" },
                        ],
                        md,
                        undefined,
                        "grid grid-cols-2 sm:grid-cols-3 gap-4"
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Campaign Performance Table */}
                {Boolean(md.campaignRows) && Array.isArray(md.campaignRows) && (md.campaignRows as unknown[]).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDynamicTable(
                        md.campaignRows as Record<string, unknown>[],
                        templateFields.campaignColumns!
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Social Media: Platform Metrics */}
            {templateType === "socialMedia" && Boolean(md.enabledPlatforms) && (
              <>
                {/* Per-platform cards */}
                {[
                  { id: "instagram", label: "Instagram", fields: [
                    { key: "igFollowers", label: "Followers" }, { key: "igReach", label: "Reach" },
                    { key: "igImpressions", label: "Impressions" }, { key: "igEngagementRate", label: "Engagement Rate" },
                  ]},
                  { id: "facebook", label: "Facebook", fields: [
                    { key: "fbPageLikesFollowers", label: "Followers" }, { key: "fbPostReach", label: "Reach" },
                    { key: "fbPostImpressions", label: "Impressions" }, { key: "fbEngagementRate", label: "Engagement Rate" },
                  ]},
                  { id: "linkedin", label: "LinkedIn", fields: [
                    { key: "liFollowers", label: "Followers" }, { key: "liPostImpressions", label: "Impressions" },
                    { key: "liEngagementRate", label: "Engagement Rate" },
                  ]},
                  { id: "tikTok", label: "TikTok", fields: [
                    { key: "ttFollowers", label: "Followers" }, { key: "ttVideoViews", label: "Video Views" },
                    { key: "ttEngagementRate", label: "Engagement Rate" },
                  ]},
                  { id: "xTwitter", label: "X / Twitter", fields: [
                    { key: "xFollowers", label: "Followers" }, { key: "xImpressions", label: "Impressions" },
                    { key: "xEngagementRate", label: "Engagement Rate" },
                  ]},
                  { id: "youtube", label: "YouTube", fields: [
                    { key: "ytSubscribers", label: "Subscribers" }, { key: "ytViews", label: "Views" },
                    { key: "ytCtr", label: "CTR" },
                  ]},
                ].map((platform) => {
                  const enabled = (md.enabledPlatforms as Record<string, boolean>)[platform.id];
                  if (!enabled) return null;

                  return (
                    <Card key={platform.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{platform.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {platform.fields.map((field) => {
                            const val = md[field.key];
                            if (val == null) return null;
                            return (
                              <div key={field.key} className="p-3 rounded-lg bg-slate-50">
                                <p className="text-xs text-muted-foreground">{field.label}</p>
                                <p className="text-lg font-bold">{String(val)}</p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Content Performance Table */}
                {Boolean(md.contentRows) && Array.isArray(md.contentRows) && (md.contentRows as unknown[]).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDynamicTable(
                        md.contentRows as Record<string, unknown>[],
                        templateFields.contentColumns!
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Audience & Growth */}
                {renderMetricSection(
                  [
                    { key: "totalAudienceSize", label: "Total Audience", type: "number" },
                    { key: "netFollowerGrowth", label: "Net Follower Growth", type: "number" },
                    { key: "followerGrowthRate", label: "Growth Rate", type: "percentage" },
                    { key: "websiteTrafficFromSocial", label: "Website Traffic from Social", type: "number" },
                    { key: "socialConversions", label: "Social Conversions", type: "number" },
                  ],
                  md
                )}
              </>
            )}

            {/* Notes / Executive Summary */}
            {renderNotes(md, templateFields.noteKeys)}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-10 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {report.agency?.whiteLabel && report.agency?.name ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {report.agency.logoUrl ? (
                  <img src={report.agency.logoUrl} alt={report.agency.name} className="h-5 w-auto object-contain" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span>Generated by {report.agency.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileBarChart className="h-4 w-4" />
                <span>Generated with ReportFlow</span>
              </div>
            )}
            {!report.agency?.whiteLabel && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/" target="_blank">
                  Create your own report
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
