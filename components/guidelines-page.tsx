"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDragToClose } from "@/lib/use-drag-to-close";
import { useAnimatedSheet } from "@/lib/use-animated-sheet";
import { useBackCount } from "@/lib/use-back-count";
import { useBackClose } from "@/lib/use-back-close";
import {
  PrincipleToggleList,
  type CoreTruth,
} from "@/components/principle-toggles";
import { ManualMarkdown } from "@/components/manual-markdown";

type GuidelineIndex = {
  slug: string;
  title: string;
  organisation: string;
  order: number;
  description: string;
};

type Slide = {
  id: number;
  title: string;
  body: string;
};

type Workflow = {
  id: string;
  title: string;
  overview: string;
  slides: Slide[];
};

type Subject = {
  slug: string;
  title: string;
  order: number;
  description?: string;
  workflows: Workflow[];
  firstPrinciples: CoreTruth[];
};

type GuidelineDetail = {
  slug: string;
  title: string;
  organisation: string;
  order: number;
  description: string;
  subjects: Subject[];
};

type PlayerState = {
  categorySlug: string;
  subjectSlug: string;
  workflow: Workflow;
};

export function GuidelinesPage() {
  const [view, setView] = useState<"list" | "player">("list");
  const [guidelines, setGuidelines] = useState<GuidelineIndex[]>([]);
  const [categoryData, setCategoryData] = useState<
    Record<string, GuidelineDetail>
  >({});
  const [loading, setLoading] = useState(true);

  // Toggle hierarchy state — a single Set of expanded toggle IDs.
  //   cat:<slug>                                       — category open
  //   cat:<slug>:subj:<subjSlug>                       — subject open
  //   cat:<slug>:subj:<subjSlug>:section:workflows     — workflows sub-toggle
  //   cat:<slug>:subj:<subjSlug>:section:principles    — principles sub-toggle
  //   cat:<slug>:subj:<subjSlug>:wf:<id>               — workflow open
  //   cat:<slug>:subj:<subjSlug>:wf:<id>:overview      — workflow overview open
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Player state — set when user taps "Test" on a workflow
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Overview bottom sheet (player view) — animated open/close + drag-to-dismiss
  const [overviewOpen, setOverviewOpen] = useState(false);
  const resetOverview = useCallback(() => setOverviewOpen(false), []);
  const { closing: overviewClosing, close: closeOverview } = useAnimatedSheet(
    overviewOpen,
    resetOverview,
  );
  const { sheetRef: overviewSheetRef, handleProps: overviewDragHandle } =
    useDragToClose(resetOverview);

  // Track which first-principle toggle is open per (category, subject)
  const [openTruthBySubj, setOpenTruthBySubj] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/guidelines");
      const data = await res.json();
      setGuidelines(Array.isArray(data) ? data : []);
    } catch {
      setGuidelines([]);
    } finally {
      setLoading(false);
    }
  };

  const isExpanded = (id: string) => expanded.has(id);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Pop one toggle on a hardware back press: removes the most-recently
  // inserted entry from the Set (Sets preserve insertion order in JS).
  const popLastToggle = useCallback(() => {
    setExpanded((prev) => {
      if (prev.size === 0) return prev;
      const arr = [...prev];
      const next = new Set(arr);
      next.delete(arr[arr.length - 1]);
      return next;
    });
  }, []);
  useBackCount(view === "list" ? expanded.size : 0, popLastToggle);
  useBackClose(view === "player", () => {
    setView("list");
    setPlayer(null);
    setCurrentSlide(0);
    setOverviewOpen(false);
  });

  const toggleCategory = async (slug: string) => {
    const id = `cat:${slug}`;
    toggle(id);
    if (!categoryData[slug]) {
      try {
        const res = await fetch(`/api/guidelines/${slug}`);
        if (!res.ok) return;
        const data: GuidelineDetail = await res.json();
        setCategoryData((prev) => ({ ...prev, [slug]: data }));
      } catch (err) {
        console.error(`Failed to load guideline ${slug}`, err);
      }
    }
  };

  const toggleTruth = (catSlug: string, subjSlug: string) => (id: string) => {
    const key = `${catSlug}:${subjSlug}`;
    setOpenTruthBySubj((prev) => ({
      ...prev,
      [key]: prev[key] === id ? null : id,
    }));
  };

  const startTest = (
    categorySlug: string,
    subjectSlug: string,
    workflow: Workflow,
  ) => {
    if (workflow.slides.length === 0) return;
    setPlayer({ categorySlug, subjectSlug, workflow });
    setCurrentSlide(0);
    setView("player");
  };

  const exitPlayer = () => {
    setView("list");
    setPlayer(null);
    setCurrentSlide(0);
    setOverviewOpen(false);
  };

  const nextSlide = () => {
    if (!player) return;
    if (currentSlide < player.workflow.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const restart = () => setCurrentSlide(0);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-ink-muted text-sm tracking-wide uppercase">
          Loading…
        </span>
      </div>
    );
  }

  if (view === "player" && player) {
    const { workflow } = player;
    const isLastSlide = currentSlide === workflow.slides.length - 1;
    const slide = workflow.slides[currentSlide];

    return (
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 pointer-events-none bg-gradient-to-b from-paper via-paper to-transparent">
          <button
            onClick={exitPlayer}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink transition-colors"
            aria-label="Back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="flex-1 flex justify-center px-2">
            <h2 className="font-serif text-sm text-ink text-center truncate">
              {workflow.title}
            </h2>
          </div>
          <button
            onClick={() => setOverviewOpen(true)}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink transition-colors"
            aria-label="Overview"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h12v8H6l-3 3v-3H2V3z" strokeLinejoin="round" />
            </svg>
          </button>
        </header>

        {!isLastSlide && (
          <div className="absolute left-0 right-0 z-10 px-6 top-[calc(env(safe-area-inset-top)+3.75rem)]">
            <div className="w-full bg-rule/30 rounded-full h-1">
              <div
                className="h-full bg-bronze rounded-full transition-all"
                style={{
                  width: `${((currentSlide + 1) / workflow.slides.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-[calc(env(safe-area-inset-bottom)+10rem)] text-center overflow-hidden">
          {isLastSlide ? (
            <div className="space-y-4">
              <div className="font-serif text-2xl text-ink">Complete</div>
              <p className="text-sm text-ink-muted">
                You've worked through every step of this workflow.
              </p>
              <button
                onClick={restart}
                className="mt-6 rounded-full bg-accent-green text-paper px-5 py-2.5 text-sm tracking-wide uppercase font-medium hover:brightness-110 transition"
              >
                Restart
              </button>
            </div>
          ) : (
            <>
              <h3 className="font-serif text-lg text-ink mb-4 leading-relaxed max-w-lg">
                {slide.title}
              </h3>
              <p className="text-sm text-ink leading-relaxed max-w-lg mb-6">
                {slide.body}
              </p>
            </>
          )}
        </div>

        <div className="absolute inset-x-0 flex items-center justify-between px-4 gap-3 bottom-[calc(env(safe-area-inset-bottom)+5.75rem)]">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="inline-flex items-center justify-center rounded-full bg-paper-sunk border border-rule px-4 py-2.5 text-sm tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper transition-colors"
          >
            Back
          </button>
          <div className="text-xs text-ink-muted tracking-wide">
            {currentSlide + 1} / {workflow.slides.length}
          </div>
          <button
            onClick={nextSlide}
            disabled={isLastSlide}
            className="inline-flex items-center justify-center rounded-full bg-accent-green text-paper px-4 py-2.5 text-sm tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Next
          </button>
        </div>

        {(overviewOpen || overviewClosing) &&
          typeof document !== "undefined" &&
          createPortal(
            <>
              <div
                className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-[90] ${
                  overviewClosing ? "animate-fade-out" : "animate-fade-in"
                }`}
                onClick={closeOverview}
              />
              <div
                ref={overviewSheetRef}
                className={`fixed left-0 right-0 bottom-0 z-[95] bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] ${
                  overviewClosing ? "animate-slide-down" : "animate-slide-up"
                }`}
                style={{ maxHeight: "82dvh" }}
              >
                <div
                  className="flex flex-col max-h-[82dvh]"
                  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                >
                  <div
                    {...overviewDragHandle}
                    className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
                  >
                    <div className="w-10 h-1 rounded-full bg-rule" />
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <h3 className="font-serif text-lg text-ink mb-4">
                      Overview
                    </h3>
                    <ManualMarkdown source={workflow.overview} />
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5.5rem)] px-4">
      <header className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5">
        <h1 className="font-serif text-2xl text-ink">Guidelines</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-wide">
          Workflows and first principles from SDCEP, BSP, FGDP, DBOH
        </p>
      </header>

      {guidelines.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center px-8">
            <p className="text-sm text-ink-muted">
              No content yet. Run the{" "}
              <code className="text-xs bg-paper-sunk px-2 py-1 rounded">
                extract-guidelines-slides
              </code>{" "}
              skill to generate.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-3">
          {guidelines.map((cat) => {
            const catId = `cat:${cat.slug}`;
            const catOpen = isExpanded(catId);
            const data = categoryData[cat.slug];

            return (
              <div key={cat.slug} className="space-y-0">
                {/* Level 1: Category */}
                <button
                  onClick={() => toggleCategory(cat.slug)}
                  className="w-full text-left rounded-lg bg-[#2d2d2d] hover:bg-[#3a3a3a] text-white px-4 py-3 transition-colors flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm tracking-wide">
                      {cat.title}
                    </span>
                    {cat.description && (
                      <span className="text-[11px] text-white/60 mt-0.5">
                        {cat.description}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform flex-shrink-0 ml-3 ${
                      catOpen ? "rotate-90" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>

                {catOpen && data && (
                  <div className="pt-2 pl-3 border-l-2 border-[#2d2d2d] space-y-2">
                    {data.subjects.map((subj) => {
                      const subjId = `${catId}:subj:${subj.slug}`;
                      const subjOpen = isExpanded(subjId);
                      const wfSectionId = `${subjId}:section:workflows`;
                      const fpSectionId = `${subjId}:section:principles`;
                      const wfSectionOpen = isExpanded(wfSectionId);
                      const fpSectionOpen = isExpanded(fpSectionId);

                      return (
                        <div key={subj.slug}>
                          {/* Level 2: Subject */}
                          <button
                            onClick={() => toggle(subjId)}
                            className="w-full text-left rounded-lg bg-[#5a5a5a] hover:bg-[#6a6a6a] text-white px-3 py-2.5 transition-colors flex items-center justify-between"
                          >
                            <span className="font-medium text-sm tracking-wide">
                              {subj.title}
                            </span>
                            <svg
                              className={`w-4 h-4 transition-transform flex-shrink-0 ml-3 ${
                                subjOpen ? "rotate-90" : ""
                              }`}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </button>

                          {subjOpen && (
                            <div className="pt-2 pl-3 border-l border-[#5a5a5a] space-y-2">
                              {/* Level 3a: Workflows */}
                              {subj.workflows.length > 0 && (
                                <div>
                                  <button
                                    onClick={() => toggle(wfSectionId)}
                                    className="w-full text-left rounded-lg bg-paper-sunk hover:bg-paper transition-colors px-3 py-2 flex items-center justify-between"
                                  >
                                    <span className="text-sm text-ink font-medium tracking-wide">
                                      Workflows
                                      <span className="ml-2 text-[11px] text-ink-muted font-normal">
                                        {subj.workflows.length}
                                      </span>
                                    </span>
                                    <svg
                                      className={`w-4 h-4 transition-transform ${
                                        wfSectionOpen ? "rotate-90" : ""
                                      }`}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M9 6l6 6-6 6" />
                                    </svg>
                                  </button>

                                  {wfSectionOpen && (
                                    <div className="pt-2 pl-3 border-l border-rule space-y-2">
                                      {subj.workflows.map((wf) => {
                                        const wfId = `${subjId}:wf:${wf.id}`;
                                        const wfOpen = isExpanded(wfId);
                                        const overviewId = `${wfId}:overview`;
                                        const overviewOpen = isExpanded(
                                          overviewId,
                                        );

                                        return (
                                          <div key={wf.id}>
                                            {/* Level 4: individual workflow */}
                                            <button
                                              onClick={() => toggle(wfId)}
                                              className="w-full text-left rounded-lg bg-paper hover:bg-paper-sunk transition-colors border border-rule px-3 py-2 flex items-start justify-between gap-3"
                                            >
                                              <span className="text-sm text-ink flex-1">
                                                {wf.title}
                                              </span>
                                              <svg
                                                className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                                                  wfOpen ? "rotate-90" : ""
                                                }`}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                              >
                                                <path d="M9 6l6 6-6 6" />
                                              </svg>
                                            </button>

                                            {wfOpen && (
                                              <div className="pt-2 pl-3 border-l border-rule/60 space-y-2">
                                                {/* Level 5a: Overview */}
                                                <div>
                                                  <button
                                                    onClick={() =>
                                                      toggle(overviewId)
                                                    }
                                                    className="w-full text-left rounded-md bg-paper-sunk hover:bg-paper transition-colors px-3 py-2 flex items-center justify-between"
                                                  >
                                                    <span className="text-xs text-ink uppercase tracking-[0.12em]">
                                                      Overview
                                                    </span>
                                                    <svg
                                                      className={`w-3.5 h-3.5 transition-transform ${
                                                        overviewOpen
                                                          ? "rotate-90"
                                                          : ""
                                                      }`}
                                                      viewBox="0 0 24 24"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                    >
                                                      <path d="M9 6l6 6-6 6" />
                                                    </svg>
                                                  </button>
                                                  {overviewOpen && (
                                                    <div className="mt-2 px-3 py-3 bg-paper rounded-md">
                                                      <ManualMarkdown
                                                        source={wf.overview}
                                                      />
                                                    </div>
                                                  )}
                                                </div>

                                                {/* Level 5b: Test (button — launches slideshow) */}
                                                <button
                                                  onClick={() =>
                                                    startTest(
                                                      cat.slug,
                                                      subj.slug,
                                                      wf,
                                                    )
                                                  }
                                                  disabled={
                                                    wf.slides.length === 0
                                                  }
                                                  className="w-full text-left rounded-md bg-accent-green text-paper hover:brightness-110 transition px-3 py-2 flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                  <span className="text-xs uppercase tracking-[0.12em] font-medium">
                                                    Test
                                                    {wf.slides.length > 0 && (
                                                      <span className="ml-2 text-[11px] opacity-70 font-normal">
                                                        {wf.slides.length} slides
                                                      </span>
                                                    )}
                                                  </span>
                                                  <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                  >
                                                    <path d="M9 6l6 6-6 6" />
                                                  </svg>
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Level 3b: First Principles */}
                              {subj.firstPrinciples.length > 0 && (
                                <div>
                                  <button
                                    onClick={() => toggle(fpSectionId)}
                                    className="w-full text-left rounded-lg bg-paper-sunk hover:bg-paper transition-colors px-3 py-2 flex items-center justify-between"
                                  >
                                    <span className="text-sm text-ink font-medium tracking-wide">
                                      First Principles
                                      <span className="ml-2 text-[11px] text-ink-muted font-normal">
                                        {subj.firstPrinciples.length}
                                      </span>
                                    </span>
                                    <svg
                                      className={`w-4 h-4 transition-transform ${
                                        fpSectionOpen ? "rotate-90" : ""
                                      }`}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M9 6l6 6-6 6" />
                                    </svg>
                                  </button>

                                  {fpSectionOpen && (
                                    <div className="pt-2 pl-3 border-l border-rule">
                                      <PrincipleToggleList
                                        truths={subj.firstPrinciples}
                                        category={`${cat.title} · ${subj.title}`}
                                        openTruthId={
                                          openTruthBySubj[
                                            `${cat.slug}:${subj.slug}`
                                          ] ?? null
                                        }
                                        onToggle={toggleTruth(
                                          cat.slug,
                                          subj.slug,
                                        )}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
