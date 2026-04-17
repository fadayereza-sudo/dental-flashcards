---
name: extract-references
description: "Scan source material and extract sections relevant to the user's learning goals as reference files. Trigger when the user asks to \"find references\", \"extract references\", \"scan for content\", or wants to identify what to study. Reads from `source-material/`. Writes to `references/`."
---

# extract-references

Systematically scan preprocessed dental textbooks **line by line** and extract every section that will help the user become a safe, competent GDP. Each extracted section becomes a reference file — the raw input for flashcard generation.

## User's learning goals

The user is a GDP returning after a 2+ year career break. Every section you extract must serve at least one of these goals:

1. **Safe clinician** — diagnosis, treatment planning, knowing your limits, medical history red flags, emergencies
2. **Independent thinker** — clinical reasoning, understanding *why* not just *what*, differential diagnosis, case analysis
3. **Holistic care** — biopsychosocial model, patient communication, behaviour change, transparency and trust
4. **Complex case reasoning** — how different aspects of a case interact and affect the plan

### What to extract

- Clinical reasoning and decision-making processes
- Diagnostic frameworks and differential diagnosis
- Treatment planning logic (why this option over that one)
- Medical history considerations that affect dental treatment
- Emergency recognition and management
- Patient communication techniques
- Prevention strategies and behaviour change
- Operative principles and techniques for common procedures
- Pharmacology relevant to GDP (analgesics, antibiotics, interactions)
- Legal, ethical, and professional obligations
- Conditions to recognise and refer

### What to skip

- Rare specialist procedures the user would refer out (e.g. orthognathic surgery details, complex implant planning)
- Detailed lab techniques or materials science beyond what a GDP needs to choose and explain
- Historical context or academic debate that doesn't affect clinical practice
- Repetitive content already captured from another source
- Tables of contents, indexes, contributor lists, copyright pages

### 80/20 rule

Focus on content with the highest clinical yield. A paragraph explaining *why* a treatment works is worth more than a page listing every variant of a technique. Extract the reasoning, not the encyclopaedia.

## Source material

Three categories of source in `source-material/`:

| Short name | Full title | Structure | Extraction approach |
|---|---|---|---|
| `oxford-handbook` | Oxford Handbook of Clinical Dentistry 7e | Topic-based chapters with sections | **Verbatim** — line-by-line scan, copy text as-is |
| `biopsychosocial` | The Biopsychosocial Model of Health and Disease 2019 | Theoretical chapters on the BPS model | **Applied** — read for principles, write dental applications |
| `guidelines/<body>` | UK dental guidelines (DBOH, SDCEP, BSP, FGDP) | Decision rules + rationale | **Recommendation + rationale** — one reference per recommendation |
| `university handbooks/` (sources for `paed-handbook`, `restorative-handbook`) | Leeds University clinical handbooks (Paediatric, Restorative) | Plain Calibre `.txt`, procedural how-to | **Procedural verbatim** — one reference per procedure, decision, or tool/method block |

The two textbooks each have:
- **`full-text.txt`** — every paragraph, one per line, tagged `[index][style] text`
- **`image-map.json`** — extracted images mapped to paragraph indices
- **`images/`** — extracted image files

Guidelines have a different layout — see "Guidelines — recommendation + rationale" below.

## Book-specific approaches

### Oxford Handbook — verbatim extraction

The Oxford Handbook is a clinical reference. Extract text verbatim using the line-by-line scan workflow below.

### Biopsychosocial — applied to dentistry

The biopsychosocial book is academic theory (philosophy, systems theory, epistemology). Verbatim paragraphs about physicalism and Hegel will not make useful flashcards. Instead:

1. **Read the source** to understand the principles being taught.
2. **Identify each principle** that has practical relevance to GDP work — patient communication, pain management, behaviour change, treatment planning, clinical reasoning under uncertainty.
3. **Write a reference** that teaches the principle *applied to dental practice*. The body is **not verbatim** — it is a clear explanation of the principle with concrete dental examples. The `paragraphs` field records where in the source the principle was derived from.
4. **One reference = one teachable principle** — sized for 1–5 flashcards.

#### What to extract from the biopsychosocial book

- The biopsychosocial model itself and what it means for dentistry
- Pain perception: discriminative, motivational, evaluative components; catastrophising
- Chronic stress mechanisms and their dental consequences (bruxism, TMD, periodontal disease, dry mouth)
- Patient-centred care: asking what matters to the patient, not just what's the matter
- Agency and autonomy: shared decision-making, giving patients control
- Modifiable causes: targeting what you can change in complex cases
- Clinical uncertainty: managing multifactorial presentations
- Illness attribution and stigma: how shame about oral health affects care-seeking
- Social determinants: deprivation, access, the social gradient in oral health
- Behaviour change: understanding motivation, not just instructing technique

#### What to skip

- Pure philosophy (physicalism, dualism, reductionism debates)
- Academic methodology (statistical theory, study design philosophy)
- Research framework design (RDoC, grid models)
- Psychiatry-specific content
- Historical context that doesn't yield a clinical lesson

### University handbooks — procedural verbatim

The Leeds Paediatric and Restorative clinical handbooks are written *for student dentists doing the procedure*. They are dense with the practical detail that disappears from textbooks: which instrument to pick, how to position the patient, what bonding regime to follow, when to abandon a treatment plan and refer. **This is the highest-value content in the repo for clinical bedside competence — extract it carefully.**

#### Source layout

```
source-material/university handbooks/
  Paediatric dentistry clinical handbook - denjt.txt        # ~5,300 lines
  RESTORATIVE HANDBOOK 2018-min-compressed c - Unknown.txt   # ~13,000 lines
  *.pdf                                                       # ignored — text only
```

The `.txt` files are plain Calibre output. There are no `[Para NNN]` tags. Use **file line numbers** (the numbers shown by `Read`) for traceback.

Calibre artefacts to expect:
- Paragraphs are spread across multiple lines with blank lines between every line of text. Treat any block of consecutive non-blank lines (allowing for these blank-line breaks) as one paragraph when extracting.
- Page-header repetitions like `PAEDIATRIC DENTISTRY CLINICAL HANDBOOK` or `Department of Restorative Dentistry / Clinical Handbook` reappear every few pages — skip them.
- Numbered lists may be split across lines. Reconstruct them in the reference body so they read as a list.
- Tables are mangled. Most can still be reconstructed by reading the surrounding prose — do that, since we are not extracting images.

#### Approach

1. **Read the file in batches** of ~1,500 lines (similar to Oxford Handbook).
2. **Identify procedural / decision blocks** — a section that teaches *how to do something* or *when to do which option*. Examples: "Local anaesthetic technique in children", "Rubber dam placement on a primary molar", "Composite layering on an anterior tooth", "Vitality testing — interpreting a non-responder".
3. **One reference = one procedure or one decision** — sized for 1–5 flashcards. If a section covers ten distinct procedures (e.g. an entire chapter on caries management), split it into ten references.
4. **Body is verbatim from the source**, with light cleanup only:
   - Strip Calibre's blank-line bloat between lines of the same paragraph.
   - Strip repeated page-header lines (`PAEDIATRIC DENTISTRY CLINICAL HANDBOOK`, etc.).
   - Reconstruct broken numbered lists as proper lists.
   - **Do not** paraphrase, summarise, or "improve" the wording. The student-handbook voice is the value — it is already at the right level of detail.
5. **Skip non-procedural content**:
   - Front matter, contributor lists, acknowledgements, ToC.
   - "Welcome to the clinic / your role as a student" admin pages.
   - Department logistics (clinic hours, attendance policies, dress code, the lockers, dispensary opening times).
   - Assessment criteria pages, exam structures (Jackson Prize, Annual Review).
   - Marketing or branding text (BSPD membership, society endorsements).
   - Legal disclaimers and copyright pages.
   - Repeated chapter cover pages and section dividers with no content.

#### Reference file path and ID

```
references/<short-name>/<short-name>-<NNN>.md
```

Where `<short-name>` is:
- `paed-handbook` (Paediatric Dentistry Clinical Handbook, Leeds, 2017)
- `restorative-handbook` (Restorative Dentistry Clinical Handbook, Leeds, 2018)

Example: `references/paed-handbook/paed-handbook-007.md`.

#### Frontmatter

```yaml
---
id: paed-handbook-007
book: "Paediatric Dentistry Clinical Handbook (Leeds, 2017)"
section: "Local Anaesthetic – Topical anaesthesia in children"
paragraphs: []          # not used — no paragraph index in source
sourceLines: [1834, 1902]   # inclusive Read line range
images: []              # text-only extraction; leave empty
tags:
  - operative
  - patient-communication
---
```

- `book` — full title with year/institution.
- `section` — `"<Chapter title> – <Specific procedure or decision>"`.
- `paragraphs` — leave as `[]`.
- `sourceLines` — `[start, end]` line range from the `Read` tool's line numbers.
- `images` — leave as `[]`. We are not extracting images from these handbooks.
- `tags` — see `references/README.md`.

#### Body template

No fixed sub-headings. Just the verbatim procedural text from the source, cleaned of Calibre artefacts. If the source itself uses sub-headings (e.g. "Indications", "Technique", "Complications"), preserve them.

#### Per-handbook 80/20 — what to skip

- **Paed handbook** — Jackson Prize details, BSPD membership pitch, contributor lists, the introductory "objectives of the curriculum" page, lecture timetables.
- **Restorative handbook** — clinic equipment cabinetry layouts, attendance policies, dispensary lists, professional conduct admin, equipment failure phone numbers, blank annotation pages.

### Guidelines — recommendation + rationale

The four UK guideline bodies (DBOH, SDCEP, BSP, FGDP) publish decision rules with an evidence rationale. They are neither narrative prose nor academic theory — they are *rules a GDP applies*. Verbatim copy would bury the rule in evidence-grading scaffolding; pure paraphrase would lose the exact wording the GDP needs to recall.

#### Approach

1. **Read the source `.txt` / `.md`** for the guideline.
2. **Identify each recommendation** — a discrete decision rule the GDP needs to know (e.g. "Apply fluoride varnish 22,600 ppm twice yearly to all children from 3 years upwards"; "For low-bleeding-risk procedures, do not interrupt warfarin if INR is below 4").
3. **For each recommendation, write a reference** with three sections:
   - **The recommendation** — one sentence, exactly as the guideline states it (preserve doses, intervals, thresholds verbatim — these are what get tested).
   - **Why** — the evidence, mechanism, or risk that drives the rule. This is the "because" the user fails the card on if they can't recall it.
   - **How this applies in practice** — the specific clinical scenario where the GDP must act on it. Drugs, doses, intervals, decision points, red flags. Concrete, not abstract.
4. **One reference = one recommendation.** A short guideline (e.g. SDCEP antibiotic prophylaxis) might yield 8–15 references; a long one (DBOH) might yield 60+.

#### Source layout

```
source-material/guidelines/
  delivering-better-oral-health/
    delivering-better-oral-health.md      # web crawl
  SDCEP/
    sdcep-antibiotic-prophylaxis.md       # web crawl
    sdcep-child-caries.md                 # web crawl
    sdcep-dental-prescribing.md           # web crawl
    sdcep-dental-amalgam-implementation-advice - SDCEP.txt
    SDCEP Management of Dental Patients Taking - SDCEP.txt
    SDCEP MRONJ guidance - extant 2024 - SDCEP.txt
    *.pdf                                 # kept for image extraction only
  BSP/
    good practitioners guide 2016 - Unknown.txt
    good_practitioners_guide_2016.pdf     # for images
    BSP_Treatment_Flow_Chart_..._ytube_link.pdf  # single-page flowchart, image source only
  FGDP/
    FGDP-SCDR-ALL-Web.txt
    FGDP-SCDR-ALL-Web.pdf                 # for images
```

**Text from `.txt`/`.md` only.** The PDFs are kept solely for on-demand image extraction (see "Image extraction from guideline PDFs" below). Do not read PDFs as text — they are 100× more expensive than the matching `.txt`.

Calibre's `.txt` will mangle tables (DBOH summary tables, MRONJ risk strata, FGDP frequency-of-recall, BSP staging+grading). That's expected — those tables are captured as images instead.

#### Per-guideline 80/20 — what to skip

- **DBOH** — Ch 13 evidence base, appendix case studies, acknowledgements, endorsements, ToC.
- **SDCEP (all)** — methodology, contributors, full evidence-table appendices, "about this advice" pages, navigation/footer crawl artefacts (anything that looks like a website nav menu).
- **BSP good practitioners guide** — historical context, evidence grading methodology.
- **FGDP** — equipment specification minutiae, dose-calculation appendices.

#### Reference file path and ID

```
references/guidelines/<source>/<source>-<NNN>.md
```

`<source>` matches the subfolder slug, e.g.:
- `dboh` (delivering better oral health)
- `sdcep-antibiotic-prophylaxis`
- `sdcep-child-caries`
- `sdcep-dental-prescribing`
- `sdcep-amalgam`
- `sdcep-anticoagulants`
- `sdcep-mronj`
- `bsp` (good practitioners guide + treatment flow chart together)
- `fgdp`

Example: `references/guidelines/sdcep-mronj/sdcep-mronj-007.md`.

#### Frontmatter for guidelines

```yaml
---
id: sdcep-mronj-007
book: "SDCEP Oral Health Management of Patients at Risk of MRONJ (2024)"
section: "SDCEP MRONJ – Risk stratification of patients on anti-resorptives"
paragraphs: []          # not used for guidelines (no paragraph-indexed source)
sourceLines: [120, 178] # line range in the .txt/.md for traceback
images:
  - sdcep-mronj-007-risk-strata.png
tags:
  - prescribing
  - medical-history
  - recognise-and-refer
---
```

- `book` — full title of the guideline (year included for SDCEP/BSP since they revise).
- `section` — `"<Body short name> <topic> – <subtopic>"`. Lets the in-app folder tree read naturally.
- `paragraphs` — leave as `[]` for guidelines; the source has no paragraph index.
- `sourceLines` — `[start, end]` line range in the `.txt`/`.md` so the user can trace it back. Use `Read` line numbers (not paragraph indices).
- `images` — image filenames pulled from the matching PDF (see below). Saved into `references/images/`.
- `tags` — see `references/README.md` for the full list (includes guideline-specific tags `pharmacology`, `prescribing`, `radiography`, `infection-control`).

#### Body template

```markdown
## The recommendation

<One sentence, exact wording from the guideline. Preserve doses, intervals, numerical thresholds. Quote with quotation marks if the wording is non-obvious or load-bearing.>

## Why

<The evidence, mechanism, or risk that drives the rule. 2–4 sentences. This is what makes the matching flashcards pass/fail-able on reasoning rather than rote.>

## How this applies in practice

<The specific clinical scenario where the GDP must act on this. Concrete: drug names, doses, intervals, decision thresholds, red-flag features. Bullet points are fine if the rule has multiple branches.>
```

#### Image extraction from guideline PDFs

Most guidelines have at least one decision-critical chart or table that the `.txt` either lost or mangled:

- BSP — staging + grading table; step-by-step treatment flow chart (single-page A3 PDF, full image)
- SDCEP MRONJ — risk-strata table
- SDCEP anticoagulants — bleeding-risk decision flowchart
- FGDP — recommended frequency of radiographs table

Workflow:

1. Use a one-shot Python script with `pymupdf` (or fall back to `pdfimages` from poppler) to render specific PDF pages as PNG, OR to dump all embedded images at once.
2. Triage by opening each candidate with `Read` (only the candidates enter context — image bytes are skipped during extraction itself).
3. Save the keepers to `references/images/<reference-id>-<descriptor>.png`.
4. List them in the reference frontmatter `images` array.

For the BSP single-page treatment flowchart PDF (`BSP_Treatment_Flow_Chart_..._ytube_link.pdf`): just render page 1 at 200–300 dpi. There's no reason to extract anything else from that file.

**Do not** read PDFs through the `Read` tool to find the page number for a chart — read the matching `.txt` and grep for the table title or surrounding text, then map that to a PDF page number heuristically (the `.txt` from Calibre often preserves rough page order). If unclear, render a couple of candidate pages and triage.

## How headings work in the Oxford Handbook text

There are **no `[Heading 2]` or `[Heading 3]` tags** in the Oxford Handbook. Structure is encoded as:

- **Chapter boundary:** `[Para 047] Chapter N` — marks the start of a new chapter
- **Chapter title:** `[Para 086] <title>` — the line immediately after a chapter boundary (e.g. `[Para 086] History and examination`)
- **Section headings:** `[Heading 1] <title>` — marks a section within a chapter (e.g. `[Heading 1] Presenting complaint`)
- **Sub-section headings:** `[Para 032] <title>` — shorter heading-style text within a section

**Always derive the current chapter and section title from these tags** as you scan. Every Oxford Handbook reference needs a `section` field like `"Ch 1 History and examination – Presenting complaint"`.

## How to scan the Oxford Handbook — line by line, no sampling

**Read every line.** Do not sample, skip ahead, or skim. The goal is comprehensive coverage. This workflow applies to the Oxford Handbook only; for the biopsychosocial book, see "Book-specific approaches" above.

### Workflow

1. **Check progress.** Read `references/<book>/progress.json` (if it exists) to find the last line processed.
2. **Read a batch of lines.** Load ~1500 lines at a time from `full-text.txt` using offset/limit. This is your working window.
3. **Track heading context.** As you read, maintain the current chapter title and current section heading. Update these whenever you encounter a chapter boundary (`[Para 047] Chapter N`) or a section heading (`[Heading 1]`).
4. **Assess every paragraph.** For each substantive paragraph or group of paragraphs, decide: does this serve the user's learning goals? If yes, mark it for extraction. If no, note it as skipped.
5. **Segment into references.** Group relevant consecutive paragraphs into reference-sized chunks. One reference = one teachable concept (enough for 1–5 flashcards).
6. **Check `image-map.json`** for images in each reference's paragraph range. View clinically useful ones.
7. **Write reference files** for each extracted chunk.
8. **Update `progress.json`** with the last line processed and a summary of what was extracted/skipped.
9. **Load the next batch** and repeat until you reach the end of the file or the context window is getting full.

### Batch size

~1500 lines per read. This fits comfortably in context alongside reference-writing work. For the Oxford Handbook (14,908 lines), that's ~10 batches to cover the whole book.

### When context is getting full

If you've processed several batches and the conversation is getting long, **stop, update progress.json, and tell the user** where you left off. They can invoke the skill again to continue. Do not rush or skip content to finish in one session.

## Progress tracking

Each book gets a progress file at `references/<book>/progress.json`:

```json
{
  "book": "oxford-handbook",
  "totalLines": 14908,
  "lastLineProcessed": 2500,
  "lastChapter": "Ch 2 Preventive and community dentistry",
  "referencesCreated": ["oxford-handbook-001", "oxford-handbook-002", "..."],
  "sectionsSkipped": [
    {
      "lines": [29, 231],
      "reason": "Front matter — title page, copyright, table of contents, contributors"
    }
  ],
  "complete": false
}
```

Update this file **every time you finish processing a batch**. This is the source of truth for resuming work across conversations.

### Resuming

When invoked with no line range:
1. Read `progress.json` for the book.
2. Start from `lastLineProcessed + 1`.
3. Restore heading context from `lastChapter`.

## Writing reference files

### File path

```
references/<book-short-name>/<book-short-name>-<NNN>.md
```

Example: `references/biopsychosocial/biopsychosocial-003.md`

**Numbering:** check the existing files in the book's reference folder to find the next available sequence number. Always use 3-digit zero-padded numbers (001, 002, ...).

### Frontmatter

```yaml
---
id: oxford-handbook-003
book: "Oxford Handbook of Clinical Dentistry 7e"
section: "Ch 1 History and examination – Presenting complaint"
paragraphs: [258, 277]
images: []
tags:
  - clinical-reasoning
  - patient-communication
---
```

- `id` — matches the filename without extension
- `book` — full title of the source book
- `section` — derived from the heading context: `"Ch N <chapter title> – <section heading>"`. Be specific
- `paragraphs` — `[start, end]` inclusive index values from the `[index]` prefix in `full-text.txt` (NOT file line numbers — the index is the number in the first bracket)
- `images` — filenames from `source-material/<book>/images/` that belong to this reference. Copy these to `references/images/` when writing the reference
- `tags` — one or more from the tag list in `references/README.md`

### Body — Oxford Handbook (verbatim)

Copy the text **verbatim** from `full-text.txt`, but:
- **Strip** the `[index][style]` prefix from each line
- **Preserve** paragraph breaks (blank lines between paragraphs)
- **Do not** paraphrase, summarise, or edit the text
- **Do not** include lines that are purely structural (empty `[Para 218]` lines, image captions that are just figure numbers)
- **Include** meaningful figure captions (e.g. "Fig. 1.1 The lower right first molar. The gutta percha point indicates a sinus opening.")

### Body — Biopsychosocial (applied to dentistry)

The body teaches a principle from the book **applied to dental practice**. Structure each reference as:

1. **The principle** — state the concept clearly in 1–2 sentences
2. **What the book says** — summarise the key argument (cite chapter/section, not verbatim paragraphs)
3. **How this applies in dental practice** — concrete dental scenarios, patient interactions, or clinical decisions where this principle matters

Keep it concise and practical. The flashcards generated from these references will test whether the user can recall and apply the principle, not recite academic text.

### Images

1. Check `image-map.json` for images whose `paragraph` falls within the reference's range.
2. View each candidate with `Read` — skip decorative images, logos, icons.
3. Copy useful images to `references/images/` (preserving the original filename).
4. List them in the frontmatter `images` array.

## Deciding granularity

A reference should be **self-contained enough to generate 1–5 flashcards** from it. If a passage only supports one card, that's fine. If a section is so large it covers 10+ distinct concepts, split it into multiple references.

## Running order

Process sources in this order (highest clinical yield first):
1. **`oxford-handbook`** — broadest coverage of GDP-relevant topics (COMPLETE)
2. **`biopsychosocial`** — principles applied to dental practice (see "Book-specific approaches")
3. **`paed-handbook`** — Paediatric Dentistry Clinical Handbook (Leeds, 2017) — procedural how-to for paediatric care
4. **`restorative-handbook`** — Restorative Dentistry Clinical Handbook (Leeds, 2018) — procedural how-to for adult restorative work
5. **`guidelines/`** — UK dental guidelines, in this sub-order:
   1. **DBOH** — broadest preventive coverage
   2. **SDCEP antibiotic prophylaxis** — sharp safety topic, smallest file
   3. **SDCEP MRONJ** — high-stakes prescribing/extraction safety; pull risk-strata image
   4. **SDCEP anticoagulants** — common GDP dilemma; pull decision flowchart image
   5. **SDCEP dental prescribing** — drug-by-drug reference
   6. **SDCEP child caries** — preventive + operative blend
   7. **SDCEP amalgam phase-down** — narrower regulatory scope
   8. **BSP good practitioners guide** — perio fundamentals
   9. **BSP treatment flow chart** — single-page image; one or two reference files that embed it
   10. **FGDP radiography** — narrowest scope; pull frequency-of-recall image

For the Oxford Handbook, work sequentially from line 1 to the end. For the biopsychosocial book, read thematically to understand each principle, then write the applied reference. For guidelines, identify discrete recommendations and write one reference per recommendation (see "Guidelines — recommendation + rationale").

## Inputs

When invoked, the user may specify:
- A specific book: "extract references from odells"
- A specific chapter: "extract from oxford-handbook ch 5"
- A line range: "extract from oxford-handbook lines 3000-5000"
- No arguments: continue from where you left off (check `progress.json`)

If no input is given, check `progress.json` to determine where to resume and continue systematically.

## Output

After processing each batch, report:
- Lines processed (e.g. "lines 1–2500 of 14,908")
- How many references were created
- Which chapters/sections they cover
- The tags assigned
- Any notable sections that were skipped and why
- Where the next session should pick up

## Do NOT

- Skip lines or sample in the Oxford Handbook — read every line in order
- Paraphrase Oxford Handbook text — the body must be verbatim
- For the biopsychosocial book: do not copy verbatim academic text — apply principles to dentistry
- Extract content that doesn't serve the user's learning goals
- Create references for content that's already covered by an existing reference (check paragraph ranges in `progress.json`)
- Copy large images (> 1MB) without noting it — the user may want to skip those
- Try to finish an entire book in one session if context is getting full — stop cleanly and resume next time
