---
name: pdf-to-flashcards
description: Convert dental e-book content into spaced-repetition flashcards. Trigger when the user asks to "make flashcards from", "ingest", "extract cards from", or otherwise process a textbook. Reads from preprocessed source material in `source-material/`. Outputs JSON files into `flashcards-import/` for the existing `npm run import` pipeline — never writes to the database.
---

# pdf-to-flashcards

Convert chapters of a dental textbook into FSRS-ready flashcards. The cards must teach the *meaning* behind each fact, not just the fact, so retention compounds across reviews.

## User context

The user is a starting GDP (general dental practitioner). Focus on practical, common-case knowledge: diagnosis, bread-and-butter procedures, pain and emergencies, medical history red flags, patient communication. Skip rare specialist detail — for those, just "recognise and refer."

## Inputs (ask if missing)

1. **Book** — which preprocessed source in `source-material/`. Currently available:
   - `source-material/oxford-handbook/` — Oxford Handbook of Clinical Dentistry 7e
   - `source-material/odells/` — Odell's Clinical Problem Solving 4e
   - `source-material/biopsychosocial/` — The Biopsychosocial Model of Health and Disease 2019
2. **Chapter** — number + title (e.g. "Ch 1 – History and examination"). Check `chapters.json` for boundaries.
3. **Card count** — for test batches, default to 5. For full chapter runs, ask before assuming.

## Reading source material

Books are preprocessed into `source-material/<book>/` with three files:

- **`full-text.txt`** — every paragraph, one per line, tagged `[index][style] text`. Use `Grep` to search, `Read` with line ranges to read specific sections. Never load the whole file.
- **`chapters.json`** — paragraph indices for chapter/section boundaries.
- **`image-map.json`** — maps extracted images to paragraph indices. Images are in `images/`.

### Workflow (token-efficient)

1. Read `chapters.json` to find the chapter's start/end paragraph indices.
2. `Grep` the chapter range in `full-text.txt` for key topics, section headings, and figure references.
3. `Read` only the paragraph ranges you need — targeted sections, not the whole chapter.
4. Check `image-map.json` for images in the chapter's paragraph range.
5. Read the chapter in sections, drafting cards as you go. Don't dump the entire chapter into context.

### Fallback for books without preprocessed source

If a book hasn't been preprocessed yet, run `python scripts/preprocess-docx.py` if a DOCX is available. For PDF-only books, use `pdftotext`:

```bash
pdftotext -layout -f <start> -l <end> "<absolute path>" -
```

## Card-writing rules

**Each card tests two things:** the answer AND why the answer is correct. The user fails the card if they can recall only one.

### Brevity (hard rules)

- **Question:** ≤20 words, one sentence, ends in a question mark.
- **Answer:** ≤50 words. Open with the mechanism ("Because…", "Since…") — no scene-setting, no re-stating the question, no "this is important because".
- Cut every word that survives removal. If a clause doesn't change the meaning or carry the reasoning, delete it.
- No hedges ("typically", "generally", "in most cases") unless the hedge itself is the clinical point.
- No filler ("it's worth noting that", "interestingly", "as discussed above").

### Readability — write like a human talking

Picture explaining this to a friend who knows nothing about dentistry. Write the way you'd actually say it out loud.

- **Plain syntax.** Short sentences. Active voice. One clause per comma at most.
- **No jargon** unless the term is itself the thing being learned. "Saliva washes sugar off the teeth" beats "salivary clearance". If a technical word has to appear, use it plainly — don't dress it up.
- **No flourishes.** Cut em-dashed asides, parenthetical stacks, semicolons, and "not X but Y" constructions. Nobody speaks like that.
- Prefer the everyday word: "talk" over "verbalise", "stop talking" over "lapse into silence", "how often" over "the frequency of".
- **Test out loud.** Read the card as if you're saying it to someone. If you wouldn't phrase it that way in conversation, rewrite it.

### Content

- **Question form:** prefer "Why…", "How does…", "What explains…" over "What is…". A "what" with a rote answer is too shallow — rewrite as a "why" against the surrounding context.
- **Answer form:** fact → mechanism → consequence, linked with "because", "so", "therefore". Strip anything that isn't one of those three.
- **Reformulate, don't quote.** Verbatim text lets the user pattern-match instead of reasoning. Paraphrase tightly.
- **One idea per card.** Two "becauses" joined by "and" = two cards.
- **Capture the chapter, not just the easy parts.** Cover mechanisms, exceptions, and clinically loaded "small" details — the textbook's value-add over a fact list.

### Self-check before writing

For each card, ask:
1. Could this answer be cut by 30% without losing the reasoning? If yes, cut it.
2. Does the first sentence already carry the mechanism? If not, rewrite.
3. If the user recalls only the fact (not the "because"), does the card fail? If not, the card is too shallow.

## Image handling

The schema supports an `image` field per card (path relative to `public/`).

### Workflow

1. Check `image-map.json` for images in the chapter's paragraph range.
2. View each candidate image with `Read` to decide if it's clinically useful (not decorative).
3. Copy useful images to `public/card-images/` with a descriptive name: `ch<NN>-<description>.<ext>`
4. Reference in the card JSON as `"/card-images/ch<NN>-<description>.<ext>"`
5. The image renders below the answer text on the back of the flashcard.

### When to include images

- Diagrams that carry information the text alone can't convey (notation charts, anatomy, procedural steps).
- Tables that are easier to read as an image than as prose.
- Skip decorative images, book logos, and icons.

## Output format

Write one JSON file per chapter at:

```
flashcards-import/<book-short-name>/<chapter-slug>.json
```

Example: `flashcards-import/oxford-handbook-clinical-dentistry/ch01-history-and-examination.json`

Schema (matches [scripts/import-flashcards.ts](../../../scripts/import-flashcards.ts)):

```json
{
  "folder": "Oxford Handbook of Clinical Dentistry",
  "subfolder": "Ch 1 – History and examination",
  "source": "Oxford Handbook of Clinical Dentistry 7e, Ch 1",
  "cards": [
    { "question": "Why …?", "answer": "Because …" },
    { "question": "What …?", "answer": "…", "image": "/card-images/ch01-description.jpg" }
  ]
}
```

`folder` should be the book's full title (so the in-app folder tree reads naturally). `subfolder` follows the pattern `Ch N – Title`. `source` should let a user trace the citation back to the chapter.

## Do NOT

- Run `npm run import` yourself. Show the user the file path and let them run it. The import is one-way and dedupe is by content hash — a typo in a generated card sticks until manually deleted.
- Copy PDFs or DOCX files into the project tree. The dev server OOMs on large files in the workspace.
- Load `full-text.txt` in its entirety. Grep first, then read targeted ranges.
- Generate the full chapter in one go on the first run. Do a small batch (default 5), let the user review the question style, then scale up.

## Test-batch checklist

For a 5-card test:
1. Confirm the chapter with the user.
2. Read `chapters.json` for boundaries, then read 2–3 sections from the chapter.
3. Check `image-map.json` for relevant images in that range.
4. Draft cards across different sub-topics (don't bunch them in one paragraph).
5. Self-check each card: does failing to recall the *reasoning* count as a fail? If not, rewrite.
6. Write the JSON, report the file path, and stop. Wait for user feedback before generating more.
