import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
