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
      "overview": "## 1. Establish IE risk category\n\nBefore any procedure planning, confirm the group the patient sits in. If unclear, contact the cardiac team or GP.\n\n### High risk\n- Previous IE\n- Surgically implanted prosthetic valves or repair material\n- Transcatheter aortic or pulmonary valve prostheses\n- Untreated cyanotic CHD\n- Palliated cyanotic CHD with residual defects\n- Ventricular assist devices\n\n### Moderate risk\n- Rheumatic heart disease\n- Non-rheumatic degenerative valve disease\n- Congenital valve abnormalities (incl. bicuspid aortic valve)\n- CIEDs\n- Hypertrophic cardiomyopathy\n\n## 2. Branch by procedure (high risk only)\n\n1. **Extractions or oral surgery** → **offer** prophylaxis\n2. **Gingival or periapical manipulation** → **consider**; weigh oral health\n3. **Anything else** → **not required**",
      "slides": [
        { "id": 1, "title": "Step 1: where to start", "body": "Antibiotic prophylaxis against IE is not given routinely. The first thing to settle is the patient's IE risk category. The high risk group includes…" },
        { "id": 2, "title": "High risk conditions", "body": "…previous IE, surgically implanted prosthetic valves, transcatheter aortic or pulmonary prostheses, untreated cyanotic CHD, palliated cyanotic CHD, and ventricular assist devices. Moving down a tier, the moderate risk group includes…" }
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

#### a) `overview` (clinical manual, structured markdown)

The overview is a **clinical manual**, not a summary. The reader is a dentist about to think strategically through a problem at the chair, who wants the workflow organised into clear stages they can scan visually. They are NOT looking for prose; they are looking for a manual.

Write it as **structured markdown** using this subset (the renderer supports nothing else):

- `## Heading` — top-level stage of the workflow (e.g. "1. Establish IE risk category")
- `### Subheading` — sub-stage (e.g. branch labels like "High risk")
- `- item` or `* item` — unordered list (criteria, drugs, branches)
- `1. item`, `2. item`, … — numbered list (sequential steps, decision branches in order)
- `**bold**` — for key decision terms or thresholds
- `*italic*` — sparingly, for emphasis
- Plain paragraphs — short, between blocks

**Structure expectations:**
- Lead with the stages of clinical reasoning. Number them.
- Inside each stage, give the criteria/options as bullets or a numbered list, not prose.
- Use bold for the words the clinician would search for at the chair (e.g. **offer**, **consider**, **not recommended**, drug names, dose thresholds).
- A short intro paragraph per stage is fine when context is needed; a long paragraph is not.
- The whole overview should be visually scannable in under 30 seconds.

**Example shape (abbreviated):**

```markdown
## 1. Establish IE risk category

Before any procedure planning, confirm which group the patient is in. If unclear, contact the cardiac team or GP.

### High risk
- Previous IE
- Surgically implanted prosthetic valves or repair material
- Transcatheter aortic or pulmonary valve prostheses
- Untreated cyanotic CHD
- Palliated cyanotic CHD with residual defects
- Ventricular assist devices

### Moderate risk
- Rheumatic heart disease
- Non-rheumatic degenerative valve disease
- Congenital valve abnormalities (incl. bicuspid aortic valve)
- Cardiovascular implanted electronic devices (CIEDs)
- Hypertrophic cardiomyopathy

### Not at increased risk
- Stents
- Conditions on neither list above

## 2. Branch by risk group

### Moderate risk
- Prophylaxis is **not recommended**
- *Exception:* cardiac team has explicitly requested it → treat on high-risk pathway

### High risk
- Continue to procedure decision (Stage 3)

## 3. Branch by procedure

1. **Extractions or oral surgery** (incl. I&D abscess, perio/endo surgery, implant placement) → **offer** prophylaxis
2. **Gingival or periapical manipulation** (PMPR, BPE, pocket charting, subgingival restorations, PMCs, subgingival rubber dam clamps, ortho separators/bands, endo before apical stop) → **consider** prophylaxis; weigh oral health status
3. **Anything else** (infiltration LA, supragingival restorations, suture removal, radiographs, mucosal trauma) → **not required**
```

#### b) `slides` (incremental test mode)

Convert the same workflow into a sequence of slides that **incrementally tests recall** of the manual. The reader is forced to remember the next stage from a leading prompt.

**Each slide is a small chunk** — one fact, one criterion, one drug, one decision point. Not a paragraph of background.

**Each slide ends with a dangling prompt** that names what comes next without revealing it. Use an ellipsis `…` to mark the dangle.

**Example flow:**

```
Slide 1: "Antibiotic prophylaxis against IE is not given routinely. The first thing to settle is which IE risk group the patient sits in. The high risk group includes…"
Slide 2: "…previous IE, surgically implanted prosthetic valves, transcatheter aortic or pulmonary prostheses, untreated cyanotic CHD, palliated cyanotic CHD, and ventricular assist devices. Moving down a tier, the moderate risk group includes…"
Slide 3: "…rheumatic heart disease, non-rheumatic degenerative valve disease, bicuspid aortic valve and other congenital valve abnormalities, CIEDs, and hypertrophic cardiomyopathy. For a moderate-risk patient, the recommendation is…"
Slide 4: "…prophylaxis is not recommended, unless the patient's own cardiac team has specifically asked for it. For a high-risk patient, the next branch is…"
Slide 5: "…the procedure itself. The strongest tier — extractions and oral surgery — gets…"
```

Each slide:
- 1–3 sentences max. Often one.
- Ends with a leading phrase that names the next concept.
- Uses `…` at the end to mark the dangle, and `…` at the start of the next slide to receive it.
- Picks up immediately where the previous slide left off, so the reader effectively recites the manual back to themselves.

**Slide count:** 18–35 slides for a typical workflow. Each stage of the manual produces several slides. A workflow with three stages and several branches per stage will land around 25 slides.

**Forbidden in slides:**
- Em dashes in slide titles (use `:` or `(qualifier)` instead — em dashes read machine-typical)
- Self-contained paragraph-style bodies that don't dangle
- Background or motivation text that doesn't belong in a recall test
- Repeating information from earlier slides

**Slide title rules:**
- Short, neutral labels of what's being tested at this slide (e.g. `"High risk cardiac conditions"`, `"Moderate risk: management"`, `"Adult oral regimen"`)
- Plain punctuation: `:` or parentheses, not em dashes

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
- `overview` is a **clinical manual in markdown**, not a prose summary. Lead with numbered stages; use bullets, sub-headings, bold and italic. Visually scannable in 30 seconds.
- `slides` are **incremental recall tests**, not paragraph explainers. Each slide is one chunk, ends with a dangling prompt (`…`), and the next slide picks up after the dangle. 18–35 slides per workflow.
- No em dashes in slide titles. Use `:` or parentheses instead.
- First principles follow the same notebook rules as the Oxford Handbook first principles. Keep voice consistent.
- Citations on first principles must be verbatim. Preserve original symbols (`↑`, `1°`, `≤`).
- `broaderContext` ≤ 30 words.
- Do not include workflows that are merely lists ("here are the antibiotics for X"). A workflow needs a decision shape.
- Do not include first principles that are just protocol summaries ("rinse with chlorhexidine before extraction"). A first principle is a verifiable truth about how the body or the disease behaves.

## Trigger

User says: "extract guidelines", "generate guidelines", "extract guideline workflows", "extract guideline first principles", or calls `/extract-guidelines-slides`.
