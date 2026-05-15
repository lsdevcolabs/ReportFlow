import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMaxReports } from "@/lib/plans";
import ReportsClient from "./reports-client";

// Allow Next.js to revalidate every 15 seconds instead of force-dynamic
export const revalidate = 15;

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please sign in to view reports.</div>;
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
        
      userReports = rawReports.map((row) => ({
        ...row.report,
        client: row.client ? { name: row.client.name, brandColor: row.client.brandColor } : undefined,
      }));
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