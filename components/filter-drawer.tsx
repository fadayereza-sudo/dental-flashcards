"use client";

import { useCallback, useEffect, useState } from "react";
import { TAG_VALUES, TAG_LABELS, UNTAGGED, type Tag } from "@/lib/tags";
import { useBackClose } from "@/lib/use-back-close";
import { useDragToClose } from "@/lib/use-drag-to-close";

type Chapter = {
  id: number;
  name: string;
  cardCount: number;
  deletedAt?: string | null;
};

type Root = {
  id: number;
  name: string;
  deletedAt?: string | null;
  children: Chapter[];
};

type Tree = Root[];

type DeletedCard = {
  id: number;
  question: string;
  folderId: number;
  chapterName: string;
  bookName: string | null;
  deletedAt: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  tree: Tree;
  selected: number[];
  selectedTags: string[];
  onApply: (next: { folders: number[]; tags: string[] }) => void;
  onTreeChanged?: () => void | Promise<void>;
};

const TAG_CHIPS: Array<{ value: Tag | typeof UNTAGGED; label: string }> = [
  ...TAG_VALUES.map((t) => ({ value: t, label: TAG_LABELS[t] })),
  { value: UNTAGGED, label: "Untagged" },
];

export function FilterDrawer({
  open,
  onClose,
  tree,
  selected,
  selectedTags,
  onApply,
  onTreeChanged,
}: Props) {
  const [local, setLocal] = useState<Set<number>>(new Set(selected));
  const [localTags, setLocalTags] = useState<Set<string>>(new Set(selectedTags));
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const [showTrash, setShowTrash] = useState(false);
  const [trashTree, setTrashTree] = useState<Tree>([]);
  const [deletedCards, setDeletedCards] = useState<DeletedCard[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [confirmDelId, setConfirmDelId] = useState<number | null>(null);
  const [confirmPurgeFolderId, setConfirmPurgeFolderId] = useState<number | null>(
    null,
  );
  const [confirmPurgeCardId, setConfirmPurgeCardId] = useState<number | null>(
    null,
  );
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setLocal(new Set(selected));
      setLocalTags(new Set(selectedTags));
      setExpanded(new Set());
      setEditingId(null);
      setEditDraft("");
      setRowError(null);
      setConfirmDelId(null);
      setConfirmPurgeFolderId(null);
      setConfirmPurgeCardId(null);
    }
  }, [open, selected, selectedTags, tree]);

  const fetchTrash = useCallback(async () => {
    setTrashLoading(true);
    try {
      const [foldersRes, cardsRes] = await Promise.all([
        fetch("/api/folders?includeDeleted=1", { cache: "no-store" }),
        fetch("/api/cards/deleted", { cache: "no-store" }),
      ]);
      const foldersData = await foldersRes.json();
      const cardsData = await cardsRes.json();
      setTrashTree((foldersData.tree ?? []) as Tree);
      setDeletedCards((cardsData.cards ?? []) as DeletedCard[]);
    } catch {
      // swallow — drawer stays usable
    } finally {
      setTrashLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && showTrash) fetchTrash();
  }, [open, showTrash, fetchTrash]);

  const toggle = (id: number) => {
    const next = new Set(local);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLocal(next);
  };

  const toggleRoot = (root: Root) => {
    const next = new Set(local);
    const childIds = root.children.filter((c) => !c.deletedAt).map((c) => c.id);
    const allSelected = childIds.length > 0 && childIds.every((id) => next.has(id));
    if (allSelected) {
      childIds.forEach((id) => next.delete(id));
    } else {
      childIds.forEach((id) => next.add(id));
    }
    setLocal(next);
  };

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const toggleTag = (value: string) => {
    const next = new Set(localTags);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setLocalTags(next);
  };

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditDraft(currentName);
    setRowError(null);
    setConfirmDelId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft("");
    setRowError(null);
  };

  const saveRename = async (id: number) => {
    const name = editDraft.trim();
    if (!name) {
      setRowError({ id, message: "name required" });
      return;
    }
    setBusyId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id, message: data?.error ?? `${res.status}` });
        return;
      }
      setEditingId(null);
      setEditDraft("");
      await onTreeChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const softDelete = async (id: number) => {
    setBusyId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id, message: data?.error ?? `${res.status}` });
        return;
      }
      setConfirmDelId(null);
      setLocal((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await onTreeChanged?.();
      if (showTrash) await fetchTrash();
    } finally {
      setBusyId(null);
    }
  };

  const restoreFolder = async (id: number) => {
    setBusyId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/folders/${id}/restore`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id, message: data?.error ?? `${res.status}` });
        return;
      }
      await onTreeChanged?.();
      await fetchTrash();
    } finally {
      setBusyId(null);
    }
  };

  const purgeFolder = async (id: number) => {
    setBusyId(id);
    setRowError(null);
    try {
      const res = await fetch(`/api/folders/${id}/purge`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id, message: data?.error ?? `${res.status}` });
        return;
      }
      setConfirmPurgeFolderId(null);
      await onTreeChanged?.();
      await fetchTrash();
    } finally {
      setBusyId(null);
    }
  };

  const restoreCard = async (id: number) => {
    setBusyId(-id);
    try {
      const res = await fetch(`/api/cards/${id}/restore`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id: -id, message: data?.error ?? `${res.status}` });
        return;
      }
      await onTreeChanged?.();
      await fetchTrash();
    } finally {
      setBusyId(null);
    }
  };

  const purgeCard = async (id: number) => {
    setBusyId(-id);
    try {
      const res = await fetch(`/api/cards/${id}/purge`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRowError({ id: -id, message: data?.error ?? `${res.status}` });
        return;
      }
      setConfirmPurgeCardId(null);
      await fetchTrash();
    } finally {
      setBusyId(null);
    }
  };

  const deletedRoots = trashTree.filter((r) => !!r.deletedAt);
  const activeRootsWithDeletedChildren = trashTree
    .filter((r) => !r.deletedAt)
    .map((r) => ({ ...r, children: r.children.filter((c) => !!c.deletedAt) }))
    .filter((r) => r.children.length > 0);

  useBackClose(open, onClose);
  const { sheetRef, handleProps } = useDragToClose(onClose);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed left-0 right-0 bottom-0 z-40 bg-paper rounded-t-[28px] border-t border-rule shadow-[0_-20px_40px_-20px_rgba(28,25,23,0.25)] transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "82dvh" }}
      >
        <div className="flex flex-col max-h-[82dvh]">
          <div
            {...handleProps}
            className="flex justify-center pt-3 pb-2 touch-none cursor-grab active:cursor-grabbing"
          >
            <div className="w-10 h-1 rounded-full bg-rule" />
          </div>
          <div className="px-6 pt-3 pb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-ink">Filter</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowTrash((v) => !v)}
                className={`text-xs tracking-wide uppercase ${showTrash ? "text-ink" : "text-ink-muted hover:text-ink"}`}
              >
                {showTrash ? "Hide trash" : "Show trash"}
              </button>
              <button
                onClick={() => {
                  setLocal(new Set());
                  setLocalTags(new Set());
                }}
                className="text-xs tracking-wide uppercase text-ink-muted hover:text-ink"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-2">
            <div className="px-3 pt-2 pb-3">
              <p className="text-[11px] tracking-[0.12em] uppercase text-ink-muted mb-2">
                Themes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TAG_CHIPS.map((chip) => {
                  const active = localTags.has(chip.value);
                  return (
                    <button
                      key={chip.value}
                      onClick={() => toggleTag(chip.value)}
                      className={`rounded-full px-3 py-1.5 text-xs tracking-wide transition-colors ${
                        active
                          ? "bg-ink text-paper"
                          : "bg-paper-sunk text-ink-soft border border-rule hover:text-ink"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
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
                    <FolderRow
                      id={root.id}
                      name={root.name}
                      trailing={
                        <span className="font-mono text-[11px] text-ink-muted">
                          {root.children.reduce((sum, c) => sum + c.cardCount, 0)}
                        </span>
                      }
                      isRoot
                      isOpen={isOpen}
                      onToggleExpand={() => toggleExpand(root.id)}
                      checkbox={
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={() => toggleRoot(root)}
                        />
                      }
                      editing={editingId === root.id}
                      editDraft={editDraft}
                      setEditDraft={setEditDraft}
                      onSaveEdit={() => saveRename(root.id)}
                      onCancelEdit={cancelEdit}
                      onStartEdit={() => startEdit(root.id, root.name)}
                      confirmingDelete={confirmDelId === root.id}
                      onRequestDelete={() => {
                        setConfirmDelId(root.id);
                        setEditingId(null);
                      }}
                      onCancelDelete={() => setConfirmDelId(null)}
                      onConfirmDelete={() => softDelete(root.id)}
                      busy={busyId === root.id}
                      error={rowError && rowError.id === root.id ? rowError.message : null}
                    />
                    {isOpen &&
                      root.children.map((c) => (
                        <ChapterRow
                          key={c.id}
                          id={c.id}
                          name={c.name}
                          cardCount={c.cardCount}
                          checked={local.has(c.id)}
                          onToggle={() => toggle(c.id)}
                          editing={editingId === c.id}
                          editDraft={editDraft}
                          setEditDraft={setEditDraft}
                          onSaveEdit={() => saveRename(c.id)}
                          onCancelEdit={cancelEdit}
                          onStartEdit={() => startEdit(c.id, c.name)}
                          confirmingDelete={confirmDelId === c.id}
                          onRequestDelete={() => {
                            setConfirmDelId(c.id);
                            setEditingId(null);
                          }}
                          onCancelDelete={() => setConfirmDelId(null)}
                          onConfirmDelete={() => softDelete(c.id)}
                          busy={busyId === c.id}
                          error={
                            rowError && rowError.id === c.id ? rowError.message : null
                          }
                        />
                      ))}
                  </div>
                );
              })
            )}

            {showTrash && (
              <div className="mt-4 pt-4 border-t border-rule/60">
                <h3 className="px-3 text-[11px] tracking-[0.12em] uppercase text-ink-muted mb-2">
                  Trash
                </h3>
                {trashLoading && (
                  <p className="px-3 py-2 text-xs text-ink-muted">Loading…</p>
                )}

                {!trashLoading &&
                  deletedRoots.length === 0 &&
                  activeRootsWithDeletedChildren.length === 0 &&
                  deletedCards.length === 0 && (
                    <p className="px-3 py-6 text-center text-xs text-ink-muted">
                      Trash is empty.
                    </p>
                  )}

                {deletedRoots.map((root) => (
                  <TrashFolderRow
                    key={`droot-${root.id}`}
                    id={root.id}
                    name={root.name}
                    subtitle={`Book · ${root.children.length} chapter${root.children.length === 1 ? "" : "s"}`}
                    deletedAt={root.deletedAt ?? null}
                    onRestore={() => restoreFolder(root.id)}
                    confirmingPurge={confirmPurgeFolderId === root.id}
                    onRequestPurge={() => setConfirmPurgeFolderId(root.id)}
                    onCancelPurge={() => setConfirmPurgeFolderId(null)}
                    onConfirmPurge={() => purgeFolder(root.id)}
                    busy={busyId === root.id}
                    error={
                      rowError && rowError.id === root.id ? rowError.message : null
                    }
                  />
                ))}

                {activeRootsWithDeletedChildren.map((root) => (
                  <div key={`active-${root.id}`} className="mb-2">
                    <p className="px-3 pt-2 pb-1 font-serif text-[15px] text-ink-soft">
                      {root.name}
                    </p>
                    {root.children.map((c) => (
                      <TrashFolderRow
                        key={`dchap-${c.id}`}
                        id={c.id}
                        name={c.name}
                        subtitle="Chapter"
                        deletedAt={c.deletedAt ?? null}
                        onRestore={() => restoreFolder(c.id)}
                        confirmingPurge={confirmPurgeFolderId === c.id}
                        onRequestPurge={() => setConfirmPurgeFolderId(c.id)}
                        onCancelPurge={() => setConfirmPurgeFolderId(null)}
                        onConfirmPurge={() => purgeFolder(c.id)}
                        busy={busyId === c.id}
                        error={
                          rowError && rowError.id === c.id
                            ? rowError.message
                            : null
                        }
                      />
                    ))}
                  </div>
                ))}

                {deletedCards.length > 0 && (
                  <div className="mt-3">
                    <h4 className="px-3 text-[11px] tracking-[0.12em] uppercase text-ink-muted mb-1">
                      Deleted cards
                    </h4>
                    {deletedCards.map((c) => (
                      <TrashCardRow
                        key={`dcard-${c.id}`}
                        id={c.id}
                        question={c.question}
                        path={
                          c.bookName
                            ? `${c.bookName} / ${c.chapterName}`
                            : c.chapterName
                        }
                        onRestore={() => restoreCard(c.id)}
                        confirmingPurge={confirmPurgeCardId === c.id}
                        onRequestPurge={() => setConfirmPurgeCardId(c.id)}
                        onCancelPurge={() => setConfirmPurgeCardId(null)}
                        onConfirmPurge={() => purgeCard(c.id)}
                        busy={busyId === -c.id}
                        error={
                          rowError && rowError.id === -c.id
                            ? rowError.message
                            : null
                        }
                      />
                    ))}
                  </div>
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
              onClick={() =>
                onApply({ folders: [...local], tags: [...localTags] })
              }
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

type RowActionProps = {
  editing: boolean;
  editDraft: string;
  setEditDraft: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  confirmingDelete: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  busy: boolean;
  error: string | null;
};

function FolderRow(
  props: {
    id: number;
    name: string;
    trailing: React.ReactNode;
    isRoot: boolean;
    isOpen: boolean;
    onToggleExpand: () => void;
    checkbox: React.ReactNode;
  } & RowActionProps,
) {
  const {
    name,
    trailing,
    isOpen,
    onToggleExpand,
    checkbox,
    editing,
    editDraft,
    setEditDraft,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    confirmingDelete,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
    busy,
    error,
  } = props;
  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-paper-sunk/70">
        <button
          onClick={onToggleExpand}
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
        {checkbox}
        {editing ? (
          <RowEditInput
            value={editDraft}
            onChange={setEditDraft}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            busy={busy}
          />
        ) : confirmingDelete ? (
          <RowConfirmDelete
            label="Move to trash?"
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
            busy={busy}
          />
        ) : (
          <>
            <span className="font-serif text-[17px] text-ink flex-1">{name}</span>
            {trailing}
            <RowIconButtons
              onEdit={onStartEdit}
              onDelete={onRequestDelete}
              disabled={busy}
            />
          </>
        )}
      </div>
      {error && (
        <p className="px-3 pb-1 text-[11px] text-accent-red break-all">{error}</p>
      )}
    </>
  );
}

function ChapterRow(
  props: {
    id: number;
    name: string;
    cardCount: number;
    checked: boolean;
    onToggle: () => void;
  } & RowActionProps,
) {
  const {
    name,
    cardCount,
    checked,
    onToggle,
    editing,
    editDraft,
    setEditDraft,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    confirmingDelete,
    onRequestDelete,
    onCancelDelete,
    onConfirmDelete,
    busy,
    error,
  } = props;
  return (
    <>
      <div className="ml-8 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-paper-sunk/70">
        <Checkbox checked={checked} onChange={onToggle} />
        {editing ? (
          <RowEditInput
            value={editDraft}
            onChange={setEditDraft}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            busy={busy}
          />
        ) : confirmingDelete ? (
          <RowConfirmDelete
            label="Move to trash?"
            onCancel={onCancelDelete}
            onConfirm={onConfirmDelete}
            busy={busy}
          />
        ) : (
          <>
            <span className="text-[15px] text-ink-soft flex-1">{name}</span>
            <span className="font-mono text-[11px] text-ink-muted">
              {cardCount}
            </span>
            <RowIconButtons
              onEdit={onStartEdit}
              onDelete={onRequestDelete}
              disabled={busy}
            />
          </>
        )}
      </div>
      {error && (
        <p className="ml-8 px-3 pb-1 text-[11px] text-accent-red break-all">
          {error}
        </p>
      )}
    </>
  );
}

function TrashFolderRow({
  name,
  subtitle,
  deletedAt,
  onRestore,
  confirmingPurge,
  onRequestPurge,
  onCancelPurge,
  onConfirmPurge,
  busy,
  error,
}: {
  id: number;
  name: string;
  subtitle: string;
  deletedAt: string | null;
  onRestore: () => void;
  confirmingPurge: boolean;
  onRequestPurge: () => void;
  onCancelPurge: () => void;
  onConfirmPurge: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-paper-sunk/70">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[15px] text-ink truncate">{name}</p>
          <p className="text-[10px] tracking-wide uppercase text-ink-muted">
            {subtitle}
            {deletedAt ? ` · deleted ${relTime(deletedAt)}` : ""}
          </p>
        </div>
        {confirmingPurge ? (
          <RowConfirmDelete
            label="Permanently delete? Review history will be lost."
            confirmLabel="Delete forever"
            onCancel={onCancelPurge}
            onConfirm={onConfirmPurge}
            busy={busy}
            destructive
          />
        ) : (
          <>
            <button
              onClick={onRestore}
              disabled={busy}
              className="rounded-full border border-rule px-3 py-1.5 text-[11px] tracking-wide uppercase text-ink-soft hover:text-ink disabled:opacity-50"
            >
              Restore
            </button>
            <button
              onClick={onRequestPurge}
              disabled={busy}
              className="rounded-full px-2 py-1.5 text-[11px] tracking-wide uppercase text-accent-red/80 hover:text-accent-red disabled:opacity-50"
              aria-label="Permanently delete"
            >
              Purge
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="px-3 pb-1 text-[11px] text-accent-red break-all">{error}</p>
      )}
    </>
  );
}

function TrashCardRow({
  question,
  path,
  onRestore,
  confirmingPurge,
  onRequestPurge,
  onCancelPurge,
  onConfirmPurge,
  busy,
  error,
}: {
  id: number;
  question: string;
  path: string;
  onRestore: () => void;
  confirmingPurge: boolean;
  onRequestPurge: () => void;
  onCancelPurge: () => void;
  onConfirmPurge: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <>
      <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-paper-sunk/70">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-ink line-clamp-2">{question}</p>
          <p className="text-[10px] tracking-wide uppercase text-ink-muted mt-0.5">
            {path}
          </p>
        </div>
        {confirmingPurge ? (
          <RowConfirmDelete
            label="Permanently delete? Review history will be lost."
            confirmLabel="Delete forever"
            onCancel={onCancelPurge}
            onConfirm={onConfirmPurge}
            busy={busy}
            destructive
          />
        ) : (
          <>
            <button
              onClick={onRestore}
              disabled={busy}
              className="rounded-full border border-rule px-3 py-1.5 text-[11px] tracking-wide uppercase text-ink-soft hover:text-ink disabled:opacity-50"
            >
              Restore
            </button>
            <button
              onClick={onRequestPurge}
              disabled={busy}
              className="rounded-full px-2 py-1.5 text-[11px] tracking-wide uppercase text-accent-red/80 hover:text-accent-red disabled:opacity-50"
              aria-label="Permanently delete"
            >
              Purge
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="px-3 pb-1 text-[11px] text-accent-red break-all">{error}</p>
      )}
    </>
  );
}

function RowEditInput({
  value,
  onChange,
  onSave,
  onCancel,
  busy,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          else if (e.key === "Escape") onCancel();
        }}
        className="flex-1 bg-paper border border-rule rounded-md px-2 py-1.5 text-[15px] text-ink focus:outline-none focus:border-ink-soft"
      />
      <button
        onClick={onCancel}
        disabled={busy}
        className="text-[11px] tracking-wide uppercase text-ink-muted"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={busy}
        className="rounded-full bg-ink text-paper px-3 py-1.5 text-[11px] tracking-wide uppercase disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </>
  );
}

function RowConfirmDelete({
  label,
  onCancel,
  onConfirm,
  busy,
  confirmLabel = "Delete",
  destructive = false,
}: {
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return (
    <>
      <p className="flex-1 text-[12px] text-ink-soft">{label}</p>
      <button
        onClick={onCancel}
        disabled={busy}
        className="text-[11px] tracking-wide uppercase text-ink-muted"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={busy}
        className={`rounded-full px-3 py-1.5 text-[11px] tracking-wide uppercase text-paper disabled:opacity-50 ${destructive ? "bg-accent-red" : "bg-accent-red/90"}`}
      >
        {busy ? "…" : confirmLabel}
      </button>
    </>
  );
}

function RowIconButtons({
  onEdit,
  onDelete,
  disabled,
}: {
  onEdit: () => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <>
      <button
        onClick={onEdit}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40"
        aria-label="Rename"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M1.5 12.5l2.5-.5 7-7-2-2-7 7-.5 2.5zM9 2l2 2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        onClick={onDelete}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center text-ink-muted hover:text-accent-red disabled:opacity-40"
        aria-label="Delete"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M3 4h8m-1 0v7.5a1 1 0 01-1 1H5a1 1 0 01-1-1V4m2 0V3a1 1 0 011-1h0a1 1 0 011 1v1M6 6.5v4M8 6.5v4"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
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
