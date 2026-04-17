import { NextRequest, NextResponse } from "next/server";
import { eq, lte, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import {
  sendMessage,
  editMessageText,
  answerCallbackQuery,
} from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  message_id: number;
  chat: { id: number };
  from?: { id: number };
  text?: string;
};

type TelegramCallbackQuery = {
  id: string;
  from: { id: number };
  message?: TelegramMessage;
  data?: string;
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

const FOREVER = new Date("9999-12-31T00:00:00Z");

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
      or(lte(schema.cardState.due, now), eq(schema.cardState.state, 0))!,
    );
  return rows.length;
}

function formatUntil(d: Date): string {
  // If effectively forever (>1000 days out), show "forever"
  const diffDays = (d.getTime() - Date.now()) / 86_400_000;
  if (diffDays > 1000) return "forever";
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

function statusText(
  settings: typeof schema.settings.$inferSelect,
  due: number,
): string {
  const muted = !!(settings.mutedUntil && settings.mutedUntil > new Date());
  const statusLine = muted
    ? `🔕 Muted until ${formatUntil(settings.mutedUntil!)}`
    : "🔔 Active";
  return [
    statusLine,
    "",
    `Times: ${settings.notifyTimes?.join(", ") || "(none)"} (${settings.timezone})`,
    `Due now: ${due}`,
  ].join("\n");
}

function mainKeyboard(
  settings: typeof schema.settings.$inferSelect,
): object {
  const muted = !!(settings.mutedUntil && settings.mutedUntil > new Date());
  return {
    inline_keyboard: [
      muted
        ? [{ text: "🔔 Unmute", callback_data: "unmute" }]
        : [{ text: "🔕 Mute", callback_data: "menu:mute" }],
      [{ text: "📊 Status", callback_data: "menu:main" }],
    ],
  };
}

function muteKeyboard(): object {
  return {
    inline_keyboard: [
      [
        { text: "1 hour", callback_data: "mute:1h" },
        { text: "1 day", callback_data: "mute:1d" },
        { text: "Forever", callback_data: "mute:forever" },
      ],
      [{ text: "← Back", callback_data: "menu:main" }],
    ],
  };
}

async function handleMessage(msg: TelegramMessage, allowedUser?: string) {
  if (allowedUser && msg.from && String(msg.from.id) !== allowedUser) {
    await sendMessage(msg.chat.id, "This bot is not for you.");
    return;
  }

  const chatId = String(msg.chat.id);
  const body = (msg.text ?? "").trim();
  const [cmdRaw] = body.split(/\s+/);
  const cmd = cmdRaw?.toLowerCase().split("@")[0];

  switch (cmd) {
    case "/start": {
      await db
        .update(schema.settings)
        .set({ telegramChatId: chatId })
        .where(eq(schema.settings.id, 1));
      const settings = await loadSettings();
      const due = await countDue();
      await sendMessage(
        chatId,
        `Linked. I'll ping you when cards are due.\n\n${statusText(settings, due)}`,
        { replyMarkup: mainKeyboard(settings) },
      );
      break;
    }

    case "/status":
    case "/settings": {
      const settings = await loadSettings();
      const due = await countDue();
      await sendMessage(chatId, statusText(settings, due), {
        replyMarkup: mainKeyboard(settings),
      });
      break;
    }

    default: {
      if (body) {
        const settings = await loadSettings();
        const due = await countDue();
        await sendMessage(chatId, statusText(settings, due), {
          replyMarkup: mainKeyboard(settings),
        });
      }
    }
  }
}

async function handleCallback(
  cq: TelegramCallbackQuery,
  allowedUser?: string,
) {
  if (allowedUser && String(cq.from.id) !== allowedUser) {
    await answerCallbackQuery(cq.id, "Not authorised");
    return;
  }
  if (!cq.message) {
    await answerCallbackQuery(cq.id);
    return;
  }
  const chatId = String(cq.message.chat.id);
  const messageId = cq.message.message_id;
  const data = cq.data ?? "";
  const [action, arg] = data.split(":");

  let toast: string | undefined;
  let nextKeyboard: "main" | "mute" = "main";

  switch (action) {
    case "menu": {
      if (arg === "mute") {
        nextKeyboard = "mute";
      } else {
        nextKeyboard = "main";
      }
      break;
    }

    case "mute": {
      let until: Date;
      if (arg === "1h") {
        until = new Date(Date.now() + 3600 * 1000);
        toast = "Muted 1 hour";
      } else if (arg === "1d") {
        until = new Date(Date.now() + 24 * 3600 * 1000);
        toast = "Muted 1 day";
      } else if (arg === "forever") {
        until = FOREVER;
        toast = "Muted forever";
      } else {
        toast = "Bad mute value";
        break;
      }
      await db
        .update(schema.settings)
        .set({ mutedUntil: until })
        .where(eq(schema.settings.id, 1));
      nextKeyboard = "main";
      break;
    }

    case "unmute": {
      await db
        .update(schema.settings)
        .set({ mutedUntil: null })
        .where(eq(schema.settings.id, 1));
      toast = "Unmuted";
      nextKeyboard = "main";
      break;
    }

    default:
      toast = "Unknown action";
  }

  await answerCallbackQuery(cq.id, toast);

  const settings = await loadSettings();
  const due = await countDue();
  const text =
    nextKeyboard === "mute"
      ? "How long should I stay quiet?"
      : statusText(settings, due);
  const replyMarkup =
    nextKeyboard === "mute" ? muteKeyboard() : mainKeyboard(settings);

  await editMessageText(chatId, messageId, text, { replyMarkup });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
  const querySecret = url.searchParams.get("secret");
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || (headerSecret !== expected && querySecret !== expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const allowedUser = process.env.TELEGRAM_USER_ID;
  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;

  if (update?.callback_query) {
    await handleCallback(update.callback_query, allowedUser);
  } else if (update?.message) {
    await handleMessage(update.message, allowedUser);
  }

  return NextResponse.json({ ok: true });
}
