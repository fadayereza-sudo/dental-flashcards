import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
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

  const roots = rows.filter((r) => r.parentId === null);
  const tree = roots.map((root) => ({
    id: root.id,
    name: root.name,
    children: rows
      .filter((r) => r.parentId === root.id)
      .map((c) => ({ id: c.id, name: c.name, cardCount: c.cardCount })),
  }));

  return NextResponse.json({ tree });
}
