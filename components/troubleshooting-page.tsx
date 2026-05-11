"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useBackClose } from "@/lib/use-back-close";
import { useDragToClose } from "@/lib/use-drag-to-close";
import {
  PrincipleToggleList,
  type Citation,
  type CoreTruth,
} from "@/components/principle-toggles";
import { SearchBar } from "@/components/search-bar";
import {
  matchScore,
  normalizeQuery,
  useSearchIndex,
  type SearchTroubleshootingProblemItem,
} from "@/lib/use-search-index";

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

const PREVALENCE_STYLE: Record<
  Prevalence,
  { badge: string; pillActive: string; pillInactive: string }
> = {
  "very-common": {
    badge: "bg-[#b8d4b3] text-[#3d5c3a]",
    pillActive: "bg-[#b8d4b3] text-[#3d5c3a]",
    pillInactive: "bg-paper-sunk text-[#3d5c3a]/70 hover:bg-paper",
  },
  common: {
    badge: "bg-[#d4cb95] text-[#6b6230]",
    pillActive: "bg-[#d4cb95] text-[#6b6230]",
    pillInactive: "bg-paper-sunk text-[#6b6230]/70 hover:bg-paper",
  },
  uncommon: {
    badge: "bg-[#e0b888] text-[#7d4f1d]",
    pillActive: "bg-[#e0b888] text-[#7d4f1d]",
    pillInactive: "bg-paper-sunk text-[#7d4f1d]/70 hover:bg-paper",
  },
  "very-uncommon": {
    badge: "bg-[#e0ac9a] text-[#8d4530]",
    pillActive: "bg-[#e0ac9a] text-[#8d4530]",
    pillInactive: "bg-paper-sunk text-[#8d4530]/70 hover:bg-paper",
  },
  rare: {
    badge: "bg-[#e09a90] text-[#9a3a2a]",
    pillActive: "bg-[#e09a90] text-[#9a3a2a]",
    pillInactive: "bg-paper-sunk text-[#9a3a2a]/70 hover:bg-paper",
  },
};

const PREVALENCE_DETAIL: Record<
  Prevalence,
  { range: string; encounter: string }
> = {
  "very-common": {
    range: "≥10% lifetime",
    encounter: "Seen weekly or more",
  },
  common: {
    range: "1–10% lifetime",
    encounter: "Seen monthly",
  },
  uncommon: {
    range: "0.1–1% (1 in 100 – 1 in 1,000)",
    encounter: "A handful per career",
  },
  "very-uncommon": {
    range: "0.01–0.1% (1 in 1,000 – 1 in 10,000)",
    encounter: "Once or twice per career",
  },
  rare: {
    range: "<0.01% (<1 in 10,000)",
    encounter: "Likely never personally",
  },
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
    badge: {
      label: PREVALENCE_LABEL[problem.prevalence],
      className: PREVALENCE_STYLE[problem.prevalence].badge,
    },
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
  const [prevalenceInfoOpen, setPrevalenceInfoOpen] = useState(false);

  const [query, setQuery] = useState("");
  const isSearching = normalizeQuery(query).length > 0;
  const searchIndex = useSearchIndex(isSearching);
  const [openSearchProblem, setOpenSearchProblem] = useState<string | null>(
    null
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
  useBackClose(openOrigin !== null && !isSearching, closeOrigin);
  useBackClose(openProblem !== null && !isSearching, closeProblem);

  const clearSearch = useCallback(() => setQuery(""), []);
  useBackClose(isSearching, clearSearch);

  const sortedOrigins = useMemo(
    () => [...origins].sort((a, b) => a.order - b.order),
    [origins]
  );

  const searchGroups = useMemo(() => {
    if (!isSearching || !searchIndex) return [];
    const q = normalizeQuery(query);
    type Scored = {
      item: SearchTroubleshootingProblemItem;
      score: number;
    };
    const matches: Scored[] = [];
    for (const item of searchIndex.troubleshooting ?? []) {
      const p = item.problem;
      const citationText = (p.citations || []).map((c) => c.quote).join(" ");
      const bodyText = [
        p.etiology,
        p.presentation,
        p.results,
        p.definingCharacteristics,
        p.treatment,
        p.prognosis,
      ]
        .filter(Boolean)
        .join(" ");
      const score = matchScore(
        q,
        p.description,
        p.conditionName,
        item.originTitle,
        bodyText,
        citationText
      );
      if (score !== null) matches.push({ item, score });
    }
    matches.sort((a, b) => b.score - a.score);
    type Group = {
      originSlug: string;
      originTitle: string;
      originOrder: number;
      truths: CoreTruth[];
      bestScore: number;
    };
    const byOrigin = new Map<string, Group>();
    for (const m of matches) {
      const key = m.item.originSlug;
      let g = byOrigin.get(key);
      if (!g) {
        g = {
          originSlug: m.item.originSlug,
          originTitle: m.item.originTitle,
          originOrder: m.item.originOrder,
          truths: [],
          bestScore: m.score,
        };
        byOrigin.set(key, g);
      }
      g.truths.push(problemToTruth(m.item.problem as Problem));
      if (m.score > g.bestScore) g.bestScore = m.score;
    }
    return [...byOrigin.values()].sort((a, b) => b.bestScore - a.bestScore);
  }, [isSearching, searchIndex, query]);

  const totalSearchMatches = searchGroups.reduce(
    (n, g) => n + g.truths.length,
    0
  );

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-ink-soft text-sm">Loading…</span>
      </div>
    );
  }

  if (origins.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <div className="text-center px-8">
          <p className="text-2xl font-semibold text-ink mb-2">Troubleshooting</p>
          <p className="text-sm text-ink-soft">
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
        <h1 className="text-2xl font-semibold text-ink">Troubleshooting</h1>
        <p className="text-sm text-ink-soft mt-1">
          Diagnose by origin and presentation
        </p>
      </header>

      <div className="max-w-2xl mx-auto pb-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search problems…"
        />
      </div>

      {!isSearching && (
        <div className="max-w-2xl mx-auto pb-3 flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {PREVALENCE_ORDER.map((p) => {
              const active = activePrevalences.has(p);
              const style = PREVALENCE_STYLE[p];
              return (
                <button
                  key={p}
                  onClick={() => togglePrevalence(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active ? style.pillActive : style.pillInactive
                  }`}
                >
                  {PREVALENCE_LABEL[p]}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPrevalenceInfoOpen(true)}
            className="shrink-0 w-7 h-7 rounded-full bg-paper-sunk border border-rule flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label="What do these prevalence labels mean?"
          >
            <span className="text-xs font-semibold leading-none">?</span>
          </button>
        </div>
      )}

      {isSearching ? (
        <div className="max-w-2xl mx-auto">
          {searchIndex === null ? (
            <p className="text-sm text-ink-soft px-1">Loading search index…</p>
          ) : totalSearchMatches === 0 ? (
            <p className="text-sm text-ink-soft px-1 py-6 text-center">
              No matches for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-3 px-1">
                {totalSearchMatches} match
                {totalSearchMatches === 1 ? "" : "es"}
              </p>
              <div className="space-y-5">
                {searchGroups.map((group) => (
                  <div key={group.originSlug}>
                    <p className="text-xs text-ink-muted tracking-[0.04em] uppercase font-semibold mb-2 px-1">
                      {group.originTitle}
                    </p>
                    <PrincipleToggleList
                      truths={group.truths}
                      category={group.originTitle}
                      openTruthId={openSearchProblem}
                      onToggle={(id) =>
                        setOpenSearchProblem((prev) =>
                          prev === id ? null : id
                        )
                      }
                      highlightTerm={query}
                      accent="dark"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
      <div className="max-w-2xl mx-auto space-y-3">
        {sortedOrigins.map((origin) => {
          const isOpen = openOrigin === origin.slug;
          const data = originData[origin.slug];
          const allProblems = data?.problems || [];
          const filteredProblems = allProblems
            .filter((p) => activePrevalences.has(p.prevalence))
            .slice()
            .sort(
              (a, b) =>
                PREVALENCE_ORDER.indexOf(a.prevalence) -
                PREVALENCE_ORDER.indexOf(b.prevalence)
            );
          const truths = filteredProblems.map(problemToTruth);

          return (
            <div key={origin.slug} className="space-y-0">
              <button
                onClick={() => toggleOrigin(origin.slug)}
                className="w-full text-left rounded-md bg-paper-sunk hover:bg-paper border-b-2 border-bronze/25 text-ink px-4 py-3.5 min-h-[44px] transition-colors flex items-center justify-between"
              >
                <span className="text-[17px] font-semibold">
                  {origin.title}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform text-ink-soft ${
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
                <div className="pt-2 pl-3 border-l-2 border-bronze/25">
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
                  <div className="pt-2 pl-3 border-l-2 border-bronze/25">
                    <p className="text-sm text-ink-soft px-3 py-2">
                      No problems match the current filter.
                    </p>
                  </div>
                )}

              {isOpen && data && allProblems.length === 0 && (
                <div className="pt-2 pl-3 border-l-2 border-bronze/25">
                  <p className="text-sm text-ink-soft px-3 py-2">
                    No problems documented for this origin yet.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {prevalenceInfoOpen && (
        <PrevalenceInfoSheet onClose={() => setPrevalenceInfoOpen(false)} />
      )}
    </div>
  );
}

function PrevalenceInfoSheet({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestClose = useCallback(() => {
    setClosing((c) => {
      if (c) return c;
      setTimeout(() => onClose(), 260);
      return true;
    });
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  useBackClose(mounted && !closing, requestClose);
  const { sheetRef, handleProps } = useDragToClose(onClose);

  if (!mounted) return null;

  const sheet = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={requestClose}
    >
      <div
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm ${
          closing ? "animate-fade-out" : "animate-fade-in"
        }`}
      />
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[32rem] max-h-[75dvh] bg-paper rounded-t-2xl border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
      >
        <div
          {...handleProps}
          className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
        >
          <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
        </div>

        <div className="flex items-start justify-between px-6 pb-3 border-b border-rule/70">
          <div className="min-w-0 pr-4">
            <p className="text-xs tracking-[0.04em] uppercase text-bronze font-semibold mb-1">
              Prevalence guide
            </p>
            <p className="text-sm text-ink-soft">
              What each label means statistically
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="shrink-0 mt-1 w-7 h-7 rounded-full bg-paper-sunk border border-rule flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 py-5"
          style={{
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <p className="text-sm text-ink-soft leading-[1.55] mb-5">
            Probability of encountering this condition in a UK practice
            catchment, anchored to lifetime prevalence in the white-British
            population (with adjustment where ethnic or geographic skew
            materially shifts the bucket).
          </p>

          <ul className="space-y-4">
            {PREVALENCE_ORDER.map((p) => {
              const detail = PREVALENCE_DETAIL[p];
              const style = PREVALENCE_STYLE[p];
              return (
                <li key={p}>
                  <span
                    className={`inline-block text-xs tracking-[0.04em] uppercase font-semibold whitespace-nowrap px-2 py-0.5 rounded-full ${style.badge}`}
                  >
                    {PREVALENCE_LABEL[p]}
                  </span>
                  <p className="text-sm text-ink font-medium mt-1.5">
                    {detail.range}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {detail.encounter}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
