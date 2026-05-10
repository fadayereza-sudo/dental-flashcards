import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";

type Citation = {
  id: number;
  quote: string;
  paragraph?: number;
  source?: string;
};

type CoreTruth = {
  id: string;
  title: string;
  broaderContext?: string;
  body: string;
  citations?: Citation[];
};

type Slide = { id: number; title: string; body: string };

type Workflow = {
  id: string;
  title: string;
  overview: string;
  slides: Slide[];
};

type Subject = {
  slug: string;
  title: string;
  order: number;
  description?: string;
  workflows: Workflow[];
  firstPrinciples: CoreTruth[];
};

type ChapterData = {
  chapter: string;
  slug: string;
  order: number;
  coreTruths: CoreTruth[];
};

type TroubleshootingProblem = {
  id: string;
  description: string;
  conditionName: string;
  prevalence: string;
  etiology: string;
  presentation: string;
  results: string;
  definingCharacteristics: string;
  treatment: string;
  prognosis: string;
  citations?: Citation[];
};

type TroubleshootingOrigin = {
  slug: string;
  title: string;
  order: number;
  description?: string;
  problems: TroubleshootingProblem[];
};

type GuidelineDetail = {
  slug: string;
  title: string;
  organisation: string;
  order: number;
  description: string;
  subjects: Subject[];
};

export type SearchPrincipleItem = {
  kind: "principle";
  chapterSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  truth: CoreTruth;
};

export type SearchWorkflowItem = {
  kind: "workflow";
  categorySlug: string;
  categoryTitle: string;
  categoryOrder: number;
  subjectSlug: string;
  subjectTitle: string;
  subjectOrder: number;
  workflow: Workflow;
};

export type SearchGuidelinePrincipleItem = {
  kind: "guideline-principle";
  categorySlug: string;
  categoryTitle: string;
  categoryOrder: number;
  subjectSlug: string;
  subjectTitle: string;
  subjectOrder: number;
  truth: CoreTruth;
};

export type SearchTroubleshootingProblemItem = {
  kind: "troubleshooting-problem";
  originSlug: string;
  originTitle: string;
  originOrder: number;
  problem: TroubleshootingProblem;
};

export type SearchIndex = {
  principles: SearchPrincipleItem[];
  guidelines: (SearchWorkflowItem | SearchGuidelinePrincipleItem)[];
  troubleshooting: SearchTroubleshootingProblemItem[];
};

function readJsonFiles<T>(dir: string): T[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out: T[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    if (entry === "index.json" || entry === "progress.json") continue;
    try {
      const content = readFileSync(join(dir, entry), "utf-8");
      out.push(JSON.parse(content) as T);
    } catch {
      // skip malformed file
    }
  }
  return out;
}

export async function GET() {
  const principlesDir = join(process.cwd(), "data/first-principles");
  const guidelinesDir = join(process.cwd(), "data/guidelines");
  const troubleshootingDir = join(process.cwd(), "data/troubleshooting");

  const chapters = readJsonFiles<ChapterData>(principlesDir);
  const categories = readJsonFiles<GuidelineDetail>(guidelinesDir);
  const origins = readJsonFiles<TroubleshootingOrigin>(troubleshootingDir);

  const principles: SearchPrincipleItem[] = [];
  for (const chapter of chapters) {
    if (!chapter || !Array.isArray(chapter.coreTruths)) continue;
    for (const truth of chapter.coreTruths) {
      principles.push({
        kind: "principle",
        chapterSlug: chapter.slug,
        chapterTitle: chapter.chapter,
        chapterOrder: chapter.order ?? 0,
        truth,
      });
    }
  }

  const guidelines: (SearchWorkflowItem | SearchGuidelinePrincipleItem)[] = [];
  for (const cat of categories) {
    if (!cat || !Array.isArray(cat.subjects)) continue;
    for (const subj of cat.subjects) {
      for (const wf of subj.workflows ?? []) {
        guidelines.push({
          kind: "workflow",
          categorySlug: cat.slug,
          categoryTitle: cat.title,
          categoryOrder: cat.order ?? 0,
          subjectSlug: subj.slug,
          subjectTitle: subj.title,
          subjectOrder: subj.order ?? 0,
          workflow: wf,
        });
      }
      for (const truth of subj.firstPrinciples ?? []) {
        guidelines.push({
          kind: "guideline-principle",
          categorySlug: cat.slug,
          categoryTitle: cat.title,
          categoryOrder: cat.order ?? 0,
          subjectSlug: subj.slug,
          subjectTitle: subj.title,
          subjectOrder: subj.order ?? 0,
          truth,
        });
      }
    }
  }

  const troubleshooting: SearchTroubleshootingProblemItem[] = [];
  for (const origin of origins) {
    if (!origin || !Array.isArray(origin.problems)) continue;
    for (const problem of origin.problems) {
      troubleshooting.push({
        kind: "troubleshooting-problem",
        originSlug: origin.slug,
        originTitle: origin.title,
        originOrder: origin.order ?? 0,
        problem,
      });
    }
  }

  const payload: SearchIndex = { principles, guidelines, troubleshooting };
  return Response.json(payload);
}
