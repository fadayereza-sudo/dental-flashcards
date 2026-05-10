# Phase 2 — synthesise prompt (per-origin)

You are synthesising the troubleshooting JSON for **one origin**. Phase 1 has already populated `staging/troubleshooting/*.jsonl` with verbatim excerpts tagged by origin. Your job is to cluster those excerpts by clinical entity, then write one `Problem` per cluster, then write the origin file.

## Inputs (filled in per run)

- `<origin-slug>` — one of `permanent-dentition`, `periodontal`, `tongue`, etc.
- `<origin-title>` — display title (e.g. `"Permanent dentition"`)
- `<origin-order>` — display order from the canonical list

## Pipeline

### 1. Gather

Read every line of every JSONL in `staging/troubleshooting/`. Filter to rows where `origin == <origin-slug>`. Dedupe by `(source, quote)` — exact string match. If two rows differ only in `hint`, keep one.

If no rows are present, stop and report: phase 1 has not yet covered this origin.

### 2. Cluster

Group rows by clinical entity. One cluster = one problem = one named condition (or one named differential within a tight family).

Indicators that two excerpts belong in the same cluster:
- Same condition name appears in either `quote` or `hint`
- Same diagnostic test threshold cited
- Two excerpts plug different sections (one etiology, one Tx) of the same disease

Indicators they belong in different clusters:
- Different named conditions (`reversible pulpitis` vs `irreversible pulpitis`)
- Same anatomical region, different mechanism (caries vs cracked tooth)
- Same condition but different age group (caries in primary vs permanent dentition — note this is also resolved by the `origin` filter)

A row may cite a *contrast* between two conditions; in that case, include the row in both clusters and reuse the citation in both problems.

### 3. Write the seven sections per problem

For each cluster, draft a `Problem` object. Fill all seven fields plus `description`, `conditionName`, `id`. Use the prose rules from `SKILL.md`:

- Third person, plain spoken-style sentences
- ≤25 words for `description`, no condition name in it
- Citations `[1]`, `[2]`, … local to this problem
- Em dashes sparingly
- No reference to "the handbook" / "the guideline"
- No fabricated rationale — if a section is genuinely silent in the sources, write the strongest cited sentence available and stop

#### Section-by-section rubric

| field                     | what to write                                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `description`             | One symptom-led sentence, ≤25 words. Lead with the most distinctive observable. **Never name the condition.**  |
| `conditionName`           | Most precise current clinical name. Spell out abbreviations on first use.                                      |
| `etiology`                | The mechanistic chain — what triggers what. Layer A (static structural / biomechanical) where applicable.      |
| `presentation`            | Patient-reported symptoms first, clinician-observable signs second.                                            |
| `results`                 | Special-test findings: vitality / percussion / probing / radiograph / transillumination, with cited numbers.   |
| `definingCharacteristics` | The differential thinking — what distinguishes this from neighbours in the same origin.                        |
| `treatment`               | Best typical primary-care treatment. Drug doses and materials cited verbatim. Referral threshold if relevant.  |
| `prognosis`               | With and without treatment, where the sources speak to it. Numerical outcomes cited.                           |

### 4. Build the citation array

Per-problem, not per-origin. Number from `[1]` upward. Each citation:

```json
{
  "id": 1,
  "quote": "verbatim source sentence(s)",
  "paragraph": 4949,
  "source": "Oxford Handbook · paragraph 4949"
}
```

- `source` is **mandatory**. The page renders this label directly. Do not rely on the paragraph fallback.
- `paragraph` is included only when the source is `oxford` or `odells`.
- `quote` is whatever was in the staged row — copy it through verbatim. Don't trim or rephrase at this stage.
- 3–8 citations per problem is the typical range. More is fine if numerical thresholds and drug doses cluster.

### 5. Validate

Before writing the file, check:

- Every `[N]` marker in any of the seven sections has a matching `citations[].id == N`.
- No duplicate `id` in the citation array.
- Every citation has a non-empty `quote` and `source`.
- `description` does not contain the value of `conditionName` (or any near-substring).
- `id` is unique across the origin file: `<origin-slug>-001`, `<origin-slug>-002`, …

### 6. Write the file

Replace `data/troubleshooting/<origin-slug>.json` in full. The file is the canonical record for this origin; write it as if from scratch, even on a re-run.

```json
{
  "slug": "permanent-dentition",
  "title": "Permanent dentition",
  "order": 11,
  "description": "Optional one-sentence orientation.",
  "problems": [
    {
      "id": "permanent-dentition-001",
      "description": "Brief sharp pain on cold, settles within seconds of removing the stimulus.",
      "conditionName": "Reversible pulpitis",
      "etiology": "Reversible inflammation of the pulp triggered by a thermal or mechanical insult, with the dentine-pulp complex still able to recover once the stimulus is removed [1].",
      "presentation": "Patient reports a sharp pain on cold drinks that vanishes seconds after the stimulus is gone. No spontaneous pain, no pain on biting [2].",
      "results": "Vitality test exaggerated to cold but rapid recovery. Percussion negative. Radiograph shows no periapical change [3].",
      "definingCharacteristics": "Unlike irreversible pulpitis, the pain does not linger and is not spontaneous [4].",
      "treatment": "Identify and remove the cause — replace defective restoration, address exposed dentine, treat caries [5]. No endodontic intervention.",
      "prognosis": "With cause removed, the pulp typically settles. If the insult continues, progresses to irreversible pulpitis [6].",
      "citations": [
        { "id": 1, "quote": "…", "paragraph": 4949, "source": "Oxford Handbook · paragraph 4949" },
        { "id": 2, "quote": "…", "source": "BES Guidelines 2022 — Examination and Diagnosis" }
      ]
    }
  ]
}
```

### 7. Update siblings

After writing the origin file:

- Update `data/troubleshooting/index.json` — append `{ slug, title, order, description? }` if the origin is new, otherwise update the existing row's `description` if changed. Keep the array sorted by `order`.
- Update `data/troubleshooting/progress.json` — add the slug to `synthesised`, set `lastUpdated` to today's date.

### 8. Hand-back report

In the conversation, summarise:
- Origin slug and title
- Number of problems written
- Conditions named (one-line list)
- Number of citations
- Sources cited (count by source-id)
- Any gaps you noticed — sections you had to leave thin because sources were silent
- Any condition you considered but dropped, and why (e.g. insufficient cited evidence)

Do not move on to the next origin. The user reviews each one before scaling.

## Hard rules (no exceptions)

- Verbatim citations only. No paraphrasing. Preserve `↑`, `1°`, percent signs, arrows, original typography.
- Layer A only. No adaptation theory, no FEM, no remodelling-frame discussion.
- No extrapolation beyond what the cited rows support.
- Third person. No "I", "we", "us", "for me".
- No reference to "the handbook", "the guideline", "the textbook" inside body fields.
- Em dashes sparingly. Prefer commas, periods, colons.
- The L2 `description` never names the condition.
- The L3 `conditionName` is the diagnostic reveal — keep it precise.
