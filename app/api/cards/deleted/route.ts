import { NextResponse } from "next/server";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const chapter = alias(schema.folders, "chapter");
  const book = alias(schema.folders, "book");

  const rows = await db
    .select({
      id: schema.cards.id,
      question: schema.cards.question,
      folderId: schema.cards.folderId,
      chapterName: chapter.name,
      bookName: book.name,
      deletedAt: schema.cards.deletedAt,
    })
    .from(schema.cards)
    .innerJoin(chapter, eq(chapter.id, schema.cards.folderId))
    .leftJoin(book, eq(book.id, chapter.parentId))
    .where(
      and(
        isNotNull(schema.cards.deletedAt),
        isNull(chapter.deletedAt),
      ),
    )
    .orderBy(desc(schema.cards.deletedAt));

  return NextResponse.json({
    cards: rows.map((r) => ({
      id: r.id,
      question: r.question,
      folderId: r.folderId,
      chapterName: r.chapterName,
      bookName: r.bookName,
      deletedAt: r.deletedAt ? r.deletedAt.toISOString() : null,
    })),
  });
}
