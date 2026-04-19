"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flashcard } from "./flashcard";
import { FilterDrawer } from "./filter-drawer";
import { CardEditor, type CardEditorValue } from "./card-editor";
import { useAnimatedSheet } from "@/lib/use-animated-sheet";

type Card = {
  id: number;
  question: string;
  answer: string;
  source: string | null;
  image: string | null;
  reference: string | null;
  referenceSection: string | null;
  note: string | null;
  folderId: number;
  due: string;
  state: number;
  reps: number;
};

type FolderTree = {
  tree: Array<{
    id: number;
    name: string;
    deletedAt?: string | null;
    children: Array<{
      id: number;
      name: string;
      cardCount: number;
      deletedAt?: string | null;
    }>;
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
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tree, setTree] = useState<FolderTree["tree"]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editorInitial, setEditorInitial] = useState<CardEditorValue | null>(null);
  const [noteCardId, setNoteCardId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [undoCardId, setUndoCardId] = useState<number | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(loadSelectedFolders());
    setInitialized(true);
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({ limit: "500" });
    if (selected.length > 0) params.set("folders", selected.join(","));
    try {
      const res = await fetch(`/api/cards/due?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setCards(data.cards ?? []);
      setReviewedIds(new Set());
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

  const refreshTree = useCallback(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((d: FolderTree) => setTree(d.tree ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  // Prune any selected chapter ids that no longer exist in the active tree
  // (happens when a chapter is soft-deleted elsewhere).
  useEffect(() => {
    if (!initialized || tree.length === 0) return;
    const active = new Set<number>();
    for (const root of tree) {
      if (root.deletedAt) continue;
      for (const c of root.children) {
        if (!c.deletedAt) active.add(c.id);
      }
    }
    const pruned = selected.filter((id) => active.has(id));
    if (pruned.length !== selected.length) {
      setSelected(pruned);
      localStorage.setItem("selectedFolders", JSON.stringify(pruned));
    }
  }, [tree, initialized, selected]);

  const onRate = useCallback(
    async (cardId: number, rating: number, index: number) => {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, rating }),
      });
      setReviewedIds((prev) => {
        if (prev.has(cardId)) return prev;
        const updated = new Set(prev);
        updated.add(cardId);
        return updated;
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

  const openCreate = useCallback(() => {
    setEditorMode("create");
    setEditorInitial({
      folderId: null,
      question: "",
      answer: "",
      source: "",
      image: "",
      reference: "",
      referenceSection: "",
    });
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((card: Card) => {
    setEditorMode("edit");
    setEditorInitial({
      id: card.id,
      folderId: card.folderId,
      question: card.question,
      answer: card.answer,
      source: card.source ?? "",
      image: card.image ?? "",
      reference: card.reference ?? "",
      referenceSection: card.referenceSection ?? "",
    });
    setEditorOpen(true);
  }, []);

  const onEditorSaved = useCallback(
    async (_saved: { id: number }) => {
      setEditorOpen(false);
      refreshTree();
      await fetchCards();
    },
    [fetchCards, refreshTree],
  );

  const onEditorDeleted = useCallback(
    (id: number) => {
      setEditorOpen(false);
      setCards((prev) => prev.filter((c) => c.id !== id));
      refreshTree();
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      setUndoCardId(id);
      undoTimerRef.current = setTimeout(() => {
        setUndoCardId((curr) => (curr === id ? null : curr));
      }, 6000);
    },
    [refreshTree],
  );

  const dismissUndo = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoCardId(null);
  }, []);

  const undoDelete = useCallback(async () => {
    if (undoCardId === null) return;
    const id = undoCardId;
    dismissUndo();
    try {
      const res = await fetch(`/api/cards/${id}/restore`, { method: "POST" });
      if (!res.ok) return;
      refreshTree();
      await fetchCards();
    } catch {
      // silent; user can still recover from trash view
    }
  }, [undoCardId, dismissUndo, refreshTree, fetchCards]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const openNote = useCallback((card: Card) => {
    setNoteCardId(card.id);
    setNoteDraft(card.note ?? "");
    setNoteError(null);
  }, []);

  const resetNote = useCallback(() => {
    setNoteCardId(null);
    setNoteDraft("");
    setNoteError(null);
    setNoteSaving(false);
  }, []);

  const { closing: noteClosing, close: closeNote } = useAnimatedSheet(
    noteCardId !== null,
    resetNote,
  );

  const saveNote = useCallback(async () => {
    if (noteCardId === null) return;
    setNoteSaving(true);
    setNoteError(null);
    const trimmed = noteDraft.trim();
    try {
      const res = await fetch(`/api/cards/${noteCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmed === "" ? null : trimmed }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setCards((prev) =>
        prev.map((c) =>
          c.id === noteCardId ? { ...c, note: trimmed === "" ? null : trimmed } : c,
        ),
      );
      closeNote();
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : String(err));
      setNoteSaving(false);
    }
  }, [noteCardId, noteDraft, closeNote]);

  const noteCard =
    noteCardId === null ? null : cards.find((c) => c.id === noteCardId) ?? null;

  const sessionTotal = cards.length;
  const sessionDone = reviewedIds.size;

  const selectedCardCount = (() => {
    if (selected.length === 0) return 0;
    const ids = new Set(selected);
    let total = 0;
    for (const root of tree) {
      for (const c of root.children) {
        if (ids.has(c.id)) total += c.cardCount;
      }
    }
    return total;
  })();

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
            <span className="text-bronze">· {selectedCardCount}</span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink"
            aria-label="New card"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/comments"
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink"
            aria-label="Comments"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 3h10v6H5l-2 2V9H2V3z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/stats"
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink"
            aria-label="Progress"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 12V6M6 12V2M10 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <div
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-paper/80 backdrop-blur-md px-3.5 py-2 text-xs tracking-wide uppercase text-ink-soft border border-rule/60 shadow-sm"
            aria-label={`${sessionDone} of ${sessionTotal} reviewed`}
          >
            <span className="font-mono text-ink">{sessionDone}</span>
            <span className="font-mono text-ink-muted">/ {sessionTotal}</span>
          </div>
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
              className="snap-item h-[100dvh] w-full flex flex-col items-center justify-center gap-3 px-5 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+4rem)]"
            >
              <Flashcard
                card={c}
                onRate={(rating) => onRate(c.id, rating, i)}
                onEdit={() => openEdit(c)}
              />
              <button
                type="button"
                onClick={() => openNote(c)}
                className="inline-flex items-center gap-2 rounded-full bg-paper-sunk border border-rule px-3.5 py-1.5 text-[10px] tracking-[0.08em] uppercase text-ink-muted hover:text-ink transition-colors"
                aria-label={c.note ? "Edit comment on this card" : "Add comment to this card"}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M2 3h12v8H6l-3 3v-3H2V3z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                {c.note ? "Edit comment" : "Add comment"}
                {c.note && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-bronze"
                    aria-hidden
                  />
                )}
              </button>
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
        onTreeChanged={async () => {
          refreshTree();
          await fetchCards();
        }}
      />
      <CardEditor
        open={editorOpen}
        mode={editorMode}
        tree={tree}
        initial={editorInitial}
        onClose={() => setEditorOpen(false)}
        onSaved={onEditorSaved}
        onDeleted={onEditorDeleted}
        onTreeChanged={refreshTree}
      />

      {undoCardId !== null && (
        <div className="fixed left-0 right-0 z-50 flex justify-center pointer-events-none bottom-[calc(env(safe-area-inset-bottom)+1rem)]">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink text-paper px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <span className="text-xs tracking-wide uppercase">Card deleted</span>
            <button
              onClick={undoDelete}
              className="rounded-full border border-paper/40 px-3 py-1 text-[11px] tracking-wide uppercase hover:bg-paper/10"
            >
              Undo
            </button>
            <button
              onClick={dismissUndo}
              className="text-paper/60 hover:text-paper"
              aria-label="Dismiss"
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path
                  d="M1 1l8 8M9 1l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {noteCard && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={closeNote}
        >
          <div
            className={`absolute inset-0 bg-ink/40 backdrop-blur-sm ${noteClosing ? "animate-fade-out" : "animate-fade-in"}`}
          />
          <div
            className={`relative w-full max-w-lg max-h-[85dvh] rounded-t-2xl bg-paper border-t border-rule shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden ${noteClosing ? "animate-slide-down" : "animate-slide-up"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
            </div>

            <div className="flex items-start justify-between px-6 pb-4 border-b border-rule/70">
              <div className="min-w-0 pr-4">
                <p className="text-[10px] tracking-[0.12em] uppercase text-bronze mb-1">
                  Comment on card
                </p>
                <p className="text-sm text-ink line-clamp-2">
                  {noteCard.question}
                </p>
              </div>
              <button
                type="button"
                onClick={closeNote}
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

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="What would improve this card or the app? e.g. rewrite the question, add an image, fix a typo, new feature idea…"
                rows={8}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[15px] leading-[1.6] text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink-soft resize-none"
                autoFocus
              />
              {noteError && (
                <p className="mt-3 text-xs text-accent-red break-all">{noteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-rule/70">
              <button
                type="button"
                onClick={closeNote}
                disabled={noteSaving}
                className="rounded-full px-4 py-2 text-xs tracking-wide uppercase text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                disabled={noteSaving}
                className="rounded-full bg-ink text-paper px-5 py-2 text-xs tracking-wide uppercase disabled:opacity-50"
              >
                {noteSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
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
