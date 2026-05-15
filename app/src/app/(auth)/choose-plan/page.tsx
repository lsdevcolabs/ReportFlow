import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";
import ChoosePlanClient from "./choose-plan-client";

export const dynamic = "force-dynamic";

export default async function ChoosePlanPage() {
  let userId: string | null = null;
  let clerkUser: any = null;

  try {
    const authResult = await auth();
    userId = authResult?.userId ?? null;
    clerkUser = await currentUser();
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground">Please try signing in again.</p>
        </div>
      </div>
    );
  }

  if (!userId || !clerkUser) {
    return null;
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("...")) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      await ensureUserExists(userId, email, name);
    }
  } catch (error) {
    console.error("[ChoosePlanPage] DB Error:", error);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <ChoosePlanClient />
    </div>
  );
}
