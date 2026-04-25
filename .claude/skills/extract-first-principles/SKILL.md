# Extract First Principles from Oxford Handbook

## Goal

Scan the Oxford Handbook of Clinical Dentistry and extract core truths — fundamental, scientifically sound concepts that can be relied upon as truth. For each core truth, find the dependent ideas in the same handbook that build on or derive from that core truth. The goal is to show the relationships between core truths and the ideas that depend on them.

## Input

- `source-material/oxford-handbook/full-text.txt` — full handbook text, line format `[index][style] text`
- `source-material/oxford-handbook/chapters.json` — chapter/section boundaries (paragraph indices)

## Output

- `data/first-principles/<chapter-slug>.json` — structured chapter data with core truths and dependent ideas
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
- Facts that, if understood, make dependent concepts clear
- Established mechanisms, diagnostic criteria, biological facts

Examples:
- "Enamel cannot self-repair once mature — it is acellular"
- "Bacterial plaque biofilm is the causative factor in caries and gingivitis"
- "Periodontal pockets are deeper in areas with reduced keratinized gingiva"

NOT core truths:
- Clinical protocols or procedures
- Pragmatic shortcuts or opinions
- General statements without specific scientific basis

### 3. For each core truth, find dependent ideas in the handbook

Search the same chapter for ideas, statements, or concepts that logically build on or derive from the core truth. These are ideas that would lose validity or make less sense without the core truth as foundation.

Examples:
- Core truth: "Enamel cannot self-repair"
- Dependent ideas: "Prevention must focus on stopping acid supply and remineralization", "Arrested caries require intervention if past the DEJ", "Fluoride works by promoting remineralization, not by killing bacteria"

The dependent ideas should be:
- Taken directly from the Oxford Handbook text
- Clearly linked to the core truth (show how one depends on the other)
- Written with good readability and flow
- Use quotes when the phrasing is particularly clear; otherwise paraphrase for better flow

### 4. Output format

Create `data/first-principles/<chapter-slug>.json`:

```json
{
  "chapter": "Caries Risk Assessment",
  "slug": "caries-risk-assessment",
  "order": 3,
  "coreTruths": [
    {
      "id": "caries-risk-assessment-001",
      "title": "Bacterial plaque biofilm is the primary causative factor in caries",
      "body": "This core truth underlies the entire approach to caries prevention and management. From this principle follows the logic that controlling plaque (through mechanical removal and antimicrobials) is essential. It also explains why dietary control alone is insufficient — the bacteria must be removed or suppressed. Understanding this as a first principle clarifies why fluoride supplements mechanical cleaning: it works by remineralization when plaque is controlled, not by antibacterial action. The handbook emphasizes that high-risk patients need multiple interventions because controlling any single factor (diet, plaque, saliva) is rarely enough when this core factor — plaque — is the root cause."
    },
    {
      "id": "caries-risk-assessment-002",
      "title": "Saliva is a critical protective factor against caries",
      "body": "Saliva's role as a buffer, remineralizer, and antimicrobial agent makes it fundamental to caries defense. This is why xerostomia (dry mouth) is a major risk factor and why saliva quality, not just quantity, matters. The handbook notes that patients with reduced salivary function require aggressive preventive strategies because one of the three legs of caries control (bacteria, substrate, host) has been compromised. Understanding saliva's protective role explains why in-office fluoride treatments, increased water intake, and saliva substitutes are prioritized for these patients."
    }
  ]
}
```

Create `data/first-principles/index.json`:

```json
[
  { "slug": "history-and-examination", "chapter": "History and Examination", "order": 1 },
  { "slug": "caries-risk-assessment", "chapter": "Caries Risk Assessment", "order": 2 }
]
```

Create `data/first-principles/progress.json`:

```json
{
  "completed": ["history-and-examination"],
  "in_progress": "caries-risk-assessment",
  "total_chapters": 30,
  "last_updated": "2026-04-25"
}
```

### 5. Output JSON schema details

Each core truth object has:
- `id`: Format `<chapter-slug>-###` where ### is zero-padded counter (001, 002, 003…)
- `title`: The core truth itself in one clear sentence
- `body`: Readable prose (2–4 paragraphs) showing how the core truth connects to dependent ideas found in the handbook

**Writing style:** Easy to read, easy to understand, easy to remember. Write for a 1st-year GDP (they know basic science and anatomy). Focus on showing the relationships between the core truth and the ideas that build on it. Quote when the handbook's phrasing is particularly clear; paraphrase when rewording reads better. Avoid overly complicated syntax.

## Rules

- Add as many core truths per chapter as you can accurately identify, even if it's only 1.
- Dependent ideas must come from the handbook itself, not from general knowledge.
- Show clear connections between the core truth and the dependent ideas.
- Write for readability and flow — use quotes or paraphrasing depending on what works best.
- No artificial rules about paraphrasing or quote length — let readability guide your choice.

## Trigger

User says: "extract first principles" or "generate first principles" or calls `/extract-first-principles`.
