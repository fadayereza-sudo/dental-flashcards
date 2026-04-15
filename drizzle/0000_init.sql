CREATE TABLE "card_state" (
	"card_id" integer PRIMARY KEY NOT NULL,
	"due" timestamp with time zone NOT NULL,
	"stability" double precision NOT NULL,
	"difficulty" double precision NOT NULL,
	"elapsed_days" double precision NOT NULL,
	"scheduled_days" double precision NOT NULL,
	"reps" integer NOT NULL,
	"lapses" integer NOT NULL,
	"state" integer NOT NULL,
	"last_review" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"folder_id" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"source" text,
	"content_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"card_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"prev_state" jsonb NOT NULL,
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" BETWEEN 1 AND 4)
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"telegram_chat_id" text,
	"muted_until" timestamp with time zone,
	"notify_times" jsonb DEFAULT '["08:00","20:00"]'::jsonb NOT NULL,
	"last_notified_at" timestamp with time zone,
	"timezone" text DEFAULT 'Europe/London' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_state" ADD CONSTRAINT "card_state_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_state_due_idx" ON "card_state" USING btree ("due");--> statement-breakpoint
CREATE UNIQUE INDEX "cards_folder_hash_uniq" ON "cards" USING btree ("folder_id","content_hash");--> statement-breakpoint
CREATE INDEX "cards_folder_idx" ON "cards" USING btree ("folder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "folders_parent_name_uniq" ON "folders" USING btree ("parent_id","name");--> statement-breakpoint
CREATE INDEX "folders_parent_idx" ON "folders" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "reviews_card_idx" ON "reviews" USING btree ("card_id");--> statement-breakpoint
CREATE INDEX "reviews_reviewed_at_idx" ON "reviews" USING btree ("reviewed_at");