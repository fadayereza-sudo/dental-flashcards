import { NextRequest, NextResponse } from "next/server";
import { eq, lte, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron") !== null) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const given =
    new URL(req.url).searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return given === expected;
}

async function countDue(): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ id: schema.cardState.cardId })
    .from(schema.cardState)
    .where(
      or(lte(schema.cardState.due, now), eq(schema.cardState.state, 0))!,
    );
  return rows.length;
}

function localDay(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(d);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [settings] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);

  if (!settings || !settings.telegramChatId) {
    return NextResponse.json({ skipped: "no chat linked" });
  }

  const now = new Date();
  if (settings.mutedUntil && settings.mutedUntil > now) {
    return NextResponse.json({
      skipped: "muted",
      until: settings.mutedUntil,
    });
  }

  const tz = settings.timezone || "Europe/London";

  // Debounce: at most one notification per local day, even if the cron
  // misfires or is replayed.
  if (
    settings.lastNotifiedAt &&
    localDay(settings.lastNotifiedAt, tz) === localDay(now, tz)
  ) {
    return NextResponse.json({ skipped: "already notified today" });
  }

  const due = await countDue();
  if (due === 0) {
    await db
      .update(schema.settings)
      .set({ lastNotifiedAt: now })
      .where(eq(schema.settings.id, 1));
    return NextResponse.json({ skipped: "nothing due" });
  }

  const miniAppUrl = process.env.MINI_APP_URL;
  const text = [
    `${due} flashcard${due === 1 ? "" : "s"} due today.`,
    miniAppUrl ? `Open: ${miniAppUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendMessage(settings.telegramChatId, text);

  await db
    .update(schema.settings)
    .set({ lastNotifiedAt: now })
    .where(eq(schema.settings.id, 1));

  return NextResponse.json({
    sent: result.ok,
    due,
    description: result.description,
  });
}
