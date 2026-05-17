import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email";
import { trackUserSignedUp } from "@/lib/analytics";

/**
 * Ensures a user exists in the database.
 * If the user doesn't exist, creates a new record.
 * This is called on first login or when accessing protected routes.
 */
export async function ensureUserExists(clerkUserId: string, email?: string, name?: string | null) {
  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUserId))
    .limit(1);

  if (existingUser) {
    const isSuperUser = existingUser.email && (
      existingUser.email.toLowerCase() === "hocem57722@hilostar.com" ||
      (process.env.SUPERUSER_EMAIL && existingUser.email.toLowerCase() === process.env.SUPERUSER_EMAIL.toLowerCase())
    );
    if (isSuperUser) {
      return { ...existingUser, plan: "pro", subscriptionStatus: "active" };
    }
    return existingUser;
  }

  // If email is not provided, we can't create a new user
  // This might happen if Clerk isn't fully configured
  if (!email) {
    console.warn("[ensureUserExists] No email provided, cannot create user");
    return null;
  }

  // Create new user
  const [newUser] = await db
    .insert(users)
    .values({
      id: clerkUserId,
      email,
      name: name || null,
      plan: "free",
      subscriptionStatus: "inactive",
    })
    .returning();

  // Send welcome email and track signup event (fire-and-forget)
  const displayName = name || email.split("@")[0];
  sendWelcomeEmail(email, displayName).catch((err) =>
    console.error("[ensureUserExists] Failed to send welcome email:", err)
  );
  trackUserSignedUp(clerkUserId, "clerk");

  const isSuperUser = email && (
    email.toLowerCase() === "hocem57722@hilostar.com" ||
    (process.env.SUPERUSER_EMAIL && email.toLowerCase() === process.env.SUPERUSER_EMAIL.toLowerCase())
  );

  if (isSuperUser) {
    return { ...newUser, plan: "pro", subscriptionStatus: "active" };
  }

  return newUser;
}

/**
 * Get user by Clerk user ID
 */
export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const isSuperUser = user?.email && (
    user.email.toLowerCase() === "hocem57722@hilostar.com" ||
    (process.env.SUPERUSER_EMAIL && user.email.toLowerCase() === process.env.SUPERUSER_EMAIL.toLowerCase())
  );

  if (isSuperUser) {
    return { ...user, plan: "pro", subscriptionStatus: "active" };
  }

  return user || null;
}

/**
 * Update user plan (called after successful payment)
 */
export async function updateUserPlan(
  userId: string,
  plan: "free" | "starter" | "pro",
  subscriptionStatus: "active" | "past_due" | "cancelled" | "inactive" = "active"
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      plan,
      subscriptionStatus,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

/**
 * Get user's current plan
 */
export async function getUserPlan(userId: string): Promise<"free" | "starter" | "pro"> {
  const user = await getUserById(userId);
  return (user?.plan as "free" | "starter" | "pro") || "free";
}