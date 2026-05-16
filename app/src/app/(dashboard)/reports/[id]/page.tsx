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
  metricsData: MetricsData;
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

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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

      {/* KPI Cards */}
      {metricsData.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{formatNumber(metricsData.summary.sessions)}</p>
              {metricsData.summary.previousSessions && (() => {
                const change = ((metricsData.summary.sessions - metricsData.summary.previousSessions) / metricsData.summary.previousSessions) * 100;
                return (
                  <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs prev
                  </p>
                );
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold">{formatNumber(metricsData.summary.conversions)}</p>
              {metricsData.summary.previousConversions && (() => {
                const change = ((metricsData.summary.conversions - metricsData.summary.previousConversions) / metricsData.summary.previousConversions) * 100;
                return (
                  <p className={`text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(1)}% vs prev
                  </p>
                );
              })()}
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