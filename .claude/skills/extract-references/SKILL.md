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

Two preprocessed books in `source-material/`:

| Short name | Full title | Structure | Extraction approach |
|---|---|---|---|
| `oxford-handbook` | Oxford Handbook of Clinical Dentistry 7e | Topic-based chapters with sections | **Verbatim** — line-by-line scan, copy text as-is |
| `biopsychosocial` | The Biopsychosocial Model of Health and Disease 2019 | Theoretical chapters on the BPS model | **Applied** — read for principles, write dental applications |

Each has:
- **`full-text.txt`** — every paragraph, one per line, tagged `[index][style] text`
- **`image-map.json`** — extracted images mapped to paragraph indices
- **`images/`** — extracted image files

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

Process books in this order (highest clinical yield first):
1. **`oxford-handbook`** — broadest coverage of GDP-relevant topics (COMPLETE)
2. **`biopsychosocial`** — principles applied to dental practice (see "Book-specific approaches")

For the Oxford Handbook, work sequentially from line 1 to the end. For the biopsychosocial book, read thematically to understand each principle, then write the applied reference.

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
