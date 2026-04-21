ALTER TABLE "cards" ADD COLUMN "tag" text;--> statement-breakpoint
CREATE INDEX "cards_tag_idx" ON "cards" USING btree ("tag");--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_tag_allowed" CHECK ("cards"."tag" IS NULL OR "cards"."tag" IN ('diagnosis', 'treatment-planning', 'safety-and-compliance', 'patient-best-interests'));