import "dotenv/config";
import { createHash } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "../lib/db";

function hash(q: string, a: string) {
  return createHash("sha256")
    .update(`${q.trim()}\u0000${a.trim()}`)
    .digest("hex")
    .slice(0, 32);
}

const pairs: Array<[string, string]> = [
  [
    "Why is articaine 4% never used for an inferior dental block?",
    "Because at 4% it is twice the concentration of lignocaine, and the IDB needle passes close to the lingual and inferior alveolar nerves. The higher concentration carries a much greater risk of persistent paraesthesia if the needle traumatises the nerve. Reserve articaine for infiltration.",
  ],
  [
    "Why doesn't the '1/10 cartridge per kg' rule of thumb safely apply to articaine?",
    "Because articaine is 4% (40 mg/ml) with a max of 7 mg/kg, giving only 0.175 ml/kg — closer to 1/12 of a cartridge per kg. Treating articaine like lignocaine by volume would push the child past the toxic dose.",
  ],
];

async function run() {
  const hashes = pairs.map(([q, a]) => hash(q, a));
  console.log("Deleting content hashes:", hashes);

  const found = await db
    .select({ id: schema.cards.id, question: schema.cards.question })
    .from(schema.cards)
    .where(inArray(schema.cards.contentHash, hashes));
  console.log(`Matched ${found.length} cards:`, found.map((c) => c.question.slice(0, 60)));

  if (found.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  const cardIds = found.map((c) => c.id);

  await db.delete(schema.reviews).where(inArray(schema.reviews.cardId, cardIds));
  await db.delete(schema.cardState).where(inArray(schema.cardState.cardId, cardIds));
  const deleted = await db
    .delete(schema.cards)
    .where(inArray(schema.cards.contentHash, hashes))
    .returning({ id: schema.cards.id });

  console.log(`Deleted ${deleted.length} cards.`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
