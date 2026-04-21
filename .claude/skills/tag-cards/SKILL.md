---
name: tag-cards
description: Classify flashcards in the database into one of four themes (diagnosis, treatment-planning, safety-and-compliance, patient-best-interests) or leave untagged. Trigger when the user asks to "tag cards", "tag flashcards", "classify cards by theme", or after a batch import when new untagged cards exist. Fans out parallel Sonnet agents to do the work; writes directly to the database via existing scripts.
---

# tag-cards

Automate the classification of every untagged active flashcard into one of four themes, using parallel Sonnet agents. The schema is already in place ([lib/db/schema.ts](../../../lib/db/schema.ts) — `cards.tag` column with a check constraint). This skill only tags the cards that are currently `tag IS NULL`, so it's safe to re-run after new imports.

## The four themes

Use these exact slugs (agents must output them verbatim):

1. **diagnosis** — diagnosing dental problems. Recognising conditions, interpreting signs/symptoms, reading investigations (radiographs, special tests), forming differentials, identifying pathology.

2. **treatment-planning** — informing how to build a patient's treatment plan: choosing between options, sequencing, prognosis, material selection *criteria* (A vs B, indicated/contraindicated), restore vs extract vs refer, prosthetic planning, risk stratification / prevention planning, factors that make one option better than another.

3. **safety-and-compliance** — being a safe dentist and staying legally compliant. Drug interactions, medical contraindications, consent, indemnity/insurance, record-keeping, regulations, preventing iatrogenic harm (MRONJ, radiation safety, cross-infection, fluoride toxicity), GDC/regulatory obligations, complaints.

4. **patient-best-interests** — practical advice on acting in the patient's best interests (not wishy-washy ethics). Patient communication, managing anxiety, behaviour management, prevention advice given to patients, cost/access considerations, referral decisions, dentist wellbeing that directly affects patient care.

A card that doesn't fit any of the four gets `null` (literal JSON null, not the string `"null"`).

## Rules the agent must follow

- Pick exactly ONE tag per card, or `null`.
- If a card fits two tags, pick the PRIMARY teaching — ask "what is the dentist meant to DO with this knowledge?"
- Pure science/mechanism cards with no practical action → `null` (e.g. pharmacology mechanism, material chemistry).
- Pure technique steps with no decision criteria → `null` (e.g. "how to bond composite to ceramic" is execution of an already-decided plan).
- Dentist self-development/wellness cards (finding a mentor, meditation for personal growth) → `null` unless the card is explicitly about how it protects patient care.
- Medical contraindications / drug interactions prefer `safety-and-compliance` over `treatment-planning` (primary teaching is "don't cause harm").
- Use the JSON literal `null`, not the string `"null"`.

## Existing scripts (do not rewrite)

- [scripts/split-cards-for-tagging.ts](../../../scripts/split-cards-for-tagging.ts) — dumps every active untagged card into `tmp-tag-batches/batch-NN.json` (100 cards per batch). Safe to re-run; clears the folder first.
- [scripts/apply-tags.ts](../../../scripts/apply-tags.ts) — reads one `tmp-tag-results/batch-NN.json` and applies it to the DB in a single `UPDATE ... FROM (VALUES ...)`. Coerces string `"null"` → literal null defensively. Rejects invalid tag slugs.
- [scripts/tag-stats.ts](../../../scripts/tag-stats.ts) — prints the tag distribution across all active cards, and a by-book breakdown.
- [scripts/spot-check-tags.ts](../../../scripts/spot-check-tags.ts) — samples 2 random cards per tag so you can eyeball the classifications.
- [scripts/count-cards.ts](../../../scripts/count-cards.ts) — counts total/active/untagged cards and splits by book. Use this first to decide whether the skill needs to run at all.

## Workflow

1. **Check scope.** Run `npx tsx scripts/count-cards.ts`. If `untagged` is 0, stop — nothing to do. Otherwise, report the count to the user and confirm before proceeding.

2. **Split.** Run `npx tsx scripts/split-cards-for-tagging.ts`. It writes 100-card batches into `tmp-tag-batches/`. Note the batch count (e.g. 27 batches for 2601 cards).

3. **Ensure results dir.** `mkdir -p tmp-tag-results`.

4. **Fan out.** Dispatch Sonnet agents in waves of ~6 to stay polite on rate limits. Each agent reads one batch file, classifies, and writes `tmp-tag-results/batch-NN.json`. Use the prompt template below verbatim — it encodes the rules and is what the pilot validated on.

5. **Apply as each wave finishes.** After all 6 agents in a wave return, run `for i in NN NN NN …; do npx tsx scripts/apply-tags.ts tmp-tag-results/batch-$i.json; done` (bash, substitute the padded batch numbers). The apply script validates and writes in one UPDATE per batch. If it reports invalid tags, fix the file and re-apply — don't skip.

6. **Launch the next wave** as soon as the current wave's results are applied. Repeat until all batches are tagged.

7. **Verify.** Run `npx tsx scripts/tag-stats.ts` to show the distribution, then `npx tsx scripts/spot-check-tags.ts` to sample 2 cards per tag. Report both to the user before declaring done.

8. **Clean up.** Do NOT delete `tmp-tag-batches/` or `tmp-tag-results/` — they're gitignored and useful for debugging if a card turns out mis-tagged. They'll be overwritten on the next run.

## Agent prompt template

Dispatch each agent with `subagent_type: "general-purpose"`, `model: "sonnet"`, and this prompt (substitute `NN` with the zero-padded batch number):

```
You are classifying dental flashcards for a starting UK general dental practitioner (GDP) who wants practical, common-case knowledge.

INPUT: Read `tmp-tag-batches/batch-NN.json` — an array of cards, each `{id, question, answer, book, folder}`.

OUTPUT: Write `tmp-tag-results/batch-NN.json` — an array of `{id, tag, reasoning}`. Use exactly one `reasoning` sentence. Same length and id order as input.

The four tags (use exact slugs, or literal `null`):

1. **diagnosis** — diagnosing dental problems. Recognising conditions, interpreting signs/symptoms, reading investigations (radiographs, special tests), forming differentials, identifying pathology.

2. **treatment-planning** — informing how to build a patient's treatment plan: choosing between options, sequencing, prognosis, material selection *criteria* (A vs B, indicated/contraindicated), restore vs extract vs refer, prosthetic planning, risk stratification / prevention planning (recognising a high-risk site/patient so the plan can address it), factors that make one option better than another.

3. **safety-and-compliance** — being a safe dentist and staying legally compliant. Drug interactions, medical contraindications, consent, indemnity/insurance, record-keeping, regulations, preventing iatrogenic harm (MRONJ, radiation safety, cross-infection, fluoride toxicity), GDC/regulatory obligations, complaints.

4. **patient-best-interests** — practical advice on acting in the patient's best interests (not wishy-washy ethics). Patient communication, managing anxiety, behaviour management, prevention advice given to patients, cost/access considerations, referral decisions, dentist wellbeing that directly affects patient care.

Rules:
- Pick exactly ONE tag per card, or `null` if it genuinely doesn't fit.
- If a card fits two tags, pick the PRIMARY teaching. Ask: "what is the dentist meant to DO with this knowledge?"
- Pure science/mechanism cards with no practical action attached → `null` (e.g. pharmacology mechanism, material chemistry).
- Pure technique steps with no decision criteria → `null` (e.g. "how to bond composite to ceramic" is execution of an already-decided plan).
- Dentist self-development/wellness cards (finding a mentor, meditation for personal growth) → `null` unless the card is explicitly about how it protects patient care.
- When classifying medical contraindications / drug interactions, prefer `safety-and-compliance` over `treatment-planning` (the primary teaching is "don't cause harm", not "choose between options").
- IMPORTANT: Use the JSON literal `null` (no quotes), not the string `"null"`. Example: `{"id": 123, "tag": null, "reasoning": "..."}`.

After writing the file, reply with a one-line summary: `batch-NN: N total — diagnosis X, treatment-planning Y, safety Z, best-interests W, null V`.

Do NOT output the full JSON in your reply. The file is the output. Keep reply under 50 words.
```

## Scaling heuristics

- **Waves of 6.** Observed in practice: each agent takes ~80-120s for 100 cards; dispatching 6 at once is the sweet spot for throughput without triggering rate limits. Larger waves risk queued failures.
- **Batch size 100.** Small enough that a single JSON mistake (string `"null"`, missing id) is contained and recoverable. Larger batches increase retry cost.
- **Per 1000 untagged cards**, expect ~2 minutes wall clock plus apply time (negligible). 2601 cards took ~12 minutes end-to-end.

## Failure modes and recovery

- **Invalid tag slug.** `apply-tags.ts` rejects the whole file with a list of offending ids. Fix those entries in the results JSON (typo in slug) and re-apply.
- **String `"null"` instead of literal null.** `apply-tags.ts` coerces these automatically. No action needed.
- **Agent returned wrong count of items.** Read the results JSON, compare lengths with the batch. Re-dispatch the batch if off by more than 2.
- **Missing cards in DB.** `apply-tags.ts` verifies every id exists before writing. If some are missing (e.g. card was deleted between split and apply), remove them from the results JSON and re-apply.
- **Rate-limited mid-wave.** Check the failing agent's log; if it crashed before writing, just re-dispatch that one batch alone. Do not re-dispatch the whole wave.

## Do NOT

- Rewrite the scripts — they're validated and idempotent.
- Run all 27 agents in one go — rate limits will kill some mid-wave.
- Manually edit `cards.tag` values in the DB to bypass the flow. Fix the classification in the results JSON and re-apply instead, so the audit trail is consistent.
- Tag cards that already have a tag. The split script filters to `tag IS NULL` for a reason — re-tagging without intent destroys manual overrides the user made via the card editor.
- Delete `tmp-tag-results/` while reasoning is still useful for spot-checking. Delete only when the user confirms.
