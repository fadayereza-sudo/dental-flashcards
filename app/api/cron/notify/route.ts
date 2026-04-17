import { NextRequest, NextResponse } from "next/server";
import { eq, lte, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  // Vercel Cron adds this header. Local/manual calls can use ?secret=<CRON_SECRET>.
  if (req.headers.get("x-vercel-cron") !== null) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const given =
    new URL(req.url).searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return given === expected;
}

type MinuteOfDay = number;

function toMinuteOfDay(hm: string): MinuteOfDay | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function localMinuteOfDay(now: Date, timeZone: string): MinuteOfDay {
  // Use Intl to get HH:mm in the given timezone.
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const mm = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return h * 60 + mm;
}

const WINDOW_MINUTES = 20; // cron runs every 15 min; tolerate slight drift

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
    return NextResponse.json({ skipped: "muted", until: settings.mutedUntil });
  }

  const tz = settings.timezone || "Europe/London";
  const currentMinute = localMinuteOfDay(now, tz);

  const times = (settings.notifyTimes ?? [])
    .map(toMinuteOfDay)
    .filter((n): n is number => n !== null);

  const slot = times.find(
    (t) =>
      // within window past the notify time
      currentMinute >= t && currentMinute < t + WINDOW_MINUTES,
  );

  if (slot === undefined) {
    return NextResponse.json({ skipped: "outside window", currentMinute });
  }

  // Debounce: only notify once per slot per day.
  if (settings.lastNotifiedAt) {
    const last = settings.lastNotifiedAt;
    const sameDay =
      new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(last) ===
      new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
    const lastMinute = localMinuteOfDay(last, tz);
    if (sameDay && Math.abs(lastMinute - slot) < WINDOW_MINUTES) {
      return NextResponse.json({ skipped: "already notified this slot" });
    }
  }

  const due = await countDue();
  if (due === 0) {
    // Still mark lastNotifiedAt so we don't retry every 15 min.
    await db
      .update(schema.settings)
      .set({ lastNotifiedAt: now })
      .where(eq(schema.settings.id, 1));
    return NextResponse.json({ skipped: "nothing due" });
  }

  const miniAppUrl = process.env.MINI_APP_URL;
  const text = [
    `${due} flashcard${due === 1 ? "" : "s"} due.`,
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
