"use client";

import { useEffect, useState, useRef } from "react";
import { useDragToClose } from "@/lib/use-drag-to-close";
import { useAnimatedSheet } from "@/lib/use-animated-sheet";

type Guideline = {
  id: string;
  title: string;
  organisation: string;
  year: number;
  description: string;
};

type Slide = {
  id: number;
  title: string;
  body: string;
};

type GuidelineDetail = {
  id: string;
  title: string;
  organisation: string;
  year: number;
  referenceText: string;
  slides: Slide[];
};

export function GuidelinesPage() {
  const [view, setView] = useState<"list" | "player">("list");
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [currentGuideline, setCurrentGuideline] = useState<GuidelineDetail | null>(
    null
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const { isOpen: refOpen, setIsOpen: setRefOpen } = useAnimatedSheet();

  const progressKey = (id: string) => `guideline-progress-${id}`;

  useEffect(() => {
    fetchGuidelines();
  }, []);

  useDragToClose(dragRef, () => setReferenceOpen(false));

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

  const openGuideline = async (guideline: Guideline) => {
    try {
      const res = await fetch(`/api/guidelines/${guideline.id}`);
      const data: GuidelineDetail = await res.json();

      const savedProgress = sessionStorage.getItem(progressKey(guideline.id));
      const savedSlide = savedProgress
        ? JSON.parse(savedProgress).slideIndex
        : 0;

      setCurrentGuideline(data);
      setCurrentSlide(savedSlide);
      setView("player");
    } catch (err) {
      console.error("Failed to load guideline:", err);
    }
  };

  const nextSlide = () => {
    if (!currentGuideline) return;
    if (currentSlide < currentGuideline.slides.length - 1) {
      const newIdx = currentSlide + 1;
      setCurrentSlide(newIdx);
      saveProgress(newIdx);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const newIdx = currentSlide - 1;
      setCurrentSlide(newIdx);
      saveProgress(newIdx);
    }
  };

  const saveProgress = (idx: number) => {
    if (!currentGuideline) return;
    sessionStorage.setItem(
      progressKey(currentGuideline.id),
      JSON.stringify({ slideIndex: idx })
    );
  };

  const backToList = () => {
    setView("list");
    setCurrentGuideline(null);
    setCurrentSlide(0);
    setReferenceOpen(false);
  };

  const restartGuideline = () => {
    setCurrentSlide(0);
    saveProgress(0);
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-ink-muted text-sm tracking-wide uppercase">
          Loading…
        </span>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="absolute inset-0 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+5.5rem)] px-4">
        <header className="max-w-2xl mx-auto pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-5">
          <h1 className="font-serif text-2xl text-ink">Guidelines</h1>
          <p className="text-xs text-ink-muted mt-1 tracking-wide">
            Decision workflows from SDCEP, BSP, FGDP, DBOH
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
            {guidelines.map((guideline) => (
              <button
                key={guideline.id}
                onClick={() => openGuideline(guideline)}
                className="w-full text-left rounded-lg bg-paper-sunk hover:bg-paper/80 transition-colors border border-rule px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-ink mb-1">
                      {guideline.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="bg-ink/10 rounded px-2 py-1">
                        {guideline.organisation}
                      </span>
                      <span>{guideline.year}</span>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 flex-shrink-0 mt-1 text-ink-muted"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!currentGuideline) return null;

  const isLastSlide = currentSlide === currentGuideline.slides.length - 1;
  const slide = currentGuideline.slides[currentSlide];

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3 pointer-events-none bg-gradient-to-b from-paper via-paper to-transparent">
        <button
          onClick={backToList}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink transition-colors"
          aria-label="Back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex-1 flex justify-center px-2">
          <h2 className="font-serif text-sm text-ink text-center truncate">
            {currentGuideline.title}
          </h2>
        </div>
        <button
          onClick={() => {
            setReferenceOpen(true);
            setRefOpen(true);
          }}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-paper/80 backdrop-blur-md w-9 h-9 text-ink-soft border border-rule/60 shadow-sm hover:text-ink transition-colors"
          aria-label="Reference"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 3h12v8H6l-3 3v-3H2V3z" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+4.5rem)] pb-[calc(env(safe-area-inset-bottom)+9rem)] text-center overflow-hidden">
        {isLastSlide ? (
          <div className="space-y-4">
            <div className="font-serif text-2xl text-ink">Complete</div>
            <p className="text-sm text-ink-muted">
              You've reviewed all slides for this guideline.
            </p>
            <button
              onClick={restartGuideline}
              className="mt-6 rounded-full bg-ink text-paper px-5 py-2.5 text-sm tracking-wide uppercase font-medium hover:bg-ink-soft transition-colors"
            >
              Restart
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 w-full bg-rule/30 rounded-full h-1">
              <div
                className="h-full bg-bronze rounded-full transition-all"
                style={{
                  width: `${((currentSlide + 1) / currentGuideline.slides.length) * 100}%`,
                }}
              />
            </div>
            <h3 className="font-serif text-lg text-ink mb-4 leading-relaxed max-w-lg">
              {slide.title}
            </h3>
            <p className="text-sm text-ink leading-relaxed max-w-lg mb-6">
              {slide.body}
            </p>
          </>
        )}
      </div>

      <div className="absolute inset-x-0 flex items-center justify-between px-4 gap-3 bottom-[calc(env(safe-area-inset-bottom)+4.25rem)]">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="inline-flex items-center justify-center rounded-full bg-paper-sunk border border-rule px-4 py-2.5 text-sm tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper transition-colors"
        >
          Back
        </button>
        <div className="text-xs text-ink-muted tracking-wide">
          {currentSlide + 1} / {currentGuideline.slides.length}
        </div>
        <button
          onClick={nextSlide}
          disabled={isLastSlide}
          className="inline-flex items-center justify-center rounded-full bg-ink text-paper px-4 py-2.5 text-sm tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-soft transition-colors"
        >
          Next
        </button>
      </div>

      {referenceOpen && refOpen && (
        <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 transition-opacity duration-300 pointer-events-auto" />
      )}
      {refOpen && (
        <div className="fixed left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ maxHeight: "82dvh" }}>
          <div className="flex flex-col max-h-[82dvh]">
            <div
              ref={dragRef}
              className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
            >
              <div className="w-10 h-1 rounded-full bg-rule" />
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <h3 className="font-serif text-lg text-ink mb-4">Reference</h3>
              <div className="prose prose-sm text-ink space-y-3">
                {currentGuideline.referenceText
                  .split("\n\n")
                  .filter((p) => p.trim())
                  .map((para, i) => (
                    <p key={i} className="text-sm leading-relaxed">
                      {para.trim()}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
