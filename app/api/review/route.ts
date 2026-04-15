import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { scheduler, toFsrsCard, fromFsrsCard, Rating } from "@/lib/fsrs";

export const runtime = "nodejs";

const ratingMap: Record<number, Rating> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const cardId = Number(body?.cardId);
  const ratingNum = Number(body?.rating);

  if (!Number.isFinite(cardId) || !ratingMap[ratingNum]) {
    return NextResponse.json(
      { error: "cardId and rating (1–4) required" },
      { status: 400 },
    );
  }

  const [state] = await db
    .select()
    .from(schema.cardState)
    .where(eq(schema.cardState.cardId, cardId))
    .limit(1);

  if (!state) {
    return NextResponse.json({ error: "card not found" }, { status: 404 });
  }

  const now = new Date();
  const result = scheduler.repeat(toFsrsCard(state), now);
  const chosen = result[ratingMap[ratingNum]];
  const nextState = fromFsrsCard(cardId, chosen.card);

  await db
    .update(schema.cardState)
    .set({
      due: nextState.due,
      stability: nextState.stability,
      difficulty: nextState.difficulty,
      elapsedDays: nextState.elapsedDays,
      scheduledDays: nextState.scheduledDays,
      reps: nextState.reps,
      lapses: nextState.lapses,
      state: nextState.state,
      lastReview: nextState.lastReview,
    })
    .where(eq(schema.cardState.cardId, cardId));

  await db.insert(schema.reviews).values({
    cardId,
    rating: ratingNum,
    prevState: state,
  });

  return NextResponse.json({
    ok: true,
    due: nextState.due.toISOString(),
    state: nextState.state,
  });
}
