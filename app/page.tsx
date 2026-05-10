"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { ReviewFeed } from "@/components/review-feed";
import { TroubleshootingPage } from "@/components/troubleshooting-page";
import { GuidelinesPage } from "@/components/guidelines-page";
import { BottomTabs } from "@/components/bottom-tabs";

const INITIAL_PANEL = 1;
const PANEL_COUNT = 3;
const PANEL_STORAGE_KEY = "dental:active-panel";

export default function Home() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(INITIAL_PANEL);

  useLayoutEffect(() => {
    const container = panelRef.current;
    if (!container) return;
    let target = INITIAL_PANEL;
    try {
      const saved = sessionStorage.getItem(PANEL_STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < PANEL_COUNT) {
          target = parsed;
        }
      }
    } catch {
      // sessionStorage unavailable (private mode etc.) — fall back to default
    }
    container.scrollLeft = container.clientWidth * target;
    setActivePanel(target);
  }, []);

  useEffect(() => {
    const container = panelRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActivePanel(index);
      try {
        sessionStorage.setItem(PANEL_STORAGE_KEY, String(index));
      } catch {
        // sessionStorage unavailable — skip persistence
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (index: number) => {
    const el = panelRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "start" });
  };

  return (
    <>
      <div
        ref={panelRef}
        className="panel-container fixed inset-0"
      >
        <div className="panel">
          <ReviewFeed />
        </div>
        <div className="panel">
          <TroubleshootingPage />
        </div>
        <div className="panel">
          <GuidelinesPage />
        </div>
      </div>
      <BottomTabs active={activePanel} onSelect={scrollTo} />
    </>
  );
}
