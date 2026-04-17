"use client";

import { useEffect, useState } from "react";

type Tree = Array<{
  id: number;
  name: string;
  children: Array<{ id: number; name: string; cardCount: number }>;
}>;

type Props = {
  open: boolean;
  onClose: () => void;
  tree: Tree;
  selected: number[];
  onApply: (next: number[]) => void;
};

export function FilterDrawer({
  open,
  onClose,
  tree,
  selected,
  onApply,
}: Props) {
  const [local, setLocal] = useState<Set<number>>(new Set(selected));
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      setLocal(new Set(selected));
      setExpanded(new Set(tree.map((t) => t.id)));
    }
  }, [open, selected, tree]);

  const toggle = (id: number) => {
    const next = new Set(local);
    next.has(id) ? next.delete(id) : next.add(id);
    setLocal(next);
  };

  const toggleRoot = (root: Tree[number]) => {
    const next = new Set(local);
    const childIds = root.children.map((c) => c.id);
    const allSelected = childIds.every((id) => next.has(id));
    if (allSelected) {
      childIds.forEach((id) => next.delete(id));
    } else {
      childIds.forEach((id) => next.add(id));
    }
    setLocal(next);
  };

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "82dvh" }}
      >
        <div className="flex flex-col max-h-[82dvh]">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-rule" />
          </div>
          <div className="px-6 pt-3 pb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-ink">Filter</h2>
            <button
              onClick={() => setLocal(new Set())}
              className="text-xs tracking-wide uppercase text-ink-muted hover:text-ink"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {tree.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-ink-muted">
                No folders yet. Import cards to populate.
              </p>
            ) : (
              tree.map((root) => {
                const childIds = root.children.map((c) => c.id);
                const allSelected =
                  childIds.length > 0 &&
                  childIds.every((id) => local.has(id));
                const someSelected =
                  !allSelected && childIds.some((id) => local.has(id));
                const isOpen = expanded.has(root.id);
                return (
                  <div key={root.id} className="py-0.5">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-paper-sunk/70">
                      <button
                        onClick={() => toggleExpand(root.id)}
                        className="w-5 h-5 flex items-center justify-center text-ink-muted"
                        aria-label={isOpen ? "Collapse" : "Expand"}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                        >
                          <path
                            d="M3 2l4 3-4 3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={() => toggleRoot(root)}
                      />
                      <span className="font-serif text-[17px] text-ink flex-1">
                        {root.name}
                      </span>
                      <span className="font-mono text-[11px] text-ink-muted">
                        {root.children.reduce((sum, c) => sum + c.cardCount, 0)}
                      </span>
                    </div>
                    {isOpen &&
                      root.children.map((c) => (
                        <label
                          key={c.id}
                          className="ml-8 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper-sunk/70 cursor-pointer"
                        >
                          <Checkbox
                            checked={local.has(c.id)}
                            onChange={() => toggle(c.id)}
                          />
                          <span className="text-[15px] text-ink-soft flex-1">
                            {c.name}
                          </span>
                          <span className="font-mono text-[11px] text-ink-muted">
                            {c.cardCount}
                          </span>
                        </label>
                      ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-rule/60 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-rule py-3 text-sm tracking-wide uppercase text-ink-soft"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply([...local])}
              className="flex-1 rounded-full bg-ink text-paper py-3 text-sm tracking-wide uppercase"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
        checked || indeterminate
          ? "bg-ink border-ink"
          : "bg-paper border-rule"
      }`}
    >
      {indeterminate ? (
        <span className="block w-2.5 h-[2px] bg-paper" />
      ) : checked ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path
            d="M2 5.5l2.2 2.2L9 3"
            stroke="#f7f2e8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </button>
  );
}
