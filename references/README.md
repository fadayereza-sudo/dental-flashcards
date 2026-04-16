# references

Curated extracts from the source material, each capturing a single teachable
concept that aligns with the user's learning goals. These are the raw inputs
for flashcard generation — one reference becomes one or more flashcards.

## Directory layout

```
references/
  <book-short-name>/
    <ref-id>.md        # verbatim text + metadata
  images/              # shared image store (copied from source-material)
```

Book short names match source-material folders:
- `oxford-handbook`
- `biopsychosocial`

## Reference file format

Each `.md` file uses this frontmatter:

```yaml
---
id: <book>-<seq>           # e.g. oxford-handbook-001
book: <full book title>
section: <chapter or case + section title>
paragraphs: [start, end]  # inclusive line range in full-text.txt
images: []                 # filenames from source-material/<book>/images/
tags: []                   # goal-aligned tags for filtering
---
```

Body is **verbatim text** copied from `full-text.txt`, stripped of the
`[index][style]` prefix. Paragraph breaks preserved. Nothing paraphrased.

## Tags (aligned to learning goals)

Use one or more of:
- `clinical-reasoning` — diagnosis, differential, case analysis
- `patient-communication` — history taking, rapport, consent, explanation
- `prevention` — diet, fluoride, OHI, risk assessment
- `operative` — restorative, endodontics, extractions, perio treatment
- `medical-history` — systemic conditions, drug interactions, red flags
- `emergency` — collapse, anaphylaxis, haemorrhage, acute pain
- `holistic-care` — biopsychosocial, patient-centred, behaviour change
- `professional` — ethics, law, safeguarding, record keeping
- `recognise-and-refer` — conditions beyond GDP scope

## Flashcard generation

The `make-flashcards` skill reads from this folder. Each reference's verbatim
text + images become the basis for card writing. The skill never reads
`full-text.txt` directly when working from references.

## Adding references

References are created by the `extract-references` skill (or manually).
The skill scans `source-material/*/full-text.txt` and `chapters.json`,
identifies sections relevant to the user's goals, and writes reference files
here with verbatim content.
