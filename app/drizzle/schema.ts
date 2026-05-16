import { pgTable, foreignKey, text, varchar, timestamp, unique, jsonb, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const clients = pgTable("clients", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	email: text(),
	website: text(),
	industry: text(),
	logoUrl: text("logo_url"),
	brandColor: varchar("brand_color", { length: 7 }).default('#2563EB'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clients_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const reports = pgTable("reports", {
	id: text().primaryKey().notNull(),
	clientId: text("client_id").notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	dateRangeStart: timestamp("date_range_start", { mode: 'string' }).notNull(),
	dateRangeEnd: timestamp("date_range_end", { mode: 'string' }).notNull(),
	metricsData: jsonb("metrics_data").default({}).notNull(),
	shareToken: text("share_token"),
	isPublic: boolean("is_public").default(false),
	status: text().default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.clientId],
			foreignColumns: [clients.id],
			name: "reports_client_id_clients_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reports_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("reports_share_token_unique").on(table.shareToken),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	plan: text().default('free').notNull(),
	lsCustomerId: text("ls_customer_id"),
	lsSubscriptionId: text("ls_subscription_id"),
	subscriptionStatus: text("subscription_status").default('inactive'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	agencyName: text("agency_name"),
	agencyWebsite: text("agency_website"),
	agencyLogoUrl: text("agency_logo_url"),
	agencyBrandColor: varchar("agency_brand_color", { length: 7 }).default('#2563EB'),
	dodoCustomerId: text("dodo_customer_id"),
	dodoSubscriptionId: text("dodo_subscription_id"),
	dodoPaymentId: text("dodo_payment_id"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
