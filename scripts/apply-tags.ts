import "dotenv/config";
import { readFileSync } from "node:fs";
import { inArray, sql } from "drizzle-orm";
import { db, schema } from "../lib/db";

const ALLOWED = new Set([
  "diagnosis",
  "treatment-planning",
  "safety-and-compliance",
  "patient-best-interests",
]);

type Result = { id: number; tag: string | null; reasoning?: string };

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: tsx scripts/apply-tags.ts <results.json>");
    process.exit(1);
  }

  const raw = readFileSync(path, "utf-8");
  const results: Result[] = JSON.parse(raw);

  for (const r of results) {
    if (r.tag === "null" || r.tag === "") r.tag = null;
  }

  const invalid = results.filter(
    (r) => r.tag !== null && !ALLOWED.has(r.tag as string),
  );
  if (invalid.length) {
    console.error(`Invalid tags in ${path}:`);
    for (const r of invalid) console.error(`  id=${r.id} tag=${r.tag}`);
    process.exit(1);
  }

  const ids = results.map((r) => r.id);
  const existing = await db
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .where(inArray(schema.cards.id, ids));
  const existingSet = new Set(existing.map((r) => r.id));
  const missing = ids.filter((id) => !existingSet.has(id));
  if (missing.length) {
    console.error(`Cards not found in DB: ${missing.join(", ")}`);
    process.exit(1);
  }

  const values = sql.join(
    results.map((r) =>
      sql`(${r.id}::int, ${r.tag === null ? sql`NULL::text` : sql`${r.tag}::text`})`,
    ),
    sql`, `,
  );

  await db.execute(sql`
    UPDATE cards
       SET tag = v.tag
      FROM (VALUES ${values}) AS v(id, tag)
     WHERE cards.id = v.id
  `);

  const updated = results.filter((r) => r.tag !== null).length;
  const untagged = results.length - updated;
  console.log(`${path}: ${updated} tagged, ${untagged} left null (${results.length} total)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
