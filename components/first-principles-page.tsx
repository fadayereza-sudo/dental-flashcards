"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useBackClose } from "@/lib/use-back-close";
import {
  PrincipleToggleList,
  type CoreTruth,
} from "@/components/principle-toggles";
import { SearchBar } from "@/components/search-bar";
import {
  matchScore,
  normalizeQuery,
  useSearchIndex,
  type SearchPrincipleItem,
} from "@/lib/use-search-index";

type Chapter = {
  slug: string;
  chapter: string;
  order: number;
};

type ChapterData = {
  chapter: string;
  slug: string;
  order: number;
  coreTruths: CoreTruth[];
};

export function FirstPrinciplesPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [openTruth, setOpenTruth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<Record<string, ChapterData>>({});

  const [query, setQuery] = useState("");
  const isSearching = normalizeQuery(query).length > 0;
  const searchIndex = useSearchIndex(isSearching);
  const [openSearchTruth, setOpenSearchTruth] = useState<string | null>(null);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/first-principles");
      const data = await res.json();
      setChapters(Array.isArray(data) ? data : []);
    } catch {
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = async (slug: string) => {
    if (openChapter === slug) {
      setOpenChapter(null);
      setOpenTruth(null);
      return;
    }
    setOpenChapter(slug);
    setOpenTruth(null);
    if (!chapterData[slug]) {
      try {
        const res = await fetch(`/api/first-principles/${slug}`);
        const data = await res.json();
        setChapterData((prev) => ({ ...prev, [slug]: data }));
      } catch {
        console.error(`Failed to load chapter ${slug}`);
      }
    }
  };

  const toggleTruth = (id: string) => {
    setOpenTruth((prev) => (prev === id ? null : id));
  };

  const closeChapter = useCallback(() => {
    setOpenChapter(null);
    setOpenTruth(null);
  }, []);
  const closeTruth = useCallback(() => setOpenTruth(null), []);
  useBackClose(openChapter !== null && !isSearching, closeChapter);
  useBackClose(openTruth !== null && !isSearching, closeTruth);

  const clearSearch = useCallback(() => setQuery(""), []);
  useBackClose(isSearching, clearSearch);

  // Group matching truths by chapter so the user sees clustered hits.
  const searchGroups = useMemo(() => {
    if (!isSearching || !searchIndex) return [];
    const q = normalizeQuery(query);
    type Scored = { item: SearchPrincipleItem; score: number };
    const matches: Scored[] = [];
    for (const item of searchIndex.principles) {
      const t = item.truth;
      const citationText = (t.citations || []).map((c) => c.quote).join(" ");
      const score = matchScore(
        q,
        t.title,
        item.chapterTitle,
        t.broaderContext,
        t.body,
        citationText,
      );
      if (score !== null) matches.push({ item, score });
    }
    matches.sort((a, b) => b.score - a.score);
    type Group = {
      chapterSlug: string;
      chapterTitle: string;
      chapterOrder: number;
      truths: CoreTruth[];
      bestScore: number;
    };
    const byChapter = new Map<string, Group>();
    for (const m of matches) {
      const key = m.item.chapterSlug;
      let g = byChapter.get(key);
      if (!g) {
        g = {
          chapterSlug: m.item.chapterSlug,
          chapterTitle: m.item.chapterTitle,
          chapterOrder: m.item.chapterOrder,
          truths: [],
          bestScore: m.score,
        };
        byChapter.set(key, g);
      }
      g.truths.push(m.item.truth);
      if (m.score > g.bestScore) g.bestScore = m.score;
    }
    return [...byChapter.values()].sort((a, b) => b.bestScore - a.bestScore);
  }, [isSearching, searchIndex, query]);

  const totalMatches = searchGroups.reduce((n, g) => n + g.truths.length, 0);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-ink-muted text-sm tracking-wide uppercase">
          Loading…
        </span>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-[calc(env(safe-area-inset-bottom)+5rem)]">
        <div className="text-center px-8">
          <p className="font-serif text-2xl text-ink mb-2">First Principles</p>
          <p className="text-sm text-ink-muted">
            No content yet. Run the{" "}
            <code className="text-xs bg-paper-sunk px-2 py-1 rounded">
              extract-first-principles
            </code>{" "}
            skill to generate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5.5rem)] px-4">
      <header className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4">
        <h1 className="font-serif text-2xl text-ink">First Principles</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-wide">
          Core truths from the Oxford Handbook
        </p>
      </header>

      <div className="max-w-2xl mx-auto mb-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search principles…"
        />
      </div>

      {isSearching ? (
        <div className="max-w-2xl mx-auto">
          {searchIndex === null ? (
            <p className="text-xs text-ink-muted px-1">Loading search index…</p>
          ) : totalMatches === 0 ? (
            <p className="text-sm text-ink-muted px-1 py-6 text-center">
              No matches for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <>
              <p className="text-[11px] text-ink-muted tracking-wide uppercase mb-3 px-1">
                {totalMatches} match{totalMatches === 1 ? "" : "es"}
              </p>
              <div className="space-y-5">
                {searchGroups.map((group) => (
                  <div key={group.chapterSlug}>
                    <p className="text-[11px] text-ink-muted tracking-[0.12em] uppercase mb-2 px-1">
                      {group.chapterTitle}
                    </p>
                    <PrincipleToggleList
                      truths={group.truths}
                      category={group.chapterTitle}
                      openTruthId={openSearchTruth}
                      onToggle={(id) =>
                        setOpenSearchTruth((prev) => (prev === id ? null : id))
                      }
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-3">
          {chapters.map((chapter) => {
            const isOpen = openChapter === chapter.slug;
            const data = chapterData[chapter.slug];
            const truths = data?.coreTruths || [];

            return (
              <div key={chapter.slug} className="space-y-0">
                <button
                  onClick={() => toggleChapter(chapter.slug)}
                  className="w-full text-left rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-white px-4 py-3 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-sm tracking-wide">
                    {chapter.chapter}
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
                      category={chapter.chapter}
                      openTruthId={openTruth}
                      onToggle={toggleTruth}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
