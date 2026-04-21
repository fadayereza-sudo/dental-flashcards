import "dotenv/config";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

const BATCH_SIZE = 100;
const OUT_DIR = "tmp-tag-batches";

async function main() {
  const rows = await db.execute(sql`
    WITH RECURSIVE tree AS (
      SELECT id, id AS root_id FROM folders WHERE parent_id IS NULL
      UNION ALL
      SELECT f.id, t.root_id FROM folders f JOIN tree t ON f.parent_id = t.id
    )
    SELECT c.id,
           c.question,
           c.answer,
           (SELECT name FROM folders WHERE id = t.root_id) AS book,
           (SELECT name FROM folders WHERE id = c.folder_id) AS folder
      FROM cards c
      JOIN tree t ON c.folder_id = t.id
     WHERE c.deleted_at IS NULL
       AND c.tag IS NULL
     ORDER BY c.id
  `);

  const cards = rows.rows as Array<{
    id: number;
    question: string;
    answer: string;
    book: string;
    folder: string;
  }>;

  console.log(`Found ${cards.length} untagged active cards`);

  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  let batchIdx = 0;
  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    batchIdx++;
    const batch = cards.slice(i, i + BATCH_SIZE);
    const path = join(OUT_DIR, `batch-${String(batchIdx).padStart(2, "0")}.json`);
    writeFileSync(path, JSON.stringify(batch, null, 2));
    console.log(`  ${path}  (${batch.length} cards)`);
  }
  console.log(`\nWrote ${batchIdx} batches to ${OUT_DIR}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
