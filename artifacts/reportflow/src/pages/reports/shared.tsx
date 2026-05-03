import { useGetSharedReport, getGetSharedReportQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { format } from "date-fns";
import { 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export default function SharedReport() {
  const [, params] = useRoute("/reports/shared/:shareToken");
  const shareToken = params?.shareToken || "";
  
  const { data: report, isLoading, error } = useGetSharedReport(shareToken, {
    query: { enabled: !!shareToken, queryKey: getGetSharedReportQueryKey(shareToken), retry: 1 }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
        <div className="bg-card p-8 rounded-xl border shadow-sm max-w-md w-full text-center space-y-4">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold">Report Unavailable</h2>
          <p className="text-muted-foreground">
            This report link is invalid, has expired, or is no longer public. 
            Please contact your agency for a new link.
          </p>
        </div>
      </div>
    );
  }

  const brandColor = report.clientBrandColor || 'hsl(var(--primary))';

  // Prepare chart data
  const hasTrafficData = report.data.organicTraffic != null || report.data.paidTraffic != null;
  const trafficData = [
    { name: 'Organic', value: report.data.organicTraffic || 0 },
    { name: 'Paid', value: report.data.paidTraffic || 0 },
  ];

  const hasConversionData = report.data.conversions != null || report.data.previousConversions != null;
  const conversionData = [
    { name: 'Previous', value: report.data.previousConversions || 0, fill: 'hsl(var(--muted))' },
    { name: 'Current', value: report.data.conversions || 0, fill: brandColor },
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
      <span className={`flex items-center text-xs font-medium ${isGood ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
        {percent > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(percent)}%
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-muted/10 print:bg-white text-foreground selection:bg-primary/20">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-break-inside-avoid { break-inside: avoid; }
        }
      `}} />
      
      {/* Brand Header */}
      <div 
        className="h-2 w-full print:hidden" 
        style={{ backgroundColor: brandColor }}
      />
      
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <header className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm print:border-none print:shadow-none print:p-0 print:mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground" style={{ color: brandColor }}>
                  {report.clientName}
                </span>
                <span className="text-muted-foreground/30">•</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(report.dateRangeStart), 'MMMM d')} - {format(new Date(report.dateRangeEnd), 'MMMM d, yyyy')}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{report.title}</h1>
            </div>
            
            <div 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md shrink-0 border-4 border-white dark:border-card"
              style={{ backgroundColor: brandColor }}
            >
              {report.clientName.charAt(0).toUpperCase()}
            </div>
          </div>
          
          {report.data.notes && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Executive Summary</h3>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 text-lg">{report.data.notes}</p>
              </div>
            </div>
          )}
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-4 print:break-inside-avoid">
          {(report.data.organicTraffic != null || report.data.paidTraffic != null) && (
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Traffic</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold" style={{ color: brandColor }}>
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
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversions</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold" style={{ color: brandColor }}>
                    {report.data.conversions.toLocaleString()}
                  </h3>
                  {renderTrend(report.data.conversions, report.data.previousConversions)}
                </div>
              </CardContent>
            </Card>
          )}
          
          {report.data.spend != null && (
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ad Spend</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">
                    ${report.data.spend.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </h3>
                  {renderTrend(report.data.spend, report.data.previousSpend, true)}
                </div>
              </CardContent>
            </Card>
          )}
          
          {report.data.roas != null && (
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground mb-1">ROAS</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">{report.data.roas}x</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 print:break-inside-avoid">
          {hasTrafficData && (
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
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
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {trafficData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? brandColor : 'hsl(var(--muted-foreground)/0.3)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {hasConversionData && (
            <Card className="border-none shadow-sm bg-card print:border print:shadow-none">
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
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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

        {/* Detailed Metrics */}
        <Card className="border-none shadow-sm bg-card overflow-hidden print:border print:shadow-none print:break-inside-avoid">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Detailed Performance Data</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y">
                {report.data.impressions != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Ad Impressions</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.impressions.toLocaleString()}</td>
                  </tr>
                )}
                {report.data.clicks != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Ad Clicks</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.clicks.toLocaleString()}</td>
                  </tr>
                )}
                {report.data.ctr != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Click-Through Rate</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.ctr}%</td>
                  </tr>
                )}
                {report.data.conversionRate != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Conversion Rate</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.conversionRate}%</td>
                  </tr>
                )}
                {report.data.socialFollowers != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Social Followers</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.socialFollowers.toLocaleString()}</td>
                  </tr>
                )}
                {report.data.socialEngagement != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Social Engagement</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.socialEngagement}%</td>
                  </tr>
                )}
                {report.data.emailSubscribers != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Email Subscribers</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.emailSubscribers.toLocaleString()}</td>
                  </tr>
                )}
                {report.data.emailOpenRate != null && (
                  <tr className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">Email Open Rate</td>
                    <td className="px-6 py-4 text-right font-mono text-lg">{report.data.emailOpenRate}%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        
        <footer className="pt-12 pb-6 text-center text-sm text-muted-foreground print:hidden">
          Powered by <span className="font-bold">ReportFlow</span>
        </footer>
      </div>
    </div>
  );
}