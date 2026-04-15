import {
  fsrs,
  generatorParameters,
  createEmptyCard,
  Rating,
  type Card as FsrsCard,
} from "ts-fsrs";
import type { CardStateRow } from "./db/schema";

const params = generatorParameters({
  enable_fuzz: true,
  maximum_interval: 365 * 3,
});

export const scheduler = fsrs(params);

export function emptyState(now = new Date()): FsrsCard {
  return createEmptyCard(now);
}

export function toFsrsCard(row: CardStateRow): FsrsCard {
  return {
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsedDays,
    scheduled_days: row.scheduledDays,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    last_review: row.lastReview ?? undefined,
  } as FsrsCard;
}

export function fromFsrsCard(
  cardId: number,
  card: FsrsCard,
): CardStateRow {
  return {
    cardId,
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review ?? null,
  };
}

export { Rating };
