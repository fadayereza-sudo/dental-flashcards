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

## PDF sources

Source PDFs live at `c:\Users\IAU\Documents\Claude Projects\e-books\dentistry\` — **never** copy them into this repo. Putting large PDFs under the project root makes the Next dev server OOM.

## Data model

Two-level folder tree → cards → per-card FSRS `card_state` + append-only `reviews` log. `settings` is a single-row table holding Telegram chat id, timezone, and notification windows. Schema in [lib/db/schema.ts](lib/db/schema.ts).
