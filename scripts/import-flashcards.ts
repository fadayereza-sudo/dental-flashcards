import "dotenv/config";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../lib/db";
import { emptyState, fromFsrsCard } from "../lib/fsrs";

type ImportFile = {
  folder: string;
  subfolder: string;
  source?: string;
  cards: Array<{ question: string; answer: string; image?: string }>;
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

async function upsertFolder(
  name: string,
  parentId: number | null,
): Promise<number> {
  const existing = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(
      and(
        eq(schema.folders.name, name),
        parentId === null
          ? isNull(schema.folders.parentId)
          : eq(schema.folders.parentId, parentId),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0].id;
  const [row] = await db
    .insert(schema.folders)
    .values({ name, parentId })
    .returning({ id: schema.folders.id });
  return row.id;
}

async function run() {
  const files = walkJson(IMPORT_DIR);
  if (files.length === 0) {
    console.log("No JSON files in flashcards-import/. Nothing to do.");
    return;
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const payload = JSON.parse(raw) as ImportFile;

    if (!payload.folder || !payload.subfolder || !Array.isArray(payload.cards)) {
      console.warn(`Skipping ${file}: missing folder/subfolder/cards`);
      continue;
    }

    const rootId = await upsertFolder(payload.folder, null);
    const subId = await upsertFolder(payload.subfolder, rootId);

    for (const c of payload.cards) {
      const contentHash = hash(c.question, c.answer);
      const dup = await db
        .select({ id: schema.cards.id })
        .from(schema.cards)
        .where(
          and(
            eq(schema.cards.folderId, subId),
            eq(schema.cards.contentHash, contentHash),
          ),
        )
        .limit(1);
      if (dup[0]) {
        totalSkipped++;
        continue;
      }
      const [card] = await db
        .insert(schema.cards)
        .values({
          folderId: subId,
          question: c.question,
          answer: c.answer,
          source: payload.source ?? null,
          image: c.image ?? null,
          contentHash,
        })
        .returning({ id: schema.cards.id });
      const state = fromFsrsCard(card.id, emptyState());
      await db.insert(schema.cardState).values(state);
      totalInserted++;
    }
    console.log(`Imported ${file} → ${payload.folder} / ${payload.subfolder}`);
  }

  console.log(`\nDone. Inserted ${totalInserted}, skipped ${totalSkipped}.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
