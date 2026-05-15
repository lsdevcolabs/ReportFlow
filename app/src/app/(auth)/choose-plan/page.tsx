import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/auth";
import ChoosePlanClient from "./choose-plan-client";

export const dynamic = "force-dynamic";

export default async function ChoosePlanPage() {
  // Attempt to get the current user — right after signup Clerk's session
  // can take a moment to propagate on the server, so we treat auth errors
  // as non-fatal and always render the plan-selection UI.
  try {
    const clerkUser = await currentUser();

    if (clerkUser) {
      // Best-effort: create the DB record for this user if it doesn't exist yet.
      // Errors here must NOT block the page from rendering.
      try {
        if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("...")) {
          const email = clerkUser.emailAddresses[0]?.emailAddress;
          const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
          await ensureUserExists(clerkUser.id, email, name);
        }
      } catch (dbError) {
        console.error("[ChoosePlanPage] DB Error (non-fatal):", dbError);
      }
    }
  } catch (authError) {
    // Clerk session not yet available on the server right after signup — this is
    // expected. Log it but still render the page so the user isn't blocked.
    console.warn("[ChoosePlanPage] Auth not ready yet (non-fatal):", authError);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <ChoosePlanClient />
    </div>
  );
}
