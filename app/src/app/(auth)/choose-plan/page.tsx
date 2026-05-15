import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";
import ChoosePlanClient from "./choose-plan-client";

export const dynamic = "force-dynamic";

export default async function ChoosePlanPage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    return null;
  }

  try {
    if (process.env.DATABASE_URL) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

      await ensureUserExists(userId, email, name);
    }
  } catch (error) {
    console.error("[ChoosePlanPage] Error:", error);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <ChoosePlanClient />
    </div>
  );
}