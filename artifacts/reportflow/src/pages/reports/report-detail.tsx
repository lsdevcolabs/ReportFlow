import { useState } from "react";
import { useGetReport, useUpdateReport, getGetReportQueryKey } from "@workspace/api-client-react";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  Share2,
  Globe,
  Lock,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:reportId");
  const reportId = params?.reportId ? parseInt(params.reportId) : 0;

  const { data: report, isLoading } = useGetReport(reportId, {
    query: { enabled: !!reportId, queryKey: getGetReportQueryKey(reportId) },
  });

  const updateReport = useUpdateReport();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const togglePublic = (isPublic: boolean) => {
    updateReport.mutate(
      { reportId, data: { isPublic } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReportQueryKey(reportId) });
          toast({
            title: isPublic ? "Report published" : "Report unpublished",
            description: isPublic
              ? "Client can now view this via the shared link."
              : "Public access revoked.",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Report not found</h2>
        <Link href="/reports">
          <Button variant="link" className="mt-4">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}/reports/shared/${report.shareToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard" });
  };

  const hasTrafficData = report.data.organicTraffic != null || report.data.paidTraffic != null;
  const trafficData = [
    { name: "Organic", value: report.data.organicTraffic || 0 },
    { name: "Paid", value: report.data.paidTraffic || 0 },
  ];

  const hasConversionData = report.data.conversions != null || report.data.previousConversions != null;
  const conversionData = [
    { name: "Previous", value: report.data.previousConversions || 0, fill: "hsl(var(--muted))" },
    { name: "Current", value: report.data.conversions || 0, fill: report.clientBrandColor || "hsl(var(--primary))" },
  ];

  const renderTrend = (current: number | null | undefined, previous: number | null | undefined, inverse = false) => {
    if (current == null || previous == null || previous === 0) return null;
    const diff = current - previous;
    const percent = Math.round((diff / previous) * 100);
    if (percent === 0) {
      return <span className="flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3 mr-1" /> 0%</span>;
    }
    const isGood = inverse ? percent < 0 : percent > 0;
    return (
      <span className={`flex items-center text-xs font-medium ${isGood ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
        {percent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(percent)}%
      </span>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" data-testid="button-back-reports-detail">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </Link>

        {/* Actions: publish toggle + share — stacks on mobile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border text-sm font-medium">
            {report.isPublic
              ? <Globe className="h-4 w-4 text-green-600 shrink-0" />
              : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span>{report.isPublic ? "Published" : "Draft"}</span>
            <Switch
              checked={report.isPublic}
              onCheckedChange={togglePublic}
              disabled={updateReport.isPending}
              className="ml-1"
              data-testid="switch-toggle-publish"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!report.isPublic} data-testid="button-share-report">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view this report. No login required.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="share-link" className="sr-only">Link</Label>
                  <Input id="share-link" defaultValue={shareUrl} readOnly className="font-mono text-xs" />
                </div>
                <Button size="sm" className="shrink-0 px-3" onClick={copyLink}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end">
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open in new tab
                  </Button>
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Report header card */}
      <div className="bg-card border rounded-xl p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-secondary text-secondary-foreground font-medium">
                {report.clientName}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(report.dateRangeStart), "MMM d")} – {format(new Date(report.dateRangeEnd), "MMM d, yyyy")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{report.title}</h1>
          </div>
          <div
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md shrink-0"
            style={{ backgroundColor: report.clientBrandColor || "hsl(var(--primary))" }}
          >
            {report.clientName.charAt(0).toUpperCase()}
          </div>
        </div>
        {report.data.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Executive Summary</h3>
            <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{report.data.notes}</p>
          </div>
        )}
      </div>

      {/* Key metrics — 2 cols on mobile, 4 on md+ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {(report.data.organicTraffic != null || report.data.paidTraffic != null) && (
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Traffic</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold">
                  {((report.data.organicTraffic || 0) + (report.data.paidTraffic || 0)).toLocaleString()}
                </h3>
                {renderTrend(
                  (report.data.organicTraffic || 0) + (report.data.paidTraffic || 0),
                  report.data.previousOrganicTraffic
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {report.data.conversions != null && (
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Conversions</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold">{report.data.conversions.toLocaleString()}</h3>
                {renderTrend(report.data.conversions, report.data.previousConversions)}
              </div>
            </CardContent>
          </Card>
        )}
        {report.data.spend != null && (
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Ad Spend</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold">${report.data.spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                {renderTrend(report.data.spend, report.data.previousSpend, true)}
              </div>
            </CardContent>
          </Card>
        )}
        {report.data.roas != null && (
          <Card>
            <CardContent className="p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">ROAS</p>
              <h3 className="text-xl sm:text-2xl font-bold">{report.data.roas}x</h3>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {hasTrafficData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] sm:h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? report.clientBrandColor || "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {hasConversionData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Conversion Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] sm:h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed metrics table — horizontally scrollable on narrow screens */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-medium">Metric</th>
                  <th className="px-4 sm:px-6 py-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.data.impressions != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Ad Impressions</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.impressions.toLocaleString()}</td></tr>
                )}
                {report.data.clicks != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Ad Clicks</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.clicks.toLocaleString()}</td></tr>
                )}
                {report.data.ctr != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">CTR</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.ctr}%</td></tr>
                )}
                {report.data.conversionRate != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Conversion Rate</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.conversionRate}%</td></tr>
                )}
                {report.data.socialFollowers != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Social Followers</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.socialFollowers.toLocaleString()}</td></tr>
                )}
                {report.data.socialEngagement != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Social Engagement</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.socialEngagement}%</td></tr>
                )}
                {report.data.emailSubscribers != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Email Subscribers</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.emailSubscribers.toLocaleString()}</td></tr>
                )}
                {report.data.emailOpenRate != null && (
                  <tr><td className="px-4 sm:px-6 py-3 font-medium">Email Open Rate</td><td className="px-4 sm:px-6 py-3 text-right font-mono">{report.data.emailOpenRate}%</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
