import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../lib/db";

async function run() {
  const [rootName, subName] = process.argv.slice(2);
  if (!rootName || !subName) {
    console.error('Usage: tsx scripts/delete-folder-cards.ts "<folder>" "<subfolder>"');
    process.exit(1);
  }

  const root = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(and(eq(schema.folders.name, rootName)))
    .limit(1);
  if (!root[0]) {
    console.log(`No root folder "${rootName}"`);
    return;
  }

  const sub = await db
    .select({ id: schema.folders.id })
    .from(schema.folders)
    .where(
      and(
        eq(schema.folders.name, subName),
        eq(schema.folders.parentId, root[0].id),
      ),
    )
    .limit(1);
  if (!sub[0]) {
    console.log(`No subfolder "${subName}" under "${rootName}"`);
    return;
  }

  const deleted = await db
    .delete(schema.cards)
    .where(eq(schema.cards.folderId, sub[0].id))
    .returning({ id: schema.cards.id });
  console.log(`Deleted ${deleted.length} cards from ${rootName} / ${subName}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
