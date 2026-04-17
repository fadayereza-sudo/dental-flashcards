"use client";

import { useEffect, useState } from "react";

type Tree = Array<{
  id: number;
  name: string;
  children: Array<{ id: number; name: string; cardCount: number }>;
}>;

export type CardEditorValue = {
  id?: number;
  folderId: number | null;
  question: string;
  answer: string;
  source: string;
  image: string;
  reference: string;
  referenceSection: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  tree: Tree;
  initial: CardEditorValue | null;
  onClose: () => void;
  onSaved: (card: { id: number }) => void;
  onDeleted?: (id: number) => void;
};

const EMPTY: CardEditorValue = {
  folderId: null,
  question: "",
  answer: "",
  source: "",
  image: "",
  reference: "",
  referenceSection: "",
};

export function CardEditor({
  open,
  mode,
  tree,
  initial,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [value, setValue] = useState<CardEditorValue>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(initial ?? EMPTY);
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, initial]);

  const update = <K extends keyof CardEditorValue>(
    k: K,
    v: CardEditorValue[K],
  ) => setValue((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!value.folderId) {
      setError("Pick a folder");
      return;
    }
    if (!value.question.trim() || !value.answer.trim()) {
      setError("Question and answer required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        folderId: value.folderId,
        question: value.question,
        answer: value.answer,
        source: value.source || null,
        image: value.image || null,
        reference: value.reference || null,
        referenceSection: value.referenceSection || null,
      };
      const url =
        mode === "edit" && value.id
          ? `/api/cards/${value.id}`
          : "/api/cards";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? `${res.status}`);
      }
      onSaved(data.card);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!value.id) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${value.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `${res.status}`);
      }
      onDeleted?.(value.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`fixed left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "92dvh" }}
      >
        <div className="flex flex-col max-h-[92dvh]">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-rule" />
          </div>
          <div className="px-6 pt-3 pb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-2xl text-ink">
              {mode === "edit" ? "Edit card" : "New card"}
            </h2>
            <button
              onClick={onClose}
              className="text-xs tracking-wide uppercase text-ink-muted hover:text-ink"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
            <Field label="Folder">
              <FolderPicker
                tree={tree}
                value={value.folderId}
                onChange={(id) => update("folderId", id)}
              />
            </Field>

            <Field label="Question">
              <textarea
                value={value.question}
                onChange={(e) => update("question", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="What's the question?"
              />
            </Field>

            <Field label="Answer & reasoning">
              <textarea
                value={value.answer}
                onChange={(e) => update("answer", e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="Fact → mechanism → consequence."
              />
            </Field>

            <Field label="Source (optional)">
              <input
                type="text"
                value={value.source}
                onChange={(e) => update("source", e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-2.5 text-[15px] text-ink focus:outline-none focus:border-ink-soft"
                placeholder="e.g. Oxford Handbook, Ch 2"
              />
            </Field>

            <Field label="Image filename (optional)">
              <input
                type="text"
                value={value.image}
                onChange={(e) => update("image", e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-2.5 text-[15px] text-ink focus:outline-none focus:border-ink-soft"
                placeholder="served from /card-images/"
              />
            </Field>

            <Field label="Reference section (optional)">
              <input
                type="text"
                value={value.referenceSection}
                onChange={(e) => update("referenceSection", e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-2.5 text-[15px] text-ink focus:outline-none focus:border-ink-soft"
                placeholder="e.g. Periodontal assessment"
              />
            </Field>

            <Field label="Reference text (optional)">
              <textarea
                value={value.reference}
                onChange={(e) => update("reference", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="Verbatim source extract shown in the card overlay"
              />
            </Field>

            {error && (
              <p className="text-sm text-accent-red">{error}</p>
            )}

            {mode === "edit" && (
              <div className="pt-2 border-t border-rule/60">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-ink-soft flex-1">
                      Delete this card permanently?
                    </p>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs tracking-wide uppercase text-ink-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={doDelete}
                      disabled={deleting}
                      className="rounded-full bg-accent-red text-paper px-4 py-2 text-xs tracking-wide uppercase disabled:opacity-50"
                    >
                      {deleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs tracking-wide uppercase text-accent-red hover:underline"
                  >
                    Delete card
                  </button>
                )}
              </div>
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
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-full bg-ink text-paper py-3 text-sm tracking-wide uppercase disabled:opacity-50"
            >
              {saving ? "Saving…" : mode === "edit" ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.22em] uppercase text-bronze mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function FolderPicker({
  tree,
  value,
  onChange,
}: {
  tree: Tree;
  value: number | null;
  onChange: (id: number) => void;
}) {
  const [expandedRoot, setExpandedRoot] = useState<number | null>(() => {
    if (value === null) return null;
    for (const root of tree) {
      if (root.children.some((c) => c.id === value)) return root.id;
    }
    return null;
  });

  const currentName = (() => {
    if (value === null) return null;
    for (const root of tree) {
      for (const c of root.children) {
        if (c.id === value) return `${root.name} · ${c.name}`;
      }
    }
    return null;
  })();

  return (
    <div className="rounded-xl border border-rule bg-paper-sunk overflow-hidden">
      {currentName && (
        <div className="px-4 py-2.5 text-[13px] text-ink border-b border-rule/60 bg-paper">
          {currentName}
        </div>
      )}
      <div className="max-h-60 overflow-y-auto">
        {tree.map((root) => {
          const isOpen = expandedRoot === root.id;
          return (
            <div key={root.id}>
              <button
                type="button"
                onClick={() => setExpandedRoot(isOpen ? null : root.id)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-paper"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className={`text-ink-muted transition-transform ${isOpen ? "rotate-90" : ""}`}
                >
                  <path
                    d="M3 2l4 3-4 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[14px] text-ink flex-1">{root.name}</span>
              </button>
              {isOpen &&
                root.children.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChange(c.id)}
                    className={`w-full flex items-center gap-2 pl-10 pr-4 py-2 text-left text-[13px] hover:bg-paper ${value === c.id ? "bg-paper text-ink" : "text-ink-soft"}`}
                  >
                    {c.name}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
