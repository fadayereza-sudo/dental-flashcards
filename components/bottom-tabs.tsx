"use client";

const TABS = [
  {
    id: 0,
    label: "Cards",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="7" y="4" width="13" height="15" rx="2" />
        <rect x="3" y="7" width="13" height="15" rx="2" />
      </svg>
    ),
  },
  {
    id: 1,
    label: "Troubleshoot",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1 1 1.7v.4h5v-.4c0-.7.4-1.3 1-1.7A6 6 0 0 0 12 3z" />
      </svg>
    ),
  },
  {
    id: 2,
    label: "Guidelines",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 3h10a3 3 0 0 1 3 3v14a1 1 0 0 1-1.5.87L13 18l-4.5 2.87A1 1 0 0 1 7 20V6" />
        <path d="M6 3a3 3 0 0 0-3 3v0a2 2 0 0 0 2 2h2" />
        <path d="M9 9h6M9 12h4" />
      </svg>
    ),
  },
];

interface BottomTabsProps {
  active: number;
  onSelect: (index: number) => void;
}

export function BottomTabs({ active, onSelect }: BottomTabsProps) {
  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-30 bg-paper/95 backdrop-blur-xl border-t border-rule/60"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.375rem)",
      }}
      aria-label="Sections"
    >
      <ul className="flex items-stretch">
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onSelect(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className="w-full flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 group relative"
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-12 rounded-b-full bg-bronze"
                  />
                )}
                <span
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                    isActive
                      ? "bg-bronze/15 text-bronze"
                      : "text-ink-muted group-hover:text-ink"
                  }`}
                >
                  {tab.icon}
                </span>
                <span
                  className={`text-[10px] tracking-[0.12em] uppercase transition-colors ${
                    isActive ? "text-bronze font-semibold" : "text-ink-muted group-hover:text-ink"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
