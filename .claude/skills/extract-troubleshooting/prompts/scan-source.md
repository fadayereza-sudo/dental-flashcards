# Phase 1 — scan-source worker prompt

You are one of several parallel Sonnet workers. You have been assigned **one source pillar** (named in the task brief). Your job is to walk that source end-to-end and emit one JSONL row per clinically-actionable excerpt you find, tagging each with the origin it belongs to.

You do **not** synthesise. You do **not** group. You **only** find and tag. Phase 2 (a separate run) will cluster and write prose.

## Inputs (filled in per worker)

- `<source-id>` — short ID: `oxford` | `odells` | `leeds-restorative` | `leeds-paediatrics` | `sdcep` | `dboh` | `bsp` | `fgdp` | `iadt` | `bes` | `nice` | `rcs` | `orthodontic-referral`
- `<source-paths>` — exact file paths under `source-material/` you must read
- `<output-jsonl>` — `staging/troubleshooting/<source-id>.jsonl`
- `<scope>` — optional chapter / section restriction (used for the sample run; absent for a full scan)

## Read pacing

- **Paragraph-indexed** (`oxford`, `odells`): read in 1500-paragraph windows. Each window ≤50k tokens.
- **Unstructured Calibre exports / markdown** (everything else): read in ≤800-line windows.
- Append to the JSONL after every window. Never rewrite — the file is append-only.
- If context fills, stop cleanly at a section boundary and report where you stopped.

## Origins (canonical slugs)

Use only these slugs. If an excerpt clearly maps to two origins, emit two rows with the same quote and different `origin` values.

```
skin, lips, cheeks, tongue, floor-of-mouth, palate, throat, muscles,
periodontal, primary-dentition, permanent-dentition,
fixed-prosthesis, removable-prosthesis,
psychological, lifestyle
```

If a clinically-load-bearing excerpt clearly belongs to none of these (e.g. salivary gland disease, TMD), invent a new slug and use it consistently — flag it in the run report so it can be added to the canonical list.

## Row schema

Every row is a single JSON object on its own line. No wrapping array. No trailing commas.

```json
{
  "origin": "permanent-dentition",
  "source": "oxford",
  "paragraph": 4949,
  "sourceLabel": "Oxford Handbook · paragraph 4949",
  "quote": "Infection of the pulp can result in irreversible inflammation, necrosis, or both.",
  "hint": "etiology of pulpal disease"
}
```

| key           | required | rule                                                                                |
| ------------- | -------- | ----------------------------------------------------------------------------------- |
| `origin`      | yes      | one canonical slug (or new slug, flagged)                                           |
| `source`      | yes      | the `<source-id>` you were assigned                                                 |
| `quote`       | yes      | **verbatim** from the source — no paraphrase, no merging two sentences              |
| `sourceLabel` | yes      | reader-facing label that will appear in citation popouts                            |
| `hint`        | yes      | ≤15 words on what this excerpt evidences (etiology / presentation / Tx / Px / etc.) |
| `paragraph`   | iff `source` is `oxford` or `odells` | integer paragraph index from `[N][style]` prefix |

### `sourceLabel` formats (use exactly these patterns)

- Oxford: `"Oxford Handbook · paragraph 4949"`
- Odell's: `"Odell's Clinical Problem Solving · paragraph 1234"`
- Leeds restorative: `"Leeds Restorative Handbook, §<section name>"`
- Leeds paediatrics: `"Leeds Paediatrics Handbook, §<section name>"`
- SDCEP: `"SDCEP <document title>, §<section>"` (e.g. `"SDCEP MRONJ Guidance 2024, §4.2"`)
- DBOH: `"Delivering Better Oral Health 2021, §<section>"`
- BSP: `"BSP Good Practitioners Guide 2016, §<section>"` or flowchart name
- FGDP: `"FGDP Selection Criteria for Dental Radiography 3rd ed., §<section>"`
- IADT: `"IADT Guidelines 2020 — <document>, §<section>"`
- BES: `"BES Guidelines 2022 — <section title>"`
- NICE: `"NICE TA1 Wisdom Teeth, §<section>"`
- RCS: `"RCS <document title>, §<section>"`
- Ortho referral: `"BOS When To Refer"` / `"Manchester Ortho e-Referral Guidance"`

If the section name is not obvious, use the nearest heading in the source. Don't invent.

## What to tag

Emit a row when an excerpt evidences any of:

- **Etiology / mechanism** — what causes the problem; biomechanical or biological chain.
- **Presentation** — symptoms the patient reports; signs the clinician sees on initial examination.
- **Special-test results** — vitality, percussion, palpation, mobility, probing depth, radiograph findings, transillumination, occlusal interference, numerical thresholds.
- **Defining characteristics** — what distinguishes this from differentials in the same origin.
- **Treatment** — drug doses, irrigation regimens, restorative materials, technique, indications, contraindications, referral thresholds.
- **Prognosis** — outcome statements with or without treatment; numerical survival / success rates.

## What to skip

- Pure anatomy descriptions with no diagnostic payload
- Historical / research / theory-frame discussions
- Adaptation / remodelling / cell-biology dynamics
- Administrative or policy text
- Common knowledge ("teeth have enamel")
- Internal podcast episode codes (`GF019`, `PDP177`, `IC051`)
- Excerpts about populations or epidemiology with no clinical decision rule

## Verbatim discipline

- Copy the source sentence as-is. Preserve `↑`, `↓`, `1°`, `2°`, arrows, percent signs, curly quotes, en/em dashes from the source.
- Do not normalise capitalisation. Do not merge two sentences. Do not trim a clause.
- If the source contains a line break mid-sentence (Calibre artefact), repair it to a single space — that is the only allowed normalisation.

## Run report

When you finish (or stop because context filled), write a final note in the conversation summarising:

- Last paragraph / line index processed
- Number of rows appended
- Any new origin slugs you used (so they can be promoted to canonical)
- Any sections you deliberately skipped and why
