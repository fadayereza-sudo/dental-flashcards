const API = "https://api.telegram.org";

export type TelegramSendResult = { ok: boolean; description?: string };

function getToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  return token;
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  opts: {
    parseMode?: "MarkdownV2" | "HTML";
    disableNotification?: boolean;
    replyMarkup?: object;
  } = {},
): Promise<TelegramSendResult> {
  const token = getToken();
  const res = await fetch(`${API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: opts.parseMode,
      disable_notification: opts.disableNotification,
      reply_markup: opts.replyMarkup,
    }),
  });
  return (await res.json()) as TelegramSendResult;
}

export async function editMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  opts: {
    parseMode?: "MarkdownV2" | "HTML";
    replyMarkup?: object;
  } = {},
): Promise<TelegramSendResult> {
  const token = getToken();
  const res = await fetch(`${API}/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: opts.parseMode,
      reply_markup: opts.replyMarkup,
    }),
  });
  return (await res.json()) as TelegramSendResult;
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<TelegramSendResult> {
  const token = getToken();
  const res = await fetch(`${API}/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
  return (await res.json()) as TelegramSendResult;
}

export async function setWebhook(
  url: string,
  secretToken?: string,
): Promise<TelegramSendResult> {
  const token = getToken();
  const res = await fetch(`${API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      secret_token: secretToken,
      allowed_updates: ["message"],
    }),
  });
  return (await res.json()) as TelegramSendResult;
}

export function escapeMd(s: string): string {
  // MarkdownV2 requires escaping these.
  return s.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, (c) => `\\${c}`);
}
