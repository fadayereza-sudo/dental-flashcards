# Extract Guidelines Content

## Goal

For each guideline organisation (SDCEP, DBOH, BSP, FGDP), extract two parallel artefacts from its source material:

1. **Workflows** — practical, step-by-step clinical procedures someone could follow at the chair to GET THINGS DONE. Each workflow is a logical flowchart-in-text. Many source documents already contain decision flowcharts; convert those flowcharts into ordered workflow steps. Each workflow is paired with a slide-based "Test" mode that walks the user through recall in leading statements.
2. **First Principles** — fundamental, scientifically sound truths that the entire organisation's guidance rests on. Same notebook style and rules as the `extract-first-principles` skill. Pooled across every source document inside the category.

Both are bundled into a single `data/guidelines/<slug>.json` per category.

## Input

Source files in `source-material/guidelines/`, grouped by category:

**SDCEP** (`source-material/guidelines/SDCEP/` and root):
- `sdcep-antibiotic-prophylaxis.md` — IE prophylaxis indications and regimens
- `sdcep-child-caries.md` — caries assessment, prevention, treatment by tooth
- `sdcep-dental-prescribing.md` — comprehensive drug guide
- `SDCEP/SDCEP MRONJ guidance - extant 2024 - SDCEP.txt`
- `SDCEP/SDCEP Management of Dental Patients Taking - SDCEP.txt` (anticoagulants/antiplatelets)
- `SDCEP/sdcep-dental-amalgam-implementation-advice - SDCEP.txt`

**DBOH** (`source-material/guidelines/delivering-better-oral-health/`):
- `delivering-better-oral-health.md` — caries, perio, oral cancer, diet, fluoride

**BSP** (`source-material/guidelines/BSP/`):
- `good practitioners guide 2016 - Unknown.txt` — Calibre export of BSP guidance

**FGDP** (`source-material/guidelines/FGDP/`):
- `FGDP-SCDR-ALL-Web.txt` — Calibre export of FGDP competency framework

## Output

For each category `<slug>` ∈ {`sdcep`, `dboh`, `bsp`, `fgdp`}:

- `data/guidelines/<slug>.json` — full category file (workflows + firstPrinciples)
- `data/guidelines/index.json` — category index (already scaffolded; only update if metadata changes)
- `data/guidelines/progress.json` — track extraction progress

## Schema

```json
{
  "slug": "sdcep",
  "title": "SDCEP",
  "organisation": "SDCEP",
  "order": 1,
  "description": "…",
  "workflows": [
    {
      "id": "sdcep-antibiotic-prophylaxis-decision",
      "title": "Antibiotic prophylaxis decision for infective endocarditis",
      "overview": "Plain-prose walkthrough of the workflow as a paragraph or two. No diagrams, no bullet lists, no slide structure. This is what the user reads when they want to refresh on the workflow without being tested.",
      "slides": [
        { "id": 1, "title": "First decision point", "body": "Leading statement that ends in a way that prompts the next slide." }
      ]
    }
  ],
  "firstPrinciples": [
    {
      "id": "sdcep-001",
      "title": "Core truth title",
      "broaderContext": "≤30 words placing the truth in the bigger picture.",
      "body": "## Heading\n\nParagraph that develops the heading, with [1] inline citations.",
      "citations": [
        { "id": 1, "quote": "Verbatim quote from the source.", "source": "SDCEP MRONJ guidance, p.12" }
      ]
    }
  ]
}
```

## Process

### 1. Pick a category and read every source file in it

For SDCEP, that means reading all six files end to end. For DBOH, BSP, FGDP, just the one file each. Do not skip pages, sections, or appendices that look administrative — flowcharts and decision aids often live there.

### 2. Extract workflows

Identify each distinct **decision workflow** or **clinical SOP** that the organisation's guidance defines. A single source document can yield multiple workflows. The SDCEP child-caries guideline alone may produce many: caries risk assessment, prevention regimen, treatment of occlusal lesion in a primary molar, treatment of approximal lesion, behaviour management, etc.

Each workflow must be:
- **Practical and operational** — written so the clinician could follow it at the chair to get something done
- **Logical-flowchart shape** — ordered steps where the next step depends on the previous decision
- **Self-contained** — the user picks one workflow at a time and works through it

When the source contains a flowchart diagram, **transcribe it into prose steps**. Capture every branch and exit condition. Do not invent branches the source doesn't define.

For each workflow, write **two pieces**:

#### a) `overview` (plain prose)
A paragraph or two of natural-language explanation of the whole workflow. No diagrams, no bullet lists, no slide structure. The reader should be able to read it and have the whole flowchart in their head. Use `\n\n` between paragraphs.

#### b) `slides` (test mode)
Convert the same workflow into 5–15 slides. Each slide is one decision point or step.

```json
{ "id": 1, "title": "First decision point", "body": "Leading statement…" }
```

**Writing style for slide bodies:**
- Each `body` is a leading statement that walks the user through the thinking
- End the body in a way that prompts the next concept ("Now that we know X, the next question is Y…")
- Write for a practising dentist; avoid academic phrasing
- Quote from the source when the phrasing is particularly clear; paraphrase otherwise

**Workflow `id` rules:**
- Lowercase, hyphenated, prefixed with category slug
- Globally unique inside the category file
- Examples: `sdcep-antibiotic-prophylaxis-decision`, `sdcep-child-caries-risk-assessment`, `sdcep-mronj-extraction-decision`

### 3. Extract first principles

Pool all source documents in the category and identify **fundamental, scientifically sound truths** that the entire organisation's guidance rests on. Use the **exact same rules** as the `extract-first-principles` skill (in `.claude/skills/extract-first-principles/SKILL.md`). Specifically:

- **Core truths** are facts you could defend in a room of scientists, not protocols or opinions
- **broaderContext** ≤ 30 words, no citations, third person
- **body** uses `## Heading\n\nparagraph` blocks, conversational third-person prose, short sentences, em dashes sparingly
- Body must focus on **clinical application**, not scientific theory
- **Inline citations** `[N]` after concrete claims; citations must be **verbatim** quotes
- For guidelines, the citation `source` field is a free-text reference (e.g. `"SDCEP MRONJ guidance, section 3.2"` or `"Delivering Better Oral Health, p.84"`). The Oxford Handbook `paragraph` field is not used here.

**ID convention for first principles:** `<slug>-NNN` (zero-padded, e.g. `sdcep-001`, `sdcep-002`).

Aim for as many truths as the source genuinely supports. Cross-document truths are fine: if multiple SDCEP documents reinforce the same principle, write it once and cite the strongest source.

### 4. Update the index and progress

`data/guidelines/index.json` is already scaffolded. Only edit it if you need to refine the `description` field after reading the source. Do not change `slug` or `order`.

Update `data/guidelines/progress.json` after each category:

```json
{
  "completed": ["sdcep"],
  "in_progress": "dboh",
  "total_categories": 4,
  "last_updated": "2026-04-26"
}
```

## Rules

- One file per category (`<slug>.json`). Do not split workflows into separate files.
- Workflow `slides` and `overview` must describe the same workflow from different angles — `overview` is the calm read; `slides` are the recall test.
- First principles in the guidelines section follow the same notebook rules as the Oxford Handbook first principles. Keep voice consistent.
- Citations on first principles must be verbatim. Preserve original symbols (`↑`, `1°`, `≤`).
- Do not include workflows that are merely lists ("here are the antibiotics for X"). A workflow needs a decision shape.
- Do not include first principles that are just protocol summaries ("rinse with chlorhexidine before extraction"). A first principle is a verifiable truth about how the body or the disease behaves.

## Trigger

User says: "extract guidelines", "generate guidelines", "extract guideline workflows", "extract guideline first principles", or calls `/extract-guidelines-slides`.
