import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ cards: [] });
  }
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "20", 10) || 20,
    100,
  );
  const pattern = `%${q}%`;

  const rows = await db
    .select({
      id: schema.cards.id,
      question: schema.cards.question,
      answer: schema.cards.answer,
      source: schema.cards.source,
      image: schema.cards.image,
      reference: schema.cards.reference,
      referenceSection: schema.cards.referenceSection,
      note: schema.cards.note,
      tag: schema.cards.tag,
      folderId: schema.cards.folderId,
      due: schema.cardState.due,
      state: schema.cardState.state,
      reps: schema.cardState.reps,
    })
    .from(schema.cards)
    .innerJoin(schema.cardState, eq(schema.cardState.cardId, schema.cards.id))
    .innerJoin(schema.folders, eq(schema.folders.id, schema.cards.folderId))
    .where(
      and(
        isNull(schema.cards.deletedAt),
        isNull(schema.folders.deletedAt),
        or(
          ilike(schema.cards.question, pattern),
          ilike(schema.cards.answer, pattern),
          ilike(schema.cards.source, pattern),
          ilike(schema.cards.referenceSection, pattern),
        )!,
      )!,
    )
    .orderBy(desc(schema.cards.id))
    .limit(limit);

  return NextResponse.json({ cards: rows });
}
