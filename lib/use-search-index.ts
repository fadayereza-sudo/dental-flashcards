"use client";

import { useEffect, useState } from "react";
import type {
  SearchIndex,
  SearchPrincipleItem,
  SearchWorkflowItem,
  SearchGuidelinePrincipleItem,
} from "@/app/api/search/route";

export type {
  SearchIndex,
  SearchPrincipleItem,
  SearchWorkflowItem,
  SearchGuidelinePrincipleItem,
};

let cache: SearchIndex | null = null;
let inflight: Promise<SearchIndex | null> | null = null;
const subscribers = new Set<() => void>();

async function fetchOnce(): Promise<SearchIndex | null> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/search");
      if (!res.ok) return null;
      const data = (await res.json()) as SearchIndex;
      cache = data;
      for (const fn of subscribers) fn();
      return data;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

// Manually invalidate the cache (e.g., after content changes in-session).
export function invalidateSearchIndex() {
  cache = null;
  for (const fn of subscribers) fn();
}

// Hook: returns the search index. Triggers a fetch when `enabled` becomes true.
export function useSearchIndex(enabled: boolean): SearchIndex | null {
  const [, setTick] = useState(0);

  useEffect(() => {
    const notify = () => setTick((n) => n + 1);
    subscribers.add(notify);
    return () => {
      subscribers.delete(notify);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (cache) return;
    void fetchOnce();
  }, [enabled]);

  return cache;
}

// Lowercase, collapse whitespace.
export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

// Score matches: title hits beat body hits. Returns null when nothing matches.
export function matchScore(query: string, ...fields: (string | undefined)[]): number | null {
  const q = normalizeQuery(query);
  if (!q) return null;
  let score = 0;
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (!f) continue;
    const idx = f.toLowerCase().indexOf(q);
    if (idx >= 0) {
      // Earlier fields are weighted more heavily (caller orders by importance).
      score += (fields.length - i) * 10;
      // Match at start of field is worth more than later in the field.
      if (idx === 0) score += 5;
    }
  }
  return score > 0 ? score : null;
}

// Build a snippet showing the match in context.
export function buildSnippet(text: string, query: string, radius = 80): string {
  if (!text) return "";
  const q = normalizeQuery(query);
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) {
    return text.length > radius * 2
      ? text.slice(0, radius * 2).trimEnd() + "…"
      : text;
  }
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + q.length + radius);
  let out = text.slice(start, end);
  if (start > 0) out = "…" + out.replace(/^\S*\s+/, "");
  if (end < text.length) out = out.replace(/\s+\S*$/, "") + "…";
  return out;
}
