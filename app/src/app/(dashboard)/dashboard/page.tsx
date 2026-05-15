import { Users, FileBarChart, ArrowUpRight, Link as LinkIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients, reports } from "@/lib/db/schema";
import { eq, count, and, gte, sql } from "drizzle-orm";

// Allow Next.js to cache and revalidate every 30 seconds instead of force-dynamic
export const revalidate = 30;

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to view your dashboard.</div>;
  }

  let totalClients = 0;
  let totalReports = 0;
  let reportsThisMonth = 0;
  let sharedReports = 0;

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("...")) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Single parallel fetch instead of 4 sequential queries
      const [clientsResult, reportsResult] = await Promise.all([
        db.select({ count: count() }).from(clients).where(eq(clients.userId, userId)),
        db.select({
          total: count(),
          thisMonth: sql<number>`count(*) filter (where ${reports.createdAt} >= ${startOfMonth})`,
          shared: sql<number>`count(*) filter (where ${reports.isPublic} = true)`,
        }).from(reports).where(eq(reports.userId, userId)),
      ]);

      totalClients = clientsResult[0]?.count || 0;
      totalReports = reportsResult[0]?.total || 0;
      reportsThisMonth = Number(reportsResult[0]?.thisMonth) || 0;
      sharedReports = Number(reportsResult[0]?.shared) || 0;
    }
  } catch (error) {
    console.error("Dashboard DB Error:", error);
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your client reporting.</p>
        </div>
        <Link href="/reports/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Add your first client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
            <p className="text-xs text-muted-foreground">Create your first report</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports This Month</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsThisMonth}</div>
            <p className="text-xs text-muted-foreground">This month&apos;s reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shared Reports</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedReports}</div>
            <p className="text-xs text-muted-foreground">Published reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to create your first client report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium">Add your first client</h4>
              <p className="text-sm text-muted-foreground">Create a client profile with their details and brand colors.</p>
              <Link href="/clients">
                <Button variant="link" className="mt-2 h-8">Add Client →</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium">Create a report</h4>
              <p className="text-sm text-muted-foreground">Enter your client&apos;s metrics and generate a professional report.</p>
              <Link href="/reports/new">
                <Button variant="link" className="mt-2 h-8">Create Report →</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium">Share with your client</h4>
              <p className="text-sm text-muted-foreground">Publish the report and share the link with your client.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}