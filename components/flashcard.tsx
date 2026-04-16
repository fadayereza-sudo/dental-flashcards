"use client";

import { useState } from "react";

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
};

const RATINGS = [
  { value: 1, label: "Again", sub: "forgot",   accent: "text-accent-red"   },
  { value: 2, label: "Hard",  sub: "struggled", accent: "text-bronze"       },
  { value: 3, label: "Good",  sub: "got it",    accent: "text-ink"          },
  { value: 4, label: "Easy",  sub: "instant",   accent: "text-accent-green" },
] as const;

export function Flashcard({ card, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [rated, setRated] = useState(false);
  const [refOpen, setRefOpen] = useState(false);

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

  return (
    <div
      className="relative w-full max-w-md"
      style={{ perspective: "1400px" }}
    >
      {/* Card meta above */}
      <div className="flex items-center justify-between px-1 pb-3 text-[10px] tracking-[0.18em] uppercase text-ink-muted">
        <span>{stateLabel}</span>
        {card.source && (
          <span className="truncate max-w-[60%] text-right">{card.source}</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="block w-full text-left"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <div
          className={`flip-3d relative w-full min-h-[60vh] rounded-[20px] border border-rule bg-paper-sunk shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_40px_-28px_rgba(28,25,23,0.35)] ${flipped ? "flipped" : ""}`}
        >
          {/* Front */}
          <div className="flip-face absolute inset-0 p-8 flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-6">
                Question
              </p>
              <p className="text-[24px] leading-[1.3] text-ink">
                {card.question}
              </p>
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  className="mt-4 w-full rounded-lg border border-rule/50"
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-ink-muted pt-6 border-t border-rule/70">
              <span>Tap to reveal</span>
              <span aria-hidden>▾</span>
            </div>
          </div>

          {/* Back */}
          <div className="flip-face flip-back absolute inset-0 p-8 flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-6">
                Answer &amp; Reasoning
              </p>
              <p className="text-[18px] leading-[1.5] text-ink">
                {card.answer}
              </p>
              {card.image && (
                <img
                  src={card.image}
                  alt=""
                  className="mt-4 w-full rounded-lg border border-rule/50"
                />
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-ink-muted pt-6 border-t border-rule/70">
              {card.reference ? (
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
                  View reference
                </button>
              ) : (
                <span>Rate your recall</span>
              )}
              <span aria-hidden>▴</span>
            </div>
          </div>
        </div>
      </button>

      {/* Rating row (visible only when flipped) */}
      <div
        className={`grid grid-cols-4 gap-2 mt-5 transition-all duration-300 ${flipped && !rated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        {RATINGS.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRate(r.value)}
            className="group flex flex-col items-center justify-center gap-0.5 rounded-2xl bg-paper-sunk border border-rule hover:border-ink-soft active:scale-[0.97] transition py-3"
          >
            <span className={`text-base font-medium ${r.accent}`}>{r.label}</span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-ink-muted">
              {r.sub}
            </span>
          </button>
        ))}
      </div>
      {rated && (
        <p className="mt-3 text-center text-[10px] tracking-[0.18em] uppercase text-ink-muted">
          Scheduled — scroll on
        </p>
      )}

      {/* Reference overlay */}
      {refOpen && card.reference && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setRefOpen(false)}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[85dvh] rounded-t-2xl bg-paper border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pb-4 border-b border-rule/70">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-1">
                  Source reference
                </p>
                {card.source && (
                  <p className="text-xs text-ink-soft truncate">{card.source}</p>
                )}
                {card.referenceSection && (
                  <p className="text-sm font-medium text-ink mt-1">
                    {card.referenceSection}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setRefOpen(false)}
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
              <blockquote className="text-[15px] leading-[1.7] text-ink whitespace-pre-line border-l-2 border-bronze/40 pl-4">
                {card.reference}
              </blockquote>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
