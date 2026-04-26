"use client";

import { useRef, useState, useEffect } from "react";
import { ReviewFeed } from "@/components/review-feed";
import { FirstPrinciplesPage } from "@/components/first-principles-page";
import { GuidelinesPage } from "@/components/guidelines-page";
import { BottomTabs } from "@/components/bottom-tabs";

export default function Home() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [activePanel, setActivePanel] = useState(0);

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
          <FirstPrinciplesPage />
        </div>
        <div className="panel">
          <GuidelinesPage />
        </div>
      </div>
      <BottomTabs active={activePanel} onSelect={scrollTo} />
    </>
  );
}
