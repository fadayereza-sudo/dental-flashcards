"use client";

import { useEffect, useRef, useState } from "react";
import { useBackClose } from "@/lib/use-back-close";
import { useDragToClose } from "@/lib/use-drag-to-close";

export type SearchCard = {
  id: number;
  question: string;
  answer: string;
  source: string | null;
  image: string | null;
  reference: string | null;
  referenceSection: string | null;
  note: string | null;
  tag: string | null;
  folderId: number;
  due: string;
  state: number;
  reps: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (card: SearchCard) => void;
};

export function SearchOverlay({ open, onClose, onPick }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryToken = useRef(0);

  useBackClose(open, onClose);
  const { sheetRef, handleProps } = useDragToClose(onClose);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setResults([]);
    setError(null);
    const t = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const token = ++queryToken.current;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/cards/search?q=${encodeURIComponent(trimmed)}&limit=20`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        if (token !== queryToken.current) return;
        setResults(data.cards ?? []);
        setError(null);
      } catch (e) {
        if (token !== queryToken.current) return;
        setError(e instanceof Error ? e.message : String(e));
        setResults([]);
      } finally {
        if (token === queryToken.current) setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [q, open]);

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        ref={sheetRef}
        className={`fixed left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "92dvh" }}
      >
        <div className="flex flex-col max-h-[92dvh]">
          <div
            {...handleProps}
            className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-1 rounded-full bg-rule" />
          </div>

          <div className="px-6 pb-4 flex items-center gap-3">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="shrink-0 text-ink-muted"
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search question, answer, source"
              className="flex-1 bg-transparent text-[17px] text-ink placeholder:text-ink-muted focus:outline-none"
              autoComplete="off"
            />
            <button
              onClick={onClose}
              className="text-xs tracking-wide uppercase text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border-t border-rule/60">
            {error ? (
              <p className="px-6 py-6 text-sm text-accent-red break-all">{error}</p>
            ) : q.trim().length < 2 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">
                Type at least 2 characters to search.
              </p>
            ) : loading ? (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">
                Searching…
              </p>
            ) : results.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-muted">
                No matches.
              </p>
            ) : (
              <ul className="divide-y divide-rule/50">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onPick(c)}
                      className="w-full text-left px-6 py-4 hover:bg-paper-sunk/70 transition-colors"
                    >
                      <p className="text-[15px] leading-[1.4] text-ink line-clamp-2">
                        {c.question}
                      </p>
                      {(c.source || c.referenceSection) && (
                        <p className="mt-1 text-[11px] tracking-wide uppercase text-ink-muted truncate">
                          {c.source || c.referenceSection}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
