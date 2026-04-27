"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useBackClose } from "@/lib/use-back-close";
import { useDragToClose } from "@/lib/use-drag-to-close";
import { highlight } from "@/lib/highlight";

export type Citation = {
  id: number;
  quote: string;
  paragraph?: number;
  source?: string;
};

export type CoreTruth = {
  id: string;
  title: string;
  broaderContext?: string;
  body: string;
  citations?: Citation[];
};

type ActiveCitation = {
  citation: Citation;
  truthTitle: string;
  category: string;
};

interface PrincipleToggleListProps {
  truths: CoreTruth[];
  category: string;
  openTruthId: string | null;
  onToggle: (id: string) => void;
  highlightTerm?: string;
}

export function PrincipleToggleList({
  truths,
  category,
  openTruthId,
  onToggle,
  highlightTerm,
}: PrincipleToggleListProps) {
  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(
    null
  );

  return (
    <>
      <div className="space-y-2">
        {truths.map((truth) => {
          const truthOpen = openTruthId === truth.id;
          return (
            <div key={truth.id}>
              <button
                onClick={() => onToggle(truth.id)}
                className="w-full text-left rounded-lg bg-paper-sunk hover:bg-paper transition-colors border-l-2 border-[#2563eb] px-3 py-2 flex items-start justify-between gap-3"
              >
                <span className="text-[#2563eb] text-sm font-medium flex-1">
                  {highlight(truth.title, highlightTerm)}
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
                        {highlight(truth.broaderContext, highlightTerm)}
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
                          category,
                        }),
                      highlightTerm
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
  onCitation: (c: Citation) => void,
  highlightTerm?: string
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
          {renderParagraph(group.heading, citations, onCitation, highlightTerm)}
        </h4>
      )}
      {group.paragraphs.map((p, pi) => (
        <p key={pi} className={pi > 0 ? "mt-3" : ""}>
          {renderParagraph(p, citations, onCitation, highlightTerm)}
        </p>
      ))}
    </div>
  ));
}

function renderParagraph(
  para: string,
  citations: Citation[],
  onCitation: (c: Citation) => void,
  highlightTerm?: string
): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\[(\d+)\]/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  const pushText = (s: string, baseKey: string) => {
    if (!s) return;
    const hl = highlight(s, highlightTerm);
    if (hl.length === 1 && typeof hl[0] === "string") {
      parts.push(hl[0]);
    } else {
      parts.push(
        <span key={baseKey}>
          {hl}
        </span>
      );
    }
  };
  while ((match = regex.exec(para)) !== null) {
    if (match.index > lastIdx) {
      pushText(para.slice(lastIdx, match.index), `txt-${lastIdx}`);
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
    pushText(para.slice(lastIdx), `txt-${lastIdx}`);
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

  useBackClose(mounted && !closing, requestClose);
  // Drag uses onClose (no animation) because useDragToClose runs its own
  // finish transition; routing through requestClose would double-animate.
  const { sheetRef, handleProps } = useDragToClose(onClose);

  if (!mounted) return null;

  const sourceLabel = active.citation.source
    ? active.citation.source
    : active.citation.paragraph !== undefined
    ? `Oxford Handbook · paragraph ${active.citation.paragraph}`
    : null;

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
        className={`relative w-full max-w-[32rem] max-h-[65dvh] bg-paper rounded-t-2xl border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] ${
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
            <p className="text-[10px] tracking-[0.12em] uppercase text-bronze mb-1">
              Source · {active.category}
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
          className="flex-1 min-h-0 overflow-y-auto px-6 py-5"
          style={{
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <blockquote className="border-l-2 border-bronze/60 pl-4 font-serif text-[16px] leading-[1.7] text-ink whitespace-pre-wrap">
            {active.citation.quote}
          </blockquote>
          {sourceLabel && (
            <p className="mt-4 text-[10px] tracking-[0.12em] uppercase text-ink-muted">
              {sourceLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
