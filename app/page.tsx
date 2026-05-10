"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { ReviewFeed } from "@/components/review-feed";
import { TroubleshootingPage } from "@/components/troubleshooting-page";
import { GuidelinesPage } from "@/components/guidelines-page";
import { BottomTabs } from "@/components/bottom-tabs";

const INITIAL_PANEL = 1;

export default function Home() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(INITIAL_PANEL);

  useLayoutEffect(() => {
    const container = panelRef.current;
    if (!container) return;
    container.scrollLeft = container.clientWidth * INITIAL_PANEL;
  }, []);

  useEffect(() => {
    const container = panelRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActivePanel(index);
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
