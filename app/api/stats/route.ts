import { NextResponse } from "next/server";
import { gte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      newCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.state} = 0)::int`,
      learningCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.state} = 1)::int`,
      reviewCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.state} = 2)::int`,
      relearningCount: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.state} = 3)::int`,
    })
    .from(schema.cardState);

  const [dueBuckets] = await db
    .select({
      dueNow: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.due} <= NOW())::int`,
      dueIn24h: sql<number>`COUNT(*) FILTER (WHERE ${schema.cardState.due} BETWEEN NOW() AND ${in24h.toISOString()})::int`,
    })
    .from(schema.cardState);

  const reviewsByDayRaw = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${schema.reviews.reviewedAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
      count: sql<number>`COUNT(*)::int`,
      again: sql<number>`COUNT(*) FILTER (WHERE ${schema.reviews.rating} = 1)::int`,
      hard: sql<number>`COUNT(*) FILTER (WHERE ${schema.reviews.rating} = 2)::int`,
      good: sql<number>`COUNT(*) FILTER (WHERE ${schema.reviews.rating} = 3)::int`,
      easy: sql<number>`COUNT(*) FILTER (WHERE ${schema.reviews.rating} = 4)::int`,
    })
    .from(schema.reviews)
    .where(gte(schema.reviews.reviewedAt, thirtyDaysAgo))
    .groupBy(sql`date_trunc('day', ${schema.reviews.reviewedAt} AT TIME ZONE 'UTC')`)
    .orderBy(sql`date_trunc('day', ${schema.reviews.reviewedAt} AT TIME ZONE 'UTC') ASC`);

  const [overall] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      successful: sql<number>`COUNT(*) FILTER (WHERE ${schema.reviews.rating} >= 3)::int`,
    })
    .from(schema.reviews);

  // Fill day gaps for the last 30 days
  const byDay = new Map(reviewsByDayRaw.map((r) => [r.day, r]));
  const reviewsByDay: Array<{
    day: string;
    count: number;
    again: number;
    hard: number;
    good: number;
    easy: number;
  }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    reviewsByDay.push({
      day: key,
      count: row?.count ?? 0,
      again: row?.again ?? 0,
      hard: row?.hard ?? 0,
      good: row?.good ?? 0,
      easy: row?.easy ?? 0,
    });
  }

  return NextResponse.json({
    now: now.toISOString(),
    cards: {
      total: totals?.total ?? 0,
      byState: {
        new: totals?.newCount ?? 0,
        learning: totals?.learningCount ?? 0,
        review: totals?.reviewCount ?? 0,
        relearning: totals?.relearningCount ?? 0,
      },
      dueNow: dueBuckets?.dueNow ?? 0,
      dueIn24h: dueBuckets?.dueIn24h ?? 0,
    },
    reviews: {
      total: overall?.total ?? 0,
      accuracy:
        overall && overall.total > 0
          ? overall.successful / overall.total
          : null,
      byDay: reviewsByDay,
    },
  });
}
