import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const B = "http://localhost:3000";

async function probe(cardId: number) {
  const [state] = await sql`
    SELECT reps, state, stability, difficulty, lapses FROM card_state WHERE card_id = ${cardId}
  `;
  const [r] = await sql`
    SELECT COUNT(*)::int AS n FROM reviews WHERE card_id = ${cardId}
  `;
  const [c] = await sql`
    SELECT deleted_at FROM cards WHERE id = ${cardId}
  `;
  return {
    deletedAt: c?.deleted_at ?? null,
    state,
    reviewCount: r.n,
  };
}

async function main() {
  const topReviewed = await sql`
    SELECT card_id, COUNT(*)::int AS n FROM reviews
    GROUP BY card_id ORDER BY n DESC LIMIT 1
  `;
  if (topReviewed.length === 0) {
    console.log("no reviewed cards — skipping");
    return;
  }
  const cardId = topReviewed[0].card_id as number;
  console.log(`target card_id=${cardId} (reviews=${topReviewed[0].n})\n`);

  console.log("=== BEFORE ===");
  const before = await probe(cardId);
  console.log(JSON.stringify(before, null, 2));

  console.log("\n=== Soft-delete card ===");
  const delRes = await fetch(`${B}/api/cards/${cardId}`, { method: "DELETE" });
  console.log(await delRes.text());

  console.log("\n=== AFTER soft-delete (state + reviews must match BEFORE) ===");
  const afterDelete = await probe(cardId);
  console.log(JSON.stringify(afterDelete, null, 2));

  const statePreserved =
    JSON.stringify(before.state) === JSON.stringify(afterDelete.state);
  const reviewsPreserved = before.reviewCount === afterDelete.reviewCount;
  console.log(`state preserved: ${statePreserved}`);
  console.log(`reviews preserved: ${reviewsPreserved}`);
  if (!statePreserved || !reviewsPreserved) {
    throw new Error("HISTORY-PRESERVATION INVARIANT VIOLATED");
  }

  console.log("\n=== In /api/cards/deleted? ===");
  const trashRes = await fetch(`${B}/api/cards/deleted`);
  const trash = (await trashRes.json()) as {
    cards: Array<{ id: number; bookName: string; chapterName: string }>;
  };
  const hit = trash.cards.find((c) => c.id === cardId);
  console.log(
    hit
      ? `yes — path: ${hit.bookName} / ${hit.chapterName}`
      : "NO — bug",
  );

  console.log("\n=== Gone from /api/cards/due? ===");
  const dueRes = await fetch(`${B}/api/cards/due?limit=500`);
  const due = (await dueRes.json()) as { cards: Array<{ id: number }> };
  console.log(`present: ${due.cards.some((c) => c.id === cardId)}`);

  console.log("\n=== Restore card ===");
  const restoreRes = await fetch(`${B}/api/cards/${cardId}/restore`, {
    method: "POST",
  });
  console.log(await restoreRes.text());

  console.log("\n=== AFTER restore (state + reviews still match BEFORE) ===");
  const afterRestore = await probe(cardId);
  console.log(JSON.stringify(afterRestore, null, 2));

  const stateStillPreserved =
    JSON.stringify(before.state) === JSON.stringify(afterRestore.state);
  const reviewsStillPreserved = before.reviewCount === afterRestore.reviewCount;
  console.log(`state preserved across round-trip: ${stateStillPreserved}`);
  console.log(
    `reviews preserved across round-trip: ${reviewsStillPreserved}`,
  );
  if (!stateStillPreserved || !reviewsStillPreserved) {
    throw new Error("HISTORY-PRESERVATION INVARIANT VIOLATED ON RESTORE");
  }

  console.log("\n=== PASSED ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
