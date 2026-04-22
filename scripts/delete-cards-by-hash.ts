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
    "In the McGuire and Nunn cohort, how accurate was the clinician's prognosis call at predicting tooth survival, and where did it fall down?",
    "Overall, clinicians predicted 5- and 8-year tooth survival correctly about 81% of the time. But when 'good' prognosis teeth were excluded, accuracy dropped to around 50% (chance). In other words, we reliably spot a good tooth, but calls of 'fair', 'poor', or 'questionable' are close to coin flips. That argues for conservative management and reassessment rather than pre-emptive extraction.",
  ],
  [
    "Quantitatively, how much does smoking worsen the response to periodontal treatment, and is the effect reversible?",
    "Smokers get roughly 50 to 75% less clinical improvement (probing depth reduction, attachment gain) than non-smokers from both non-surgical and surgical perio therapy, dose-dependent with pack-years. The deficit is partly reversible after cessation, which is why every perio plan needs a documented smoking cessation conversation. Smoking is the single biggest modifiable risk factor the GDP controls in perio.",
  ],
  [
    "In periodontally compromised patients, how does 20-year implant outcome compare with retaining compromised but treated teeth?",
    "In Roccuzzo's 20-year Italian cohort, patients with a history of severe periodontitis lost on average 1.9 teeth over 20 years while their implants survived around 93%. But 47% of severe-PCP implants needed antibiotic or surgical retreatment for peri-implantitis, and non-compliance with supportive care raised the odds of implant loss roughly 14-fold. Strategic extraction for pre-emptive implants in a perio patient isn't supported: treated teeth last well over a decade, and implants in the same patient fail more often when the patient drops out of recall.",
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
