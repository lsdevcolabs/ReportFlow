"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FileBarChart, Calendar, Filter, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlanLimitBadge, UpgradePrompt } from "@/components/ui/upgrade-prompt";

interface ReportData {
  id: string;
  title: string;
  clientId: string;
  userId: string;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  metricsData: unknown;
  shareToken: string | null;
  isPublic: boolean | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  client?: {
    name: string;
    brandColor: string;
  };
}

interface ReportsClientProps {
  initialReports: ReportData[];
  maxReports: number;
  currentCount: number;
  plan: string;
}

export default function ReportsClient({ initialReports, maxReports, plan }: ReportsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reports, setReports] = useState(initialReports);
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      (report.client?.name && report.client.name.toLowerCase().includes(search.toLowerCase()));

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "published") return matchesSearch && report.isPublic;
    if (statusFilter === "draft") return matchesSearch && !report.isPublic;

    return matchesSearch;
  });

  const canCreateReport = maxReports === Infinity || reports.length < maxReports;

  const handleNewReportClick = () => {
    if (!canCreateReport) {
      setIsLimitDialogOpen(true);
    }
  };

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "N/A";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}, ${endDate.getFullYear()}`;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your generated reports.</p>
        </div>
        <div className="flex items-center gap-4">
          <PlanLimitBadge limit={maxReports} current={reports.length} type="reports" />
          {canCreateReport ? (
            <Link href="/reports/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </Link>
          ) : (
            <Button onClick={handleNewReportClick}>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileBarChart className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports found</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {search || statusFilter !== "all"
                ? "No reports match your search criteria."
                : "Get started by creating your first report."}
            </p>
            {!search && statusFilter === "all" && canCreateReport && (
              <Link href="/reports/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Report
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: report.client?.brandColor || "#2563EB" }}
                      >
                        {report.client?.name?.charAt(0).toUpperCase() || "R"}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{report.client?.name || "Unknown Client"}</p>
                      </div>
                    </div>
                    <Badge variant={report.isPublic ? "default" : "secondary"}>
                      {report.isPublic ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{report.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDateRange(report.dateRangeStart, report.dateRangeEnd)}
                  </div>

                  <div className="pt-3 border-t mt-auto">
                    <p className="text-xs text-muted-foreground">
                      Created {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <UpgradePrompt
        open={isLimitDialogOpen}
        onOpenChange={setIsLimitDialogOpen}
        message={`You've reached the maximum of ${maxReports} reports on your ${plan} plan. Upgrade to create unlimited reports.`}
        feature="Unlimited reports"
      />
    </div>
  );
}