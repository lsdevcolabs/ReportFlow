import { relations } from "drizzle-orm/relations";
import { users, clients, reports } from "./schema";

export const clientsRelations = relations(clients, ({one, many}) => ({
	user: one(users, {
		fields: [clients.userId],
		references: [users.id]
	}),
	reports: many(reports),
}));

export const usersRelations = relations(users, ({many}) => ({
	clients: many(clients),
	reports: many(reports),
}));

export const reportsRelations = relations(reports, ({one}) => ({
	client: one(clients, {
		fields: [reports.clientId],
		references: [clients.id]
	}),
	user: one(users, {
		fields: [reports.userId],
		references: [users.id]
	}),
}));