"use client";

import { useEffect, useState } from "react";

type Chapter = {
  slug: string;
  chapter: string;
  order: number;
};

type CoreTruth = {
  id: string;
  title: string;
  body: string;
};

type ChapterData = {
  chapter: string;
  slug: string;
  order: number;
  coreTruths: CoreTruth[];
};

export function FirstPrinciplesPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
  const [expandedTruths, setExpandedTruths] = useState<Set<string>>(new Set());
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
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
      if (!chapterData[slug]) {
        try {
          const res = await fetch(`/api/first-principles/${slug}`);
          const data = await res.json();
          setChapterData((prev) => ({ ...prev, [slug]: data }));
        } catch {
          console.error(`Failed to load chapter ${slug}`);
        }
      }
    }
    setExpandedChapters(newExpanded);
  };

  const toggleTruth = (id: string) => {
    const newExpanded = new Set(expandedTruths);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTruths(newExpanded);
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
      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto">
        <div className="text-center px-8 py-16">
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
    <div className="absolute inset-0 overflow-y-auto pt-[calc(env(safe-area-inset-top)+3.5rem)] pb-8 px-4">
      <div className="max-w-2xl mx-auto space-y-3">
        {chapters.map((chapter) => {
          const isOpen = expandedChapters.has(chapter.slug);
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
                <div className="space-y-2 pt-2 pl-3 border-l-2 border-[#2d2d2d]">
                  {truths.map((truth) => {
                    const truthOpen = expandedTruths.has(truth.id);
                    return (
                      <div key={truth.id}>
                        <button
                          onClick={() => toggleTruth(truth.id)}
                          className="w-full text-left rounded-lg bg-paper-sunk hover:bg-paper transition-colors border-l-2 border-[#2563eb] px-3 py-2 flex items-start justify-between gap-3"
                        >
                          <span className="text-[#2563eb] text-sm font-medium flex-1">
                            {truth.title}
                          </span>
                          <svg
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                              truthOpen ? "rotate-90" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </button>

                        {truthOpen && (
                          <div className="mt-2 px-3 py-2 bg-paper rounded-lg text-sm text-ink leading-relaxed space-y-2">
                            {truth.body
                              .split("\n\n")
                              .filter((p) => p.trim())
                              .map((para, i) => (
                                <p key={i}>{para.trim()}</p>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
