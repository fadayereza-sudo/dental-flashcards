---
name: writing-style
description: Ali's voice patterns for prose he writes for himself (troubleshooting guide, first principles, project notes). Reference this whenever generating clinical or project content for him. Detail high, register conversational, reasoning revealed inline.
---

# Ali's writing style

This is a reference for any prose generated for Ali — troubleshooting guide entries, first principles notes, project briefs, anything that isn't pure code or data. The voice is conversational and personal. He's writing notes to himself, not pieces for a journal or for other professionals to read.

The patterns below were distilled from a corpus of his own diary entries and project notes. Mirror these. Do not include any of the original training content — only the patterns matter.

## Sentence rhythm

- **Three-beat structure** — setup → expansion → takeaway. State the fact, expand on why it matters, close with the practical implication.
- **Mix sentence lengths.** A short, declarative sentence often punctuates a longer explanatory one. "No pain on biting. No tenderness over the gum above the tooth."
- **Reasoning revealed inline.** Don't drop a conclusion in isolation. Let the reader see the logical chain. "X is true. The reason is Y. This means Z."
- **Restate for emphasis.** Same point, different framing, two consecutive sentences.

## Connective tissue (his signature phrases)

These are the connective words and phrases that mark his voice. Use them naturally — not all at once, but at least a few per piece:

- "the goal is to…"
- "the reason is that…"
- "the thing is…"
- "the interesting bit / the interesting thing"
- "the question is:"
- "this means…"
- "what happens is…"
- "the rule of thumb"
- "the takeaway"
- "actually,"
- "so…"
- "now, if…"
- "here's the sequence / here's the thing"
- "the great thing about…"
- "for example,"
- "however," / "but"

## Punctuation moves

- **Em dashes — sparingly.** They draw the eye and break flow when scattered through long-form text. Reach for commas, parentheses, colons, or a sentence break first. Save the em dash for moments where it does real work — a sharp aside, a beat of emphasis the rhythm needs. **Rule of thumb:** at most one em dash per paragraph, and never two paired dashes back-to-back when a comma pair would carry the same meaning.
- **Colons** to drop into substance: "The question is: how do we …", "One reassurance though: the pain won't cross the midline."
- **Sparing semicolons.** Prefers a period break.

## Voice habits

- **Active voice.** Address the reader as "you" when giving procedural guidance.
- **Don't hedge needlessly.** When sure, state it flatly. When uncertain, name the uncertainty.
- **Plain words over jargon when both work.** "Fresh carious cavity or a leaking restoration" not "carious lesion with microleakage at restoration margin". Technical terms still allowed when they're the right word (RCT, CSC, GIC, lamina dura).
- **Avoid academic register.** No "moreover", "furthermore", "thus", "therefore". Use "so", "and", "but".
- **Concrete examples** to ground abstract claims.
- **Practical consequence** after a fact. Tell the reader what to DO with the information, not just what's true.

## Procedural mode (for treatment steps, sequences)

- Short imperative sentences. "Rubber dam on. Selective caries removal. Dry it. Cover the deepest part."
- Pre-sequence framing: "Here's the sequence." or "The principle is straightforward:" then the steps.

## Format on the page

The troubleshooting page renders body markdown with headings (`##`), paragraphs, bullet lists (`- `), and bold (`**…**`). Use these intentionally:

- **Bullets for scannable lists** — symptoms, exam findings, step sequences, contrast tables. Anything where breaking the rhythm helps the reader skim.
- **Bold key labels at the start of a bullet** (`**Cold test**: exaggerated response…`).
- **Bold the takeaway phrase** in a paragraph if it's the one thing to remember (`**Rule of thumb** when you can't quite decide: treat as reversible.`).
- **Paragraph breaks** between distinct ideas within a section. Don't run two arguments together in one wall of text.
- **Short lead sentence** before a bullet list, ending in a colon ("What you'll typically hear:" or "The diagnostic consequence:").

## Density dial

- **Detail high, prose tight.** Ali wants the full clinical picture — explain proprioception when proprioception matters, give drug concentrations and contact times, name the materials. Don't compress detail for the sake of brevity.
- **The problem isn't length, it's flow.** A long section that scans well via bullets and short paragraphs is fine. A short section written as one dense block of prose is not.
- **Fast to read, easy to grasp.** These are notes for use, not a textbook chapter. Optimise for "I can land on this section and re-orient in 20 seconds".

## What to avoid

- Soulless textbook register. Don't write to please a scientific journal.
- Conclusions without their reasoning visible.
- Over-formality, long compound sentences joined by commas, passive constructions.
- Bullet lists used for narrative prose — bullets are for genuine list-shaped content (symptoms, steps, contrasts). Don't bullet a paragraph just to look organised.
- Heading-stuffing inside body sections. Use `##` for the canonical section headings only (Etiology, Presentation, Results, etc.); don't add sub-headings inside.

## How to apply this skill

- Whenever generating prose for the troubleshooting guide, first principles notes, project briefs, or any personal writing — read this file first.
- When delegating prose generation to a sub-agent, paste the relevant sections of this file into the sub-agent's prompt. Sub-agents don't share the parent's memory; they need the rules inline.
- If Ali corrects voice in a specific way, update this file rather than just remembering the correction for the current session.
