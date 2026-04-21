import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const totals = await db.execute(sql`
    SELECT COUNT(*) AS total,
           COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active,
           COUNT(*) FILTER (WHERE deleted_at IS NULL AND tag IS NULL) AS untagged
      FROM cards
  `);
  console.log("Totals:", totals.rows[0]);

  const per = await db.execute(sql`
    WITH RECURSIVE tree AS (
      SELECT id, id AS root_id FROM folders WHERE parent_id IS NULL
      UNION ALL
      SELECT f.id, t.root_id FROM folders f JOIN tree t ON f.parent_id = t.id
    )
    SELECT (SELECT name FROM folders WHERE id = t.root_id) AS book,
           COUNT(*) AS n
      FROM cards c
      JOIN tree t ON c.folder_id = t.id
     WHERE c.deleted_at IS NULL
     GROUP BY t.root_id
     ORDER BY n DESC
  `);
  console.log("\nBy book:");
  for (const row of per.rows) console.log(`  ${(row as any).n}\t${(row as any).book}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
