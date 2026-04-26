/**
 * Shared back-stack for nested modals/toggles. Each `pushEntry` adds one
 * `history.pushState` entry and remembers the close callback. On `popstate`
 * we close only the topmost entry, matching native "back closes the
 * deepest thing first" UX.
 *
 * `removeEntry` is for UI-initiated closes (the user tapped the X button):
 * we splice the entry out of the stack and pop the matching number of
 * history entries via `history.back()`. Those programmatic pops still
 * trigger `popstate`, so we count them in `programmaticPops` to know
 * which firings to ignore.
 */

type Entry = { id: number; close: () => void };

const stack: Entry[] = [];
let nextId = 1;
let programmaticPops = 0;
let initialized = false;

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("popstate", () => {
    if (programmaticPops > 0) {
      programmaticPops -= 1;
      return;
    }
    const top = stack.pop();
    if (top) top.close();
  });
}

export function pushEntry(close: () => void): number {
  init();
  if (typeof window === "undefined") return -1;
  const id = nextId++;
  window.history.pushState({ __backStack: id }, "");
  stack.push({ id, close });
  return id;
}

export function removeEntry(id: number) {
  if (typeof window === "undefined") return;
  const idx = stack.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const removed = stack.length - idx;
  stack.splice(idx, removed);
  programmaticPops += removed;
  for (let i = 0; i < removed; i++) {
    window.history.back();
  }
}
