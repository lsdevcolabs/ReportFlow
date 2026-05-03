import { useState } from "react";
import { useListReports } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  FileBarChart, 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Reports() {
  const { data: reports, isLoading } = useListReports();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredReports = reports?.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(search.toLowerCase()) || 
      report.clientName.toLowerCase().includes(search.toLowerCase());
      
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "published") return matchesSearch && report.isPublic;
    if (statusFilter === "draft") return matchesSearch && !report.isPublic;
    
    return matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Manage and view all your generated reports.</p>
        </div>
        <Link href="/reports/new">
          <Button data-testid="button-new-report-list">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports or clients..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-reports"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]" data-testid="select-status-filter">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-5 space-y-4">
              <div className="flex justify-between">
                <div className="flex gap-3 items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2 pt-2 border-t mt-4">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))
        ) : filteredReports.length === 0 ? (
          <div className="col-span-full text-center py-16 border rounded-xl border-dashed bg-muted/20">
            <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium">No reports found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
              {search || statusFilter !== "all" 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't created any reports yet. Generate your first report to see it here."}
            </p>
            {!(search || statusFilter !== "all") && (
              <Link href="/reports/new">
                <Button data-testid="button-create-first-report-empty">Create Report</Button>
              </Link>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <div 
                className="border rounded-xl p-5 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                data-testid={`card-report-${report.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm shrink-0"
                      style={{ backgroundColor: report.clientBrandColor || 'hsl(var(--primary))' }}
                    >
                      {report.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{report.clientName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{report.clientProjectType}</p>
                    </div>
                  </div>
                  {report.isPublic ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Published</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Draft</Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">{report.title}</h3>
                
                <div className="mt-auto pt-4 border-t flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                  {format(new Date(report.dateRangeStart), 'MMM d, yyyy')} - {format(new Date(report.dateRangeEnd), 'MMM d, yyyy')}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}