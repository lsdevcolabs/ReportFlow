import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Users table — synced from Clerk via webhook or on first login
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID (e.g., "user_2abc...")
  email: text("email").notNull().unique(),
  name: text("name"),
  plan: text("plan").notNull().default("free"), // 'free' | 'starter' | 'pro'
  lsCustomerId: text("ls_customer_id"), // Legacy Lemon Squeezy customer ID
  lsSubscriptionId: text("ls_subscription_id"), // Legacy Lemon Squeezy subscription ID
  dodoCustomerId: text("dodo_customer_id"), // Dodo Payments customer ID
  dodoSubscriptionId: text("dodo_subscription_id"), // Dodo Payments subscription ID
  dodoPaymentId: text("dodo_payment_id"), // Dodo Payments payment ID
  subscriptionStatus: text("subscription_status").default("inactive"), // 'active' | 'past_due' | 'cancelled' | 'inactive'
  agencyName: text("agency_name"),
  agencyWebsite: text("agency_website"),
  agencyLogoUrl: text("agency_logo_url"),
  agencyBrandColor: varchar("agency_brand_color", { length: 7 }).default("#2563EB"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients table — each user manages multiple clients
export const clients = pgTable("clients", {
  id: text("id").primaryKey().$defaultFn(() => nanoid(10)),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"), // Client's email (optional, for sending reports)
  website: text("website"),
  industry: text("industry"),
  logoUrl: text("logo_url"), // Stored in Vercel Blob
  brandColor: varchar("brand_color", { length: 7 }).default("#2563EB"), // Hex color for white-label
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table — one report per client per reporting period
export const reports = pgTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => nanoid(10)),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // e.g., "April 2025 Marketing Report"
  dateRangeStart: timestamp("date_range_start").notNull(),
  dateRangeEnd: timestamp("date_range_end").notNull(),

  // Report data stored as JSON — flexible structure
  metricsData: jsonb("metrics_data").notNull().default("{}"),
  // Structure of metricsData:
  // {
  //   summary: { sessions: number, conversions: number, revenue: number, ... },
  //   channelBreakdown: [{ channel: string, sessions: number, percentage: number }],
  //   weeklyTrend: [{ week: string, sessions: number, conversions: number }],
  //   customMetrics: [{ label: string, value: string, change: string, changeType: 'positive'|'negative'|'neutral' }],
  //   notes: string  (editor notes / summary text)
  // }

  shareToken: text("share_token").unique(), // Random token for public URL (e.g., /r/abc123xyz)
  isPublic: boolean("is_public").default(false), // Must be true for share link to work

  status: text("status").default("draft"), // 'draft' | 'published'
  lastSentAt: timestamp("last_sent_at"), // When the report was last emailed
  lastSentTo: text("last_sent_to"), // Email address it was last sent to
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;