import { getUserById } from "@/lib/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMaxReports } from "@/lib/plans";
import ReportsClient from "./reports-client";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  let userId: string | null = null;

  try {
    const { auth } = await import("@clerk/nextjs");
    const { userId: id } = await auth();
    userId = id;
  } catch {
    userId = null;
  }

  if (!userId) {
    return <div>Please sign in to view reports.</div>;
  }

  const params = await searchParams;

  let userReports: typeof reports.$inferSelect[] = [];
  let plan = "free";
  let maxReports = 3;

  try {
    const user = await getUserById(userId);
    plan = user?.plan || "free";
    maxReports = getMaxReports(plan as "free" | "starter" | "pro");

    if (process.env.DATABASE_URL) {
      userReports = await db
        .select()
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.createdAt));
    }
  } catch {
    // DB error - use empty array
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