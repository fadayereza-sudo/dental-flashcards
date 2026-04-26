"use client";

import { ReactNode } from "react";

/**
 * Tiny markdown subset renderer for the manual-style workflow overviews.
 * Supports: ##/### headings, ordered + unordered lists, paragraphs,
 * inline **bold** and *italic*. Nothing else.
 */

type Block =
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "p"; text: string };

const ULI = /^[-*]\s+(.*)$/;
const OLI = /^\d+\.\s+(.*)$/;

function parse(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === "") {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }

    if (ULI.test(line)) {
      const items: string[] = [];
      while (i < lines.length && ULI.test(lines[i].trim())) {
        const m = lines[i].trim().match(ULI);
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    if (OLI.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OLI.test(lines[i].trim())) {
        const m = lines[i].trim().match(OLI);
        if (m) items.push(m[1]);
        i++;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph: gather contiguous non-empty, non-block lines.
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("## ") &&
      !lines[i].trim().startsWith("### ") &&
      !ULI.test(lines[i].trim()) &&
      !OLI.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  // Tokens: **bold** | *italic* | text
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      out.push(
        <strong key={`b-${key++}`} className="font-semibold text-ink">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      out.push(
        <em key={`i-${key++}`} className="italic">
          {tok.slice(1, -1)}
        </em>
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

interface Props {
  source: string;
  className?: string;
}

export function ManualMarkdown({ source, className }: Props) {
  const blocks = parse(source);

  return (
    <div className={className}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h2":
            return (
              <h3
                key={i}
                className={`font-serif text-[16px] font-bold text-ink leading-snug ${
                  i === 0 ? "" : "mt-5"
                } mb-2`}
              >
                {renderInline(b.text)}
              </h3>
            );
          case "h3":
            return (
              <h4
                key={i}
                className={`text-[13px] font-semibold text-ink uppercase tracking-[0.08em] ${
                  i === 0 ? "" : "mt-4"
                } mb-1.5`}
              >
                {renderInline(b.text)}
              </h4>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="list-disc list-outside pl-5 space-y-1 my-2 text-[14px] leading-[1.6] text-ink"
              >
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol
                key={i}
                className="list-decimal list-outside pl-5 space-y-1 my-2 text-[14px] leading-[1.6] text-ink"
              >
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );
          case "p":
            return (
              <p
                key={i}
                className={`text-[14px] leading-[1.65] text-ink ${
                  i === 0 ? "" : "mt-3"
                }`}
              >
                {renderInline(b.text)}
              </p>
            );
        }
      })}
    </div>
  );
}
