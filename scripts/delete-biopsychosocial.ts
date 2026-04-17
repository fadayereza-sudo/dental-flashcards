import "dotenv/config";
import { eq, inArray, or, ilike } from "drizzle-orm";
import { db, schema } from "../lib/db";

async function run() {
  const folders = await db
    .select({ id: schema.folders.id, name: schema.folders.name, parentId: schema.folders.parentId })
    .from(schema.folders)
    .where(or(ilike(schema.folders.name, "%biopsychosocial%"), ilike(schema.folders.name, "%BPS%")));

  if (folders.length === 0) {
    console.log("No biopsychosocial folders found. Nothing to delete.");
    return;
  }

  console.log("Folders matched:");
  for (const f of folders) console.log(`  - ${f.id}: ${f.name}`);

  const folderIds = folders.map((f) => f.id);

  const children = await db
    .select({ id: schema.folders.id, name: schema.folders.name })
    .from(schema.folders)
    .where(inArray(schema.folders.parentId, folderIds));
  console.log(`Child folders: ${children.length}`);
  for (const c of children) console.log(`  - ${c.id}: ${c.name}`);

  const allFolderIds = [...folderIds, ...children.map((c) => c.id)];

  const cards = await db
    .select({ id: schema.cards.id })
    .from(schema.cards)
    .where(inArray(schema.cards.folderId, allFolderIds));
  console.log(`Cards to delete: ${cards.length}`);

  if (cards.length === 0) {
    console.log("(Still deleting empty folders.)");
  } else {
    const cardIds = cards.map((c) => c.id);
    await db.delete(schema.reviews).where(inArray(schema.reviews.cardId, cardIds));
    await db.delete(schema.cardState).where(inArray(schema.cardState.cardId, cardIds));
    const deleted = await db
      .delete(schema.cards)
      .where(inArray(schema.cards.folderId, allFolderIds))
      .returning({ id: schema.cards.id });
    console.log(`Deleted ${deleted.length} cards.`);
  }

  const deletedChildren = await db
    .delete(schema.folders)
    .where(inArray(schema.folders.parentId, folderIds))
    .returning({ id: schema.folders.id });
  console.log(`Deleted ${deletedChildren.length} child folders.`);

  const deletedTop = await db
    .delete(schema.folders)
    .where(inArray(schema.folders.id, folderIds))
    .returning({ id: schema.folders.id });
  console.log(`Deleted ${deletedTop.length} top-level folders.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
