---
name: pdf-to-flashcards
description: Convert dental e-book PDFs into spaced-repetition flashcards. Trigger when the user asks to "make flashcards from", "ingest", "extract cards from", or otherwise process a PDF in `c:\Users\IAU\Documents\Claude Projects\e-books\dentistry\`. Outputs JSON files into `flashcards-import/` for the existing `npm run import` pipeline — never writes to the database.
---

# pdf-to-flashcards

Convert chapters of a dental textbook into FSRS-ready flashcards. The cards must teach the *meaning* behind each fact, not just the fact, so retention compounds across reviews.

## Inputs (ask if missing)

1. **Book** — file under `c:\Users\IAU\Documents\Claude Projects\e-books\dentistry\`. Confirm the exact filename.
2. **Chapter** — number + title (e.g. "Ch 1 – History and examination"). Never use page numbers in cards or filenames; PDF and paperback paginations differ.
3. **Card count** — for test batches, default to 5. For full chapter runs, ask before assuming.

## Reading the PDF

`Read` cannot render these PDFs (pdftoppm is not installed). Use `pdftotext` instead:

```bash
pdftotext -layout -f <start> -l <end> "<absolute path>" -
```

Workflow:
- First pass: extract the front-matter (typically pages 1–30) to find the chapter listing and confirm the book's preferred chapter title.
- Second pass: extract the chapter pages. Find boundaries by searching for "Chapter N" headings in the extracted text.
- Read the chapter end-to-end before drafting cards. Don't generate from a single page — context across the chapter is what makes a question worth asking.

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
- **No page numbers** — chapter numbers only. PDF and paperback paginations differ.
- **One idea per card.** Two "becauses" joined by "and" = two cards.
- **Capture the chapter, not just the easy parts.** Cover mechanisms, exceptions, and clinically loaded "small" details — the textbook's value-add over a fact list.

### Self-check before writing

For each card, ask:
1. Could this answer be cut by 30% without losing the reasoning? If yes, cut it.
2. Does the first sentence already carry the mechanism? If not, rewrite.
3. If the user recalls only the fact (not the "because"), does the card fail? If not, the card is too shallow.

## Image handling (v1)

The current schema and importer have **no image support**. Until image support lands:

- When a passage references a figure, table, or diagram that carries information not in the surrounding text, capture it as a **textual description** in the answer ("a labelled diagram showing X, Y, Z arranged so that…"). Mark the card with a trailing `// IMAGE-PENDING` comment in a separate `notes` array (see output format) so it can be re-processed when proper image support is built. Do not embed `![](...)` markdown — the renderer doesn't support it.
- If the image carries no information beyond the text (decorative), ignore it.

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
    { "question": "Why …?", "answer": "Because …" }
  ],
  "notes": {
    "imagesPending": [
      { "card": 0, "describes": "diagram of …" }
    ]
  }
}
```

`notes` is ignored by the importer; it's a hand-off for the future image-support pass.

`folder` should be the book's full title (so the in-app folder tree reads naturally). `subfolder` follows the pattern `Ch N – Title`. `source` should let a user trace the citation back to the chapter.

## Do NOT

- Run `npm run import` yourself. Show the user the file path and let them run it. The import is one-way and dedupe is by content hash — a typo in a generated card sticks until manually deleted.
- Copy the PDF into the project tree. The dev server OOMs on PDFs in the workspace (see [project memory](../../../../../.claude/projects/c--Users-IAU-Documents-Claude-Projects-Dental-Flashcards/memory/project_pdf_location.md) for the incident).
- Generate the full chapter in one go on the first run. Do a small batch (default 5), let the user review the question style, then scale up.

## Test-batch checklist

For a 5-card test:
1. Confirm the chapter with the user.
2. Read pages spanning the first 2–3 sections of the chapter.
3. Draft cards across different sub-topics (don't bunch them in one paragraph).
4. Self-check each card: does failing to recall the *reasoning* count as a fail? If not, rewrite.
5. Write the JSON, report the file path, and stop. Wait for user feedback before generating more.
