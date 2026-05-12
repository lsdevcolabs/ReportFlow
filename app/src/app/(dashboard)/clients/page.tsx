import { getUserById } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getMaxClients } from "@/lib/plans";
import ClientsClient from "./clients-client";

interface SearchParams {
  search?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  let userId: string | null = null;
  let plan = "free";
  let maxClients = 1;
  let userClients: typeof clients.$inferSelect[] = [];

  try {
    const { auth } = await import("@clerk/nextjs");
    const { userId: uid } = await auth();
    userId = uid;
  } catch {
    userId = null;
  }

  if (!userId) {
    return <div>Please sign in to view clients.</div>;
  }

  try {
    const user = await getUserById(userId);
    plan = user?.plan || "free";
    maxClients = getMaxClients(plan as "free" | "starter" | "pro");

    if (process.env.DATABASE_URL) {
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