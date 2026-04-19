ALTER TABLE "settings" ALTER COLUMN "notify_times" SET DEFAULT '["09:00"]'::jsonb;--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "note" text;