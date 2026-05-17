import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMaxReports } from "@/lib/plans";
import ReportsClient from "./reports-client";

export const revalidate = 15;

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
  } catch {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-2">Authentication error</h1>
        <p className="text-muted-foreground">Please try signing in again.</p>
      </div>
    );
  }

  if (!userId) {
    return <div className="p-8">Please sign in to view reports.</div>;
  }

  await searchParams;

  let userReports: any[] = [];
  let plan = "free";
  let maxReports = 3;

  try {
    const user = await getUserById(userId);
    plan = user?.plan || "free";
    maxReports = getMaxReports(plan as "free" | "starter" | "pro");

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("...")) {
      const rawReports = await db
        .select({
          report: reports,
          client: clients,
        })
        .from(reports)
        .leftJoin(clients, eq(reports.clientId, clients.id))
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.createdAt));

      userReports = rawReports.map((row) => {
        const logoUrl = row.client?.logoUrl;
        // Only pass blob/http URLs — strip base64 data URIs to avoid bloating SSR payload
        const safeLogoUrl = logoUrl && !logoUrl.startsWith("data:") ? logoUrl : null;
        return {
          ...row.report,
          client: row.client ? { name: row.client.name, brandColor: row.client.brandColor, logoUrl: safeLogoUrl } : undefined,
        };
      });
    }
  } catch (error) {
    console.error("Failed to fetch reports:", error);
  }

  return (
    <ReportsClient
      initialReports={userReports}
      maxReports={maxReports}
      currentCount={userReports.length}
      plan={plan}
    />
  );
}
