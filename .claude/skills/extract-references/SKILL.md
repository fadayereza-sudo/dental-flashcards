---
name: extract-references
description: "Scan source material and extract sections relevant to the user's learning goals as reference files. Trigger when the user asks to \"find references\", \"extract references\", \"scan for content\", or wants to identify what to study. Reads from `source-material/`. Writes to `references/`."
---

# extract-references

Systematically scan preprocessed dental textbooks and extract the specific sections that will help the user become a safe, competent GDP. Each extracted section becomes a reference file — the raw input for flashcard generation.

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

Three preprocessed books in `source-material/`:

| Short name | Full title | Structure |
|---|---|---|
| `oxford-handbook` | Oxford Handbook of Clinical Dentistry 7e | Topic-based chapters with sections |
| `odells` | Odell's Clinical Problem Solving in Dentistry 4e | Case-based — each case is a clinical scenario |
| `biopsychosocial` | The Biopsychosocial Model of Health and Disease 2019 | Theoretical chapters on the BPS model |

Each has:
- **`full-text.txt`** — every paragraph, one per line, tagged `[index][style] text`
- **`chapters.json`** — chapter/section boundaries (paragraph indices)
- **`image-map.json`** — extracted images mapped to paragraph indices
- **`images/`** — extracted image files

## How to scan (token-efficient)

**Never load an entire `full-text.txt` into context.** Follow this workflow:

1. **Read `chapters.json`** to get the chapter/section list with paragraph indices.
2. **Pick a section** to evaluate. Calculate its paragraph range (from its index to the next section's index).
3. **Read a sample** — the first 30–50 lines of the section to assess relevance.
4. **Decide:** does this section serve the user's goals? If not, skip it. If yes, read the full section.
5. **Segment the section** into reference-sized chunks. One reference = one teachable concept. This might be:
   - A single paragraph that explains a key mechanism
   - A sequence of paragraphs covering one diagnostic approach
   - A full subsection on a procedure
   - A case presentation with its reasoning
6. **Check `image-map.json`** for images in the paragraph range. View clinically useful ones.
7. **Write the reference file** with verbatim text.
8. **Move to the next section** and repeat.

### Deciding granularity

A reference should be **self-contained enough to generate 1–5 flashcards** from it. If a passage only supports one card, that's fine. If a section is so large it covers 10+ distinct concepts, split it into multiple references.

## Writing reference files

### File path

```
references/<book-short-name>/<book-short-name>-<NNN>.md
```

Example: `references/odells/odells-003.md`

**Numbering:** check the existing files in the book's reference folder to find the next available sequence number. Always use 3-digit zero-padded numbers (001, 002, …).

### Frontmatter

```yaml
---
id: odells-003
book: "Odell's Clinical Problem Solving in Dentistry 4e"
section: "Case 9 – Selective caries removal in deep lesions"
paragraphs: [1205, 1230]
images:
  - para-1210-img-042.jpeg
tags:
  - operative
  - clinical-reasoning
---
```

- `id` — matches the filename without extension
- `book` — full title of the source book
- `section` — human-readable chapter/case + topic. Be specific: "Case 9 – Selective caries removal in deep lesions" not just "Case 9"
- `paragraphs` — `[start, end]` inclusive line numbers in `full-text.txt` (the `[index]` values, not file line numbers)
- `images` — filenames from `source-material/<book>/images/` that belong to this reference. Copy these to `references/images/` when writing the reference
- `tags` — one or more from the tag list in `references/README.md`

### Body

Copy the text **verbatim** from `full-text.txt`, but:
- **Strip** the `[index][style]` prefix from each line
- **Preserve** paragraph breaks (blank lines between paragraphs)
- **Do not** paraphrase, summarise, or edit the text
- **Do not** include lines that are purely structural (empty `[Para 218]` lines, image captions that are just figure numbers)
- **Include** meaningful figure captions (e.g. "Fig. 1.1 The lower right first molar. The gutta percha point indicates a sinus opening.")

### Images

1. Check `image-map.json` for images whose `paragraph` falls within the reference's range.
2. View each candidate with `Read` — skip decorative images, logos, icons.
3. Copy useful images to `references/images/` (preserving the original filename).
4. List them in the frontmatter `images` array.

## Tracking progress

When scanning a book, keep track of where you are by checking which references already exist for that book. The paragraph ranges in existing references tell you what's been covered.

### Running order

Process books in this order (highest clinical yield first):
1. **`oxford-handbook`** — broadest coverage of GDP-relevant topics
2. **`odells`** — case-based reasoning, excellent for clinical thinking
3. **`biopsychosocial`** — theoretical framework for holistic care (selective — only extract what's clinically applicable)

Within each book, work through sections in order from `chapters.json`. This ensures systematic coverage without gaps.

## Inputs

When invoked, the user may specify:
- A specific book: "extract references from odells"
- A specific chapter/case: "extract from odells case 9"
- A tag focus: "find emergency content across all books"
- No arguments: continue from where you left off (check existing references to find the last covered paragraph range, then continue from there)

If no input is given, check existing references to determine progress and continue systematically.

## Output

After writing each batch of references, report:
- How many references were created
- Which sections they cover
- The tags assigned
- Any notable sections that were skipped and why

## Do NOT

- Load `full-text.txt` in its entirety — always grep or read targeted ranges
- Paraphrase or edit the source text — the body must be verbatim
- Extract content that doesn't serve the user's learning goals
- Create references for content that's already covered by an existing reference (check paragraph ranges)
- Copy large images (> 1MB) without noting it — the user may want to skip those
