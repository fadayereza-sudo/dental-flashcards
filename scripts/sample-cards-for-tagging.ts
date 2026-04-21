import "dotenv/config";
import { writeFileSync } from "node:fs";
import { sql } from "drizzle-orm";
import { db, schema } from "../lib/db";

async function main() {
  const rootFolders = await db
    .select({ id: schema.folders.id, name: schema.folders.name })
    .from(schema.folders)
    .where(sql`${schema.folders.parentId} IS NULL`);

  console.log(`Root folders (books): ${rootFolders.length}`);
  for (const f of rootFolders) console.log(`  [${f.id}] ${f.name}`);

  const samples: Array<{
    id: number;
    book: string;
    folderPath: string;
    question: string;
    answer: string;
  }> = [];

  for (const book of rootFolders) {
    const rows = await db.execute(sql`
      WITH RECURSIVE tree AS (
        SELECT id, name, parent_id, name::text AS path
          FROM folders WHERE id = ${book.id}
        UNION ALL
        SELECT f.id, f.name, f.parent_id, t.path || ' / ' || f.name
          FROM folders f JOIN tree t ON f.parent_id = t.id
          WHERE f.deleted_at IS NULL
      )
      SELECT c.id, c.question, c.answer, t.path AS folder_path
        FROM cards c
        JOIN tree t ON c.folder_id = t.id
       WHERE c.deleted_at IS NULL
         AND c.id NOT IN (1870, 2111, 2259, 2350, 2643, 2402, 3429, 2744, 1433, 1510)
       ORDER BY random()
       LIMIT 2
    `);
    for (const r of rows.rows as any[]) {
      samples.push({
        id: r.id,
        book: book.name,
        folderPath: r.folder_path,
        question: r.question,
        answer: r.answer,
      });
    }
  }

  writeFileSync("tmp-pilot-cards.json", JSON.stringify(samples, null, 2));
  console.log(`\nWrote ${samples.length} cards to tmp-pilot-cards.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
