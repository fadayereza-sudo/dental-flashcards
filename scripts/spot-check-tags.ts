import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const tags = ["diagnosis", "treatment-planning", "safety-and-compliance", "patient-best-interests", null];
  for (const t of tags) {
    const rows = await db.execute(
      t === null
        ? sql`SELECT id, question, answer FROM cards WHERE deleted_at IS NULL AND tag IS NULL ORDER BY random() LIMIT 2`
        : sql`SELECT id, question, answer FROM cards WHERE deleted_at IS NULL AND tag = ${t} ORDER BY random() LIMIT 2`,
    );
    console.log(`\n=== ${t ?? "(null)"} ===`);
    for (const r of rows.rows as any[]) {
      console.log(`  [${r.id}] Q: ${r.question}`);
      console.log(`         A: ${String(r.answer).slice(0, 200)}${r.answer.length > 200 ? "…" : ""}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
