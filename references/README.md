# references

Curated extracts from the source material, each capturing a single teachable
concept that aligns with the user's learning goals. These are the raw inputs
for flashcard generation — one reference becomes one or more flashcards.

## Directory layout

```
references/
  <book-short-name>/
    <ref-id>.md          # verbatim text + metadata
  guidelines/
    <source>/
      <ref-id>.md        # one recommendation per file
    progress.json        # combined progress across all guideline sources
  images/                # shared image store (copied from source-material PDFs)
```

Book short names match source-material folders:
- `oxford-handbook`
- `biopsychosocial`

Guideline source slugs (subfolders of `references/guidelines/`):
- `dboh` — Delivering Better Oral Health (PHE/OHID)
- `sdcep-antibiotic-prophylaxis`
- `sdcep-child-caries`
- `sdcep-dental-prescribing`
- `sdcep-amalgam`
- `sdcep-anticoagulants`
- `sdcep-mronj`
- `bsp` — BSP good practitioners guide + treatment flow chart
- `fgdp` — FGDP radiography selection criteria

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
- `pharmacology` — drug mechanisms, contraindications, interactions
- `prescribing` — antibiotic stewardship, analgesic ladders, doses, intervals
- `radiography` — image selection, justification, dose, quality
- `infection-control` — cross-infection, decontamination, sharps, PPE

## Body templates

The body format depends on the source category:

### Oxford Handbook — verbatim
Copy text from `full-text.txt` exactly, stripped of `[index][style]` prefixes. Paragraph breaks preserved. Nothing paraphrased.

### Biopsychosocial — applied
Three sections: **The principle**, **What the book says**, **How this applies in dental practice**. The body is not verbatim — it teaches a principle drawn from the source, applied to dental scenarios.

### Guidelines — recommendation + rationale
Three sections, one recommendation per file:

1. **The recommendation** — one sentence, exact wording from the guideline. Preserve doses, intervals, numerical thresholds verbatim — these are what get tested.
2. **Why** — the evidence, mechanism, or risk that drives the rule. 2–4 sentences. This is what makes the matching cards pass/fail-able on reasoning rather than rote recall.
3. **How this applies in practice** — concrete clinical scenarios where the GDP must act on the rule. Drugs, doses, intervals, decision points, red flags. Bullet points fine for branching rules.

Guideline references use `sourceLines: [start, end]` (line range in the source `.txt`/`.md`) instead of `paragraphs`, since guideline sources have no paragraph index.

## Flashcard generation

The `make-flashcards` skill reads from this folder. Each reference's verbatim
text + images become the basis for card writing. The skill never reads
`full-text.txt` directly when working from references.

## Adding references

References are created by the `extract-references` skill (or manually).
The skill scans `source-material/*/full-text.txt` and `chapters.json`,
identifies sections relevant to the user's goals, and writes reference files
here with verbatim content.
