# Extract Guidelines Slides

## Goal

Convert SDCEP, BSP, FGDP, and Delivering Better Oral Health guidelines into a slide-based presentation format. Each guideline is transformed into a sequence of slides that walk the user through the correct decision workflow and SOPs as though they had to recall it from the top of their head.

The presentation uses "leading statements" — each slide body ends in a way that prompts recall of the next concept, creating a flowing narrative that mirrors how one would think through the guideline step by step.

## Input

Guidelines source files in `source-material/guidelines/`:
- `sdcep-antibiotic-prophylaxis.md` — IE prophylaxis indications and regimens
- `sdcep-child-caries.md` — caries assessment, prevention, treatment by tooth
- `sdcep-dental-prescribing.md` — comprehensive drug guide (emergencies, antibiotics, analgesics, etc.)
- `delivering-better-oral-health/delivering-better-oral-health.md` — public health principles (caries, perio, oral cancer, diet, fluoride, etc.)
- `BSP/good practitioners guide 2016 - Unknown.txt` — Calibre export of BSP guidance
- `FGDP/FGDP-SCDR-ALL-Web.txt` — Calibre export of FGDP competency framework
- `SDCEP/SDCEP MRONJ guidance...txt` — medication-related osteonecrosis of the jaw
- `SDCEP/SDCEP Management of Dental Patients Taking...txt` — anticoagulant/antiplatelet management
- `SDCEP/sdcep-dental-amalgam-implementation-advice...txt` — amalgam placement and management

## Output

- `data/guidelines/<id>.json` — structured guideline with slides and reference text
- `data/guidelines/index.json` — updated index of all guidelines
- `data/guidelines/progress.json` — track extraction progress

## Process

### 1. For each guideline file

Create a unique `id` based on the source. Examples:
- `sdcep-antibiotic-prophylaxis`
- `delivering-better-oral-health`
- `bsp-good-practitioners`
- `fgdp-competencies`

Extract metadata:
- `title`: Full guideline title
- `organisation`: SDCEP, BSP, FGDP, DBOH
- `year`: Publication year (if available; use 2024 as default)
- `description`: One-line summary of the guideline's scope

### 2. Extract the decision workflow

Read the guideline and identify the logical sequence of decisions or steps that someone would follow if they were implementing the guideline. This is NOT a summary of the entire guideline — it's a decision tree or workflow.

Examples:
- Antibiotic prophylaxis: "Does patient have high-risk cardiac condition? → Is the procedure at-risk? → What antibiotic regimen?"
- Child caries: "Assess risk → Prevent caries → If present, choose treatment by tooth location and lesion activity"
- Prescribing: "Identify the clinical situation → Find the relevant drug category → Select the appropriate agent and dose"

### 3. Create slides from the workflow

Convert the workflow into a sequence of slides. Each slide is one decision point or step.

**Slide format:**
```json
{
  "id": 1,
  "title": "First decision point or topic",
  "body": "Statement that explains the decision and ends in a way that prompts the next slide..."
}
```

**Writing style:**
- Each slide `body` is a leading statement that walks the user through the thinking process
- The body should feel like explaining the guideline to someone, not a textbook definition
- End the body in a way that naturally prompts the recall of the next concept (e.g., "Now that we know whether the patient is high-risk, the next step is to determine whether the procedure itself carries risk of bacteremia.")
- Use quotes from the guideline when the phrasing is particularly clear; otherwise paraphrase for flow
- Avoid overly technical language; write for a practising dentist

**Slide count:** Typically 5–15 slides per guideline, depending on complexity. A complex guideline like dental prescribing might have more; a simple checklist might have 3–5.

### 4. Write the reference text

After creating the slides, write a comprehensive natural-language explanation of the entire guideline (500–800 words). This is what users see when they tap "Reference" — a flowing prose walkthrough of the guideline without the slide-by-slide structure.

The reference text should:
- Cover the full scope of the guideline
- Explain the rationale behind key recommendations
- Be readable and well-organized by section
- Use short paragraphs for scanability

### 5. Output format

Create `data/guidelines/<id>.json`:

```json
{
  "id": "sdcep-antibiotic-prophylaxis",
  "title": "SDCEP: Antibiotic Prophylaxis for Infective Endocarditis",
  "organisation": "SDCEP",
  "year": 2018,
  "referenceText": "Infective endocarditis (IE) is a serious infection of the heart valves that can be seeded by bacteremia from dental procedures. Antibiotic prophylaxis is indicated in patients with specific high-risk cardiac conditions undergoing high-risk dental procedures.\n\n## High-Risk Cardiac Conditions\nThese include previous episodes of IE, prosthetic valves, structural congenital heart disease, and cardiac transplant recipients with valve disease. Patients with simple or secundum ASD, surgically repaired simple lesions, or isolated pulmonary stenosis are not at high risk.\n\n## High-Risk Procedures\nProcedures that create a significant bacteremia include those involving gingival manipulation or intraligamentary injections (scaling, extractions, graft placement, implant placement). Simple amalgam/composite restoration does not require prophylaxis...",
  "slides": [
    {
      "id": 1,
      "title": "Determine if patient has a high-risk cardiac condition",
      "body": "Antibiotic prophylaxis for infective endocarditis is reserved for patients with specific cardiac lesions that place them at high risk. These include a previous episode of IE, a prosthetic heart valve or repair using prosthetic material, structural congenital heart disease, and cardiac transplant recipients who develop valvulopathy. Many patients with simple cardiac lesions such as secundum ASD or isolated pulmonary stenosis are not at high risk."
    },
    {
      "id": 2,
      "title": "Identify if the planned procedure carries bacteremia risk",
      "body": "Even in high-risk patients, antibiotic prophylaxis is only recommended for procedures that are likely to cause significant bacteremia. These are procedures involving gingival manipulation or intraligamentary local anaesthetic injection — scaling and root planing, extractions, graft placement, and implant placement all carry risk. Routine restorative procedures, simple crown preparation without gingival retraction, and local anaesthetic block injections do not require prophylaxis."
    },
    {
      "id": 3,
      "title": "Select the antibiotic regimen",
      "body": "For patients meeting both criteria (high-risk cardiac condition and high-risk procedure), a single dose of oral amoxicillin 3g is recommended one hour before the procedure. If the patient is allergic to penicillin or amoxicillin, cephalexin 2g is an alternative. If unable to take oral antibiotics, intravenous ceftriaxone 1g is used. The goal is to achieve adequate antibiotic levels at the time of bacteremia from the procedure."
    }
  ]
}
```

Create `data/guidelines/index.json`:

```json
[
  { "id": "sdcep-antibiotic-prophylaxis", "title": "SDCEP: Antibiotic Prophylaxis", "organisation": "SDCEP", "year": 2018, "description": "Indications and regimens for antibiotic prophylaxis to prevent infective endocarditis" },
  { "id": "delivering-better-oral-health", "title": "Delivering Better Oral Health", "organisation": "DBOH", "year": 2013, "description": "Public health guidance on caries prevention, fluoride, diet, smoking cessation, and oral cancer screening" }
]
```

Update `data/guidelines/progress.json`:

```json
{
  "completed": ["sdcep-antibiotic-prophylaxis"],
  "in_progress": "delivering-better-oral-health",
  "total_guidelines": 9,
  "last_updated": "2026-04-25"
}
```

## Rules

- Slides should be self-contained — each slide should make sense on its own, but flow logically to the next
- The "body" field should feel like explaining to a colleague, not a textbook definition
- Reference text should be comprehensive and readable, suitable for someone who wants to fully understand the guideline without the slide constraints
- Quote from the source when the phrasing is clear and important; paraphrase otherwise for flow
- Each slide should prompt the user to think about what comes next (leading statement pattern)
- Slide count: aim for 5–15 slides, fewer for simple guidelines, more for complex ones

## Trigger

User says: "extract guidelines" or "generate guidelines" or calls `/extract-guidelines-slides`.
