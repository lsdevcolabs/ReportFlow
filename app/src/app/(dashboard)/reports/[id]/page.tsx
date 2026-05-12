"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Copy, ExternalLink, Check, Loader2, FileText, Globe, GlobeLock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  metricsData: MetricsData;
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
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download PDF", e);
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

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white"
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
        <div className="flex items-center gap-3">
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
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
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
          <div className="flex items-center justify-between">
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
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {metricsData.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{formatNumber(metricsData.summary.sessions)}</p>
              {metricsData.summary.previousSessions && (
                <p className="text-xs text-green-600">
                  +{Math.round(((metricsData.summary.sessions - metricsData.summary.previousSessions) / metricsData.summary.previousSessions) * 100)}% vs prev
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold">{formatNumber(metricsData.summary.conversions)}</p>
              {metricsData.summary.previousConversions && (
                <p className="text-xs text-green-600">
                  +{Math.round(((metricsData.summary.conversions - metricsData.summary.previousConversions) / metricsData.summary.previousConversions) * 100)}% vs prev
                </p>
              )}
            </CardContent>
          </Card>
          {metricsData.summary.revenue !== undefined && (
            <>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${formatNumber(metricsData.summary.revenue)}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Charts */}
      {metricsData.channelBreakdown && metricsData.channelBreakdown.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metricsData.channelBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="channel" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                      {metricsData.channelBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={clientBrandColor} fillOpacity={1 - index * 0.15} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Metrics */}
      {metricsData.customMetrics && metricsData.customMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricsData.customMetrics.map((metric, index) => (
                <div key={index}>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-lg font-semibold">{metric.value}</p>
                  {metric.change && (
                    <p className={`text-xs ${metric.changeType === "positive" ? "text-green-600" : metric.changeType === "negative" ? "text-red-600" : "text-muted-foreground"}`}>
                      {metric.change}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      {metricsData.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{metricsData.notes}</p>
          </CardContent>
        </Card>
      )}

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