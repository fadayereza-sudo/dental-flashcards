"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: number;
  question: string;
  note: string;
  folderPath: string;
  updatedAt: string;
};

export function CommentsView() {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearingId, setClearingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setError(null);
    fetch("/api/comments", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((d: { comments: Comment[] }) => setComments(d.comments))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clearComment = useCallback(
    async (id: number) => {
      if (!confirm("Clear this comment?")) return;
      setClearingId(id);
      try {
        const res = await fetch(`/api/cards/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: null }),
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        setComments((prev) => (prev ? prev.filter((c) => c.id !== id) : prev));
      } catch (e) {
        alert(e instanceof Error ? e.message : String(e));
      } finally {
        setClearingId(null);
      }
    },
    [],
  );

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 bg-paper/90 backdrop-blur-md border-b border-rule/60">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M7 2L3 6l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </Link>
        <h1 className="font-serif text-xl text-ink">Comments</h1>
        <div className="w-12" />
      </header>

      <div className="max-w-xl mx-auto px-5 py-6 space-y-4">
        {error ? (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-ink mb-2">
              Couldn&rsquo;t load comments
            </p>
            <p className="text-xs text-ink-muted break-all">{error}</p>
          </div>
        ) : comments === null ? (
          <p className="text-center text-sm tracking-wide uppercase text-ink-muted py-16">
            Loading…
          </p>
        ) : comments.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-ink mb-2">No comments yet</p>
            <p className="text-sm text-ink-muted max-w-xs mx-auto">
              Tap &ldquo;Add comment&rdquo; under a card while reviewing to jot
              down ideas here.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs tracking-wide uppercase text-ink-muted">
              {comments.length} comment{comments.length === 1 ? "" : "s"}
            </p>
            {comments.map((c) => (
              <article
                key={c.id}
                className="rounded-2xl border border-rule bg-paper-sunk p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] tracking-[0.12em] uppercase text-bronze mb-1">
                      {c.folderPath}
                    </p>
                    <p className="text-sm text-ink line-clamp-2">
                      {c.question}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => clearComment(c.id)}
                    disabled={clearingId === c.id}
                    className="shrink-0 text-[10px] tracking-[0.08em] uppercase text-ink-muted hover:text-accent-red transition-colors disabled:opacity-50"
                    aria-label="Clear comment"
                  >
                    {clearingId === c.id ? "Clearing…" : "Clear"}
                  </button>
                </div>
                <p className="text-[15px] leading-[1.6] text-ink whitespace-pre-line border-l-2 border-bronze/40 pl-4">
                  {c.note}
                </p>
                <p className="mt-3 text-[10px] tracking-[0.08em] uppercase text-ink-muted">
                  {new Date(c.updatedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
