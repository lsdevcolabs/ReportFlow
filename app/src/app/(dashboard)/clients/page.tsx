import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMaxClients } from "@/lib/plans";
import ClientsClient from "./clients-client";

export const revalidate = 15;

interface SearchParams {
  search?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
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
    return <div className="p-8">Please sign in to view clients.</div>;
  }

  let plan = "free";
  let maxClients = 1;
  let userClients: typeof clients.$inferSelect[] = [];

  try {
    const user = await getUserById(userId);
    plan = user?.plan || "free";
    maxClients = getMaxClients(plan as "free" | "starter" | "pro");

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("...")) {
      userClients = await db
        .select()
        .from(clients)
        .where(eq(clients.userId, userId));
    }
  } catch {
    // DB error - use empty array
  }

  const params = await searchParams;
  const search = params.search || "";

  const filteredClients = search
    ? userClients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.industry && c.industry.toLowerCase().includes(search.toLowerCase()))
      )
    : userClients;

  return (
    <ClientsClient
      initialClients={filteredClients}
      maxClients={maxClients}
      currentCount={userClients.length}
      plan={plan}
    />
  );
}
