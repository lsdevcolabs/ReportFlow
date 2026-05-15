import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { clients, reports } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import ClientDetailClient from "./client-detail-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("...")) {
    return <div>Database not configured.</div>;
  }

  // Fetch client
  const [client] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.userId, userId)))
    .limit(1);

  if (!client) {
    return <div className="p-8">Client not found or you don't have access.</div>;
  }

  // Fetch related reports
  const clientReports = await db
    .select()
    .from(reports)
    .where(and(eq(reports.clientId, id), eq(reports.userId, userId)))
    .orderBy(desc(reports.createdAt));

  return <ClientDetailClient initialClient={client} initialReports={clientReports} />;
}