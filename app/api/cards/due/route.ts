import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, inArray, lte, or, SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const folderParam = url.searchParams.get("folders");
  const folderIds = folderParam
    ? folderParam
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n))
    : null;
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "50", 10) || 50,
    200,
  );

  const now = new Date();

  const dueOrNew = or(
    lte(schema.cardState.due, now),
    eq(schema.cardState.state, 0),
  )!;

  const where: SQL =
    folderIds && folderIds.length > 0
      ? and(dueOrNew, inArray(schema.cards.folderId, folderIds))!
      : dueOrNew;

  const rows = await db
    .select({
      id: schema.cards.id,
      question: schema.cards.question,
      answer: schema.cards.answer,
      source: schema.cards.source,
      image: schema.cards.image,
      reference: schema.cards.reference,
      referenceSection: schema.cards.referenceSection,
      folderId: schema.cards.folderId,
      due: schema.cardState.due,
      state: schema.cardState.state,
      reps: schema.cardState.reps,
    })
    .from(schema.cards)
    .innerJoin(
      schema.cardState,
      eq(schema.cardState.cardId, schema.cards.id),
    )
    .where(where)
    .orderBy(asc(schema.cardState.due))
    .limit(limit);

  return NextResponse.json({ cards: rows, now: now.toISOString() });
}
