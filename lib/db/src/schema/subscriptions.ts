import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  lsSubscriptionId: text("ls_subscription_id").notNull().unique(),
  lsCustomerId: text("ls_customer_id").notNull(),
  lsVariantId: text("ls_variant_id").notNull(),
  lsOrderId: text("ls_order_id"),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  renewsAt: timestamp("renews_at"),
  endsAt: timestamp("ends_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptionsTable.$inferSelect;
