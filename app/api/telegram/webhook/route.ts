import { NextRequest, NextResponse } from "next/server";
import { eq, lte, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    from?: { id: number };
    text?: string;
  };
};

async function ensureSettings() {
  const rows = await db.select().from(schema.settings).limit(1);
  if (rows.length === 0) {
    await db.insert(schema.settings).values({ id: 1 });
  }
}

async function loadSettings() {
  await ensureSettings();
  const [row] = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);
  return row!;
}

async function countDue(): Promise<number> {
  const now = new Date();
  const rows = await db
    .select({ id: schema.cardState.cardId })
    .from(schema.cardState)
    .where(
      or(
        lte(schema.cardState.due, now),
        eq(schema.cardState.state, 0),
      )!,
    );
  return rows.length;
}

function parseHours(arg: string | undefined): number | null {
  if (!arg) return null;
  const m = arg.trim().match(/^(\d+)\s*h?$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 && n <= 24 * 14 ? n : null;
}

export async function POST(req: NextRequest) {
  // Verify secret via either ?secret= or the Telegram header
  const url = new URL(req.url);
  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
  const querySecret = url.searchParams.get("secret");
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || (headerSecret !== expected && querySecret !== expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const allowedUser = process.env.TELEGRAM_USER_ID;
  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  if (!update?.message) {
    return NextResponse.json({ ok: true });
  }

  const { chat, from, text } = update.message;
  if (allowedUser && from && String(from.id) !== allowedUser) {
    await sendMessage(chat.id, "This bot is not for you.");
    return NextResponse.json({ ok: true });
  }

  const chatId = String(chat.id);
  const body = (text ?? "").trim();
  const [cmdRaw, ...rest] = body.split(/\s+/);
  const cmd = cmdRaw?.toLowerCase().split("@")[0];

  const settings = await loadSettings();

  const miniAppUrl = process.env.MINI_APP_URL;

  const reply = async (t: string) => {
    await sendMessage(chatId, t);
  };

  switch (cmd) {
    case "/start": {
      await db
        .update(schema.settings)
        .set({ telegramChatId: chatId })
        .where(eq(schema.settings.id, 1));
      const parts = [
        "Linked. I'll send a reminder at your configured times when cards are due.",
        `Current times: ${(settings.notifyTimes ?? ["08:00", "20:00"]).join(", ")} (${settings.timezone}).`,
        "",
        "Commands:",
        "/due — how many cards are waiting",
        "/mute 2 — quiet for 2 hours",
        "/unmute — resume",
        "/settings — show config",
      ];
      await reply(parts.join("\n"));
      break;
    }

    case "/due": {
      const n = await countDue();
      const suffix = miniAppUrl ? `\nOpen: ${miniAppUrl}` : "";
      await reply(
        n === 0
          ? "Nothing due. Come back later."
          : `${n} card${n === 1 ? "" : "s"} due.${suffix}`,
      );
      break;
    }

    case "/mute": {
      const hours = parseHours(rest[0]);
      if (!hours) {
        await reply("Usage: /mute <hours>   (1–336)");
        break;
      }
      const until = new Date(Date.now() + hours * 3600 * 1000);
      await db
        .update(schema.settings)
        .set({ mutedUntil: until })
        .where(eq(schema.settings.id, 1));
      await reply(`Muted until ${until.toISOString().replace("T", " ").slice(0, 16)} UTC.`);
      break;
    }

    case "/unmute": {
      await db
        .update(schema.settings)
        .set({ mutedUntil: null })
        .where(eq(schema.settings.id, 1));
      await reply("Unmuted. Reminders resumed.");
      break;
    }

    case "/settings": {
      const lines = [
        `Chat id: ${settings.telegramChatId ?? "(not linked)"}`,
        `Times:   ${(settings.notifyTimes ?? []).join(", ") || "(none)"}`,
        `Timezone: ${settings.timezone}`,
        `Muted until: ${settings.mutedUntil?.toISOString() ?? "—"}`,
        `Last notified: ${settings.lastNotifiedAt?.toISOString() ?? "—"}`,
      ];
      await reply(lines.join("\n"));
      break;
    }

    default: {
      if (body) {
        await reply(
          "Commands: /due, /mute <hours>, /unmute, /settings, /start",
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
