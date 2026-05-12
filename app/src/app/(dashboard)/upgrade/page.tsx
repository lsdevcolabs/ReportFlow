import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage() {
  let currentPlan = "free";

  try {
    const { auth } = await import("@clerk/nextjs");
    const { userId } = await auth();
    if (userId && process.env.DATABASE_URL) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user) {
        currentPlan = user.plan || "free";
      }
    }
  } catch {
    // Auth or DB error - use default
  }

  return (
    <div className="p-8">
      <UpgradeClient currentPlan={currentPlan} />
    </div>
  );
}