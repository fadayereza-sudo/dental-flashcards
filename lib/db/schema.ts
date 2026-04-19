import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  doublePrecision,
  jsonb,
  check,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const folders = pgTable(
  "folders",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    parentId: integer("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("folders_parent_name_uniq").on(t.parentId, t.name),
    index("folders_parent_idx").on(t.parentId),
  ],
);

export const cards = pgTable(
  "cards",
  {
    id: serial("id").primaryKey(),
    folderId: integer("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    source: text("source"),
    image: text("image"),
    reference: text("reference"),
    referenceSection: text("reference_section"),
    note: text("note"),
    contentHash: text("content_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("cards_folder_hash_uniq").on(t.folderId, t.contentHash),
    index("cards_folder_idx").on(t.folderId),
  ],
);

export const cardState = pgTable(
  "card_state",
  {
    cardId: integer("card_id")
      .primaryKey()
      .references(() => cards.id, { onDelete: "cascade" }),
    due: timestamp("due", { withTimezone: true }).notNull(),
    stability: doublePrecision("stability").notNull(),
    difficulty: doublePrecision("difficulty").notNull(),
    elapsedDays: doublePrecision("elapsed_days").notNull(),
    scheduledDays: doublePrecision("scheduled_days").notNull(),
    reps: integer("reps").notNull(),
    lapses: integer("lapses").notNull(),
    state: integer("state").notNull(),
    lastReview: timestamp("last_review", { withTimezone: true }),
  },
  (t) => [index("card_state_due_idx").on(t.due)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    prevState: jsonb("prev_state").notNull(),
  },
  (t) => [
    check("reviews_rating_range", sql`${t.rating} BETWEEN 1 AND 4`),
    index("reviews_card_idx").on(t.cardId),
    index("reviews_reviewed_at_idx").on(t.reviewedAt),
  ],
);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  telegramChatId: text("telegram_chat_id"),
  mutedUntil: timestamp("muted_until", { withTimezone: true }),
  notifyTimes: jsonb("notify_times")
    .$type<string[]>()
    .notNull()
    .default(sql`'["09:00"]'::jsonb`),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  timezone: text("timezone").notNull().default("Europe/London"),
});

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type CardStateRow = typeof cardState.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Settings = typeof settings.$inferSelect;
