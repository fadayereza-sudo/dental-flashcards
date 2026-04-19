import { NextResponse } from "next/server";
import { and, desc, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: schema.cards.id,
      question: schema.cards.question,
      note: schema.cards.note,
      folderId: schema.cards.folderId,
      folderName: schema.folders.name,
      parentFolderId: schema.folders.parentId,
      updatedAt: schema.cards.updatedAt,
    })
    .from(schema.cards)
    .innerJoin(schema.folders, eq(schema.folders.id, schema.cards.folderId))
    .where(
      and(
        isNotNull(schema.cards.note),
        ne(schema.cards.note, ""),
        isNull(schema.cards.deletedAt),
        isNull(schema.folders.deletedAt),
      ),
    )
    .orderBy(desc(schema.cards.updatedAt));

  const parentIds = Array.from(
    new Set(rows.map((r) => r.parentFolderId).filter((v): v is number => v !== null)),
  );
  const parents = parentIds.length
    ? await db
        .select({ id: schema.folders.id, name: schema.folders.name })
        .from(schema.folders)
    : [];
  const parentName = new Map(parents.map((p) => [p.id, p.name]));

  const comments = rows.map((r) => ({
    id: r.id,
    question: r.question,
    note: r.note,
    folderPath:
      r.parentFolderId !== null && parentName.has(r.parentFolderId)
        ? `${parentName.get(r.parentFolderId)} / ${r.folderName}`
        : r.folderName,
    updatedAt: r.updatedAt,
  }));

  return NextResponse.json({ comments });
}
