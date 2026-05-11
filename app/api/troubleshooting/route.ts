import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

type Prevalence =
  | "very-common"
  | "common"
  | "uncommon"
  | "very-uncommon"
  | "rare";

const PREVALENCE_KEYS: Prevalence[] = [
  "very-common",
  "common",
  "uncommon",
  "very-uncommon",
  "rare",
];

type IndexEntry = {
  slug: string;
  title: string;
  order: number;
  description?: string;
};

function zeroCounts(): Record<Prevalence, number> {
  return {
    "very-common": 0,
    common: 0,
    uncommon: 0,
    "very-uncommon": 0,
    rare: 0,
  };
}

function countsForOrigin(slug: string): Record<Prevalence, number> {
  const counts = zeroCounts();
  try {
    const path = join(process.cwd(), `data/troubleshooting/${slug}.json`);
    const raw = JSON.parse(readFileSync(path, "utf-8"));
    const problems: Array<{ prevalence?: string }> = Array.isArray(raw?.problems)
      ? raw.problems
      : [];
    for (const p of problems) {
      const bucket = p.prevalence as Prevalence | undefined;
      if (bucket && PREVALENCE_KEYS.includes(bucket)) {
        counts[bucket] += 1;
      }
    }
  } catch {
    // Missing or malformed origin file — leave counts at zero.
  }
  return counts;
}

export async function GET() {
  try {
    const indexPath = join(process.cwd(), "data/troubleshooting/index.json");
    const content = readFileSync(indexPath, "utf-8");
    const index: IndexEntry[] = JSON.parse(content);
    const withCounts = index.map((entry) => ({
      ...entry,
      counts: countsForOrigin(entry.slug),
    }));
    return Response.json(withCounts);
  } catch {
    return Response.json([]);
  }
}
