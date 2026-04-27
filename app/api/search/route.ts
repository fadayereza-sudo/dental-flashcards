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

export type SearchIndex = {
  principles: SearchPrincipleItem[];
  guidelines: (SearchWorkflowItem | SearchGuidelinePrincipleItem)[];
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

  const chapters = readJsonFiles<ChapterData>(principlesDir);
  const categories = readJsonFiles<GuidelineDetail>(guidelinesDir);

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

  const payload: SearchIndex = { principles, guidelines };
  return Response.json(payload);
}
