import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
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
      deletedAt: schema.cards.deletedAt,
    })
    .from(schema.cards)
    .where(eq(schema.cards.id, id))
    .limit(1);
  if (!card) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (card.deletedAt === null) {
    return NextResponse.json(
      { error: "soft-delete first" },
      { status: 409 },
    );
  }

  await db.delete(schema.cards).where(eq(schema.cards.id, id));
  return NextResponse.json({ ok: true });
}
