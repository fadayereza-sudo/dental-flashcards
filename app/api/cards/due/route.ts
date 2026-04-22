import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, inArray, isNull, lte, not, or, sql, SQL } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isTag, UNTAGGED, type Tag } from "@/lib/tags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const folderParam = url.searchParams.get("folders");
  const folderIds = folderParam
    ? folderParam
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n))
    : null;
  const tagParam = url.searchParams.get("tags");
  const tagValues = tagParam
    ? tagParam.split(",").filter((s) => isTag(s) || s === UNTAGGED)
    : [];
  const tagSet = tagValues.filter(isTag) as Tag[];
  const includeUntagged = tagValues.includes(UNTAGGED);

  const limit = Math.min(
    parseInt(url.searchParams.get("limit") ?? "50", 10) || 50,
    5000,
  );

  const excludeParam = url.searchParams.get("exclude");
  const excludeIds = excludeParam
    ? excludeParam
        .split(",")
        .map((s) => parseInt(s, 10))
        .filter((n) => Number.isFinite(n))
    : [];

  const now = new Date();

  const dueOrNew = or(
    lte(schema.cardState.due, now),
    eq(schema.cardState.state, 0),
  )!;

  const activeFilter = and(
    isNull(schema.cards.deletedAt),
    isNull(schema.folders.deletedAt),
  )!;

  const tagFilter: SQL | null =
    tagSet.length > 0 && includeUntagged
      ? or(inArray(schema.cards.tag, tagSet), isNull(schema.cards.tag))!
      : tagSet.length > 0
        ? inArray(schema.cards.tag, tagSet)
        : includeUntagged
          ? isNull(schema.cards.tag)
          : null;

  // Shared filter (ignores the exclude list) — used for the total count
  // so the client sees the true size of the due set regardless of
  // pagination progress.
  const baseParts: SQL[] = [dueOrNew, activeFilter];
  if (folderIds && folderIds.length > 0) {
    baseParts.push(inArray(schema.cards.folderId, folderIds));
  }
  if (tagFilter) baseParts.push(tagFilter);
  const baseWhere: SQL = and(...baseParts)!;

  const pageParts: SQL[] = [...baseParts];
  if (excludeIds.length > 0) {
    pageParts.push(not(inArray(schema.cards.id, excludeIds)));
  }
  const pageWhere: SQL = and(...pageParts)!;

  const [rows, totalRow] = await Promise.all([
    db
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
      .innerJoin(
        schema.cardState,
        eq(schema.cardState.cardId, schema.cards.id),
      )
      .innerJoin(schema.folders, eq(schema.folders.id, schema.cards.folderId))
      .where(pageWhere)
      .orderBy(asc(schema.cardState.due))
      .limit(limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.cards)
      .innerJoin(
        schema.cardState,
        eq(schema.cardState.cardId, schema.cards.id),
      )
      .innerJoin(schema.folders, eq(schema.folders.id, schema.cards.folderId))
      .where(baseWhere),
  ]);

  const total = totalRow[0]?.count ?? rows.length;

  return NextResponse.json({
    cards: rows,
    total,
    now: now.toISOString(),
  });
}
