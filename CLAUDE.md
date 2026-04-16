@AGENTS.md

# Dental Flashcards

Personal spaced-repetition app for dental study. Single-user; no auth.

## Stack

- Next.js 16 + React 19 (App Router) — see `AGENTS.md` re: API drift from older Next.js
- Drizzle ORM against Neon Postgres (`@neondatabase/serverless`)
- `ts-fsrs` for scheduling — wrapped in [lib/fsrs.ts](lib/fsrs.ts)
- Tailwind v4

## Commands

- `npm run dev` — dev server
- `npm run db:generate` — generate migration from [lib/db/schema.ts](lib/db/schema.ts)
- `npm run db:migrate` — apply migrations via [scripts/migrate.ts](scripts/migrate.ts)
- `npm run db:studio` — Drizzle Studio
- `npm run import` — ingest JSON from `flashcards-import/` into Postgres (idempotent; deduped by SHA-256 of `question + answer` per folder)

## Card content rule

Every card's `answer` must include the **reasoning**, not just the fact. The user has to recall the "why" to pass. See [flashcards-import/README.md](flashcards-import/README.md) for the JSON format the importer expects.

## Source material

Original e-books live at `c:\Users\IAU\Documents\Claude Projects\e-books\dentistry\` — **never** copy them into this repo (dev server OOM).

Preprocessed content lives in `source-material/<book>/` inside the repo:
- `full-text.txt` — every paragraph tagged `[index][style] text`
- `chapters.json` — chapter/section boundaries (paragraph indices)
- `image-map.json` — extracted images mapped to paragraph indices
- `images/` — extracted images

Preprocessing script: `python scripts/preprocess-docx.py "<docx-path>" "<output-dir>"`

Card images served from `public/card-images/`. Cards can reference them via the `image` field.

## References

Curated extracts live in `references/<book>/`. Each `.md` file has YAML frontmatter (`id`, `book`, `section`, `paragraphs`, `images`, `tags`) and verbatim source text. These are the inputs for the `make-flashcards` skill. See [references/README.md](references/README.md) for the full format.

## Workflow

After every successful code update, commit the changes immediately. Don't wait to be asked.

## Data model

Two-level folder tree → cards → per-card FSRS `card_state` + append-only `reviews` log. `settings` is a single-row table holding Telegram chat id, timezone, and notification windows. Schema in [lib/db/schema.ts](lib/db/schema.ts).
