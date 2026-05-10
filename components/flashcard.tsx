"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useAnimatedSheet } from "@/lib/use-animated-sheet";
import { useDragToClose } from "@/lib/use-drag-to-close";
import { useFitText } from "@/lib/use-fit-text";
import { ManualMarkdown } from "@/components/manual-markdown";

const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function renderWithLinks(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(MD_LINK)) {
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bronze underline underline-offset-2 hover:no-underline break-words"
      >
        {match[1]}
      </a>,
    );
    last = start + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>);
}

type Props = {
  card: {
    id: number;
    question: string;
    answer: string;
    source: string | null;
    image: string | null;
    reference: string | null;
    referenceSection: string | null;
    state: number;
    reps: number;
  };
  onRate: (rating: number) => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const RATINGS = [
  { value: 1, label: "Again", sub: "forgot",   accent: "text-accent-red"   },
  { value: 2, label: "Hard",  sub: "struggled", accent: "text-bronze"       },
  { value: 3, label: "Good",  sub: "got it",    accent: "text-ink"          },
  { value: 4, label: "Easy",  sub: "instant",   accent: "text-accent-green" },
] as const;

export function Flashcard({ card, onRate, onEdit, onDelete }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);
  const handleDeleteClick = useCallback(() => {
    if (!onDelete) return;
    if (confirmDelete) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      setConfirmDelete(false);
      onDelete();
      return;
    }
    setConfirmDelete(true);
    confirmTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000);
  }, [confirmDelete, onDelete]);
  const resetRef = useCallback(() => setRefOpen(false), []);
  const { closing: refClosing, close: closeRef } = useAnimatedSheet(
    refOpen,
    resetRef,
  );
  const { sheetRef: refSheetRef, handleProps: refDragHandle } =
    useDragToClose(resetRef);

  const questionFitRef = useRef<HTMLDivElement>(null);
  const questionTextRef = useRef<HTMLParagraphElement>(null);
  useFitText(questionTextRef, questionFitRef, card.question, 24, 15);

  const stateLabel =
    card.state === 0
      ? "New"
      : card.state === 1
        ? "Learning"
        : card.state === 2
          ? "Review"
          : "Relearning";

  const handleRate = (rating: number) => {
    if (rated) return;
    setRated(true);
    onRate(rating);
  };

  const metaRow = (
    <div className="flex items-center justify-between text-xs tracking-[0.04em] uppercase text-ink-muted font-medium mb-4">
      <span>{stateLabel}</span>
      {(card.source || card.referenceSection) && (
        <span className="truncate max-w-[60%] text-right">
          {card.source || card.referenceSection}
        </span>
      )}
    </div>
  );

  return (
    <div
      className="relative w-full max-w-md"
      style={{ perspective: "1400px" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="block w-full text-left cursor-pointer"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div
          className={`flip-3d relative w-full min-h-[50dvh] rounded-xl border border-rule bg-paper-sunk shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_40px_-28px_rgba(28,25,23,0.35)] ${flipped ? "flipped" : ""}`}
        >
          {/* Front */}
          <div className="flip-face absolute inset-0 p-6 flex flex-col">
            <div className="flex-shrink-0">
              {metaRow}
              <p className="text-xs tracking-[0.04em] uppercase text-bronze font-semibold mb-6">
                Question
              </p>
            </div>
            <div
              ref={questionFitRef}
              className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden"
            >
              <p
                ref={questionTextRef}
                className="leading-[1.3] text-ink font-medium"
                style={{ fontSize: "24px" }}
              >
                {card.question}
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center justify-between text-xs tracking-[0.04em] uppercase text-ink-muted font-medium pt-5 border-t border-rule/70">
              <span>Tap to reveal</span>
              <span aria-hidden>▾</span>
            </div>
          </div>

          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 p-6 flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              {metaRow}
              <p className="text-xs tracking-[0.04em] uppercase text-bronze font-semibold mb-6">
                Answer &amp; Reasoning
              </p>
              <ManualMarkdown source={card.answer} className="text-ink" />
            </div>
            <div className="flex items-center justify-between gap-3 text-xs tracking-[0.04em] uppercase text-ink-muted font-medium pt-5 border-t border-rule/70">
              {card.reference || card.referenceSection ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRefOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-bronze hover:text-ink transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M2 2h8l4 4v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 9h8M4 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Reference
                </button>
              ) : (
                <span>Rate your recall</span>
              )}
              <div className="flex items-center gap-3">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
                    aria-label="Edit card"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                    </svg>
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick();
                    }}
                    className={`flex items-center gap-1 transition-colors ${
                      confirmDelete
                        ? "text-accent-red"
                        : "text-ink-muted hover:text-accent-red"
                    }`}
                    aria-label={confirmDelete ? "Confirm delete card" : "Delete card"}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.5 9.5h5L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {confirmDelete ? "Sure?" : "Delete"}
                  </button>
                )}
                <span aria-hidden>▴</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating row (visible only when flipped) */}
      <div
        className={`grid grid-cols-4 gap-2 mt-5 transition-all duration-300 ${flipped && !rated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        {RATINGS.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRate(r.value)}
            className="group flex flex-col items-center justify-center gap-0.5 rounded-lg bg-paper-sunk border border-rule hover:border-ink-soft active:scale-[0.97] transition py-3"
          >
            <span className={`text-base font-semibold ${r.accent}`}>{r.label}</span>
            <span className="text-xs tracking-[0.04em] uppercase text-ink-muted font-medium">
              {r.sub}
            </span>
          </button>
        ))}
      </div>
      {rated && (
        <p className="mt-3 text-center text-xs tracking-[0.04em] uppercase text-ink-muted font-medium">
          Scheduled — scroll on
        </p>
      )}

      {/* Reference overlay */}
      {refOpen && (card.reference || card.referenceSection) && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          onClick={closeRef}
        >
          <div
            className={`absolute inset-0 bg-ink/40 backdrop-blur-sm ${refClosing ? "animate-fade-out" : "animate-fade-in"}`}
          />
          <div
            ref={refSheetRef}
            className={`relative w-full max-w-lg max-h-[65dvh] rounded-t-2xl bg-paper border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] ${refClosing ? "animate-slide-down" : "animate-slide-up"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div
              {...refDragHandle}
              className="flex justify-center pt-3 pb-1 touch-none cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pb-4 border-b border-rule/70">
              <div className="min-w-0 pr-4">
                <p className="text-xs tracking-[0.04em] uppercase text-bronze font-semibold mb-1">
                  Source reference
                </p>
                {card.source && (
                  <p className="text-sm text-ink-soft truncate">{card.source}</p>
                )}
                {card.referenceSection && (
                  <p className="text-base font-semibold text-ink mt-1">
                    {card.referenceSection}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeRef}
                className="shrink-0 mt-1 w-7 h-7 rounded-full bg-paper-sunk border border-rule flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
                aria-label="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {card.reference ? (
                <blockquote className="quote-block whitespace-pre-line">
                  {renderWithLinks(card.reference)}
                </blockquote>
              ) : (
                <p className="text-base text-ink-soft italic">
                  No reference text saved for this card.
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
