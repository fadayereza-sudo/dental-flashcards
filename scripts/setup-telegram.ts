import "dotenv/config";
import { setWebhook } from "../lib/telegram";

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "set-webhook") {
    const publicUrl = args[0] ?? process.env.MINI_APP_URL;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!publicUrl) {
      console.error("Usage: tsx scripts/setup-telegram.ts set-webhook <https://your-domain>");
      process.exit(1);
    }
    if (!secret) {
      console.error("TELEGRAM_WEBHOOK_SECRET not set");
      process.exit(1);
    }
    const url = `${publicUrl.replace(/\/$/, "")}/api/telegram/webhook`;
    const result = await setWebhook(url, secret);
    console.log(JSON.stringify(result, null, 2));
    console.log(`\nWebhook registered: ${url}`);
    return;
  }
  console.log("Commands:");
  console.log("  set-webhook [publicUrl]   Register the webhook with Telegram");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
