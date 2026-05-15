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
    redirect("/sign-in");
  }

  const { id } = await params;

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("...")) {
    return <div className="p-8">Database not configured.</div>;
  }

  let client: any = null;
  let clientReports: any[] = [];

  try {
    const [foundClient] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .limit(1);
    client = foundClient;

    if (client) {
      clientReports = await db
        .select()
        .from(reports)
        .where(and(eq(reports.clientId, id), eq(reports.userId, userId)))
        .orderBy(desc(reports.createdAt));
    }
  } catch (error) {
    console.error("Client detail DB error:", error);
  }

  if (!client) {
    return <div className="p-8">Client not found or you don&apos;t have access.</div>;
  }

  return <ClientDetailClient initialClient={client} initialReports={clientReports} />;
}
