import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, ne } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const [card] = await db
    .select({
      id: schema.cards.id,
      folderId: schema.cards.folderId,
      contentHash: schema.cards.contentHash,
      deletedAt: schema.cards.deletedAt,
    })
    .from(schema.cards)
    .where(eq(schema.cards.id, id))
    .limit(1);
  if (!card) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (card.deletedAt === null) {
    return NextResponse.json({ ok: true, affected: 0 });
  }

  const [folder] = await db
    .select({ deletedAt: schema.folders.deletedAt })
    .from(schema.folders)
    .where(eq(schema.folders.id, card.folderId))
    .limit(1);
  if (!folder) {
    return NextResponse.json({ error: "folder not found" }, { status: 404 });
  }
  if (folder.deletedAt !== null) {
    return NextResponse.json(
      { error: "restore the folder first" },
      { status: 409 },
    );
  }

  const [conflict] = await db
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .where(
      and(
        eq(schema.cards.folderId, card.folderId),
        eq(schema.cards.contentHash, card.contentHash),
        isNull(schema.cards.deletedAt),
        ne(schema.cards.id, id),
      ),
    )
    .limit(1);
  if (conflict) {
    return NextResponse.json(
      {
        error:
          "an active card with identical content exists — remove it first",
      },
      { status: 409 },
    );
  }

  const [restored] = await db
    .update(schema.cards)
    .set({ deletedAt: null })
    .where(eq(schema.cards.id, id))
    .returning();
  return NextResponse.json({ ok: true, affected: 1, card: restored });
}
