import { useState } from "react";
import { useGetReport, useUpdateReport, getGetReportQueryKey } from "@workspace/api-client-react";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Globe, 
  Lock, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Cell
} from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReportDetail() {
  const [, params] = useRoute("/reports/:reportId");
  const reportId = params?.reportId ? parseInt(params.reportId) : 0;
  
  const { data: report, isLoading } = useGetReport(reportId, {
    query: { enabled: !!reportId, queryKey: getGetReportQueryKey(reportId) }
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
            description: isPublic ? "Client can now view this via the shared link." : "Public access revoked."
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
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

  // Prepare chart data
  const hasTrafficData = report.data.organicTraffic != null || report.data.paidTraffic != null;
  const trafficData = [
    { name: 'Organic', value: report.data.organicTraffic || 0 },
    { name: 'Paid', value: report.data.paidTraffic || 0 },
  ];

  const hasConversionData = report.data.conversions != null || report.data.previousConversions != null;
  const conversionData = [
    { name: 'Previous', value: report.data.previousConversions || 0, fill: 'hsl(var(--muted))' },
    { name: 'Current', value: report.data.conversions || 0, fill: report.clientBrandColor || 'hsl(var(--primary))' },
  ];

  // Helper for trend indicators
  const renderTrend = (current: number | null | undefined, previous: number | null | undefined, inverse = false) => {
    if (current == null || previous == null || previous === 0) return null;
    
    const diff = current - previous;
    const percent = Math.round((diff / previous) * 100);
    
    if (percent === 0) {
      return <span className="flex items-center text-xs text-muted-foreground"><Minus className="h-3 w-3 mr-1" /> 0%</span>;
    }
    
    const isGood = inverse ? percent < 0 : percent > 0;
    
    return (
      <span className={`flex items-center text-xs font-medium ${isGood ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
        {percent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(percent)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" data-testid="button-back-reports-detail">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 bg-muted/50 px-3 py-1.5 rounded-full">
            {report.isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
            <span className="text-sm font-medium">{report.isPublic ? "Published" : "Draft"}</span>
            <Switch 
              checked={report.isPublic} 
              onCheckedChange={togglePublic} 
              disabled={updateReport.isPending}
              className="ml-2"
              data-testid="switch-toggle-publish"
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!report.isPublic} data-testid="button-share-report">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Anyone with this link will be able to view this report. No login required.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 mt-4">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Link
                  </Label>
                  <Input
                    id="link"
                    defaultValue={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                </div>
                <Button size="sm" className="px-3" onClick={copyLink}>
                  <span className="sr-only">Copy</span>
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

      {/* Header */}
      <div className="bg-card border rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-secondary text-secondary-foreground font-medium">
                {report.clientName}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(report.dateRangeStart), 'MMM d')} - {format(new Date(report.dateRangeEnd), 'MMM d, yyyy')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{report.title}</h1>
          </div>
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0"
            style={{ backgroundColor: report.clientBrandColor || 'hsl(var(--primary))' }}
          >
            {report.clientName.charAt(0).toUpperCase()}
          </div>
        </div>
        
        {report.data.notes && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Executive Summary</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">{report.data.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(report.data.organicTraffic != null || report.data.paidTraffic != null) && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Traffic</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">
                  {((report.data.organicTraffic || 0) + (report.data.paidTraffic || 0)).toLocaleString()}
                </h3>
                {renderTrend(
                  (report.data.organicTraffic || 0) + (report.data.paidTraffic || 0),
                  report.data.previousOrganicTraffic // Simplifying assumption for the mockup
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {report.data.conversions != null && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Conversions</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{report.data.conversions.toLocaleString()}</h3>
                {renderTrend(report.data.conversions, report.data.previousConversions)}
              </div>
            </CardContent>
          </Card>
        )}
        
        {report.data.spend != null && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">Ad Spend</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">${report.data.spend.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                {renderTrend(report.data.spend, report.data.previousSpend, true)}
              </div>
            </CardContent>
          </Card>
        )}
        
        {report.data.roas != null && (
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground mb-1">ROAS</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{report.data.roas}x</h3>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {hasTrafficData && (
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? report.clientBrandColor || 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
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
            <CardHeader>
              <CardTitle>Conversion Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conversionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
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

      {/* Additional Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Metric</th>
                  <th className="px-6 py-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.data.impressions != null && (
                  <tr><td className="px-6 py-3 font-medium">Ad Impressions</td><td className="px-6 py-3 text-right font-mono">{report.data.impressions.toLocaleString()}</td></tr>
                )}
                {report.data.clicks != null && (
                  <tr><td className="px-6 py-3 font-medium">Ad Clicks</td><td className="px-6 py-3 text-right font-mono">{report.data.clicks.toLocaleString()}</td></tr>
                )}
                {report.data.ctr != null && (
                  <tr><td className="px-6 py-3 font-medium">Click-Through Rate</td><td className="px-6 py-3 text-right font-mono">{report.data.ctr}%</td></tr>
                )}
                {report.data.conversionRate != null && (
                  <tr><td className="px-6 py-3 font-medium">Conversion Rate</td><td className="px-6 py-3 text-right font-mono">{report.data.conversionRate}%</td></tr>
                )}
                {report.data.socialFollowers != null && (
                  <tr><td className="px-6 py-3 font-medium">Social Followers</td><td className="px-6 py-3 text-right font-mono">{report.data.socialFollowers.toLocaleString()}</td></tr>
                )}
                {report.data.socialEngagement != null && (
                  <tr><td className="px-6 py-3 font-medium">Social Engagement</td><td className="px-6 py-3 text-right font-mono">{report.data.socialEngagement}%</td></tr>
                )}
                {report.data.emailSubscribers != null && (
                  <tr><td className="px-6 py-3 font-medium">Email Subscribers</td><td className="px-6 py-3 text-right font-mono">{report.data.emailSubscribers.toLocaleString()}</td></tr>
                )}
                {report.data.emailOpenRate != null && (
                  <tr><td className="px-6 py-3 font-medium">Email Open Rate</td><td className="px-6 py-3 text-right font-mono">{report.data.emailOpenRate}%</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}