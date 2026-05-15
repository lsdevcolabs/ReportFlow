import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  return user || null;
}

/**
 * Update user plan (called after successful payment)
 */
export async function updateUserPlan(
  userId: string,
  plan: "free" | "starter" | "pro",
  lsCustomerId?: string,
  lsSubscriptionId?: string,
  subscriptionStatus: "active" | "past_due" | "cancelled" | "inactive" = "active"
) {
  const [updatedUser] = await db
    .update(users)
    .set({
      plan,
      lsCustomerId: lsCustomerId || null,
      lsSubscriptionId: lsSubscriptionId || null,
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