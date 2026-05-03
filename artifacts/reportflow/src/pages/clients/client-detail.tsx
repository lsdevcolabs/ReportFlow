import { useGetClient, useListReports, getGetClientQueryKey } from "@workspace/api-client-react";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  FileBarChart, 
  Plus, 
  Mail, 
  Calendar,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ClientDetail() {
  const [, params] = useRoute("/clients/:clientId");
  const clientId = params?.clientId ? parseInt(params.clientId) : 0;
  
  const { data: client, isLoading: isLoadingClient } = useGetClient(clientId, {
    query: { enabled: !!clientId, queryKey: getGetClientQueryKey(clientId) }
  });
  
  const { data: reports, isLoading: isLoadingReports } = useListReports({ clientId });

  if (isLoadingClient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-24" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Client not found</h2>
        <Link href="/clients">
          <Button variant="link" className="mt-4">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" data-testid="button-back-to-clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0"
            style={{ backgroundColor: client.brandColor || 'hsl(var(--primary))' }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {client.email}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {client.projectType}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Added {format(new Date(client.createdAt), 'MMM yyyy')}
              </div>
            </div>
          </div>
        </div>
        <Link href={`/reports/new?clientId=${client.id}`}>
          <Button data-testid="button-new-report-client-detail">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>All reports generated for {client.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingReports ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Date Range</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/reports/${report.id}`} className="hover:underline text-foreground" data-testid={`link-report-${report.id}`}>
                          {report.title}
                        </Link>
                        <div className="text-xs text-muted-foreground sm:hidden mt-1">
                          {format(new Date(report.dateRangeStart), 'MMM d')} - {format(new Date(report.dateRangeEnd), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {format(new Date(report.dateRangeStart), 'MMM d')} - {format(new Date(report.dateRangeEnd), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        {report.isPublic ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">Draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/reports/${report.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-report-${report.id}`}>View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md border-dashed">
              <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No reports yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                You haven't generated any reports for {client.name}.
              </p>
              <Link href={`/reports/new?clientId=${client.id}`}>
                <Button data-testid="button-create-first-report-client">Create their first report</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}