import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: schema.folders.id,
      name: schema.folders.name,
      parentId: schema.folders.parentId,
      cardCount: sql<number>`COALESCE(COUNT(${schema.cards.id}), 0)::int`,
    })
    .from(schema.folders)
    .leftJoin(
      schema.cards,
      eq(schema.cards.folderId, schema.folders.id),
    )
    .groupBy(schema.folders.id)
    .orderBy(asc(schema.folders.parentId), asc(schema.folders.name));

  const chapterNumber = (name: string) => {
    const m = name.match(/^Ch\s+(\d+)\b/);
    return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
  };

  const roots = rows.filter((r) => r.parentId === null);
  const tree = roots.map((root) => ({
    id: root.id,
    name: root.name,
    children: rows
      .filter((r) => r.parentId === root.id)
      .sort((a, b) => {
        const diff = chapterNumber(a.name) - chapterNumber(b.name);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      })
      .map((c) => ({ id: c.id, name: c.name, cardCount: c.cardCount })),
  }));

  return NextResponse.json({ tree });
}

type CreateBody = {
  name?: string;
  parentId?: number | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as CreateBody | null;
  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  const parentId =
    body?.parentId === null || body?.parentId === undefined
      ? null
      : Number.isFinite(body.parentId)
        ? Number(body.parentId)
        : NaN;
  if (Number.isNaN(parentId)) {
    return NextResponse.json({ error: "bad parentId" }, { status: 400 });
  }

  if (parentId !== null) {
    const [parent] = await db
      .select({ id: schema.folders.id, parentId: schema.folders.parentId })
      .from(schema.folders)
      .where(eq(schema.folders.id, parentId))
      .limit(1);
    if (!parent) {
      return NextResponse.json({ error: "parent not found" }, { status: 404 });
    }
    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "folders are only two levels deep" },
        { status: 400 },
      );
    }
  }

  const dup = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(
      and(
        eq(schema.folders.name, name),
        parentId === null
          ? isNull(schema.folders.parentId)
          : eq(schema.folders.parentId, parentId),
      ),
    )
    .limit(1);
  if (dup.length > 0) {
    return NextResponse.json(
      { error: "folder with that name already exists here" },
      { status: 409 },
    );
  }

  const [row] = await db
    .insert(schema.folders)
    .values({ name, parentId })
    .returning();
  return NextResponse.json({ folder: row });
}
