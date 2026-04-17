"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Stats = {
  now: string;
  cards: {
    total: number;
    byState: { new: number; learning: number; review: number; relearning: number };
    dueNow: number;
    dueIn24h: number;
  };
  reviews: {
    total: number;
    accuracy: number | null;
    byDay: Array<{
      day: string;
      count: number;
      again: number;
      hard: number;
      good: number;
      easy: number;
    }>;
  };
};

export function StatsView() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.json();
      })
      .then((d: Stats) => setData(d))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-serif text-2xl text-ink">Couldn&rsquo;t load stats</p>
        <p className="text-xs text-ink-muted break-all max-w-xs">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-ink-muted text-sm tracking-wide uppercase">Loading…</span>
      </div>
    );
  }

  const maxPerDay = Math.max(1, ...data.reviews.byDay.map((d) => d.count));

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 bg-paper/90 backdrop-blur-md border-b border-rule/60">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-ink-soft hover:text-ink"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <h1 className="font-serif text-xl text-ink">Progress</h1>
        <div className="w-12" />
      </header>

      <div className="max-w-xl mx-auto px-5 py-6 space-y-6">
        <Summary data={data} />
        <DailyChart
          byDay={data.reviews.byDay}
          maxPerDay={maxPerDay}
          accuracy={data.reviews.accuracy}
        />
        <StateBreakdown data={data.cards.byState} total={data.cards.total} />
      </div>
    </div>
  );
}

function Summary({ data }: { data: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Stat label="Cards" value={data.cards.total.toString()} />
      <Stat label="Due now" value={data.cards.dueNow.toString()} />
      <Stat label="Due 24h" value={data.cards.dueIn24h.toString()} />
      <Stat
        label="Reviews"
        value={data.reviews.total.toString()}
        sub={
          data.reviews.accuracy !== null
            ? `${Math.round(data.reviews.accuracy * 100)}% success`
            : undefined
        }
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-rule bg-paper-sunk px-4 py-3">
      <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-1">
        {label}
      </p>
      <p className="font-serif text-3xl text-ink">{value}</p>
      {sub && (
        <p className="text-[11px] text-ink-muted mt-1">{sub}</p>
      )}
    </div>
  );
}

function DailyChart({
  byDay,
  maxPerDay,
  accuracy,
}: {
  byDay: Stats["reviews"]["byDay"];
  maxPerDay: number;
  accuracy: number | null;
}) {
  const total = byDay.reduce((s, d) => s + d.count, 0);
  return (
    <div className="rounded-2xl border border-rule bg-paper-sunk p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] tracking-[0.22em] uppercase text-bronze">
          Reviews · last 30 days
        </p>
        <p className="text-[11px] text-ink-muted">
          {total} total
          {accuracy !== null && ` · ${Math.round(accuracy * 100)}% hit rate`}
        </p>
      </div>
      <div className="flex items-end gap-[2px] h-32">
        {byDay.map((d) => {
          const h = d.count === 0 ? 2 : Math.max(4, (d.count / maxPerDay) * 128);
          const label = `${d.day}: ${d.count} (${d.good + d.easy} hit)`;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col justify-end"
              title={label}
              aria-label={label}
            >
              <div
                className="w-full rounded-t-sm bg-ink/70 relative"
                style={{ height: `${h}px` }}
              >
                {d.count > 0 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-accent-red/80"
                    style={{
                      height: `${(d.again / d.count) * h}px`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-ink-muted">
        <span>{byDay[0]?.day.slice(5)}</span>
        <span>{byDay[byDay.length - 1]?.day.slice(5)}</span>
      </div>
    </div>
  );
}

function StateBreakdown({
  data,
  total,
}: {
  data: Stats["cards"]["byState"];
  total: number;
}) {
  const items: Array<{
    label: string;
    sub: string;
    value: number;
    accent: string;
    text: string;
  }> = [
    {
      label: "New",
      sub: "never studied",
      value: data.new,
      accent: "bg-ink-muted/40",
      text: "text-ink-muted",
    },
    {
      label: "Learning",
      sub: "first grasp",
      value: data.learning,
      accent: "bg-bronze/70",
      text: "text-bronze",
    },
    {
      label: "Review",
      sub: "held in memory",
      value: data.review,
      accent: "bg-accent-green/70",
      text: "text-accent-green",
    },
    {
      label: "Relearning",
      sub: "forgotten, rebuilding",
      value: data.relearning,
      accent: "bg-accent-red/70",
      text: "text-accent-red",
    },
  ];
  return (
    <div>
      <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-3 px-1">
        Card state
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => {
          const pct = total > 0 ? Math.round((it.value / total) * 100) : 0;
          return (
            <div
              key={it.label}
              className="relative rounded-2xl border border-rule bg-paper-sunk px-4 py-3 pl-5 overflow-hidden"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 bottom-0 w-1 ${it.accent}`}
              />
              <p className={`text-[10px] tracking-[0.18em] uppercase ${it.text}`}>
                {it.label}
              </p>
              <p className="font-serif text-3xl text-ink mt-1">{it.value}</p>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {pct}% · {it.sub}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

