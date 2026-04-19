DROP INDEX "cards_folder_hash_uniq";--> statement-breakpoint
DROP INDEX "folders_parent_name_uniq";--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "folders" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "cards_folder_hash_active_uniq" ON "cards" USING btree ("folder_id","content_hash") WHERE "cards"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "cards_deleted_at_idx" ON "cards" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "folders_parent_name_active_uniq" ON "folders" USING btree ("parent_id","name") WHERE "folders"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "folders_deleted_at_idx" ON "folders" USING btree ("deleted_at");