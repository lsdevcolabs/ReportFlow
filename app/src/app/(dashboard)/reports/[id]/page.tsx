"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Check, Loader2, FileText, Globe, GlobeLock, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface ReportData {
  id: string;
  title: string;
  clientId: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
  shareToken: string | null;
  metricsData: Record<string, unknown>;
  templateType?: string;
  lastSentAt?: string | null;
  lastSentTo?: string | null;
  client?: {
    name: string;
    brandColor: string;
  };
}

type ApiResponse = { report: ReportData } | { error: string };

function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send modal state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendMessage, setSendMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const id = params.id as string;
        const res = await fetch(`/api/reports/${id}`);
        const data: ApiResponse = await res.json();

        if (!res.ok || "error" in data) {
          setError("Failed to load report");
          return;
        }

        setReport(data.report);
      } catch {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-32 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{error || "Report not found"}</p>
            <Button onClick={() => router.push("/reports")}>Back to Reports</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientBrandColor = report.client?.brandColor || "#2563EB";
  const clientName = report.client?.name || "Client";
  const shareUrl = report.shareToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${report.shareToken}` : "";
  const metricsData = report.metricsData;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublish = async () => {
    if (!report) return;
    setIsPublishing(true);

    try {
      const newIsPublic = !report.isPublic;
      const newShareToken = newIsPublic && !report.shareToken ? generateShareToken() : report.shareToken;

      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: newIsPublic,
          shareToken: newShareToken,
          status: newIsPublic ? "published" : "draft",
        }),
      });

      if (res.ok) {
        const data: ApiResponse = await res.json();
        if ("report" in data) {
          setReport(data.report);
        }
      }
    } catch (e) {
      console.error("Failed to update report", e);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!report) return;
    setIsDownloading(true);

    try {
      const res = await fetch(`/api/reports/${report.id}/pdf`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("Failed to download PDF", e);
      alert(e.message || "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/reports");
      }
    } catch (e) {
      console.error("Failed to delete report", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenSendModal = async () => {
    if (!report) return;

    // Check if report is published
    if (!report.isPublic || !report.shareToken) {
      alert("Please publish the report first before sending it to a client.");
      return;
    }

    // Fetch client email
    try {
      const res = await fetch(`/api/clients/${report.clientId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.client?.email) {
          setSendTo(data.client.email);
        }
      }
    } catch (e) {
      console.error("Failed to fetch client email", e);
    }

    // Set default subject
    const dateRange = `${new Date(report.dateRangeStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(report.dateRangeEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    setSendSubject(`${report.title} — ${dateRange}`);
    setSendMessage("");
    setSendError(null);
    setSendSuccess(false);
    setIsSendOpen(true);
  };

  const handleSendReport = async () => {
    if (!report || !sendTo) return;

    setIsSending(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/reports/${report.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sendTo,
          subject: sendSubject,
          message: sendMessage || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "UPGRADE_REQUIRED") {
          setSendError("Email delivery requires a Starter or Pro plan. Please upgrade to continue.");
        } else {
          setSendError(data.message || "Failed to send email. Please try again.");
        }
        return;
      }

      setSendSuccess(true);
      // Refresh report data to show updated lastSentAt
      setTimeout(() => {
        setIsSendOpen(false);
        setSendSuccess(false);
        // Re-fetch report
        fetch(`/api/reports/${report.id}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.report) setReport(d.report);
          });
      }, 2000);
    } catch (e) {
      console.error("Failed to send report", e);
      setSendError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const md = metricsData || {};
  const templateType = report.templateType || "general";

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

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
      <div className={gridClass || "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
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

  const renderNotes = (notesData: Record<string, unknown>, noteKeys: string[]) => {
    const hasNotes = noteKeys.some((key) => notesData[key]);
    if (!hasNotes) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Notes & Summary</CardTitle>
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

  const getTemplateFields = () => {
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
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: clientBrandColor }}
            >
              {clientName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <p className="text-sm text-muted-foreground">
                {clientName} • {new Date(report.dateRangeStart).toLocaleDateString()} - {new Date(report.dateRangeEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleOpenSendModal}
                disabled={!report.isPublic}
              >
                <Send className="mr-2 h-4 w-4" />
                Send to Client
              </Button>
              {report.shareToken && report.isPublic && (
            <>
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button variant="outline" asChild>
                <a href={`/r/${report.shareToken}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public
                </a>
              </Button>
            </>
          )}
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
            {report.isPublic ? (
              <Globe className="h-4 w-4 text-green-600" />
            ) : (
              <GlobeLock className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={report.isPublic}
              onCheckedChange={handleTogglePublish}
              disabled={isPublishing}
            />
          </div>
          <Button variant="outline" asChild>
            <Link href={`/reports/${report.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {report.isPublic ? (
                <>
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Public Report</p>
                    <p className="text-sm text-muted-foreground">Anyone with the link can view this report</p>
                  </div>
                </>
              ) : (
                <>
                  <GlobeLock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Private Report</p>
                    <p className="text-sm text-muted-foreground">Only you can view this report</p>
                  </div>
                </>
              )}
            </div>
            <Badge variant={report.isPublic ? "default" : "secondary"}>
              {report.isPublic ? "Published" : "Draft"}
            </Badge>
          </div>
          {report.lastSentAt && (
            <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
              <Send className="h-4 w-4" />
              <span>
                Last sent {new Date(report.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {report.lastSentTo && ` to ${report.lastSentTo}`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hero KPI Cards */}
      {renderMetricSection(templateFields.heroFields, md, 4)}

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
                      <Cell key={index} fill={clientBrandColor} fillOpacity={1 - index * 0.15} />
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

      {/* Send to Client Dialog */}
      <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Report to Client</DialogTitle>
            <DialogDescription>
              Send a branded email with a link to view this report.
            </DialogDescription>
          </DialogHeader>

          {sendSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-lg font-medium">Report Sent!</p>
              <p className="text-sm text-muted-foreground">Your client will receive the email shortly.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sendTo">To</Label>
                  <Input
                    id="sendTo"
                    type="email"
                    placeholder="client@example.com"
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendSubject">Subject</Label>
                  <Input
                    id="sendSubject"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sendMessage">Message (optional)</Label>
                  <Textarea
                    id="sendMessage"
                    placeholder="Add a personal note to include in the email..."
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                {sendError && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {sendError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSendOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendReport} disabled={isSending || !sendTo || !sendSubject}>
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}