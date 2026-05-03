import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  projectType: text("project_type").notNull(),
  brandColor: text("brand_color"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
