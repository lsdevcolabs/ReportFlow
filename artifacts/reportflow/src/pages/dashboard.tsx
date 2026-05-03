import { useGetDashboardMetrics, useGetReportsOverTime } from "@workspace/api-client-react";
import { Link } from "wouter";
import { 
  Users, 
  FileBarChart, 
  ArrowUpRight, 
  Link as LinkIcon,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useGetDashboardMetrics();
  const { data: chartData, isLoading: isLoadingChart } = useGetReportsOverTime();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your client reporting.</p>
        </div>
        <Link href="/reports/new">
          <Button data-testid="button-new-report-dashboard">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Metrics Cards — 2 cols on mobile, 4 on large */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoadingMetrics ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))
        ) : metrics ? (
          <>
            <MetricCard 
              title="Total Clients" 
              value={metrics.totalClients} 
              icon={<Users className="h-4 w-4 text-muted-foreground" />} 
            />
            <MetricCard 
              title="Total Reports" 
              value={metrics.totalReports} 
              icon={<FileBarChart className="h-4 w-4 text-muted-foreground" />} 
            />
            <MetricCard 
              title="Reports This Month" 
              value={metrics.reportsThisMonth} 
              icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />} 
            />
            <MetricCard 
              title="Shared Reports" 
              value={metrics.sharedReports} 
              icon={<LinkIcon className="h-4 w-4 text-muted-foreground" />} 
            />
          </>
        ) : null}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Reports Over Time</CardTitle>
            <CardDescription>Number of reports generated in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoadingChart ? (
              <div className="h-[220px] sm:h-[280px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[220px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[220px] sm:h-[280px] flex items-center justify-center text-muted-foreground">
                No data available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your recently generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : metrics?.recentReports && metrics.recentReports.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentReports.map(report => (
                  <Link key={report.id} href={`/reports/${report.id}`}>
                    <div className="flex items-center gap-4 p-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`link-recent-report-${report.id}`}>
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                        style={{ backgroundColor: report.clientBrandColor || 'hsl(var(--primary))' }}
                      >
                        {report.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{report.clientName}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(report.createdAt), 'MMM d')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileBarChart className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No reports generated yet.</p>
                <Link href="/reports/new">
                  <Button variant="link" className="mt-2" data-testid="button-create-first-report">Create your first report</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: number | string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}