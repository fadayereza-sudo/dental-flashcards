"use client";

import { useState } from "react";

type Props = {
  card: {
    id: number;
    question: string;
    answer: string;
    source: string | null;
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
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-6">
                Question
              </p>
              <p className="text-[24px] leading-[1.3] text-ink">
                {card.question}
              </p>
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
            </div>
            <div className="flex items-center justify-between text-[10px] tracking-[0.18em] uppercase text-ink-muted pt-6 border-t border-rule/70">
              <span>Rate your recall</span>
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
    </div>
  );
}
