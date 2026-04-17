import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db, schema } from "../lib/db";

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = join("backups", stamp);
  mkdirSync(outDir, { recursive: true });

  const tables: Array<[string, any]> = [
    ["folders", schema.folders],
    ["cards", schema.cards],
    ["card_state", schema.cardState],
    ["reviews", schema.reviews],
    ["settings", schema.settings],
  ];

  const summary: Record<string, number> = {};
  for (const [name, table] of tables) {
    const rows = await db.select().from(table);
    writeFileSync(
      join(outDir, `${name}.json`),
      JSON.stringify(rows, null, 2),
    );
    summary[name] = rows.length;
    console.log(`  ${name.padEnd(12)} ${rows.length} rows`);
  }

  writeFileSync(
    join(outDir, "meta.json"),
    JSON.stringify(
      { createdAt: new Date().toISOString(), counts: summary },
      null,
      2,
    ),
  );

  console.log(`\nBackup written to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
