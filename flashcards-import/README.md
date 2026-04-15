# flashcards-import

Local staging directory for flashcard JSON files produced by the
`pdf-to-flashcard` Claude skill. Contents are gitignored.

## File format

One JSON file per chapter / subfolder:

```json
{
  "folder": "Oxford Handbook of Clinical Dentistry",
  "subfolder": "Ch 3 – Oral Medicine",
  "source": "Oxford Handbook, Ch 3",
  "cards": [
    {
      "question": "Why is ...?",
      "answer": "Because ... Therefore ..."
    }
  ]
}
```

- `folder` / `subfolder`: the two-level tree. Imported idempotently.
- `source`: free-form citation string shown on the card.
- Each card's answer MUST contain the reasoning (the "why"), not just the
  fact. The user must recall both to pass.

## Import

```
npm run import
```

Re-running is safe: cards are deduped per subfolder by a SHA-256 hash of
`question + answer`.
