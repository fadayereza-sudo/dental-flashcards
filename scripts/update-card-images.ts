import "dotenv/config";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "../lib/db";

type ImportFile = {
  cards: Array<{
    question: string;
    answer: string;
    image?: string;
  }>;
};

const IMPORT_DIR = resolve(process.cwd(), "flashcards-import");

function walkJson(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walkJson(full));
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

function hash(q: string, a: string) {
  return createHash("sha256")
    .update(`${q.trim()}\u0000${a.trim()}`)
    .digest("hex")
    .slice(0, 32);
}

async function run() {
  const files = walkJson(IMPORT_DIR);
  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const file of files) {
    const payload = JSON.parse(readFileSync(file, "utf8")) as ImportFile;
    for (const c of payload.cards) {
      if (!c.image) continue;
      const contentHash = hash(c.question, c.answer);
      const result = await db
        .update(schema.cards)
        .set({ image: c.image })
        .where(eq(schema.cards.contentHash, contentHash))
        .returning({ id: schema.cards.id, image: schema.cards.image });
      if (result.length === 0) {
        console.warn(`MISS: no card matched hash for "${c.question.slice(0, 60)}…"`);
        missing++;
      } else {
        updated++;
      }
    }
  }
  console.log(`Updated ${updated}, missing ${missing}, total cards-with-image processed: ${updated + missing}.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
