import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, ne, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

type PatchBody = { name?: string };

async function parseId(params: Promise<{ id: string }>) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  return Number.isFinite(id) ? id : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: schema.folders.id, parentId: schema.folders.parentId })
    .from(schema.folders)
    .where(and(eq(schema.folders.id, id), isNull(schema.folders.deletedAt)))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const [dup] = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(
      and(
        eq(schema.folders.name, name),
        existing.parentId === null
          ? isNull(schema.folders.parentId)
          : eq(schema.folders.parentId, existing.parentId),
        isNull(schema.folders.deletedAt),
        ne(schema.folders.id, id),
      ),
    )
    .limit(1);
  if (dup) {
    return NextResponse.json(
      { error: "folder with that name already exists here" },
      { status: 409 },
    );
  }

  const [updated] = await db
    .update(schema.folders)
    .set({ name })
    .where(eq(schema.folders.id, id))
    .returning();
  return NextResponse.json({ folder: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(and(eq(schema.folders.id, id), isNull(schema.folders.deletedAt)))
    .limit(1);
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const rows = await db
    .update(schema.folders)
    .set({ deletedAt: new Date() })
    .where(
      and(
        isNull(schema.folders.deletedAt),
        or(eq(schema.folders.id, id), eq(schema.folders.parentId, id)),
      ),
    )
    .returning({ id: schema.folders.id });

  return NextResponse.json({ ok: true, affected: rows.length });
}
