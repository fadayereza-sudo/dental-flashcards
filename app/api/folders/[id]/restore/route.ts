import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNotNull, isNull, ne, or } from "drizzle-orm";
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

  const [existing] = await db
    .select({
      id: schema.folders.id,
      name: schema.folders.name,
      parentId: schema.folders.parentId,
      deletedAt: schema.folders.deletedAt,
    })
    .from(schema.folders)
    .where(eq(schema.folders.id, id))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (existing.deletedAt === null) {
    return NextResponse.json({ ok: true, affected: 0 });
  }

  if (existing.parentId !== null) {
    const [parent] = await db
      .select({ deletedAt: schema.folders.deletedAt })
      .from(schema.folders)
      .where(eq(schema.folders.id, existing.parentId))
      .limit(1);
    if (parent && parent.deletedAt !== null) {
      return NextResponse.json(
        { error: "restore the parent book first" },
        { status: 409 },
      );
    }
  }

  const [conflict] = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(
      and(
        eq(schema.folders.name, existing.name),
        existing.parentId === null
          ? isNull(schema.folders.parentId)
          : eq(schema.folders.parentId, existing.parentId),
        isNull(schema.folders.deletedAt),
        ne(schema.folders.id, id),
      ),
    )
    .limit(1);
  if (conflict) {
    return NextResponse.json(
      { error: "an active folder with this name exists — rename it first" },
      { status: 409 },
    );
  }

  const rows = await db
    .update(schema.folders)
    .set({ deletedAt: null })
    .where(
      and(
        isNotNull(schema.folders.deletedAt),
        or(eq(schema.folders.id, id), eq(schema.folders.parentId, id)),
      ),
    )
    .returning({ id: schema.folders.id });

  return NextResponse.json({ ok: true, affected: rows.length });
}
