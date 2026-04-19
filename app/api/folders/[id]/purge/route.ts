import { NextRequest, NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
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

  const [existing] = await db
    .select({
      id: schema.folders.id,
      deletedAt: schema.folders.deletedAt,
    })
    .from(schema.folders)
    .where(eq(schema.folders.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (existing.deletedAt === null) {
    return NextResponse.json(
      { error: "soft-delete first" },
      { status: 409 },
    );
  }

  const rows = await db
    .delete(schema.folders)
    .where(
      or(eq(schema.folders.id, id), eq(schema.folders.parentId, id)),
    )
    .returning({ id: schema.folders.id });

  return NextResponse.json({ ok: true, affected: rows.length });
}
