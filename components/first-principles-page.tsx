"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Chapter = {
  slug: string;
  chapter: string;
  order: number;
};

type Citation = {
  id: number;
  quote: string;
  paragraph?: number;
};

type CoreTruth = {
  id: string;
  title: string;
  broaderContext?: string;
  body: string;
  citations?: Citation[];
};

type ChapterData = {
  chapter: string;
  slug: string;
  order: number;
  coreTruths: CoreTruth[];
};

type ActiveCitation = {
  citation: Citation;
  truthTitle: string;
  chapter: string;
};

export function FirstPrinciplesPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  const [openTruth, setOpenTruth] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<Record<string, ChapterData>>({});
  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(
    null
  );

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
    <>
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
                  <div className="space-y-2 pt-2 pl-3 border-l-2 border-[#2d2d2d]">
                    {truths.map((truth) => {
                      const truthOpen = openTruth === truth.id;
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
                            <div className="mt-2 px-3 py-3 bg-paper rounded-lg">
                              {truth.broaderContext && (
                                <div className="mb-5 border-l-2 border-bronze/40 pl-3 py-1">
                                  <p className="text-[10px] tracking-[0.12em] uppercase text-bronze font-medium mb-1.5">
                                    Broader context
                                  </p>
                                  <p className="text-[14px] text-ink-soft leading-[1.6] italic">
                                    {truth.broaderContext}
                                  </p>
                                </div>
                              )}
                              <div className="text-[15px] text-ink leading-[1.65]">
                                {renderBody(
                                  truth.body,
                                  truth.citations || [],
                                  (citation) =>
                                    setActiveCitation({
                                      citation,
                                      truthTitle: truth.title,
                                      chapter: chapter.chapter,
                                    })
                                )}
                              </div>
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

      {activeCitation && (
        <CitationSheet
          key={`${activeCitation.citation.id}-${activeCitation.truthTitle}`}
          active={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      )}
    </>
  );
}

function renderBody(
  body: string,
  citations: Citation[],
  onCitation: (c: Citation) => void
): ReactNode {
  const blocks = body.split("\n\n").filter((p) => p.trim());

  type Group = { heading: string | null; paragraphs: string[] };
  const groups: Group[] = [];
  let current: Group = { heading: null, paragraphs: [] };
  for (const raw of blocks) {
    const block = raw.trim();
    if (block.startsWith("## ")) {
      if (current.heading !== null || current.paragraphs.length > 0) {
        groups.push(current);
      }
      current = { heading: block.slice(3).trim(), paragraphs: [] };
    } else {
      current.paragraphs.push(block);
    }
  }
  if (current.heading !== null || current.paragraphs.length > 0) {
    groups.push(current);
  }

  return groups.map((group, gi) => (
    <div key={gi} className={gi > 0 ? "mt-5" : ""}>
      {group.heading && (
        <h4 className="font-serif text-[15px] text-ink font-bold leading-snug mb-1">
          {renderParagraph(group.heading, citations, onCitation)}
        </h4>
      )}
      {group.paragraphs.map((p, pi) => (
        <p key={pi} className={pi > 0 ? "mt-3" : ""}>
          {renderParagraph(p, citations, onCitation)}
        </p>
      ))}
    </div>
  ));
}

function renderParagraph(
  para: string,
  citations: Citation[],
  onCitation: (c: Citation) => void
): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\[(\d+)\]/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(para)) !== null) {
    if (match.index > lastIdx) {
      parts.push(para.slice(lastIdx, match.index));
    }
    const id = parseInt(match[1], 10);
    const citation = citations.find((c) => c.id === id);
    if (citation) {
      parts.push(
        <button
          key={`cite-${match.index}`}
          type="button"
          onClick={() => onCitation(citation)}
          className="inline-flex items-baseline align-baseline mx-[1px] text-[11px] font-semibold text-bronze hover:text-ink transition-colors"
          aria-label={`Citation ${id}`}
        >
          [{id}]
        </button>
      );
    } else {
      parts.push(match[0]);
    }
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < para.length) {
    parts.push(para.slice(lastIdx));
  }
  return parts;
}

function CitationSheet({
  active,
  onClose,
}: {
  active: ActiveCitation;
  onClose: () => void;
}) {
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

  if (!mounted) return null;

  const sheet = (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm ${
          closing ? "animate-fade-out" : "animate-fade-in"
        }`}
        onClick={requestClose}
      />
      <div
        className={`fixed left-1/2 z-[110] bg-paper rounded-t-2xl border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] ${
          closing ? "animate-slide-down" : "animate-slide-up"
        }`}
        style={{
          bottom: 0,
          width: "100%",
          maxWidth: "32rem",
          height: "82dvh",
          transform: "translateX(-50%)",
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          overflow: "hidden",
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
        </div>

        <div className="flex items-start justify-between px-6 pb-3 border-b border-rule/70">
          <div className="min-w-0 pr-4">
            <p className="text-[10px] tracking-[0.12em] uppercase text-bronze mb-1">
              Source · {active.chapter}
            </p>
            <p className="text-xs text-ink-muted line-clamp-2">
              {active.truthTitle}
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
          className="px-6 py-5"
          style={{
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <blockquote className="border-l-2 border-bronze/60 pl-4 font-serif text-[16px] leading-[1.7] text-ink whitespace-pre-wrap">
            {active.citation.quote}
          </blockquote>
          {active.citation.paragraph !== undefined && (
            <p className="mt-4 text-[10px] tracking-[0.12em] uppercase text-ink-muted">
              Oxford Handbook · paragraph {active.citation.paragraph}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(sheet, document.body);
}
