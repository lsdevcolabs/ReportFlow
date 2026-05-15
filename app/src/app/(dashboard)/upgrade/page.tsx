import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
import { ensureUserExists } from "@/lib/auth";
import UpgradeClient from "./upgrade-client";

export default async function UpgradePage() {
  let currentPlan = "free";

  try {
    const clerkUser = await currentUser();
    if (clerkUser && process.env.DATABASE_URL) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      
      const user = await ensureUserExists(clerkUser.id, email, name);

      if (user) {
        currentPlan = user.plan || "free";
      }
    }
  } catch (error) {
    console.error("[UpgradePage] Error:", error);
    // Auth or DB error - use default
  }

  return (
    <div className="p-8">
      <UpgradeClient currentPlan={currentPlan} />
    </div>
  );
}