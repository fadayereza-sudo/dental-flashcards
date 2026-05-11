---
name: extract-troubleshooting
description: "Compile the dental troubleshooting guide. Two-pass: (1) scan source material — Oxford Handbook, Odell's, all dental guidelines — and tag clinically-actionable excerpts by origin; (2) synthesise per-origin JSON of problems with etiology / presentation / results / defining characteristics / treatment / prognosis / condition name. Reads from `source-material/`. Writes to `data/troubleshooting/`. Triggered by `/extract-troubleshooting`."
---

# Extract Dental Troubleshooting Guide

## Goal

Build a fast diagnostic / decision-support reference for general dental practice, organised as a 3-level accordion: **origin → problem → details**. The reader sees a list of body regions / structures, opens one to see a list of *symptom-led problem descriptions*, opens a description to reveal the seven labelled sections that pin down the diagnosis: etiology, presentation, results, defining characteristics, treatment, prognosis, and finally the **name of condition**.

The level-2 label is the symptom-led description, not the condition name. Opening the toggle is a "what is this?" practice — the diagnosis is revealed inside. So the description must give the *picture* without naming the disease.

Content is compiled by reading every line of the source pillars *as if for the first time* — never the summarised versions already in the repo (`data/first-principles/`, `data/guidelines/`). Those are downstream products; this skill returns to source.

The Leeds restorative and Leeds paediatric university handbooks are **excluded** from this skill. Even though they live in `source-material/university handbooks/`, do not read them — they're student lecture notes, not the credibility tier we want for a clinical decision-support guide. Stick to Oxford, Odell's, and the published guidelines.

## Input — source pillars

```
source-material/
├── oxford-handbook/
│   ├── full-text.txt          # paragraph-indexed: [index][style] text
│   └── chapters.json          # chapter / section boundaries
├── odells/
│   ├── full-text.txt          # paragraph-indexed (same format as Oxford)
│   └── chapters.json
└── guidelines/
    ├── SDCEP/                 # *.md + Calibre *.txt
    ├── delivering-better-oral-health/  delivering-better-oral-health.md
    ├── BSP/                   # *.md flowcharts + Calibre *.txt
    ├── FGDP/                  # FGDP-SCDR-ALL-Web.txt
    ├── IADT/                  # 01..04 *.md (sectioned)
    ├── orthodontic-referral/  # *.md
    ├── NICE/                  # wisdom-teeth.txt
    ├── Royal College of Surgeons/  # *.txt
    └── BES/                   # 01..09 *.md (sectioned)
```

Two source families:

- **Paragraph-indexed** (Oxford, Odell's): every paragraph is `[N][style] text`. Cite by `paragraph: N`.
- **Unstructured** (all guidelines): plain text or markdown without paragraph indices. Cite by free-text `source: "..."` (e.g. `"BSP Good Practitioners Guide 2016, §3.2"`, `"BES Guidelines 2022 — Vital Pulp Therapy"`).

Never copy any of these source files into the project tree. The dev server OOMs on large binaries and large text in `node_modules`-adjacent areas; read in place from `source-material/`.

## Output

- `data/troubleshooting/<origin-slug>.json` — one origin file per body region / structure
- `data/troubleshooting/index.json` — list of origin metadata; updated on every synthesis
- `data/troubleshooting/progress.json` — scan + synthesis progress
- `staging/troubleshooting/<source-slug>.jsonl` — phase-1 tagged excerpts (gitignored, working artefact)

## Origins (canonical slugs)

These are the 20 level-1 origins. Order is the display order; the slug must match exactly so file paths and IDs line up. Origins 1–15 are anatomical sites a GDP examines directly. Origins 16–20 are categorical groupings for problems that don't sit at a single site — they were added after the Oxford Handbook gap analysis (2026-05-11) surfaced large blocks of jaw, salivary, craniofacial, neuropathic, and systemic-disease conditions that didn't fit the original 15.

| order | slug                  | title                  |
| ----- | --------------------- | ---------------------- |
| 1     | `skin`                | Skin                   |
| 2     | `lips`                | Lips                   |
| 3     | `cheeks`              | Cheeks                 |
| 4     | `tongue`              | Tongue                 |
| 5     | `floor-of-mouth`      | Floor of mouth         |
| 6     | `palate`              | Palate                 |
| 7     | `throat`              | Throat                 |
| 8     | `muscles`             | Muscles                |
| 9     | `periodontal`         | Periodontal            |
| 10    | `primary-dentition`   | Primary dentition      |
| 11    | `permanent-dentition` | Permanent dentition    |
| 12    | `fixed-prosthesis`    | Fixed prosthesis       |
| 13    | `removable-prosthesis`| Removable prosthesis   |
| 14    | `psychological`       | Psychological          |
| 15    | `lifestyle`           | Lifestyle              |
| 16    | `jaw`                 | Jaw                    |
| 17    | `salivary`            | Salivary glands        |
| 18    | `craniofacial`        | Craniofacial syndromes |
| 19    | `neuropain`           | Neurogenic pain        |
| 20    | `systemic`            | Systemic disease       |

This list is not closed. If a clinically important problem cleanly belongs to an origin not on the list, add the origin and append it to the index — never force-fit it into a wrong bucket.

**Allocation rule when a condition touches several origins**: put it where the GDP first *sees* the problem. A drug-induced lichenoid reaction is `cheeks`; sickle-cell-related infarcts in the jaw are `jaw`; a leukaemic patient whose gingiva bleeds spontaneously is `periodontal` (with `systemic` for the underlying disease as a separate problem). Cross-reference in `definingCharacteristics` rather than duplicating across origins.

## Schema

```ts
// data/troubleshooting/index.json
type Index = { slug: string; title: string; order: number; description?: string }[];

// data/troubleshooting/<origin-slug>.json
type OriginData = {
  slug: string;
  title: string;
  order: number;
  description?: string;
  problems: {
    id: string;                       // "<origin-slug>-NNN" zero-padded
    description: string;              // L2 label — symptom-led, no condition name
    conditionName: string;            // revealed inside L3, last section
    prevalence: "very-common" | "common" | "uncommon" | "very-uncommon" | "rare";
    etiology: string;                 // markdown body, may include [N] citation markers
    presentation: string;
    results: string;
    definingCharacteristics: string;
    treatment: string;
    prognosis: string;
    citations?: { id: number; quote: string; paragraph?: number; source: string }[];
  }[];
};

// data/troubleshooting/progress.json
type Progress = {
  scanned: { oxford?: boolean; odells?: boolean; guidelines?: boolean };
  synthesised: string[];   // origin slugs done
  totalOrigins: number;
  lastUpdated: string;     // ISO date
};
```

## Process — two phases

### Phase 1 — source-first scan (per source, all origins)

Walk one source pillar at a time, beginning to end, tagging every clinically-actionable excerpt with the origin(s) it belongs to. The output is a JSONL file at `staging/troubleshooting/<source-slug>.jsonl` — one tagged excerpt per line.

Use the **scan-source** prompt at `prompts/scan-source.md`. Each row looks like:

```json
{"origin": "permanent-dentition", "source": "oxford", "paragraph": 4949, "sourceLabel": "Oxford Handbook · paragraph 4949", "quote": "Infection of the pulp can result in…", "hint": "irreversible pulpitis vs apical periodontitis"}
```

Required keys per row:
- `origin` — one slug from the canonical list
- `source` — short ID (`oxford`, `odells`, plus one per guideline: `sdcep`, `dboh`, `bsp`, `fgdp`, `iadt`, `bes`, `nice`, `rcs`, `orthodontic-referral`)
- `quote` — verbatim sentence(s) from the source. No paraphrasing.
- `sourceLabel` — the human-readable label that will end up in citation popouts (`"Oxford Handbook · paragraph 4949"`, `"Odell's Clinical Problem Solving · paragraph 1234"`, `"BES Guidelines 2022 — Hypochlorite Accident"`)
- `hint` — short note (≤15 words) on what this excerpt evidences (etiology / presentation / Tx / Px etc.)

Optional keys:
- `paragraph` — integer index for paragraph-indexed sources (Oxford, Odell's). Required when source is `oxford` or `odells`.

If one excerpt is relevant to two origins (e.g. a sentence on hypochlorite accident touches both `permanent-dentition` and `floor-of-mouth`), emit one row per origin with the same quote.

**What to tag:**
- Etiology / mechanism statements
- Diagnostic criteria, named tests, threshold numbers
- Presenting complaints, symptoms, signs
- Treatment regimens, indications, contraindications
- Prognosis / outcomes statements
- Defining clinical-appearance descriptions

**What to skip:**
- Pure anatomy descriptions with no diagnostic payload
- Historical / research / theory-frame discussions (Layer C)
- Adaptation / remodelling / cell-biology dynamics (memory: Layer A only)
- Administrative or policy text
- Common knowledge ("teeth have enamel")
- Internal episode codes from podcast bleed-through (`GF019`, `PDP177`, `IC051` and similar)

**Chunking:**
- For paragraph-indexed sources, read in 1500-paragraph windows.
- For unstructured Calibre exports, read in ≤800-line windows.
- Keep each agent read ≤50k tokens. Default model is Sonnet — never Opus or Sonnet-1M for these workers (memory: `feedback_agent_model_choice.md`).
- Append rows to the JSONL as you go; never rewrite. Crash-resumable means re-running re-tags but never loses prior work — dedupe in phase 2.

**Sub-agent fan-out:** one Sonnet worker per source pillar. Each worker walks its source independently and writes to its own JSONL. Workers do **not** synthesise; their job is *find and tag*.

### Phase 2 — per-origin synthesis (one origin at a time)

Triggered by `/extract-troubleshooting <origin-slug>`. For the named origin:

1. **Gather** all rows from `staging/troubleshooting/*.jsonl` where `origin == <slug>`. Dedupe by `(source, quote)`.
2. **Cluster** rows by clinical entity. Each cluster represents one problem — one named condition (or one named differential) — regardless of which source contributed. A row about "irreversible pulpitis" from Oxford and another from BES belong in the same cluster.
3. **Draft** one `Problem` object per cluster. Fill all seven sections. Use plain, spoken-style third person, the same notebook voice as `extract-first-principles`. The `description` is the one-sentence symptom-led picture; `conditionName` is the diagnosis, revealed at the end.
4. **Cite** every concrete claim with an inline `[N]` marker that resolves to a citation entry. The citation array is shared across the seven sections of a single problem; numbering is local to that problem (`[1]`, `[2]`, … starting from 1 for each problem).
5. **Validate**: every `[N]` marker has a matching citation entry; every citation has a non-empty `quote` and `source` (paragraph optional). No section is empty unless the source genuinely has nothing to say on it.
6. **Write** `data/troubleshooting/<origin-slug>.json` (full origin replacement, idempotent).
7. **Update** `data/troubleshooting/index.json` (append the origin if new, or update its `description` if changed) and `data/troubleshooting/progress.json` (`synthesised` list, `lastUpdated`).

Use the **synthesise** prompt at `prompts/synthesise.md`.

## Writing rules — voice, fidelity, and the seven sections

These rules apply to both phases (citations are surfaced as-is in phase 2).

### `description` (level-2 label)

A single sentence, ≤25 words, third person. Lead with the most distinctive observable or patient-experienced feature. Do **not** name the condition. The reveal at the bottom is the payoff.

❌ "Localised periodontitis: probing depths above 5.5 mm with attachment loss."
✅ "Pocket forms between the tooth and the gums, trapping bacteria and causing foul breath."

### `conditionName`

The most precise clinical name the sources support. If sources disagree, use the most current consensus and make the alternatives explicit in `definingCharacteristics`. No abbreviations without expansion on first appearance (e.g. `"Necrotising ulcerative gingivitis (NUG)"`).

### `etiology`

What causes the problem. Lead with the mechanistic chain (what triggers what), grounded in static structural / biomechanical facts where applicable (memory: `feedback_tissue_level_biomechanics.md` — composition, stiffness, attachment relationships, not adaptation theory). One short paragraph; cite the specific causal claim.

### `presentation`

What the patient says, what the clinician sees on initial look. Symptoms first, then signs. Plain language. If a symptom is a near-pathognomonic, say so.

### `results`

Special-test findings: vitality test results, percussion / palpation, mobility grade, probing depths, radiographic signs, occlusal check findings, transillumination, etc. Numerical thresholds are cited verbatim.

### `definingCharacteristics`

What makes this condition distinguishable from its near-neighbours in the same origin. The differential thinking. Use 1–3 short sentences or 2–4 bullet-style points (still as paragraph prose). Mention the *contrast* — "unlike X, this Y" — when sources support it.

### `treatment`

Best typical treatment in primary care. If the condition needs referral, say to whom and at what threshold. Drug doses, irrigation regimens, restorative materials — all cited verbatim from the source that states them. Do not invent doses.

### `prognosis`

Two halves where sources support it: with treatment, without treatment. Numerical outcomes (success rates, survival, %retention) must be cited. If sources don't speak to prognosis, write the strongest cited statement you have and leave it short — do not pad.

### `prevalence`

Required. One of `very-common` | `common` | `uncommon` | `very-uncommon` | `rare`. Framed by **GDP encounter frequency in a typical UK practice**, not lifetime population prevalence — the guide is a clinical decision-support tool, so what matters is pre-test probability when a patient walks in.

The buckets:

- **very-common** — encountered multiple times a week. Most adults will have it at some point. Bread-and-butter. (Plaque-induced gingivitis, caries, dentine hypersensitivity.)
- **common** — encountered at least monthly. A meaningful subgroup carries it. (Angular cheilitis, RAS, denture stomatitis, stage I–II periodontitis.)
- **uncommon** — a few times a year. Specific patient sub-populations. (NUG, geographic tongue, cracked tooth syndrome, stage III–IV periodontitis.)
- **very-uncommon** — once every couple of years. Often referred. (Orofacial granulomatosis, erosive lichen planus, chronic hyperplastic candidosis.)
- **rare** — career-rare or never seen by a typical GDP. (Pemphigus, certain syndromes, specific malignancies.)

How to assign:

- Where a source gives a hard number (population %, % in subgroup, annual incidence), that's the strongest evidence — use it and cite the figure inline in the body. Don't add a separate `prevalenceNote` field.
- Where no number exists, assign by clinical-frequency framing using how the source itself signals frequency. Oxford and Odell's use phrases like "very common", "rare", "occasionally seen", "the commonest cause of…" — those phrases steer the bucket.
- When two sources signal differently, lean on the more recent / more credible one.
- For conditions that are common in a sub-population but rare overall, score by GDP encounter frequency. Denture stomatitis is **common** because GDPs see denture wearers daily, even though it's uncommon in the general adult population.

## Citation rules

- **Every citation has a `source` string.** This is the label the reader sees in the popout. Do not rely on the paragraph fallback — write `source: "Oxford Handbook · paragraph 4949"` even when `paragraph: 4949` is also set.
- **Verbatim only.** No paraphrasing, no merging two source sentences, no rounding numbers. Preserve original symbols (`↑`, `1°`), arrows, and typography (curly quotes, en/em dashes).
- **One citation can support several claims** in the same paragraph. Don't put a marker after every sentence. Aim for 3–8 citations per problem; more if numerical thresholds and drug doses cluster, fewer if the condition is well-known.
- **No common-knowledge citations.** "Teeth have enamel" — no cite. "Caries is a dynamic balance of demineralisation and remineralisation" — cite, that's the load-bearing claim.
- **Numbering is per-problem.** `[1]`, `[2]`, … restart at 1 for each new problem. Markers may appear in any of the seven sections.

## Hard rules — voice and content

(Inherited from `extract-first-principles` and project memory.)

- **Layer A only.** Static structural / biomechanical facts and clinical decision rules. Drop adaptation theory, remodelling frameworks, FEM, cell biology, research-frame discussions. Memory: `user_first_principles_learning_philosophy.md`, `feedback_tissue_level_biomechanics.md`.
- **No extrapolation.** If a source doesn't state etiology / Tx / Px, leave that section sparse. Never fabricate rationale to dress up a bare rule. Memory: `feedback_no_extrapolation_in_cards.md`.
- **No internal episode codes.** Strip podcast catalogue codes (`GF019`, `PDP177`, `IC051`) anywhere they bleed in. Memory: `feedback_strip_internal_episode_codes.md`.
- **Third person only.** No "I do", "we", "us", "for me". Direct impersonal statements.
- **Spoken-style, not textbook.** Short sentences, plain words, natural rhythm. Cut "It is also worth noting that…", "The clinical implication is therefore that…". Just say the thing.
- **Em dashes sparingly.** Prefer commas, periods, colons.
- **No reference to "the handbook" / "the guideline" / "the textbook" inside body fields.** Citations carry provenance.

## Sample run — first origin: `permanent-dentition`

Before scaling to all origins, run this exact sample and hand back to the user for review.

1. **Scoped phase 1** — only sections of each source most likely to contain permanent-dentition material:
   - Oxford Handbook chapter 6 (Repairing teeth), chapter 7 (Endodontics), chapter 12 (Oral medicine — caries / pulpitis bits)
   - Odell's: cases on caries, pulp, fracture, sensitivity (chapters covering same)
   - Guidelines: BES (all 9 sections), SDCEP child caries (only the permanent-dentition portions), DBOH (caries-prevention section), FGDP (radiography selection criteria for caries)
2. **Phase 2** — synthesise `data/troubleshooting/permanent-dentition.json` aiming for 5–10 problems: caries (initial / cavitated), reversible pulpitis, irreversible pulpitis, apical periodontitis, periapical abscess, cracked tooth syndrome, dentine hypersensitivity, NCTSL, internal / external resorption, fluorosis. Pick the highest-value subset, not all ten.
3. **Hand back** for user review of: schema fit, voice, citation density, level-2 description style, condition-name reveal placement.
4. **Iterate** the prompts based on feedback before scaling to other origins.

After the sample is signed off, run phase 1 to completion across all sources, then synthesise origins one at a time.

## Trigger

User says, or types:

- `/extract-troubleshooting --scan <source-id>` — phase 1 for one source
- `/extract-troubleshooting <origin-slug>` — phase 2 synthesis for one origin
- `/extract-troubleshooting` (no arg) — print status from `progress.json` and ask which origin or source to run

Also triggered by: "extract troubleshooting", "build troubleshooting guide", "compile troubleshooting".
