import "dotenv/config";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../lib/db";

type EpisodeMeta = {
  videoId: string;
  title: string;
  published: string;
  folderPath: [string, string]; // [parent, child] names in the folders table
  folderRename?: { from: string; to: string };
};

// Add an entry here per episode. Run after each new import to apply the
// clickable-title + date convention to every card in that episode.
const EPISODES: EpisodeMeta[] = [
  {
    videoId: "SmLM5cr4mzo",
    title: "Dental Indemnity vs Insurance 2023 — Which one is Best for you?",
    published: "22 Aug 2023",
    folderPath: ["Protrusive Dental Podcast", "Dental Indemnity vs Insurance"],
    folderRename: {
      from: "GF019 — Dental Indemnity vs Insurance",
      to: "Dental Indemnity vs Insurance",
    },
  },
];

function tsToSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

function rawQuote(body: string): string {
  // If already enriched by a prior run, drop the header back to the raw transcript quote.
  const idx = body.search(/\n\n\[\d{1,2}:\d{2}(?::\d{2})?\]/);
  if (idx >= 0) return body.slice(idx + 2);
  return body;
}

function enrich(body: string, ep: EpisodeMeta): string {
  const raw = rawQuote(body);
  const m = raw.match(/^\[(\d{1,2}:\d{2}(?::\d{2})?)\]/);
  const seconds = m ? tsToSeconds(m[1]) : 0;
  const url = `https://www.youtube.com/watch?v=${ep.videoId}&t=${seconds}s`;
  return `[${ep.title}](${url})\nPublished ${ep.published}\n\n${raw}`;
}

function cleanSource(s: string | null): string | null {
  return s?.replace(/, Ep [A-Z]+\d+\b/, "") ?? null;
}

function cleanSection(s: string | null): string | null {
  return s?.replace(/^[A-Z]+\d+\s+[—-]\s+/, "") ?? null;
}

async function run() {
  for (const ep of EPISODES) {
    console.log(`\n=== ${ep.title} (${ep.videoId}) ===`);

    if (ep.folderRename) {
      const hits = await db
        .update(schema.folders)
        .set({ name: ep.folderRename.to })
        .where(eq(schema.folders.name, ep.folderRename.from))
        .returning({ id: schema.folders.id });
      if (hits.length) {
        console.log(`Renamed folder "${ep.folderRename.from}" → "${ep.folderRename.to}"`);
      }
    }

    const [parent] = await db
      .select({ id: schema.folders.id })
      .from(schema.folders)
      .where(and(eq(schema.folders.name, ep.folderPath[0]), isNull(schema.folders.parentId)))
      .limit(1);
    if (!parent) {
      console.warn(`Parent folder "${ep.folderPath[0]}" not found — skipping.`);
      continue;
    }
    const [child] = await db
      .select({ id: schema.folders.id })
      .from(schema.folders)
      .where(and(eq(schema.folders.name, ep.folderPath[1]), eq(schema.folders.parentId, parent.id)))
      .limit(1);
    if (!child) {
      console.warn(`Child folder "${ep.folderPath[1]}" not found — skipping.`);
      continue;
    }

    const cards = await db
      .select({
        id: schema.cards.id,
        reference: schema.cards.reference,
        source: schema.cards.source,
        referenceSection: schema.cards.referenceSection,
      })
      .from(schema.cards)
      .where(eq(schema.cards.folderId, child.id));

    let updated = 0;
    for (const c of cards) {
      if (!c.reference) continue;
      await db
        .update(schema.cards)
        .set({
          reference: enrich(c.reference, ep),
          source: cleanSource(c.source),
          referenceSection: cleanSection(c.referenceSection),
        })
        .where(eq(schema.cards.id, c.id));
      updated++;
    }
    console.log(`Updated ${updated} cards.`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
