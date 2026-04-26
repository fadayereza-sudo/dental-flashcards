"""Add the two BSP flowchart workflows and three new first principles to bsp.json.

Idempotent: if the new IDs already exist, the script no-ops.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BSP = ROOT / "data" / "guidelines" / "bsp.json"


# ---------------------------------------------------------------------------
# Workflow 1 — BSP 2018 classification diagnostic pathway
# ---------------------------------------------------------------------------

WORKFLOW_DIAGNOSIS = {
    "id": "bsp-2018-classification-pathway",
    "title": "BSP 2018 classification: full diagnostic pathway",
    "overview": (
        "The 2018 classification reaches a diagnosis through a single decision tree starting from the BPE. "
        "Three things are recorded in parallel: which **disease category** the patient has, their **stage and grade** if it's periodontitis, "
        "and their **current status**. The full statement combines all three with risk factors.\n\n"
        "## 1. History, examination and BPE screening\n\n"
        "- Take a full history; examine; record the BPE for every sextant\n"
        "- Look for **interdental recession** as a flag for historic periodontitis even when current pockets look shallow\n\n"
        "## 2. Branch by highest BPE code\n\n"
        "### Code 0/1/2 with no interdental recession\n\n"
        "The patient does not have periodontitis. Diagnose by **bleeding on probing** percentage:\n"
        "- **<10% BoP** → **Clinical gingival health**\n"
        "- **10–30% BoP** → **Localised gingivitis**\n"
        "- **>30% BoP** → **Generalised gingivitis**\n\n"
        "For BPE code 2, the diagnosis must also comment on any **plaque-retentive factors**.\n\n"
        "### Code 3 with no interdental recession\n\n"
        "This sextant could be early periodontitis or just deep false pockets. Resolve it with:\n\n"
        "1. **Appropriate radiographs** of the involved sextant\n"
        "2. **Initial periodontal therapy** (Step 1 of the treatment pathway)\n"
        "3. **Review at 3 months** with a localised 6-point pocket chart in the involved sextant(s)\n\n"
        "After review:\n"
        "- **No pockets ≥4mm and no radiographic bone loss due to periodontitis** → return to the **Code 0/1/2 pathway**\n"
        "- **Pockets ≥4mm remain and/or radiographic bone loss due to periodontitis** → continue on the **Code 4 pathway**\n\n"
        "### Code 4 and/or obvious interdental recession\n\n"
        "Periodontitis is presumed:\n\n"
        "1. **Appropriate radiographs**\n"
        "2. **Full 6-point pocket chart**\n\n"
        "Identify the **distribution pattern**:\n"
        "- **Molar–incisor pattern** → **Periodontitis: Molar–Incisor Pattern**\n"
        "- **<30% of teeth** affected → **Localised periodontitis**\n"
        "- **≥30% of teeth** affected → **Generalised periodontitis**\n\n"
        "## 3. Stage (severity)\n\n"
        "Use the **worst site of interproximal bone loss due to periodontitis** on radiographs (or CAL/bone loss from CEJ if bitewings only):\n"
        "- **<15%** (or **<2 mm CAL** from CEJ) → **Stage I** (early/mild)\n"
        "- **Coronal third** of root → **Stage II** (moderate)\n"
        "- **Mid third** of root → **Stage III** (severe)\n"
        "- **Apical third** of root → **Stage IV** (very severe)\n\n"
        "## 4. Grade (rate of progression)\n\n"
        "Use **% bone loss ÷ patient age** at the worst site:\n"
        "- **<0.5** → **Grade A** (slow progression)\n"
        "- **0.5–1.0** → **Grade B** (moderate progression)\n"
        "- **>1.0** → **Grade C** (rapid progression)\n\n"
        "## 5. Current periodontitis status\n\n"
        "A separate axis describing **how the disease is behaving today**:\n"
        "- **Currently stable** — BoP <10%, PPD ≤4 mm, **no BoP at 4 mm sites**\n"
        "- **Currently in remission** — BoP ≥10%, PPD ≤4 mm, **no BoP at 4 mm sites**\n"
        "- **Currently unstable** — PPD ≥5 mm **OR** PPD ≥4 mm with BoP\n\n"
        "## 6. Risk factor assessment\n\n"
        "Document the modifiable drivers, especially:\n"
        "- **Smoking** (record cigarettes/day)\n"
        "- **Sub-optimally controlled diabetes**\n\n"
        "## 7. Write the diagnosis statement\n\n"
        "Format: **Extent – Periodontitis – Stage – Grade – Stability – Risk Factors**\n\n"
        "Example: *Generalised Periodontitis Stage 3 Grade B – Currently Unstable – Risk(s): Smoker 15/day*"
    ),
    "slides": [
        {"id": 1, "title": "Where the pathway starts", "body": "The BSP 2018 classification turns history, examination and BPE into a single diagnostic statement. Before any pocket charting, the very first records that branch the pathway are…"},
        {"id": 2, "title": "First-line records", "body": "…the BPE for every sextant, plus a check for interdental recession that might flag historic periodontitis even when current pockets look shallow. With those two records in hand, the patient sorts into one of three streams. The first is…"},
        {"id": 3, "title": "Stream 1: Code 0/1/2 with no interdental recession", "body": "…BPE Code 0, 1 or 2 with no obvious interdental recession. This patient does not have periodontitis, so the diagnosis is decided by a single number, which is…"},
        {"id": 4, "title": "BoP threshold for health", "body": "…the bleeding on probing percentage. Below 10% BoP, the diagnosis is…"},
        {"id": 5, "title": "Clinical gingival health", "body": "…clinical gingival health. Between 10% and 30% BoP, the diagnosis steps up to…"},
        {"id": 6, "title": "Localised gingivitis", "body": "…localised gingivitis. Above 30% BoP, the diagnosis becomes…"},
        {"id": 7, "title": "Generalised gingivitis", "body": "…generalised gingivitis. One add-on note for the Code 0/1/2 pathway: when the highest BPE code is 2, the diagnosis must also comment on…"},
        {"id": 8, "title": "Plaque-retentive factors note", "body": "…plaque-retentive factors, since BPE 2 specifically flags them. Moving to the second stream, this is…"},
        {"id": 9, "title": "Stream 2: Code 3 with no interdental recession", "body": "…BPE Code 3 with no interdental recession. The pocket may be true early periodontitis, or it may be a deep false pocket; the pathway resolves this by first taking…"},
        {"id": 10, "title": "Code 3 first step", "body": "…appropriate radiographs of the involved sextant. The patient then receives…"},
        {"id": 11, "title": "Code 3 initial therapy", "body": "…initial periodontal therapy, equivalent to Step 1 of the treatment pathway. The pathway then pauses for…"},
        {"id": 12, "title": "Code 3 review", "body": "…a 3-month review, recording a localised 6-point pocket chart in the involved sextants. At review, two outcomes branch back to the other streams. Outcome 1 is…"},
        {"id": 13, "title": "Code 3 outcome: returns to health", "body": "…no pockets ≥4 mm and no radiographic bone loss due to periodontitis, which sends the patient back to the Code 0/1/2 pathway. Outcome 2 is…"},
        {"id": 14, "title": "Code 3 outcome: confirms periodontitis", "body": "…pockets ≥4 mm remain and/or there is radiographic bone loss due to periodontitis, which moves the patient onto the Code 4 pathway. The third stream is…"},
        {"id": 15, "title": "Stream 3: Code 4 or interdental recession", "body": "…BPE Code 4 and/or obvious interdental recession. Periodontitis is presumed, so the next records are…"},
        {"id": 16, "title": "Code 4 records", "body": "…appropriate radiographs and a full 6-point pocket chart for the whole dentition. Once charting is complete, the diagnosis branches by distribution. Three patterns are recognised, the first being…"},
        {"id": 17, "title": "Molar-incisor pattern", "body": "…the molar–incisor pattern, which is named explicitly as Periodontitis: Molar–Incisor Pattern. The second pattern, when fewer than 30% of teeth are affected, is…"},
        {"id": 18, "title": "Localised periodontitis", "body": "…localised periodontitis. The third pattern, when 30% or more of teeth are affected, is…"},
        {"id": 19, "title": "Generalised periodontitis", "body": "…generalised periodontitis. With the type and extent decided, periodontitis is then characterised on three more axes. The first axis is…"},
        {"id": 20, "title": "Stage I", "body": "…stage, which describes severity. It is read from the worst site of interproximal bone loss due to periodontitis. Less than 15% bone loss, or under 2 mm CAL from the CEJ, is…"},
        {"id": 21, "title": "Stage II", "body": "…Stage I, early or mild disease. Bone loss reaching the coronal third of the root is…"},
        {"id": 22, "title": "Stage III", "body": "…Stage II, moderate disease. Bone loss to the mid third of the root is…"},
        {"id": 23, "title": "Stage IV", "body": "…Stage III, severe disease. Bone loss to the apical third of the root is…"},
        {"id": 24, "title": "Grade A", "body": "…Stage IV, very severe disease. The next axis is grade, which captures the rate of progression. It is calculated as percent bone loss divided by the patient's age, where a ratio under 0.5 is…"},
        {"id": 25, "title": "Grade B", "body": "…Grade A, slow progression. A ratio between 0.5 and 1.0 is…"},
        {"id": 26, "title": "Grade C", "body": "…Grade B, moderate progression. A ratio above 1.0 is…"},
        {"id": 27, "title": "Status axis", "body": "…Grade C, rapid progression. The third axis runs alongside stage and grade and describes how the disease is behaving right now. It is called…"},
        {"id": 28, "title": "Currently stable", "body": "…current periodontitis status. The first state is currently stable, defined as bleeding on probing under 10%, probing depths 4 mm or less, and no bleeding at any 4 mm site. The second state is…"},
        {"id": 29, "title": "In remission", "body": "…currently in remission, where probing depths are 4 mm or less with no bleeding at 4 mm sites, but overall BoP has crept back above 10%. The third state is…"},
        {"id": 30, "title": "Currently unstable", "body": "…currently unstable, defined as any pocket of 5 mm or more, or a 4 mm pocket that bleeds. With type, extent, stage, grade and status all written down, the last record to add is…"},
        {"id": 31, "title": "Risk factor assessment", "body": "…risk factor assessment, especially smoking with cigarettes per day, and sub-optimally controlled diabetes. The full diagnosis statement is built from six elements in order, which are…"},
        {"id": 32, "title": "Diagnosis statement order", "body": "…extent, then periodontitis, then stage, then grade, then stability, then risk factors. A worked example pulling all six together would read…"},
        {"id": 33, "title": "Worked example", "body": "…Generalised Periodontitis Stage 3 Grade B – Currently Unstable – Risk(s): Smoker 15/day."},
    ],
}


# ---------------------------------------------------------------------------
# Workflow 2 — BSP S3 stepwise treatment pathway
# ---------------------------------------------------------------------------

WORKFLOW_TREATMENT = {
    "id": "bsp-s3-stepwise-treatment",
    "title": "BSP S3 stepwise treatment pathway for periodontal diseases",
    "overview": (
        "The S3 pathway is a four-step treatment ladder. Every patient starts at Step 1 regardless of diagnosis; only patients who engage with Step 1 "
        "and have periodontitis progress through Steps 2, 3 and 4. The pathway pivots on **engagement** at the end of Step 1 and on **stability** after Step 2.\n\n"
        "## 1. Diagnosis trigger\n\n"
        "Three diagnostic categories enter the pathway: **periodontal health**, **gingivitis**, and **periodontitis**. For periodontitis, before treatment starts, "
        "**extract teeth with hopeless prognosis or unsavable teeth** (e.g. Grade III mobile).\n\n"
        "## 2. Step 1: Building foundations\n\n"
        "Step 1 is delivered to everyone. It establishes the conditions for any subsequent therapy to work.\n\n"
        "Six elements:\n"
        "1. Explain disease, risk factors and treatment alternatives, including risks and benefits of **no treatment**\n"
        "2. Explain importance of OH and **support behaviour change** for OH improvement\n"
        "3. Reduce risk factors — remove **plaque-retentive features**, support **smoking cessation** and **diabetes control**\n"
        "4. Provide individually tailored OH advice including **interdental cleaning**, +/- adjunctive efficacious toothpaste and mouthwash, "
        "+/- **Professional Mechanical Plaque Removal (PMPR)** including supra- and subgingival scaling **of the clinical crown**\n"
        "5. Select recall period from published guidance, weighting smoking and diabetes\n"
        "6. **Skill mix**: Oral Health Educator delivers I–II; Hygienist or Therapist delivers I–IV; Dentist or Level 2/3-accredited practitioner delivers I–V\n\n"
        "## 3. Re-evaluate engagement\n\n"
        "After Step 1, patients are categorised as **engaging** or **non-engaging**. The criteria below are a guide, not a contract.\n\n"
        "### Engaging\n"
        "- ≥50% improvement in plaque and marginal bleeding scores, **or**\n"
        "- Plaque levels ≤20% AND bleeding levels ≤30%, **or**\n"
        "- Personal self-care plan targets met\n\n"
        "### Non-engaging\n"
        "- <50% improvement, **or**\n"
        "- Plaque levels >20% AND bleeding levels >30%, **or**\n"
        "- Patient prefers a palliative approach to periodontal care\n\n"
        "**Engaging periodontitis patient** → progress to **Step 2**.\n"
        "**Non-engaging patient** → return to **Step 1** and repeat, or **consider referral**.\n\n"
        "## 4. Step 2: Subgingival instrumentation\n\n"
        "For periodontitis only. Step 2 is the active root-surface phase.\n\n"
        "Three elements:\n"
        "1. Reinforce OH, risk factor control and behaviour change\n"
        "2. Subgingival instrumentation, **hand or powered (sonic/ultrasonic)**, alone or in combination\n"
        "3. Adjunctive **systemic antimicrobials** only when prescribed by a **Level 2 or 3 accredited practitioner**\n\n"
        "## 5. Re-evaluate after 3 months\n\n"
        "Charting is repeated and the dentition is judged against the stability criteria from the 2018 classification.\n\n"
        "- **Stable** → progress to **Step 4 (maintenance)**\n"
        "- **Unstable** → progress to **Step 3 (managing non-responding sites)**\n\n"
        "## 6. Step 3: Managing non-responding sites\n\n"
        "Sites that did not stabilise after Step 2:\n"
        "1. Reinforce OH, risk factor control and behaviour change\n"
        "2. **Moderate residual pockets (4–5 mm)** → re-perform **subgingival instrumentation**\n"
        "3. **Deep residual pockets (≥6 mm)** → consider **alternative causes** (endodontic-periodontal lesions, vertical fractures, anatomical traps)\n"
        "4. Consider **referral** for pocket management or **regenerative surgery**\n"
        "5. If referral is not possible, re-perform subgingival instrumentation; once **all sites stable**, move to Step 4\n\n"
        "## 7. Step 4: Maintenance\n\n"
        "The lifelong supportive phase:\n"
        "1. **Strongly encourage** supportive periodontal care\n"
        "2. Reinforce OH, risk factor control and behaviour change\n"
        "3. Regular targeted PMPR as required to **limit tooth loss**\n"
        "4. Consider evidence-based adjunctive efficacious toothpaste and/or mouthwash to control gingival inflammation\n\n"
        "**Maintenance recall**: tailored intervals from **3 to 12 months**.\n\n"
        "## 8. BSP top tips\n\n"
        "- The largest treatment benefit comes from regular **self-performed plaque removal** — engage the patient in a verbal contract for daily plaque control\n"
        "- **Interdental brushes** should supplement toothbrushing wherever anatomy allows\n"
        "- Match brush and interdental aid to the patient's dexterity, needs and preferences"
    ),
    "slides": [
        {"id": 1, "title": "Pathway entry", "body": "The BSP S3 stepwise pathway is a four-step treatment ladder. The diagnosis decides where the patient enters the pathway, but every patient starts at the same step, which is…"},
        {"id": 2, "title": "Step 1 universal", "body": "…Step 1, building foundations. Health and gingivitis patients receive Step 1 only; periodontitis patients receive Step 1 plus more. Before any treatment starts in a periodontitis patient, the very first action is to…"},
        {"id": 3, "title": "Pre-Step-1 extraction", "body": "…extract teeth with a hopeless prognosis or that are clearly unsavable, for example Grade III mobile teeth. With hopeless teeth removed, Step 1 covers six things in order. The first is…"},
        {"id": 4, "title": "Step 1 element I", "body": "…explain the disease, the risk factors, and the treatment alternatives, including the risks and benefits of no treatment at all. The second element is…"},
        {"id": 5, "title": "Step 1 element II", "body": "…explain the importance of oral hygiene and support behaviour change to improve it. The third element is…"},
        {"id": 6, "title": "Step 1 element III", "body": "…reduce risk factors, which specifically means removing plaque-retentive features, supporting smoking cessation, and controlling diabetes. The fourth element is…"},
        {"id": 7, "title": "Step 1 element IV: OH and PMPR", "body": "…tailored oral hygiene advice including interdental cleaning, plus optional adjunctive efficacious toothpaste and mouthwash, and optional Professional Mechanical Plaque Removal of supra- and subgingival deposits but only on…"},
        {"id": 8, "title": "Clinical crown limit", "body": "…the clinical crown — Step 1 PMPR does not extend onto the root surface. The fifth Step 1 element is…"},
        {"id": 9, "title": "Step 1 element V", "body": "…select a recall period, weighting risk factors like smoking and diabetes. The sixth element defines who can deliver each piece, called…"},
        {"id": 10, "title": "Step 1 skill mix", "body": "…the skill mix. An Oral Health Educator delivers elements I and II; a Hygienist or Therapist delivers I to IV; a Dentist or Level 2 or 3 accredited practitioner delivers all six. Once Step 1 is complete, the pathway re-evaluates the patient against a single concept, which is…"},
        {"id": 11, "title": "Engagement pivot", "body": "…engagement. The categorisation is engaging or non-engaging, and it is meant as a guide rather than a strict contract. The first criterion for an engaging patient is…"},
        {"id": 12, "title": "Engaging criterion 1", "body": "…at least 50% improvement in plaque and marginal bleeding scores. The second criterion is…"},
        {"id": 13, "title": "Engaging criterion 2", "body": "…plaque levels at or below 20% with bleeding levels at or below 30%. The third criterion is…"},
        {"id": 14, "title": "Engaging criterion 3", "body": "…the patient has met the targets in their personal self-care plan. A non-engaging patient is the mirror image: under 50% improvement, plaque above 20% with bleeding above 30%, or…"},
        {"id": 15, "title": "Palliative preference", "body": "…the patient stating they prefer a palliative approach to periodontal care. A non-engaging patient is sent back to repeat Step 1 or, depending on the situation, the practice should…"},
        {"id": 16, "title": "Consider referral", "body": "…consider referral. An engaging periodontitis patient, by contrast, progresses to…"},
        {"id": 17, "title": "Step 2 entry", "body": "…Step 2, subgingival instrumentation. This is the active root-surface phase, with three elements. The first is…"},
        {"id": 18, "title": "Step 2 element I", "body": "…reinforce OH, risk factor control, and behaviour change — Step 1 is never closed off. The second element is…"},
        {"id": 19, "title": "Step 2 element II", "body": "…subgingival instrumentation itself, performed with hand instruments or powered devices such as sonic or ultrasonic, alone or in combination. The third element is…"},
        {"id": 20, "title": "Step 2 element III", "body": "…the use of adjunctive systemic antimicrobials, but only when prescribed by a practitioner accredited for Level 2 or 3 care. After Step 2 is complete, the pathway pauses for…"},
        {"id": 21, "title": "Three-month re-evaluation", "body": "…a three-month re-evaluation, using the stability definitions from the 2018 classification. A stable patient progresses to…"},
        {"id": 22, "title": "Stable to Step 4", "body": "…Step 4, maintenance. An unstable patient instead enters…"},
        {"id": 23, "title": "Step 3 entry", "body": "…Step 3, managing non-responding sites. Step 3 has five elements. As ever, the first is…"},
        {"id": 24, "title": "Step 3 element I", "body": "…reinforce OH, risk factor control, and behaviour change. For sites with moderate residual pockets, defined as 4 to 5 mm, the action is to…"},
        {"id": 25, "title": "Step 3 element II", "body": "…re-perform subgingival instrumentation. For deep residual pockets at 6 mm or more, the practitioner should…"},
        {"id": 26, "title": "Step 3 element III", "body": "…consider alternative causes, such as endodontic-periodontal lesions, vertical root fractures, or anatomical traps. The fourth element is to…"},
        {"id": 27, "title": "Step 3 element IV", "body": "…consider referral for pocket management or regenerative surgery. If referral is not feasible, the fifth element is to…"},
        {"id": 28, "title": "Step 3 element V", "body": "…re-perform subgingival instrumentation; once all sites stabilise the patient moves to Step 4. Step 4 itself is the lifelong supportive phase, called…"},
        {"id": 29, "title": "Step 4 entry", "body": "…maintenance. Its first element is to…"},
        {"id": 30, "title": "Step 4 element I", "body": "…strongly encourage supportive periodontal care. Element two is…"},
        {"id": 31, "title": "Step 4 element II", "body": "…reinforce OH, risk factor control, and behaviour change. Element three is…"},
        {"id": 32, "title": "Step 4 element III", "body": "…regular targeted PMPR as required to limit tooth loss. Element four adds…"},
        {"id": 33, "title": "Step 4 element IV", "body": "…evidence-based adjunctive efficacious toothpaste and/or mouthwash to control gingival inflammation. Maintenance is not on a fixed timetable: recall intervals are individually tailored from…"},
        {"id": 34, "title": "Maintenance interval", "body": "…3 to 12 months, weighted by risk and stability."},
    ],
}


# ---------------------------------------------------------------------------
# First principles
# ---------------------------------------------------------------------------

FP_DIAGNOSIS_STATEMENT = {
    "id": "bsp-013",
    "title": "A periodontal diagnosis is a six-part statement, not a single label",
    "broaderContext": "The 2018 classification turns one disease into six parallel records: extent, type, stage, grade, stability and risk.",
    "body": (
        "## A clinical label is incomplete\n\n"
        "Calling a patient \"generalised periodontitis\" only answers one of the questions the 2018 classification asks. "
        "The full statement also says how severe the worst site is (stage), how fast the disease has been moving (grade), "
        "how it is behaving today (stability), and what is driving it (risk factors). Each of those carries a different management consequence: "
        "stage decides prognosis and the realistic ceiling of repair, grade decides how aggressively to manage risk factors, "
        "stability decides where the patient sits on the treatment ladder, and risk factors decide which non-dental conversations to have. [1]\n\n"
        "## Why the order matters\n\n"
        "The diagnosis statement is read in a fixed order — extent, periodontitis, stage, grade, stability, risk factors. "
        "That order is not arbitrary; it mirrors the way the pathway resolves: distribution comes from the pocket chart, stage and grade come from the radiographs, "
        "stability comes from the BoP and PPD pattern today, and risk comes from the history. "
        "A clinician encountering the patient months later can reconstruct what was found, in what order, and why each treatment decision was made. [2]"
    ),
    "citations": [
        {"id": 1, "quote": "Diagnosis Statement: Extent – Periodontitis – Stage – Grade – Stability – Risk Factors", "source": "BSP Implementing the 2018 Classification (2024)"},
        {"id": 2, "quote": "e.g.: Generalised Periodontitis Stage 3 Grade B – Currently Unstable – Risk(s): Smoker 15/day", "source": "BSP Implementing the 2018 Classification (2024)"},
    ],
}

FP_STATUS_SNAPSHOT = {
    "id": "bsp-014",
    "title": "Stable, in remission, or unstable describes the patient now, not for life",
    "broaderContext": "Periodontitis status is a snapshot of current disease activity, designed to flip with treatment progress and risk factor changes.",
    "body": (
        "## Status is the axis that updates\n\n"
        "Stage and grade are anchored to a moment in the patient's biological history — the worst bone loss to date, and the rate at which it accumulated. "
        "Status is different. It describes whether the disease is currently calm, in low-grade activity, or actively breaking down attachment, and it is meant to change. "
        "A patient who started Step 2 unstable and finishes 3 months later with shallow non-bleeding pockets is no longer unstable, even though their stage has not changed. [1]\n\n"
        "## How the three states divide\n\n"
        "The boundaries are deliberately arithmetic. Stable means BoP under 10% with no pocket of 4 mm or more bleeding; "
        "remission means the same probing picture but with overall BoP back above 10%; unstable is anything with a 5 mm pocket, or a 4 mm pocket that bleeds. "
        "The dividing line between stable and unstable is therefore the same line the pathway uses to decide between maintenance and Step 3 — "
        "status is built to drive the next clinical move, not to label the patient. [2]"
    ),
    "citations": [
        {"id": 1, "quote": "Currently Stable: BoP <10%, PPD ≤4mm, No BoP at 4mm sites", "source": "BSP Implementing the 2018 Classification (2024)"},
        {"id": 2, "quote": "Currently Unstable: PPD ≥5mm or PPD ≥4mm & BoP", "source": "BSP Implementing the 2018 Classification (2024)"},
    ],
}

FP_ENGAGEMENT_GATE = {
    "id": "bsp-015",
    "title": "Engagement is the gate between basic care and active periodontal therapy",
    "broaderContext": "Step 1's outcome decides whether the patient is biologically suitable for instrumentation, regardless of how much disease they have.",
    "body": (
        "## Treatment without engagement is wasted\n\n"
        "Subgingival instrumentation works because the biofilm is forced into a less destructive composition long enough for healing to consolidate. "
        "If the patient cannot keep the supragingival plaque under control, the subgingival microbiome re-establishes within months, "
        "and Step 2 has nothing durable to work on. The S3 pathway makes this explicit: an engaging patient progresses to Step 2; "
        "a non-engaging patient repeats Step 1 or is referred. [1]\n\n"
        "## What engagement actually means\n\n"
        "The criteria are deliberately operational: at least 50% improvement in plaque and bleeding scores from baseline, "
        "or absolute plaque ≤20% with bleeding ≤30%, or the patient meeting their own self-care plan targets. "
        "None of these require perfection — the threshold is movement and self-management, not finished oral hygiene. "
        "The mirror criterion, where a patient states a preference for palliative care, is also valid, "
        "because periodontal therapy without consent is not a procedure that should be performed. [2]"
    ),
    "citations": [
        {"id": 1, "quote": "Engaging patient – move to STEP 2", "source": "BSP UK Clinical Practice Guidelines for the Treatment of Periodontal Diseases (2021)"},
        {"id": 2, "quote": "Defining engaging & non-engaging patients (this is a guide)", "source": "BSP UK Clinical Practice Guidelines for the Treatment of Periodontal Diseases (2021)"},
    ],
}


# ---------------------------------------------------------------------------
# Splice
# ---------------------------------------------------------------------------

def main() -> int:
    data = json.loads(BSP.read_text(encoding="utf-8"))

    subj_by_slug = {s["slug"]: s for s in data["subjects"]}

    def has_workflow(subj_slug: str, wf_id: str) -> bool:
        return any(w["id"] == wf_id for w in subj_by_slug[subj_slug]["workflows"])

    def has_principle(subj_slug: str, fp_id: str) -> bool:
        return any(p["id"] == fp_id for p in subj_by_slug[subj_slug]["firstPrinciples"])

    added = []

    if not has_workflow("examination-diagnosis", WORKFLOW_DIAGNOSIS["id"]):
        subj_by_slug["examination-diagnosis"]["workflows"].append(WORKFLOW_DIAGNOSIS)
        added.append(WORKFLOW_DIAGNOSIS["id"])

    if not has_workflow("treatment-maintenance", WORKFLOW_TREATMENT["id"]):
        subj_by_slug["treatment-maintenance"]["workflows"].append(WORKFLOW_TREATMENT)
        added.append(WORKFLOW_TREATMENT["id"])

    if not has_principle("examination-diagnosis", FP_DIAGNOSIS_STATEMENT["id"]):
        subj_by_slug["examination-diagnosis"]["firstPrinciples"].append(FP_DIAGNOSIS_STATEMENT)
        added.append(FP_DIAGNOSIS_STATEMENT["id"])

    if not has_principle("examination-diagnosis", FP_STATUS_SNAPSHOT["id"]):
        subj_by_slug["examination-diagnosis"]["firstPrinciples"].append(FP_STATUS_SNAPSHOT)
        added.append(FP_STATUS_SNAPSHOT["id"])

    if not has_principle("treatment-maintenance", FP_ENGAGEMENT_GATE["id"]):
        subj_by_slug["treatment-maintenance"]["firstPrinciples"].append(FP_ENGAGEMENT_GATE)
        added.append(FP_ENGAGEMENT_GATE["id"])

    if not added:
        print("Nothing to add — already migrated.")
        return 0

    BSP.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for a in added:
        print(f"+ {a}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
