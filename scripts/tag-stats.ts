import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const totals = await db.execute(sql`
    SELECT tag, COUNT(*) AS n
      FROM cards
     WHERE deleted_at IS NULL
     GROUP BY tag
     ORDER BY n DESC
  `);
  console.log("Tag distribution (all active cards):");
  let total = 0;
  for (const row of totals.rows as any[]) {
    const label = row.tag ?? "(null/untagged)";
    console.log(`  ${String(row.n).padStart(5)}  ${label}`);
    total += Number(row.n);
  }
  console.log(`  ${String(total).padStart(5)}  total\n`);

  const perBook = await db.execute(sql`
    WITH RECURSIVE tree AS (
      SELECT id, id AS root_id FROM folders WHERE parent_id IS NULL
      UNION ALL
      SELECT f.id, t.root_id FROM folders f JOIN tree t ON f.parent_id = t.id
    )
    SELECT (SELECT name FROM folders WHERE id = t.root_id) AS book,
           c.tag,
           COUNT(*) AS n
      FROM cards c
      JOIN tree t ON c.folder_id = t.id
     WHERE c.deleted_at IS NULL
     GROUP BY t.root_id, c.tag
     ORDER BY book, c.tag NULLS LAST
  `);
  console.log("By book x tag:");
  let currentBook = "";
  for (const row of perBook.rows as any[]) {
    if (row.book !== currentBook) {
      console.log(`\n  ${row.book}`);
      currentBook = row.book;
    }
    const label = row.tag ?? "(null)";
    console.log(`    ${String(row.n).padStart(5)}  ${label}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
