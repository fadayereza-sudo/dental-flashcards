"use client";

import { useEffect, useState } from "react";
import {
  PrincipleToggleList,
  type CoreTruth,
} from "@/components/principle-toggles";

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
      <header className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5">
        <h1 className="font-serif text-2xl text-ink">First Principles</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-wide">
          Core truths from the Oxford Handbook
        </p>
      </header>
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
    </div>
  );
}
