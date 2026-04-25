"use client";

const PILLS = [
  { id: 0, label: "Flashcards" },
  { id: 1, label: "Principles" },
  { id: 2, label: "Guidelines" },
];

interface PillSwitchProps {
  active: number;
  onSelect: (index: number) => void;
}

export function PillSwitch({ active, onSelect }: PillSwitchProps) {
  return (
    <div
      className="fixed z-30 flex gap-1 rounded-full bg-paper/90 backdrop-blur-md border border-rule/60 shadow-sm p-1"
      style={{
        top: "max(env(safe-area-inset-top), 12px)",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {PILLS.map((pill) => (
        <button
          key={pill.id}
          onClick={() => onSelect(pill.id)}
          className={`px-3.5 py-1.5 text-xs tracking-wide uppercase rounded-full transition-colors whitespace-nowrap ${
            active === pill.id
              ? "bg-ink text-paper font-medium"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
