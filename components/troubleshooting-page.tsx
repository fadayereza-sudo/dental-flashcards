"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBackClose } from "@/lib/use-back-close";
import {
  PrincipleToggleList,
  type Citation,
  type CoreTruth,
} from "@/components/principle-toggles";

type OriginIndexEntry = {
  slug: string;
  title: string;
  order: number;
  description?: string;
};

type Prevalence =
  | "very-common"
  | "common"
  | "uncommon"
  | "very-uncommon"
  | "rare";

const PREVALENCE_ORDER: Prevalence[] = [
  "very-common",
  "common",
  "uncommon",
  "very-uncommon",
  "rare",
];

const PREVALENCE_LABEL: Record<Prevalence, string> = {
  "very-common": "Very common",
  common: "Common",
  uncommon: "Uncommon",
  "very-uncommon": "Very uncommon",
  rare: "Rare",
};

type Problem = {
  id: string;
  description: string;
  conditionName: string;
  prevalence: Prevalence;
  etiology: string;
  presentation: string;
  results: string;
  definingCharacteristics: string;
  treatment: string;
  prognosis: string;
  citations?: Citation[];
};

type OriginData = {
  slug: string;
  title: string;
  order: number;
  description?: string;
  problems: Problem[];
};

const SECTIONS: { key: keyof Problem; heading: string }[] = [
  { key: "etiology", heading: "Etiology" },
  { key: "presentation", heading: "Presentation" },
  { key: "results", heading: "Results" },
  { key: "definingCharacteristics", heading: "Defining characteristics" },
  { key: "treatment", heading: "Treatment" },
  { key: "prognosis", heading: "Prognosis" },
];

function problemToTruth(problem: Problem): CoreTruth {
  const sections = SECTIONS.map(({ key, heading }) => {
    const value = (problem[key] as string | undefined)?.trim();
    if (!value) return null;
    return `## ${heading}\n\n${value}`;
  }).filter(Boolean) as string[];

  sections.push(`## Name of condition\n\n**${problem.conditionName}**`);

  return {
    id: problem.id,
    title: problem.description,
    body: sections.join("\n\n"),
    citations: problem.citations,
    badge: PREVALENCE_LABEL[problem.prevalence],
  };
}

export function TroubleshootingPage() {
  const [origins, setOrigins] = useState<OriginIndexEntry[]>([]);
  const [openOrigin, setOpenOrigin] = useState<string | null>(null);
  const [openProblem, setOpenProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [originData, setOriginData] = useState<Record<string, OriginData>>({});
  const [activePrevalences, setActivePrevalences] = useState<Set<Prevalence>>(
    () => new Set(PREVALENCE_ORDER)
  );

  const togglePrevalence = (p: Prevalence) => {
    setActivePrevalences((prev) => {
      const next = new Set(prev);
      if (next.has(p)) {
        next.delete(p);
      } else {
        next.add(p);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const fetchOrigins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/troubleshooting");
      const data = await res.json();
      setOrigins(Array.isArray(data) ? data : []);
    } catch {
      setOrigins([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrigin = async (slug: string) => {
    if (openOrigin === slug) {
      setOpenOrigin(null);
      setOpenProblem(null);
      return;
    }
    setOpenOrigin(slug);
    setOpenProblem(null);
    if (!originData[slug]) {
      try {
        const res = await fetch(`/api/troubleshooting/${slug}`);
        if (!res.ok) return;
        const data = await res.json();
        setOriginData((prev) => ({ ...prev, [slug]: data }));
      } catch {
        console.error(`Failed to load origin ${slug}`);
      }
    }
  };

  const toggleProblem = (id: string) => {
    setOpenProblem((prev) => (prev === id ? null : id));
  };

  const closeOrigin = useCallback(() => {
    setOpenOrigin(null);
    setOpenProblem(null);
  }, []);
  const closeProblem = useCallback(() => setOpenProblem(null), []);
  useBackClose(openOrigin !== null, closeOrigin);
  useBackClose(openProblem !== null, closeProblem);

  const sortedOrigins = useMemo(
    () => [...origins].sort((a, b) => a.order - b.order),
    [origins]
  );

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-ink-muted text-sm tracking-wide uppercase">
          Loading…
        </span>
      </div>
    );
  }

  if (origins.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <div className="text-center px-8">
          <p className="font-serif text-2xl text-ink mb-2">Troubleshooting</p>
          <p className="text-sm text-ink-muted">
            No content yet. Run the{" "}
            <code className="text-xs bg-paper-sunk px-2 py-1 rounded">
              extract-troubleshooting
            </code>{" "}
            skill to generate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5.5rem)] px-4">
      <header className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-3">
        <h1 className="font-serif text-2xl text-ink">Troubleshooting</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-wide">
          Diagnose by origin and presentation
        </p>
      </header>

      <div className="max-w-2xl mx-auto pb-3">
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
          {PREVALENCE_ORDER.map((p) => {
            const active = activePrevalences.has(p);
            return (
              <button
                key={p}
                onClick={() => togglePrevalence(p)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] tracking-wide transition-colors ${
                  active
                    ? "bg-[#2d2d2d] text-white"
                    : "bg-paper-sunk text-ink-muted hover:bg-paper"
                }`}
              >
                {PREVALENCE_LABEL[p]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {sortedOrigins.map((origin) => {
          const isOpen = openOrigin === origin.slug;
          const data = originData[origin.slug];
          const allProblems = data?.problems || [];
          const filteredProblems = allProblems.filter((p) =>
            activePrevalences.has(p.prevalence)
          );
          const truths = filteredProblems.map(problemToTruth);

          return (
            <div key={origin.slug} className="space-y-0">
              <button
                onClick={() => toggleOrigin(origin.slug)}
                className="w-full text-left rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-white px-4 py-3 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-sm tracking-wide">
                  {origin.title}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              {isOpen && truths.length > 0 && (
                <div className="pt-2 pl-3 border-l-2 border-[#2d2d2d]">
                  <PrincipleToggleList
                    truths={truths}
                    category={origin.title}
                    openTruthId={openProblem}
                    onToggle={toggleProblem}
                    accent="dark"
                  />
                </div>
              )}

              {isOpen &&
                data &&
                truths.length === 0 &&
                allProblems.length > 0 && (
                  <div className="pt-2 pl-3 border-l-2 border-[#2d2d2d]">
                    <p className="text-xs text-ink-muted px-3 py-2">
                      No problems match the current filter.
                    </p>
                  </div>
                )}

              {isOpen && data && allProblems.length === 0 && (
                <div className="pt-2 pl-3 border-l-2 border-[#2d2d2d]">
                  <p className="text-xs text-ink-muted px-3 py-2">
                    No problems documented for this origin yet.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
