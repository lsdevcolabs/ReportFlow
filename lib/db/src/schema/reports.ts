import { pgTable, serial, text, integer, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  dateRangeStart: date("date_range_start").notNull(),
  dateRangeEnd: date("date_range_end").notNull(),
  data: jsonb("data").notNull().$type<ReportData>(),
  shareToken: text("share_token"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface ReportData {
  organicTraffic?: number | null;
  paidTraffic?: number | null;
  conversions?: number | null;
  conversionRate?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  ctr?: number | null;
  spend?: number | null;
  roas?: number | null;
  socialFollowers?: number | null;
  socialEngagement?: number | null;
  emailSubscribers?: number | null;
  emailOpenRate?: number | null;
  previousOrganicTraffic?: number | null;
  previousConversions?: number | null;
  previousSpend?: number | null;
  notes?: string | null;
}

export const insertReportSchema = createInsertSchema(reportsTable).omit({
  id: true,
  createdAt: true,
  shareToken: true,
});

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
