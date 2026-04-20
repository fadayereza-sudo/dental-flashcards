"use client";

import { useEffect, useRef, useState } from "react";

type Tree = Array<{
  id: number;
  name: string;
  deletedAt?: string | null;
  children: Array<{
    id: number;
    name: string;
    cardCount: number;
    deletedAt?: string | null;
  }>;
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
  onTreeChanged?: () => void | Promise<void>;
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
  onTreeChanged,
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
                onTreeChanged={onTreeChanged}
              />
            </Field>

            <Field label="Question">
              <textarea
                value={value.question}
                onChange={(e) => update("question", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="Write the question here."
              />
            </Field>

            <Field label="Answer & reasoning">
              <textarea
                value={value.answer}
                onChange={(e) => update("answer", e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[15px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="Write the answer here."
              />
            </Field>

            <Field label="Image (optional)">
              <ImageUpload
                value={value.image}
                onChange={(v) => update("image", v)}
                onError={setError}
              />
            </Field>

            <Field label="Source (optional)">
              <input
                type="text"
                value={value.referenceSection}
                onChange={(e) => update("referenceSection", e.target.value)}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-2.5 text-[15px] text-ink focus:outline-none focus:border-ink-soft"
                placeholder="e.g. Oxford Ch 2, or Dr Smith's advice"
              />
            </Field>

            <Field label="Reference text (optional)">
              <textarea
                value={value.reference}
                onChange={(e) => update("reference", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-rule bg-paper-sunk px-4 py-3 text-[14px] text-ink focus:outline-none focus:border-ink-soft resize-y"
                placeholder="Paste the source text here."
              />
            </Field>

            {error && (
              <p className="text-sm text-accent-red">{error}</p>
            )}

            {mode === "edit" && (
              <div className="pt-2 border-t border-rule/60">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-ink-soft">Move card to trash?</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        You can restore it from Show trash.
                      </p>
                    </div>
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
      <span className="block text-[10px] tracking-[0.12em] uppercase text-bronze mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function ImageUpload({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  onError: (msg: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const preview = value
    ? value.startsWith("/") || value.startsWith("http")
      ? value
      : `/card-images/${value}`
    : null;

  const upload = async (file: File) => {
    setUploading(true);
    onError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const text = await res.text();
      let data: { filename?: string; error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // Non-JSON response (e.g. server crash) — surface the status
      }
      if (!res.ok || !data.filename) {
        throw new Error(
          data.error ?? `Upload failed (${res.status} ${res.statusText})`,
        );
      }
      onChange(data.filename);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-xl border border-rule bg-paper-sunk overflow-hidden">
          <img
            src={preview}
            alt=""
            className="w-full max-h-48 object-contain bg-paper"
          />
          <div className="flex items-center justify-between px-3 py-2 text-[11px] text-ink-muted border-t border-rule/60">
            <span className="truncate pr-3">{value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-accent-red hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-rule bg-paper-sunk px-4 py-6 text-[13px] text-ink-soft hover:border-ink-soft hover:text-ink disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path d="M10 3v10M5 8l5-5 5 5M3 16h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {uploading ? "Uploading…" : "Add image"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
    </div>
  );
}

function FolderPicker({
  tree: rawTree,
  value,
  onChange,
  onTreeChanged,
}: {
  tree: Tree;
  value: number | null;
  onChange: (id: number) => void;
  onTreeChanged?: () => void | Promise<void>;
}) {
  // Defensive: never show soft-deleted folders or chapters in the picker.
  const tree: Tree = rawTree
    .filter((r) => !r.deletedAt)
    .map((r) => ({ ...r, children: r.children.filter((c) => !c.deletedAt) }));

  const [expandedRoot, setExpandedRoot] = useState<number | null>(() => {
    if (value === null) return null;
    for (const root of tree) {
      if (root.children.some((c) => c.id === value)) return root.id;
    }
    return null;
  });
  // When a book is freshly created, flip this on so the chapter input auto-opens.
  const [autoOpenChapterFor, setAutoOpenChapterFor] = useState<number | null>(
    null,
  );

  // Auto-expand the root that owns `value` once — e.g. on initial load when
  // the tree arrives async, or when `value` changes externally. A ref tracks
  // the last value we synced so that later user clicks on other roots aren't
  // snapped back by this effect.
  const lastSyncedValueRef = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (lastSyncedValueRef.current === value) return;
    if (value === null) {
      lastSyncedValueRef.current = null;
      return;
    }
    for (const root of tree) {
      if (root.children.some((c) => c.id === value)) {
        setExpandedRoot(root.id);
        lastSyncedValueRef.current = value;
        return;
      }
    }
  }, [value, tree]);

  const expandedRootName = (() => {
    if (expandedRoot === null) return null;
    return tree.find((r) => r.id === expandedRoot)?.name ?? null;
  })();

  const selectedChapterName = (() => {
    if (value === null) return null;
    for (const root of tree) {
      for (const c of root.children) {
        if (c.id === value) return { book: root.name, chapter: c.name };
      }
    }
    return null;
  })();

  const breadcrumb = selectedChapterName
    ? `${selectedChapterName.book} · ${selectedChapterName.chapter}`
    : expandedRootName
      ? `${expandedRootName} · pick a chapter`
      : null;

  const createFolder = async (name: string, parentId: number | null) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error ?? `${res.status}`);
    await onTreeChanged?.();
    return data.folder as { id: number; name: string; parentId: number | null };
  };

  return (
    <div className="rounded-xl border border-rule bg-paper-sunk overflow-hidden">
      {breadcrumb && (
        <div className="px-4 py-2.5 text-[13px] border-b border-rule/60 bg-paper">
          <span className={selectedChapterName ? "text-ink" : "text-ink-muted"}>
            {breadcrumb}
          </span>
        </div>
      )}
      <div className="max-h-72 overflow-y-auto">
        {tree.map((root) => {
          const isOpen = expandedRoot === root.id;
          return (
            <div
              key={root.id}
              className={isOpen ? "bg-paper/60" : ""}
            >
              <button
                type="button"
                onClick={() => {
                  setExpandedRoot(isOpen ? null : root.id);
                  if (isOpen) setAutoOpenChapterFor(null);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-paper transition-colors ${isOpen ? "border-l-2 border-bronze" : "border-l-2 border-transparent"}`}
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
                <span
                  className={`text-[14px] flex-1 ${isOpen ? "text-ink font-medium" : "text-ink"}`}
                >
                  {root.name}
                </span>
              </button>
              {isOpen && (
                <>
                  {root.children.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onChange(c.id)}
                      className={`w-full flex items-center gap-2 pl-10 pr-4 py-2 text-left text-[13px] hover:bg-paper ${value === c.id ? "bg-ink/5 text-ink font-medium" : "text-ink-soft"}`}
                    >
                      {value === c.id && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 11 11"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M2 5.5l2.2 2.2L9 3"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span className="flex-1">{c.name}</span>
                    </button>
                  ))}
                  <InlineCreate
                    placeholder={`New chapter in ${root.name}`}
                    indent
                    autoOpen={autoOpenChapterFor === root.id}
                    onOpened={() => setAutoOpenChapterFor(null)}
                    onCreate={async (name) => {
                      const folder = await createFolder(name, root.id);
                      onChange(folder.id);
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
        <InlineCreate
          placeholder="New book"
          onCreate={async (name) => {
            const folder = await createFolder(name, null);
            setExpandedRoot(folder.id);
            setAutoOpenChapterFor(folder.id);
          }}
        />
      </div>
    </div>
  );
}

function InlineCreate({
  placeholder,
  indent,
  onCreate,
  autoOpen,
  onOpened,
}: {
  placeholder: string;
  indent?: boolean;
  onCreate: (name: string) => Promise<void>;
  autoOpen?: boolean;
  onOpened?: () => void;
}) {
  const [active, setActive] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoOpen && !active) {
      setActive(true);
      onOpened?.();
    }
  }, [autoOpen, active, onOpened]);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setErr(null);
    try {
      await onCreate(trimmed);
      setName("");
      setActive(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className={`w-full flex items-center gap-2 px-4 py-2 text-left text-[12px] text-bronze hover:text-ink hover:bg-paper ${indent ? "pl-10" : ""}`}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {placeholder}
      </button>
    );
  }

  return (
    <div className={`px-4 py-2 ${indent ? "pl-10" : ""}`}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") {
              setActive(false);
              setName("");
              setErr(null);
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-rule bg-paper px-2.5 py-1.5 text-[13px] text-ink focus:outline-none focus:border-ink-soft"
          disabled={busy}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy || !name.trim()}
          className="rounded-full bg-ink text-paper px-3 py-1 text-[11px] tracking-wide uppercase disabled:opacity-50"
        >
          {busy ? "…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => {
            setActive(false);
            setName("");
            setErr(null);
          }}
          className="text-[11px] tracking-wide uppercase text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
      {err && <p className="text-[11px] text-accent-red mt-1">{err}</p>}
    </div>
  );
}
