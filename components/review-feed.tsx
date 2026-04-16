"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flashcard } from "./flashcard";
import { FilterDrawer } from "./filter-drawer";

type Card = {
  id: number;
  question: string;
  answer: string;
  source: string | null;
  folderId: number;
  due: string;
  state: number;
  reps: number;
};

type FolderTree = {
  tree: Array<{
    id: number;
    name: string;
    children: Array<{ id: number; name: string; cardCount: number }>;
  }>;
};

function loadSelectedFolders(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("selectedFolders");
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => Number.isFinite(n)) : [];
  } catch {
    return [];
  }
}

export function ReviewFeed() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tree, setTree] = useState<FolderTree["tree"]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(loadSelectedFolders());
    setInitialized(true);
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const qs =
      selected.length > 0 ? `?folders=${selected.join(",")}` : "";
    try {
      const res = await fetch(`/api/cards/due${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setCards(data.cards ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    if (!initialized) return;
    fetchCards();
  }, [initialized, fetchCards]);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((d: FolderTree) => setTree(d.tree ?? []))
      .catch(() => {});
  }, []);

  const onRate = useCallback(
    async (cardId: number, rating: number, index: number) => {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, rating }),
      });
      // Advance to the next card visually
      const next = scrollerRef.current?.children[index + 1] as
        | HTMLElement
        | undefined;
      next?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  const onApplyFilters = useCallback((next: number[]) => {
    setSelected(next);
    localStorage.setItem("selectedFolders", JSON.stringify(next));
    setDrawerOpen(false);
  }, []);

  const dueCount = cards.filter((c) => new Date(c.due) <= new Date()).length;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 pointer-events-none">
        <button
          onClick={() => setDrawerOpen(true)}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-paper/80 backdrop-blur-md px-3.5 py-2 text-xs tracking-wide uppercase text-ink-soft border border-rule/60 shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 2h10M3 6h6M5 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filter
          {selected.length > 0 && (
            <span className="text-bronze">· {selected.length}</span>
          )}
        </button>
        <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-paper/80 backdrop-blur-md px-3.5 py-2 text-xs tracking-wide uppercase text-ink-soft border border-rule/60 shadow-sm">
          <span className="font-mono text-ink">{dueCount}</span>
          <span>due</span>
        </div>
      </header>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-ink-muted text-sm tracking-wide uppercase">
            Loading…
          </span>
        </div>
      ) : fetchError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
          <p className="font-serif text-2xl text-ink">Couldn&rsquo;t load cards</p>
          <p className="text-xs text-ink-muted break-all max-w-xs">
            {fetchError}
          </p>
          <button
            onClick={fetchCards}
            className="mt-2 rounded-full bg-ink text-paper px-5 py-2.5 text-sm tracking-wide uppercase"
          >
            Retry
          </button>
        </div>
      ) : cards.length === 0 ? (
        <EmptyState selectedCount={selected.length} />
      ) : (
        <div
          ref={scrollerRef}
          className="snap-feed absolute inset-0 overflow-y-auto"
        >
          {cards.map((c, i) => (
            <div
              key={c.id}
              className="snap-item h-[100dvh] w-full flex items-center justify-center px-5 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+4rem)]"
            >
              <Flashcard
                card={c}
                onRate={(rating) => onRate(c.id, rating, i)}
              />
            </div>
          ))}
          <div className="snap-item h-[100dvh] w-full flex items-center justify-center px-5 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+4rem)]">
            <EndOfFeed onRefresh={fetchCards} />
          </div>
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tree={tree}
        selected={selected}
        onApply={onApplyFilters}
      />
    </div>
  );
}

function EmptyState({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
      <p className="font-serif text-3xl text-ink">Nothing due.</p>
      <p className="text-sm text-ink-muted max-w-xs">
        {selectedCount > 0
          ? "No cards match your selected folders, or all of them are scheduled for later."
          : "Every card in the deck is scheduled for later. Come back when you're notified."}
      </p>
    </div>
  );
}

function EndOfFeed({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="font-serif text-3xl text-ink">End of session.</p>
      <p className="text-sm text-ink-muted max-w-xs">
        Every due card has been seen. Rest, or refresh to pull newly-due cards.
      </p>
      <button
        onClick={onRefresh}
        className="mt-2 rounded-full bg-ink text-paper px-5 py-2.5 text-sm tracking-wide uppercase"
      >
        Refresh
      </button>
    </div>
  );
}
