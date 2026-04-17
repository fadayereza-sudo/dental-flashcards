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
    value: number;
    bar: string;
    text: string;
    desc: string;
  }> = [
    {
      label: "New",
      value: data.new,
      bar: "bg-ink-muted/50",
      text: "text-ink-muted",
      desc: "Never studied. FSRS hasn't scheduled these yet.",
    },
    {
      label: "Learning",
      value: data.learning,
      bar: "bg-bronze/80",
      text: "text-bronze",
      desc: "Just introduced — short intervals until recall is reliable.",
    },
    {
      label: "Review",
      value: data.review,
      bar: "bg-accent-green/80",
      text: "text-accent-green",
      desc: "Held in memory. Intervals grow each time you recall it.",
    },
    {
      label: "Relearning",
      value: data.relearning,
      bar: "bg-accent-red/80",
      text: "text-accent-red",
      desc: "You recently forgot it. Back to short intervals until it sticks.",
    },
  ];
  return (
    <div className="rounded-2xl border border-rule bg-paper-sunk p-4">
      <p className="text-[10px] tracking-[0.22em] uppercase text-bronze mb-1">
        Card state
      </p>
      <p className="text-[12px] text-ink-muted mb-4">
        FSRS moves each card through these stages as you rate your recall
        (Again, Hard, Good, Easy).
      </p>
      <div className="space-y-3">
        {items.map((it) => {
          const pct = total > 0 ? (it.value / total) * 100 : 0;
          const pctLabel = total > 0 ? Math.round(pct) : 0;
          return (
            <div key={it.label}>
              <div className="flex items-baseline justify-between mb-1">
                <span className={`text-[11px] tracking-[0.18em] uppercase ${it.text}`}>
                  {it.label}
                </span>
                <span className="text-[12px] text-ink-soft">
                  <span className="font-mono text-ink">{it.value}</span>
                  <span className="text-ink-muted"> · {pctLabel}%</span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-rule/50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${it.bar} transition-[width] duration-500`}
                  style={{ width: `${pct}%` }}
                  aria-label={`${it.label}: ${it.value} (${pctLabel}%)`}
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1">{it.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

