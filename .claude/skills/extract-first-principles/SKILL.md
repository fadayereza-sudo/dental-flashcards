# Extract First Principles from Oxford Handbook

## Goal

Scan the Oxford Handbook of Clinical Dentistry and extract core truths — fundamental, scientifically sound concepts that can be relied upon as truth. For each core truth, write a short notebook-style explanation of how the truth plays out in clinical practice. Anchor specific clinical claims to verbatim quotes from the handbook, surfaced inline as citation markers.

The goal is a personal-notebook reading experience: a competent clinician revisiting concepts they want to keep sharp, with the original source one tap away when they want to verify the underlying claim.

## Input

- `source-material/oxford-handbook/full-text.txt` — full handbook text, line format `[index][style] text`
- `source-material/oxford-handbook/chapters.json` — chapter/section boundaries (paragraph indices)

## Output

- `data/first-principles/<chapter-slug>.json` — structured chapter data with core truths, body prose, and citations
- `data/first-principles/index.json` — updated index of all chapters
- `data/first-principles/progress.json` — track progress

## Process

### 1. Load chapter list

Read `source-material/oxford-handbook/chapters.json`. Each entry has:
- `index`: paragraph index number
- `title`: section/chapter title

Organize chapters logically into coherent groups.

### 2. For each chapter, identify core truths

Read the chapter text from `full-text.txt` (between paragraph indices from `chapters.json`).

**Core truths are:**
- Fundamental, scientifically sound concepts
- Ideas that can be testified in a room of scientists, experts, policymakers
- Facts that, if understood, make a wide range of clinical decisions clearer
- Established mechanisms, diagnostic criteria, biological facts

Examples:
- "Caries is a dynamic balance between demineralisation and remineralisation, not one-way decay"
- "Plaque biofilm is the primary cause of virtually all periodontal disease"
- "Primary teeth differ structurally from permanent teeth in ways that change disease behaviour and cavity design"

NOT core truths:
- Clinical protocols or procedure recipes
- Pragmatic shortcuts or opinions
- General statements without specific scientific basis

### 3. Write the broader-context paragraph

Before the body, write a tight `broaderContext` line that places the core truth inside the bigger picture of clinical dentistry. The reader should grasp it immediately. It answers, in one breath:

- What is this core truth about?
- Where does it fit in the rest of dentistry?
- Why is it relevant and important?

**Constraints:**
- **Hard cap of 30 words.** This is one or two short sentences, not a paragraph.
- **No citations.** Lean on general, long-standing dental knowledge.
- **One block, no headings, no `\n\n` breaks.**
- **Third-person voice**, same as the body.
- Purpose: a one-glance orientation. Skip elaboration; cut anything the reader can already infer from the title.

Example for "Plaque biofilm is the primary cause of virtually all periodontal disease":

> "Periodontitis is one of the two main reasons people lose teeth. Plaque drives it, which makes plaque control the highest-leverage daily habit in dentistry."

### 4. For each core truth, write a clinical-application body

The body is the heart of each truth. It should read like a paragraph or two from a competent clinician's personal notebook — written for their own future re-reading.

**Audience:** a starting GDP who already knows basic science and anatomy and wants to stay sharp on the *why* behind everyday clinical decisions. They don't need lectures; they need the 80/20 of how the truth changes their day in clinic.

**Voice and content:**
- Focus on **clinical application**: what the truth changes about how the clinician assesses, decides, treats, or communicates with the patient.
- **Skip the science deep-dive**: leave out scientific theory, mechanism trivia, and historical context that a GDP will never act on.
- **Write the way people speak, not the way textbooks read.** This is the most important style rule. The reader should feel like a senior colleague is explaining the idea over coffee, not reading a chapter summary. Use short sentences, plain words, the natural rhythm of speech. Cut verbal fluff: "It is also worth noting that…", "The clinical implication is therefore that…", "It should be remembered that…". Just say the thing.
- **Don't refer to "the handbook" inside the body** — the reader knows everything is sourced from it. Just state the idea. Citations carry the provenance.
- **Third-person voice.** No first person ("I do", "what I keep in mind"), no "we", no "us". Direct impersonal statements: "Plaque triggers periodontitis." "The aim is to keep the ecology balanced." Conversational does not mean first person; it means short, direct, spoken-style sentences.
- **Headings, then paragraphs.** Each main idea is preceded by a one-line heading prefixed with `## `. The heading summarises the idea so the page is scannable. A 1–3 sentence paragraph develops it. Use `\n\n` between heading and paragraph and between successive pairs.
- **Use em dashes sparingly.** Prefer commas, periods, and colons.
- **Stay true to the facts.** Do not embellish, infer beyond what the chapter supports, or invent figures. Specific recommendations or numbers must carry a citation.

**Style examples:**

❌ Textbook: "Periodontal therapy is incomplete without addressing host risk factors. A smoking cessation conversation, and where appropriate liaison with the GP about diabetic glycaemic control, are part of the periodontal treatment, not separate domains."

✅ Conversational: "Periodontal therapy that ignores the host is half a treatment. Smoking cessation talk and (when relevant) GP liaison about diabetic control belong in the periodontal plan, not in someone else's clinic."

❌ Textbook: "The host response to the biofilm, while protective in nature, can also contribute to local tissue destruction via inflammatory and immunologically mediated pathways."

✅ Conversational: "Plaque triggers periodontitis. The host's own immune response does most of the damage."

### 5. Anchor specific claims with inline citations

Every concrete clinical claim in the body — a specific recommendation, a number, a "do this", a mechanism — should carry an inline citation marker `[N]` placed at the end of the sentence or clause it supports.

The marker number `[N]` references an entry in the `citations` array on the same core truth.

**Citations must be verbatim quotes from the handbook.** No paraphrasing, no merging two sentences, no rounding numbers. Copy the source sentence as-is. If the original uses arrows like `↑` or symbols like `1°` for primary, keep them — the goal is exact fidelity.

Each citation entry has:
- `id`: integer matching the inline marker
- `quote`: the verbatim source sentence(s)
- `paragraph`: the paragraph index from `full-text.txt` (the `[index]` number) for traceability

**How many citations per truth?** As many as there are concrete claims that benefit from a source-text anchor. A typical 2–3 paragraph body has 3–6 citations. A claim that is a general recap of common knowledge does not need one; a specific clinical recommendation, a numeric value, or a counterintuitive fact does.

**Don't over-cite.** A single citation can support a claim that occupies most of a paragraph. Don't put a marker after every sentence.

### 5b. Citation-quote alignment pass (mandatory)

Before writing the file, walk every `[N]` marker in the body. For each one:

1. Read the inline sentence the marker is attached to.
2. Read the `quote` of citation `[N]`.
3. Confirm the quote contains the words / phrasing / number that justify *that specific* inline claim. Topical adjacency in the source is not enough — the quote itself must carry the support.
4. If the same `[N]` is reused for two distinct claims, the quote must literally cover both. Either extend the quote to include the additional source sentence (when the sentences are consecutive in the source), or split into a new citation with its own quote.

Failure mode this catches: an inline claim says "the only definitive method is histological section [3]" but quote [3] only contains "recovery depends on blood supply, not nerve supply." Both sentences come from the same paragraph, so the citation looked harmless — but the reader taps `[3]` and sees a quote about something else. Fix: extend the quote to cover both sentences, or split into a new citation.

### 6. Output format

Create `data/first-principles/<chapter-slug>.json`:

```json
{
  "chapter": "Preventive and community dentistry",
  "slug": "preventive-and-community-dentistry",
  "order": 2,
  "coreTruths": [
    {
      "id": "preventive-and-community-dentistry-001",
      "title": "Caries is a dynamic balance between demineralization and remineralization, not one-way decay",
      "broaderContext": "Caries is one of the two great causes of tooth loss. Treating it as a balance rather than a slope changes the whole logic of restorative dentistry.",
      "body": "## Caries is a balance, not a one-way slide\n\nThe tooth surface keeps losing and gaining mineral as plaque pH swings up and down. As long as remineralization keeps up, the lesion holds [1].\n\n## A white spot is a moment of decision, not a reason to drill\n\nWith fluoride, less sugar, and better brushing the balance can shift and the lesion can arrest, or even regress [2]. Once it cavitates that option is gone, and prevention has to come with restoration [3].\n\n## Telling the patient the lesion can still arrest changes the consultation\n\nKnowing the lesion could still arrest is what makes preventive advice feel real rather than abstract [4].",
      "citations": [
        { "id": 1, "quote": "Caries is ∴ a dynamic process characterized by episodic demineralization and remineralization occurring over time.", "paragraph": 541 },
        { "id": 2, "quote": "Under favourable conditions a lesion may become inactive and even regress.", "paragraph": 549 },
        { "id": 3, "quote": "Pre-cavitated lesion—prevention. Cavitated lesion—prevention and restoration.", "paragraph": 580 },
        { "id": 4, "quote": "Counsel the patient that if the lesion is not cavitated, it has the potential to arrest. This makes the preventive advice very relevant to the patient, increasing the chance of that patient acting on the advice.", "paragraph": 582 }
      ]
    }
  ]
}
```

Create `data/first-principles/index.json`:

```json
[
  { "slug": "preventive-and-community-dentistry", "chapter": "Preventive and community dentistry", "order": 2 },
  { "slug": "paediatric-dentistry", "chapter": "Paediatric dentistry", "order": 3 }
]
```

Update `data/first-principles/progress.json`:

```json
{
  "completed": ["preventive-and-community-dentistry"],
  "in_progress": "paediatric-dentistry",
  "total_chapters": 14,
  "last_updated": "2026-04-26"
}
```

## Rules

- Add as many core truths per chapter as you can accurately identify, even if it's only 1.
- **Each truth has a `broaderContext` (≤80 words) and a body.** The broader context links the truth to the entirety of clinical dentistry; the body is the headed clinical-application notebook.
- Body content must focus on **clinical application**, not scientific theory or content a GDP will not use day-to-day.
- Body must read like notebook prose: plain language, short sentences, paragraph breaks, no academic narrators.
- **Third person only.** No "I do", "I keep in mind", "for me". Write as a textbook of one to itself.
- **Every main idea in the body gets a `## Heading` line before its paragraph.** Headings make the page scannable.
- Body must not refer to "the handbook", "the chapter", or "the author" — the citation system carries the provenance.
- Every concrete claim in the body must be either common knowledge or backed by an inline `[N]` citation. The broader-context paragraph does not need citations.
- Citations must be verbatim. No paraphrasing. Preserve original symbols (`↑`, `1°`, etc.) and original typography (curly quotes, en/em dashes inside the source).
- Each `[N]` marker's quote must contain the words that support the specific inline claim — not just words from the same paragraph. Run the alignment pass before writing the file.
- Em dashes sparingly in your own prose. Prefer plain punctuation (commas, periods, colons).

## Trigger

User says: "extract first principles" or "generate first principles" or calls `/extract-first-principles`.
