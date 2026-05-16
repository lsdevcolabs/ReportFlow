ALTER TABLE "reports" ALTER COLUMN "metrics_data" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "last_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "last_sent_to" text;