---
name: make-flashcards
description: Convert curated references into spaced-repetition flashcards. Trigger when the user asks to "make flashcards from", "create cards", "generate flashcards", or otherwise process references. Reads from `references/`. Outputs JSON files into `flashcards-import/` for the existing `npm run import` pipeline — never writes to the database.
---

# make-flashcards

Turn curated reference extracts into FSRS-ready flashcards. Each reference is a verbatim extract from a dental textbook, stored in `references/<book>/`. The cards must teach the *meaning* behind each fact, not just the fact, so retention compounds across reviews.

## User context

The user is a GDP returning after a 2+ year career break. Focus on: clinical reasoning, safe practice, diagnosis, bread-and-butter procedures, pain and emergencies, medical history red flags, patient communication, holistic care. Skip rare specialist detail — for those, just "recognise and refer."

## Inputs (ask if missing)

1. **References** — which references to convert. Can be:
   - A specific file: `references/odells/odells-001.md`
   - A book folder: `references/odells/` (all references from that book)
   - A tag filter: all references tagged `clinical-reasoning`
   - `all` — every reference in `references/`
2. **Card count** — for test batches, default to 3-5 per reference. Ask before assuming large counts.

## Reading references

Each reference file in `references/<book>/<id>.md` has:

- **Frontmatter** — `id`, `book`, `section`, `paragraphs`, `images`, `tags`
- **Body** — verbatim text from the source material (already extracted and curated)

### Workflow

1. Read the reference file(s) specified by the user.
2. If the reference has `images`, view them from `references/images/<filename>` to decide if they should appear on cards.
3. Draft cards from the reference content.
4. Copy any card-worthy images to `public/card-images/` with a descriptive name.

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
- **Capture the reference, not just the easy parts.** Cover mechanisms, exceptions, and clinically loaded "small" details — the textbook's value-add over a fact list.

### Self-check before writing

For each card, ask:
1. Could this answer be cut by 30% without losing the reasoning? If yes, cut it.
2. Does the first sentence already carry the mechanism? If not, rewrite.
3. If the user recalls only the fact (not the "because"), does the card fail? If not, the card is too shallow.

## Image handling

The schema supports an `image` field per card (path relative to `public/`).

### Workflow

1. Check the reference's `images` field for listed images.
2. View each candidate image from `references/images/` with `Read` to decide if it's clinically useful (not decorative).
3. Copy useful images to `public/card-images/` with a descriptive name: `<ref-id>-<description>.<ext>`
4. Reference in the card JSON as `"/card-images/<ref-id>-<description>.<ext>"`
5. The image renders below the answer text on the back of the flashcard.

### When to include images

- Diagrams that carry information the text alone can't convey (notation charts, anatomy, procedural steps).
- Clinical photos that show a condition the user needs to recognise.
- Tables that are easier to read as an image than as prose.
- Skip decorative images, book logos, and icons.

## Output format

Write one JSON file per reference (or group of related references) at:

```
flashcards-import/<book-short-name>/<section-slug>.json
```

Example: `flashcards-import/odells/case01-selective-caries-removal.json`

Schema (matches [scripts/import-flashcards.ts](../../../scripts/import-flashcards.ts)):

```json
{
  "folder": "Oxford Handbook of Clinical Dentistry",
  "subfolder": "Ch 1 History and examination – Presenting complaint",
  "source": "Oxford Handbook 7e, Ch 1",
  "cards": [
    {
      "question": "Why …?",
      "answer": "Because …",
      "reference": "Verbatim text from the reference file that this card was derived from.",
      "referenceSection": "Section heading from the reference"
    },
    {
      "question": "What …?",
      "answer": "…",
      "image": "/card-images/oxford-handbook-001-description.jpg",
      "reference": "Verbatim source text.",
      "referenceSection": "Section heading"
    }
  ]
}
```

`folder` should be the book's full title (so the in-app folder tree reads naturally). `subfolder` is derived from the reference's `section` field. `source` should let a user trace the citation back.

**Every card MUST include `reference` and `referenceSection`.**
- `reference` — the verbatim text from the reference file that this specific card was derived from. Copy the relevant passage(s) exactly. This appears in a "View Reference" popup on the card back.
- `referenceSection` — the section/chapter heading the text comes from (e.g. "First impressions", "Should You Ensure Removal of All Carious Tissue?").

## Do NOT

- Run `npm run import` yourself. Show the user the file path and let them run it. The import is one-way and dedupe is by content hash — a typo in a generated card sticks until manually deleted.
- Copy PDFs or DOCX files into the project tree. The dev server OOMs on large files in the workspace.
- Generate cards without reading the reference first. Always read the full reference text.
- Generate the full set in one go on the first run. Do a small batch, let the user review, then scale up.

## Test-batch checklist

For a test batch:
1. Confirm the reference(s) with the user.
2. Read the reference file(s) in full.
3. Check for images listed in the reference.
4. Draft cards across different concepts within the reference (don't bunch them around one sentence).
5. Self-check each card: does failing to recall the *reasoning* count as a fail? If not, rewrite.
6. Write the JSON, report the file path, and stop. Wait for user feedback before generating more.
