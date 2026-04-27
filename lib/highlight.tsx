import { ReactNode } from "react";

// Wrap case-insensitive matches of `term` in <mark className="search-hit">.
// Returns an array of nodes that can be dropped into any JSX position that
// already accepts strings.
export function highlight(text: string, term: string | undefined): ReactNode[] {
  if (!text) return [];
  const q = (term ?? "").trim();
  if (!q) return [text];

  const out: ReactNode[] = [];
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = lower.indexOf(needle, i);
    if (idx === -1) {
      out.push(text.slice(i));
      break;
    }
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark key={`hl-${key++}`} className="search-hit">
        {text.slice(idx, idx + needle.length)}
      </mark>,
    );
    i = idx + needle.length;
  }
  return out;
}
