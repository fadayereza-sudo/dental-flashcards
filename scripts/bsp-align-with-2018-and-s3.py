"""Align bsp.json with the latest BSP guidance (2018 classification and S3 stepwise treatment).

Removes content from the 2016 Good Practitioners Guide that conflicts with
current BSP guidance, and replaces older terminology (chronic / aggressive
periodontitis, mild/moderate/severe by mm) with the 2018 stage/grade/status
framework.

Idempotent.

Actions:
  1. Delete bsp-full-diagnosis (replaced by bsp-2018-classification-pathway)
  2. Delete bsp-non-surgical-therapy (replaced by bsp-s3-stepwise-treatment)
  3. Replace bsp-bpe-screening-adult: strip 2016 action mapping, redirect to 2018 pathway
  4. Replace bsp-bpe-screening-children: replace 'aggressive'/'incipient chronic' terminology
  5. Replace bsp-antimicrobials-perio: align with S3 (Level 2/3 prescriber owns adjunctive regimens)
  6. Replace bsp-supportive-periodontal-therapy: remove 'more rigorous RSD for >4mm' rule, add leaving-maintenance criteria
  7. Replace bsp-referral-decision: 1999 terminology → 2018 stage/grade/molar-incisor pattern
  8. Replace bsp-012 first principle: 'aggressive periodontitis' → 'Grade C periodontitis'
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BSP = ROOT / "data" / "guidelines" / "bsp.json"


# ---------------------------------------------------------------------------
# Workflow replacements
# ---------------------------------------------------------------------------

WF_BPE_ADULT = {
    "id": "bsp-bpe-screening-adult",
    "title": "Recording and acting on the BPE in adults",
    "overview": (
        "The Basic Periodontal Examination is a screening tool, not a diagnosis. "
        "It tells you the level of further examination needed and directs the patient into the **2018 classification pathway** for diagnosis. "
        "Used at every routine examination in adults; codes 3 or 4 trigger detailed charting.\n\n"
        "## 1. Set up the examination\n\n"
        "- Use a **WHO 621 (BPE) probe**: 0.5 mm ball end, black band 3.5 to 5.5 mm (and 8.5 to 11.5 mm)\n"
        "- Probing force: **20 to 25 g**, equivalent to the force needed to **blanch a fingernail**\n"
        "- Visually assess the gingivae first (redness, loss of stippling, location)\n\n"
        "## 2. Divide the dentition into 6 sextants\n\n"
        "- Upper right (17 to 14), upper anterior (13 to 23), upper left (24 to 27)\n"
        "- Lower right (47 to 44), lower anterior (43 to 33), lower left (34 to 37)\n"
        "- A sextant must contain **at least 2 teeth** to qualify\n"
        "- All teeth examined except 3rd molars (unless 1st and 2nd molars missing)\n\n"
        "## 3. Walk the probe and record the highest score per sextant\n\n"
        "Walk the probe around the sulcus of every tooth in the sextant; record the **highest** score. "
        "If a code 4 is found, continue probing the rest of the sextant so furcations are not missed.\n\n"
        "### Code definitions\n\n"
        "- **Code 0**: pockets <3.5 mm; first black band fully visible; no calculus or overhangs; no BOP\n"
        "- **Code 1**: pockets <3.5 mm; first black band fully visible; **bleeding on probing**; no calculus or overhangs\n"
        "- **Code 2**: pockets <3.5 mm; first black band fully visible; **calculus or plaque retention factor** (e.g. overhang)\n"
        "- **Code 3**: probing depth **3.5 to 5.5 mm**; first black band partially visible (pocket of 4 to 5 mm)\n"
        "- **Code 4**: probing depth **>5.5 mm**; first black band entirely within the pocket (pocket of 6 mm or more)\n"
        "- **\\* (asterisk)**: **furcation involvement** detected; recorded alongside the number, e.g. 3\\* or 4\\*\n\n"
        "## 4. Use the codes to enter the 2018 classification pathway\n\n"
        "The BPE result is a screening output, not an action plan in itself. It directs the patient into one of three streams of the 2018 diagnostic pathway:\n\n"
        "- **Codes 0, 1, 2 with no obvious interdental recession** → no periodontitis. Diagnose by **bleeding on probing** percentage: **<10%** clinical health, **10–30%** localised gingivitis, **>30%** generalised gingivitis. For BPE 2, also note plaque-retentive factors.\n"
        "- **Code 3 with no obvious interdental recession** → take radiographs, deliver **S3 Step 1 (foundations)**, review at 3 months with a localised 6-point chart. Outcome at review decides whether the patient returns to the Code 0/1/2 pathway or advances to the Code 4 pathway.\n"
        "- **Code 4 and/or obvious interdental recession** → take radiographs, record a full 6-point chart, then **stage, grade, and assess current status**.\n\n"
        "The asterisk does not change the pathway selection but flags a finding to be examined and recorded in the detailed chart.\n\n"
        "## 5. Detailed periodontal charting (when codes 3, 4 or \\* triggered it)\n\n"
        "- Use a **Williams (10 mm)** or **UNC 15 mm** probe\n"
        "- Record probing depth at **6 sites per tooth**; only sites **≥4 mm** need a number\n"
        "- Always record **bleeding on probing** alongside\n"
        "- Add recession, mobility, furcation involvement\n"
        "- Probing depths **≥4 mm** are too deep to be controlled by tooth brushing and interdental cleaning alone\n\n"
        "## 6. Caveat\n\n"
        "BPE **cannot be used to monitor response to therapy**: it does not show how individual sites within a sextant change. Use the 6-point pocket chart pre- and post-treatment for that."
    ),
    "slides": [
        {"id": 1, "title": "What the BPE is for", "body": "The Basic Periodontal Examination is a rapid screening tool. It tells you the level of further examination needed and directs the patient into the 2018 classification pathway. Before probing, the first step is…"},
        {"id": 2, "title": "Visual inspection first", "body": "…assess the gingival tissues visually for redness, loss of stippling and changes in contour, and record the location of any changes. The probe of choice is the…"},
        {"id": 3, "title": "The WHO 621 probe", "body": "…WHO 621 probe (the BPE probe), with a ball end 0.5 mm in diameter and a black band running from 3.5 to 5.5 mm. The probing force used is…"},
        {"id": 4, "title": "Probing force", "body": "…20 to 25 g, equivalent to the force needed to blanch a fingernail. The dentition is divided into…"},
        {"id": 5, "title": "Six sextants", "body": "…six sextants: upper right 17 to 14, upper anterior 13 to 23, upper left 24 to 27, lower right 47 to 44, lower anterior 43 to 33, lower left 34 to 37. For a sextant to count for recording…"},
        {"id": 6, "title": "Sextant minimum", "body": "…it must contain at least two teeth. All teeth in each sextant are examined, with the exception of third molars unless first or second molars are missing. The probe is then…"},
        {"id": 7, "title": "Walking the probe", "body": "…walked around the sulcus of every tooth in the sextant, and the highest score in the sextant is recorded. If a code 4 is identified, the rule is…"},
        {"id": 8, "title": "Code 4: keep probing", "body": "…continue to examine all sites in the sextant rather than stopping, so that furcations are not missed. The lowest code, code 0, describes…"},
        {"id": 9, "title": "Code 0", "body": "…healthy periodontal tissues, with pockets less than 3.5 mm, the first black band completely visible, no calculus or overhangs, and no bleeding on probing. Code 1 differs from code 0 only because…"},
        {"id": 10, "title": "Code 1", "body": "…there is bleeding on probing. Pockets are still under 3.5 mm and there is still no calculus or overhang. Code 2 then adds…"},
        {"id": 11, "title": "Code 2", "body": "…a plaque retention factor: supra- or subgingival calculus, or an overhanging restoration. Pockets are still under 3.5 mm. Code 3 represents…"},
        {"id": 12, "title": "Code 3", "body": "…probing depth between 3.5 and 5.5 mm, with the first black band partially visible, indicating a pocket of 4 to 5 mm. Code 4 represents…"},
        {"id": 13, "title": "Code 4", "body": "…probing depth greater than 5.5 mm, with the first black band entirely within the pocket, indicating a pocket of 6 mm or more. The asterisk is added to a code whenever…"},
        {"id": 14, "title": "Asterisk (furcation)", "body": "…a furcation involvement is detected, and is recorded alongside the number, for example 3* or 4*. With the codes recorded, the BPE output is a screening result, not an action plan; it directs the patient into one of three streams of the 2018 classification pathway. The first stream is…"},
        {"id": 15, "title": "Code 0/1/2 stream", "body": "…codes 0, 1 or 2 with no obvious interdental recession. The patient does not have periodontitis; diagnosis is made by bleeding on probing percentage. Less than 10% BoP indicates…"},
        {"id": 16, "title": "BoP-driven diagnosis", "body": "…clinical gingival health. Between 10% and 30% BoP indicates localised gingivitis; above 30% indicates generalised gingivitis. For BPE code 2 specifically, the diagnosis must also note…"},
        {"id": 17, "title": "Plaque-retentive factor note", "body": "…any plaque-retentive factors. The second stream is…"},
        {"id": 18, "title": "Code 3 stream", "body": "…code 3 with no obvious interdental recession. The pathway here is to take radiographs, deliver S3 Step 1 (the foundations of OH and risk reduction), and review at 3 months with…"},
        {"id": 19, "title": "Code 3 review", "body": "…a localised 6-point pocket chart in the involved sextants. The review then returns the patient to the Code 0/1/2 pathway if there is no residual pocket and no radiographic bone loss, or advances them to the Code 4 pathway otherwise. The third stream is…"},
        {"id": 20, "title": "Code 4 stream", "body": "…code 4 and/or obvious interdental recession. Periodontitis is presumed; the patient gets radiographs and a full 6-point pocket chart, then has stage, grade and current status recorded. Whenever code 3, 4 or an asterisk has been recorded, the detailed chart is taken at…"},
        {"id": 21, "title": "6-point chart sites", "body": "…6 sites per tooth, but only sites of 4 mm and above need a recorded number. Bleeding on probing should always be recorded alongside. Probing depths of 4 mm or more matter because…"},
        {"id": 22, "title": "Why 4 mm matters", "body": "…they are too deep to be controlled by tooth brushing and interdental cleaning alone, so these sites need active periodontal therapy. The probes used for detailed charting are typically…"},
        {"id": 23, "title": "Probes for detailed charting", "body": "…the 10 mm Williams probe or the 15 mm UNC probe. One vital limitation of the BPE itself is…"},
        {"id": 24, "title": "BPE limitation", "body": "…it cannot be used to monitor response to therapy, because it does not show how individual sites within a sextant change. To track treatment response, the chart needed is the 6-point pocket chart pre- and post-treatment."},
    ],
}


WF_BPE_CHILDREN = {
    "id": "bsp-bpe-screening-children",
    "title": "Periodontal screening for under-18s",
    "overview": (
        "Children and adolescents are screened with a **simplified BPE on six index teeth** to avoid the false-pocket problem of erupting permanent teeth. "
        "The codes available depend on the age band.\n\n"
        "## 1. Identify the index teeth\n\n"
        "Probe only six teeth:\n\n"
        "- **UR6, UR1, UL6**\n"
        "- **LL6, LL1, LR6**\n\n"
        "Use the **WHO 621** probe; the second black band at 8.5 to 11.5 mm is useful where false pocketing is present.\n\n"
        "## 2. Choose the code set by age\n\n"
        "### 7 to 11 years (mixed dentition)\n"
        "- Use **codes 0, 1, 2 only**\n"
        "- This avoids the pseudopockets associated with erupting permanent teeth\n\n"
        "### 12 to 17 years (permanent dentition)\n"
        "- Use the **full set: 0, 1, 2, 3, 4 and \\***\n\n"
        "## 3. Code definitions for under-18s\n\n"
        "- **0** Healthy\n"
        "- **1** Bleeding after gentle probing\n"
        "- **2** Calculus or plaque retention factor\n"
        "- **3** Shallow pocket 4 to 5 mm\n"
        "- **4** Deep pocket 6 mm or more\n"
        "- **\\*** Furcation\n\n"
        "## 4. Refer when any of the following apply\n\n"
        "1. **Periodontitis with rapid progression (Grade C)** or a **molar-incisor pattern** (the 2018 categories that replace what was historically called aggressive periodontitis)\n"
        "2. **Periodontitis not responding** to initial treatment despite good plaque control\n"
        "3. Systemic medical condition associated with periodontal destruction\n"
        "4. Medical history that significantly affects periodontal treatment, or requiring multi-disciplinary care\n"
        "5. Genetic conditions predisposing to periodontal destruction\n"
        "6. Root morphology adversely affecting prognosis\n"
        "7. Non-plaque-induced conditions requiring complex care\n"
        "8. Cases requiring diagnosis or management of rare or complex pathology\n"
        "9. **Drug-induced gingival overgrowth**\n"
        "10. Cases requiring evaluation for periodontal surgery"
    ),
    "slides": [
        {"id": 1, "title": "Why a different protocol", "body": "Under-18s get a simplified BPE on a fixed set of teeth, designed to avoid the false-pocket problem of erupting permanent teeth. The number of index teeth examined is…"},
        {"id": 2, "title": "Six index teeth", "body": "…six. The teeth probed are UR6, UR1, UL6, LL6, LL1 and LR6. The probe used is…"},
        {"id": 3, "title": "Probe of choice", "body": "…the WHO 621, with the second black band at 8.5 to 11.5 mm being useful where there is false pocketing. The codes available depend on the child's age. From 7 to 11 years, only…"},
        {"id": 4, "title": "Codes 7 to 11 years", "body": "…codes 0, 1 and 2 are used. This is during the mixed dentition phase. The reason for excluding 3 and 4 in this age band is…"},
        {"id": 5, "title": "Why limit codes in mixed dentition", "body": "…to avoid the pseudopockets associated with erupting permanent teeth, which would falsely register as code 3. From 12 to 17 years, the codes used are…"},
        {"id": 6, "title": "Codes 12 to 17 years", "body": "…the full set: 0, 1, 2, 3, 4 and *. The under-18 code definitions are slightly cleaner: code 0 is healthy, code 1 is bleeding after gentle probing, code 2 is…"},
        {"id": 7, "title": "Codes 2 to 4 in under-18s", "body": "…calculus or plaque retention factor; code 3 is a shallow pocket of 4 to 5 mm; code 4 is a deep pocket of 6 mm or more; and * indicates a furcation. The first specialist referral indication is periodontitis with…"},
        {"id": 8, "title": "Referral indications", "body": "…rapid progression (Grade C) or a molar-incisor pattern, which are the 2018 categories that replace what used to be called aggressive periodontitis. Other referral indications include periodontitis not responding to treatment, systemic medical conditions associated with periodontal destruction, genetic conditions predisposing to destruction, root morphology adversely affecting prognosis, drug-induced gingival overgrowth, non-plaque-induced conditions, and any case where periodontal surgery may be needed."},
    ],
}


WF_ANTIMICROBIALS = {
    "id": "bsp-antimicrobials-perio",
    "title": "Using antimicrobials in periodontitis",
    "overview": (
        "Antimicrobials have **very little place** in routine periodontal therapy. "
        "Antibiotic resistance, anaphylaxis risk and modest benefit set the bar high. "
        "Drainage of infection and removal of cause replace antibiotics in most situations.\n\n"
        "## 1. Routine periodontitis\n\n"
        "- **No indication for systemic antibiotics in primary care.**\n"
        "- The S3 pathway treats systemic antimicrobials as an **adjunct at Step 2** (subgingival instrumentation), and only when prescribed by a **Level 2 or 3 accredited practitioner**.\n"
        "- A general dental practitioner managing periodontitis at Steps 1 and 2 should not initiate systemic antibiotic therapy. If a patient is not responding despite good plaque control and adequate instrumentation, the action is **referral**, not antibiotics.\n\n"
        "## 2. Necrotising periodontal diseases\n\n"
        "A specific indication, unchanged across guideline cycles:\n\n"
        "- **Metronidazole 200 mg t.d.s for 3 days** (covers fuso-spirochaetal anaerobes)\n"
        "- Plus address smoking, stress, oral hygiene and diet\n\n"
        "## 3. Periodontal abscess\n\n"
        "- **Single abscess** → **drain** by instrumentation or incision; **not antibiotics**\n"
        "- **Single abscess with systemic involvement** (fever, malaise, facial swelling) → antibiotics **plus** debridement\n"
        "- **Multiple lateral abscesses** → suspect **undiagnosed diabetes** or other systemic immunosuppression; refer for medical investigation\n\n"
        "## 4. Local delivery antibiotics\n\n"
        "Indications are limited:\n\n"
        "- **Only after non-surgical treatment** (not first-line)\n"
        "- Reserved for **isolated pockets** that have failed to respond to repeated conventional treatment\n"
        "- **No detectable calculus** at the site\n"
        "- **Good plaque control** maintained\n\n"
        "Benefit is **modest**. If isolated sites are not responding despite good plaque control, **consider referral**.\n\n"
        "## 5. Core prescribing rules\n\n"
        "- **Never use antibiotics in isolation** — always alongside mechanical therapy or drainage\n"
        "- Drainage and removal of cause are first-line\n"
        "- Specific antibiotic regimens for adjunctive use in periodontitis sit with the **Level 2 or 3 prescriber**, not the GDP at primary care"
    ),
    "slides": [
        {"id": 1, "title": "Default position", "body": "Antimicrobials have very little place in routine periodontal therapy. The bar for prescribing is high because of antibiotic resistance, anaphylaxis risk and modest benefit. The two principles that replace antibiotics wherever possible are…"},
        {"id": 2, "title": "Drainage and removal of cause", "body": "…drainage of infection and removal of cause, both of which still apply, especially in patients who are systemically well. For routine periodontitis being managed at primary care, the indication for systemic antibiotics is…"},
        {"id": 3, "title": "Routine periodontitis: no indication", "body": "…none. The S3 pathway places systemic antimicrobials only at Step 2 of treatment, and only when prescribed by a practitioner accredited for Level 2 or 3 care. A primary care GDP managing Steps 1 and 2 should not initiate them. If a patient is not responding despite good plaque control and adequate instrumentation, the action is…"},
        {"id": 4, "title": "Non-responding patient", "body": "…referral, not antibiotics. There is one specific clinical condition, unchanged across guideline cycles, that does need antibiotics in primary care, which is…"},
        {"id": 5, "title": "Necrotising periodontal disease", "body": "…necrotising periodontal disease. The standard regimen is metronidazole 200 mg three times daily for 3 days, used for its spectrum against the fuso-spirochaetal anaerobes. Alongside antibiotics, the risk factors that need addressing in necrotising periodontal disease are…"},
        {"id": 6, "title": "Necrotising disease risk factors", "body": "…smoking, stress, poor oral hygiene and poor diet. For a single periodontal abscess, the management is…"},
        {"id": 7, "title": "Single periodontal abscess", "body": "…drainage of the abscess (by instrumentation during subgingival debridement or by incision), not antibiotics. Antibiotics may be helpful only if there is…"},
        {"id": 8, "title": "When abscesses get antibiotics", "body": "…systemic involvement (fever, malaise) and facial swelling, and even then only when combined with debridement. If a patient presents with multiple lateral periodontal abscesses, you should suspect…"},
        {"id": 9, "title": "Multiple lateral abscesses", "body": "…an underlying systemic condition such as undiagnosed diabetes, and refer the patient for relevant investigation. For local delivery antibiotics, the indications are limited and the situation has to meet several conditions, namely…"},
        {"id": 10, "title": "Local delivery indications", "body": "…isolated pockets that have failed to respond to conventional non-surgical treatment, no detectable calculus at the site, and the patient maintaining good plaque control. The expected benefit from local delivery antibiotics is…"},
        {"id": 11, "title": "Magnitude of benefit", "body": "…modest. If isolated sites are still not responding despite good plaque control, the action is referral to a specialist. The single core rule that ties all of this together is…"},
        {"id": 12, "title": "Core rule", "body": "…antibiotics are never used in isolation. They are always an adjunct to mechanical therapy or drainage, and the specific regimens for adjunctive perio antibiotics in periodontitis sit with the Level 2 or 3 prescriber, not with primary care."},
    ],
}


WF_SPT = {
    "id": "bsp-supportive-periodontal-therapy",
    "title": "Running supportive periodontal therapy (SPT)",
    "overview": (
        "Supportive periodontal therapy is the **maintenance phase** (S3 Step 4) that follows initial periodontal therapy. "
        "The goal is to keep the patient **currently stable**, with appointment intervals tailored to risk and stability.\n\n"
        "## 1. Set the recall interval by risk\n\n"
        "### Patients without periodontitis (BPE 0 to 2)\n"
        "- Hygienist visit **every 1 to 2 years** for many patients\n"
        "- Around **50%** may still develop periodontitis if causative and risk factors are not controlled\n\n"
        "### Patients with treated periodontitis\n"
        "- **3-monthly recall** is the typical starting interval, justified by subgingival flora re-establishing within 3 months even after thorough debridement\n"
        "- Initially intervals **2 to 4 months**, reviewed at each visit\n"
        "- Stable, compliant patients with stable supra- and subgingival environments may have intervals **extended over time**, up to the S3 maximum of **12 months**\n\n"
        "## 2. Watch the high-risk sites\n\n"
        "Certain sites stay difficult and need closer monitoring:\n\n"
        "- **Furcations**\n"
        "- Pockets associated with **infrabony defects**\n"
        "- Pockets associated with root grooves, enamel projections, or chronic food impaction sites\n\n"
        "## 3. Run the SPT appointment\n\n"
        "1. Oral examination with recording of plaque and gingival inflammation (redness, bleeding), used for re-motivation in the affected areas\n"
        "2. Check probing depths and bleeding from the pocket\n"
        "3. Supra- and subgingival ultrasonic and hand scaling to remove plaque or calculus\n"
        "4. **Targeted PMPR** at sites that are still inflamed or have local calculus\n"
        "5. Local anaesthetic if needed for deep residual pockets (cross-reference last periodontal chart)\n"
        "6. **Periodontal charting repeated annually**\n\n"
        "## 4. Detect when the patient has left maintenance\n\n"
        "Maintenance is for **currently stable** patients. If repeated examination shows…\n\n"
        "- BoP at any **4 mm or deeper** site, or\n"
        "- A **2 mm increase** in probing depth at a specific site\n\n"
        "…the patient is no longer stable. They re-enter active therapy at **S3 Step 3 (managing non-responding sites)**, not \"more aggressive RSD\" within the same SPT visit.\n\n"
        "## 5. Monitor the patient over time\n\n"
        "- Has the patient stopped smoking?\n"
        "- General plaque levels across recent visits?\n"
        "- Any **repeated BoP at a specific site**?\n"
        "- Any **2 mm increase in probing depth** at a specific site?\n\n"
        "Set expectations from the start: the patient must understand that once active treatment ends, **regular maintenance is for life**."
    ),
    "slides": [
        {"id": 1, "title": "Goal of SPT", "body": "Supportive periodontal therapy is the maintenance phase (S3 Step 4) that follows initial periodontal therapy. The goal is to keep the patient currently stable, with appointment intervals tailored to risk and stability. For patients without periodontitis (BPE 0 to 2), many can stay periodontally stable with hygienist visits every…"},
        {"id": 2, "title": "Healthy interval", "body": "…1 to 2 years. The proportion who may still develop some form of periodontitis if causative and risk factors are not controlled is approximately…"},
        {"id": 3, "title": "Risk in untreated", "body": "…50%. For patients with treated periodontitis, the typical recall interval is…"},
        {"id": 4, "title": "Periodontitis recall", "body": "…three-monthly. The biological reason for three months is that even with good home care, a potentially pathogenic bacterial flora can re-establish itself at the base of a 5 mm + pocket within…"},
        {"id": 5, "title": "Three-month basis", "body": "…three months after a thorough subgingival debridement. A second reason is the need for continuous oral hygiene coaching and patient motivation. Initially the interval typically varies between…"},
        {"id": 6, "title": "Initial range", "body": "…2 to 4 months, with the interval reviewed at each visit. Over time, in patients with good compliance and stable supra- and subgingival environments, intervals may be extended up to the S3 maximum of…"},
        {"id": 7, "title": "Maintenance maximum", "body": "…12 months. The decision to extend depends on monitoring both the patient and specific sites of concern. Sites that always need closer monitoring are…"},
        {"id": 8, "title": "High-risk sites", "body": "…furcations, pockets associated with infrabony defects, and pockets associated with root grooves, enamel projections or sites of chronic food impaction. A typical SPT appointment starts with…"},
        {"id": 9, "title": "Start of appointment", "body": "…oral examination with recording of plaque and gingival inflammation (redness and bleeding), used to aid re-motivation in the required areas. Probing depths are then checked and bleeding from the pocket noted. The instrumentation done at every SPT appointment is…"},
        {"id": 10, "title": "Routine instrumentation", "body": "…supra- and subgingival ultrasonic and hand scaling to remove plaque or calculus deposits, plus targeted PMPR at sites that are still inflamed or have local calculus. To debride deep residual pockets, you may need…"},
        {"id": 11, "title": "Local anaesthetic", "body": "…local anaesthetic, with the last periodontal chart used as a cross-reference for which sites still need attention. Periodontal charting should be repeated…"},
        {"id": 12, "title": "Charting frequency", "body": "…annually. SPT is for stable patients only. The triggers that mean the patient is no longer stable, and is therefore leaving maintenance, are…"},
        {"id": 13, "title": "Leaving maintenance", "body": "…BoP at any 4 mm or deeper site, or a 2 mm increase in probing depth at a specific site. A patient who meets either trigger re-enters active therapy at S3 Step 3 (managing non-responding sites), rather than getting more aggressive RSD within the same SPT visit. Setting expectations from the start, the patient must understand…"},
        {"id": 14, "title": "Lifelong maintenance", "body": "…that once the active phase is completed, regular maintenance is for life, and can be carried out by the dentist, hygienist or therapist."},
    ],
}


WF_REFERRAL = {
    "id": "bsp-referral-decision",
    "title": "Deciding when to refer a periodontitis patient",
    "overview": (
        "BSP guidance grades cases by **complexity**, then maps complexity to who should treat. "
        "Initial periodontal therapy must still be commenced in general practice as part of the GDP's duty of care, even when onward referral is planned.\n\n"
        "## 1. Identify the complexity level\n\n"
        "### Level 1 (general practice)\n"
        "- Diagnosis and management of uncomplicated periodontal diseases\n"
        "- Risk evaluation, BPE, S3 **Step 1 (foundations)** and **Step 2 (subgingival instrumentation)**, and **Step 4 maintenance**\n"
        "- Avoidance of antibiotic use except in necrotising periodontal disease or acute abscess with systemic complications\n"
        "- Preventive and supportive care for implants\n\n"
        "### Level 2 (general practice if skilled, otherwise refer)\n"
        "- After primary care therapy: residual **Stage II/III periodontitis** (around 30 to 50% bone loss) with residual true pockets ≥6 mm\n"
        "- Certain non-plaque-induced diseases (viral, autoimmune, vesiculo-bullous, GI manifestations) under specialist guidance\n"
        "- **Grade C periodontitis** or **periodontitis with molar-incisor pattern**, as determined by a specialist at referral\n"
        "- Furcation defects in **strategically important teeth**\n"
        "- Non-surgical management of gingival enlargement, in collaboration with medical colleagues\n"
        "- Pocket reduction surgery when delegated by a specialist\n"
        "- Peri-implant **mucositis** where implants placed under NHS contract\n\n"
        "### Level 3 (refer)\n"
        "- **Stage III/IV periodontitis** (more than 50% bone loss) with true pocketing ≥6 mm\n"
        "- Periodontal **surgery**\n"
        "- Furcation defects and complex root morphologies not suitable for delegation\n"
        "- Non-plaque-induced diseases not suitable for delegation\n"
        "- **Peri-implantitis** under NHS contract\n"
        "- Multi-disciplinary specialist care\n"
        "- Level 2 cases that did not respond\n\n"
        "## 2. Apply modifying factors (each adds one increment, not cumulative)\n\n"
        "- Medical history that significantly affects clinical management\n"
        "- Co-ordinated medical or dental multi-disciplinary care\n"
        "- Special needs for acceptance or provision of dental treatment\n"
        "- Concurrent mucogingival disease (e.g. erosive lichen planus)\n"
        "- Head/neck radiotherapy or IV bisphosphonate therapy\n"
        "- Significantly immuno-compromised or immunosuppressed\n"
        "- Significant bleeding dyscrasia or disorder\n"
        "- Potential drug interaction\n\n"
        "## 3. Apply the routing rule\n\n"
        "1. **Level 1** → treat in general practice\n"
        "2. **Level 2** → treat in general practice **if you have the skills**, otherwise refer\n"
        "3. **Level 3** → refer the majority\n"
        "4. **Grade C or molar-incisor pattern periodontitis** → offer referral after **S3 Step 1** (foundations of OH and risk reduction)\n"
        "5. **Stage I/II periodontitis** → initial care in general practice (S3 Steps 1 and 2); refer if Step 3 management is needed and you do not have the skills\n"
        "6. **Modifying factors** may move a patient to the next level\n\n"
        "## 4. Carry out the GDP duty before referral\n\n"
        "Even when onward referral is planned:\n\n"
        "- Commence initial **S3 Step 1** (and Step 2 where appropriate) in general practice\n"
        "- Address other primary dental pathology (caries, endodontic lesions)\n"
        "- Control modifiable risk factors, particularly **smoking** (refer to cessation services if needed)\n\n"
        "## 5. Refer correctly\n\n"
        "The referral letter should include:\n\n"
        "- Patient name, DOB, contact details\n"
        "- Reason for referral, patient concerns, any emergency problems\n"
        "- Relevant medical history including smoking history and all medications\n"
        "- Details of any periodontal treatment already carried out\n"
        "- Relevant radiographs (especially old ones) and charts\n\n"
        "Keep a copy with the patient's notes; record the referral and reason in the chart.\n\n"
        "## 6. If the patient declines\n\n"
        "- Listen to the reason; address misunderstandings\n"
        "- Ensure the patient understands the consequences\n"
        "- **Document the discussion**\n"
        "- Continue monitoring; offer best preventive advice; ask again at recall"
    ),
    "slides": [
        {"id": 1, "title": "How BSP grades cases", "body": "BSP guidance grades cases by complexity and maps complexity to who should treat. The lowest tier, Level 1, covers diagnosis and management of uncomplicated periodontal diseases, including BPE, S3 Step 1 (foundations) and Step 2 (subgingival instrumentation), and Step 4 maintenance, all in general practice. Level 2 is a step up and includes things like…"},
        {"id": 2, "title": "Level 2 examples", "body": "…residual Stage II to III periodontitis after primary care therapy, defined as around 30 to 50% bone loss with residual true pockets of 6 mm or more, plus periodontitis with rapid progression (Grade C) or a molar-incisor pattern as determined by a specialist, certain non-plaque-induced diseases under specialist guidance, furcation defects in strategically important teeth, and peri-implant mucositis. Level 3 takes in…"},
        {"id": 3, "title": "Level 3 examples", "body": "…Stage III to IV periodontitis, defined as more than 50% bone loss with true pocketing of 6 mm or more, periodontal surgery, complex furcation cases, non-plaque-induced diseases not suitable for delegation, peri-implantitis under NHS contract, and multi-disciplinary specialist care. Modifying factors increase the complexity by one increment, and importantly are…"},
        {"id": 4, "title": "Modifying factors", "body": "…not cumulative. Examples include medical history that significantly affects clinical management, multi-disciplinary care needs, special needs, concurrent mucogingival disease (such as erosive lichen planus), head and neck radiotherapy or IV bisphosphonate therapy, significant immuno-compromise, significant bleeding disorders, and potential drug interactions. The routing rule for Level 1 is…"},
        {"id": 5, "title": "Routing: Level 1", "body": "…treat in general practice. The routing rule for Level 2 is…"},
        {"id": 6, "title": "Routing: Level 2", "body": "…treat in general practice if the clinician has the relevant skills, otherwise refer. The routing rule for Level 3 is…"},
        {"id": 7, "title": "Routing: Level 3", "body": "…refer the majority of patients. For a patient with Grade C periodontitis or a molar-incisor pattern specifically, the action is to…"},
        {"id": 8, "title": "Grade C / molar-incisor: route", "body": "…offer referral after S3 Step 1, the foundations of oral hygiene and risk reduction. For Stage I or II periodontitis, the route is…"},
        {"id": 9, "title": "Stage I/II route", "body": "…initial care, including S3 Steps 1 and 2, in general practice, with referral indicated only if Step 3 management is needed and the GDP does not have the skills. Even when an onward referral has been made, the GDP duty of care is to…"},
        {"id": 10, "title": "GDP duty before referral", "body": "…still commence initial S3 Step 1 (and Step 2 where appropriate) in general practice, address any other primary dental pathology such as caries or endodontic lesions, and control modifiable risk factors, particularly smoking, by referring to cessation services if needed. The referral letter should contain the patient's name, DOB, contact details, and beyond that…"},
        {"id": 11, "title": "Referral letter content", "body": "…the reason for referral, patient concerns, any emergency problems, relevant medical history including smoking history and all medications, details of any periodontal treatment already carried out, and relevant radiographs and charts (particularly old ones). A copy is kept with the patient's notes and a dated entry recorded in the notes saying that the patient has been referred and why. If the patient declines referral, the action is to…"},
        {"id": 12, "title": "If the patient declines", "body": "…listen to their reason, discuss any misunderstandings that have led to the decision, ensure the patient is aware of the consequences of not being referred, and document this in the clinical notes. Then continue monitoring, provide the best preventive advice and treatment at recall, and ask the patient again whether they wish to discuss referral."},
    ],
}


# ---------------------------------------------------------------------------
# First principle replacement
# ---------------------------------------------------------------------------

FP_GRADE_C = {
    "id": "bsp-012",
    "title": "Grade C periodontitis is recognised by mismatch between plaque and destruction, not by severity alone",
    "broaderContext": "Rapid-progression periodontitis is rare but specific. Its grade is pattern-based, not threshold-based, and the pattern hinges on the disconnect between plaque load and the rate of attachment loss.",
    "body": (
        "## How fast is fast\n\n"
        "The 2018 classification turns rapidly progressing disease into a calculation. The **worst-site percent bone loss divided by patient age** is read off the radiograph: <0.5 is Grade A, 0.5–1.0 is Grade B, and **>1.0 is Grade C** [1]. "
        "A 25-year-old with 30% bone loss at the worst site has a ratio of 1.2, putting them in Grade C, even if their plaque load looks unremarkable. "
        "In adolescents and young adults, the same pattern often presents as **Periodontitis: Molar–Incisor Pattern**, which is its own named distribution under the 2018 classification [2].\n\n"
        "## Why mismatch matters at the chair\n\n"
        "The classification asks for the calculation, but the chair-side signal is the mismatch: a young, low-plaque patient with vertical defects on the radiograph and a family history of early tooth loss is the textbook presentation. "
        "The management implication is **referral after S3 Step 1**, because the rate of destruction usually outpaces what primary care can deliver alone."
    ),
    "citations": [
        {"id": 1, "quote": "% bone loss ÷ patient age (use worst site of bone loss due to periodontitis)", "source": "BSP Implementing the 2018 Classification (2024)"},
        {"id": 2, "quote": "Molar-incisor pattern → Periodontitis Molar-Incisor Pattern", "source": "BSP Implementing the 2018 Classification (2024)"},
    ],
}


# ---------------------------------------------------------------------------
# Splice
# ---------------------------------------------------------------------------

DELETE_WORKFLOWS = {"bsp-full-diagnosis", "bsp-non-surgical-therapy"}

REPLACE_WORKFLOWS = {
    WF_BPE_ADULT["id"]: WF_BPE_ADULT,
    WF_BPE_CHILDREN["id"]: WF_BPE_CHILDREN,
    WF_ANTIMICROBIALS["id"]: WF_ANTIMICROBIALS,
    WF_SPT["id"]: WF_SPT,
    WF_REFERRAL["id"]: WF_REFERRAL,
}


def main() -> int:
    data = json.loads(BSP.read_text(encoding="utf-8"))

    summary = []

    for subject in data["subjects"]:
        new_workflows = []
        for wf in subject["workflows"]:
            if wf["id"] in DELETE_WORKFLOWS:
                summary.append(f"DELETE  {wf['id']}")
                continue
            if wf["id"] in REPLACE_WORKFLOWS:
                new_workflows.append(REPLACE_WORKFLOWS[wf["id"]])
                summary.append(f"REPLACE {wf['id']}")
            else:
                new_workflows.append(wf)
        subject["workflows"] = new_workflows

        for i, p in enumerate(subject["firstPrinciples"]):
            if p["id"] == "bsp-012":
                subject["firstPrinciples"][i] = FP_GRADE_C
                summary.append("REPLACE bsp-012 (first principle)")

    BSP.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    for line in summary:
        print(line)

    # Final tally
    total_w = total_fp = total_slides = 0
    for s in data["subjects"]:
        for w in s["workflows"]:
            total_w += 1
            total_slides += len(w["slides"])
        total_fp += len(s["firstPrinciples"])
    print(f"\nBSP totals after update: workflows={total_w}, firstPrinciples={total_fp}, slides={total_slides}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
