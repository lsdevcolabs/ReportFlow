"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

interface MetricsData {
  summary: {
    sessions: number;
    conversions: number;
    revenue: number;
    previousSessions?: number;
    previousConversions?: number;
  };
  channelBreakdown: Array<{
    channel: string;
    sessions: number;
    percentage: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    sessions: number;
    conversions: number;
  }>;
  customMetrics: Array<{
    label: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral";
  }>;
  notes: string;
}

interface ReportData {
  id: string;
  title: string;
  status: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  shareToken: string;
  isPublic: boolean;
  metricsData: MetricsData;
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

export default function PublicReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const token = params.shareToken as string;
        const res = await fetch(`/api/reports/public/${token}?t=${Date.now()}`, { cache: "no-store" });
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

    if (params.shareToken) {
      fetchReport();
    }
  }, [params.shareToken]);

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
  const metricsData = report.metricsData;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div
            className="px-6 sm:px-10 py-8 sm:py-12 border-b"
            style={{ borderTopColor: brandColor, borderTopWidth: 4 }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {report.client.logoUrl ? (
                <img
                  src={report.client.logoUrl}
                  alt={report.client.name}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
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

          <div className="p-6 sm:p-10 space-y-8">
            {metricsData.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold">{formatNumber(metricsData.summary.sessions)}</p>
                    {metricsData.summary.previousSessions && (
                      <p className={`text-xs mt-1 ${calculateChange(metricsData.summary.sessions, metricsData.summary.previousSessions) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculateChange(metricsData.summary.sessions, metricsData.summary.previousSessions) >= 0 ? "+" : ""}
                        {calculateChange(metricsData.summary.sessions, metricsData.summary.previousSessions).toFixed(1)}% vs previous
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">Conversions</p>
                    <p className="text-2xl font-bold">{formatNumber(metricsData.summary.conversions)}</p>
                    {metricsData.summary.previousConversions && (
                      <p className={`text-xs mt-1 ${calculateChange(metricsData.summary.conversions, metricsData.summary.previousConversions) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {calculateChange(metricsData.summary.conversions, metricsData.summary.previousConversions) >= 0 ? "+" : ""}
                        {calculateChange(metricsData.summary.conversions, metricsData.summary.previousConversions).toFixed(1)}% vs previous
                      </p>
                    )}
                  </CardContent>
                </Card>

                {metricsData.summary.revenue !== undefined && (
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(metricsData.summary.revenue)}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {metricsData.channelBreakdown && metricsData.channelBreakdown.length > 0 && (
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
                        <Tooltip formatter={(value) => formatNumber(value as number)} />
                        <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                          {metricsData.channelBreakdown.map((_, index) => (
                            <Cell key={index} fill={brandColor} fillOpacity={1 - index * 0.15} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {metricsData.weeklyTrend && metricsData.weeklyTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsData.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="sessions" fill={brandColor} radius={[4, 4, 0, 0]} name="Sessions" />
                        <Bar dataKey="conversions" fill={brandColor} fillOpacity={0.5} radius={[4, 4, 0, 0]} name="Conversions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {metricsData.customMetrics && metricsData.customMetrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metricsData.customMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <div className="text-right">
                          <span className="text-lg font-bold">{metric.value}</span>
                          {metric.change && (
                            <span className={`text-xs ml-2 ${
                              metric.changeType === "positive" ? "text-green-600" :
                              metric.changeType === "negative" ? "text-red-600" :
                              "text-muted-foreground"
                            }`}>
                              {metric.changeType === "positive" ? "+" : metric.changeType === "negative" ? "-" : ""}
                              {metric.change}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {metricsData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {metricsData.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

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