"""Update bsp-bpe-screening-children to the 2021 BSP/BSPD joint guidance.

Adds the explicit action mapping per sBPE code (Table 1) and replaces the
referral list with the 2017/2018-classification-aligned referral indications
(Table 2).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BSP = ROOT / "data" / "guidelines" / "bsp.json"


WF = {
    "id": "bsp-bpe-screening-children",
    "title": "Periodontal screening for under-18s (sBPE)",
    "overview": (
        "Children and adolescents are screened with a **simplified BPE (sBPE) on six index teeth** to avoid the false-pocket problem of erupting permanent teeth. "
        "Joint BSP and BSPD guidance updated 2021 retains the six-index-tooth method but updates the action mapping and referral list to reflect the 2017 classification.\n\n"
        "## 1. Identify the index teeth\n\n"
        "Probe only six teeth:\n\n"
        "- **Upper:** UR6, UR1, UL6\n"
        "- **Lower:** LR6, LL1, LL6\n\n"
        "Use the **WHO probe** with a 0.5 mm ball end and black band at 3.5 to 5.5 mm. Assess 6 points per tooth.\n\n"
        "## 2. Choose the code set by age\n\n"
        "### 7 to 11 years (mixed dentition)\n"
        "- Use **codes 0, 1, 2 only**\n"
        "- This avoids the pseudopockets associated with erupting permanent teeth\n\n"
        "### 12 to 17 years (permanent dentition)\n"
        "- Use the **full set: 0, 1, 2, 3, 4 and \\***\n\n"
        "## 3. sBPE code definitions\n\n"
        "- **0** Healthy\n"
        "- **1** Bleeding after gentle probing — **black band fully visible**\n"
        "- **2** Calculus or plaque retention factor — **black band fully visible**\n"
        "- **3** Shallow pocket of 4 to 5 mm — **black band partly visible**\n"
        "- **4** Deep pocket of 6 mm or more — **black band disappears**\n"
        "- **\\*** Furcation involvement\n\n"
        "## 4. Act on the score (Table 1, BSP/BSPD 2021)\n\n"
        "### Code 0\n"
        "- No periodontal treatment\n"
        "- Screen again at routine recall or within **1 year**, whichever sooner\n\n"
        "### Code 1\n"
        "- **Oral hygiene instruction (OHI)**\n"
        "- Screen again at routine recall or within **6 months**, whichever sooner\n\n"
        "### Code 2\n"
        "- OHI as for Code 1\n"
        "- **Supragingival/subgingival PMPR** plus removal of plaque retention factors\n"
        "- Screen again at routine recall or within **6 months**, whichever sooner\n\n"
        "### Code 3\n"
        "- OHI as for Codes 1 and 2\n"
        "- **Supragingival/subgingival PMPR** with particular emphasis on **subgingival PMPR in shallow 4 to 5 mm pockets**\n"
        "- Remove/manage plaque retention factors\n"
        "- **After 3 months**, do a full periodontal assessment including **6-point PPD chart in the affected sextants**\n\n"
        "### Code 4 or \\*\n"
        "- **Unusual in young patients**\n"
        "- Do a full periodontal assessment including a 6-point PPD chart **throughout the entire dentition**\n"
        "- **Consider specialist referral** while doing initial therapy as for Code 3\n\n"
        "## 5. Refer to specialist services when any of the following apply (Table 2, BSP/BSPD 2021)\n\n"
        "1. **Stage II or III periodontitis not responding to treatment**\n"
        "2. **Grade C or Stage IV periodontitis**\n"
        "3. Medical history that significantly affects periodontal treatment, or requiring multi-disciplinary care\n"
        "4. **Periodontitis as a direct manifestation of systemic disease**\n"
        "5. Systemic or genetic diseases that can affect the periodontal supporting tissues\n"
        "6. Root morphology or furcation defects adversely affecting prognosis on key teeth\n"
        "7. Non-plaque-induced conditions requiring complex or specialist care\n"
        "8. Cases requiring diagnosis or management of rare or complex clinical pathology\n"
        "9. **Drug-induced gingival overgrowth needing surgery**\n"
        "10. Cases requiring evaluation for periodontal surgery"
    ),
    "slides": [
        {"id": 1, "title": "Why a different protocol", "body": "Under-18s get a simplified BPE on a fixed set of teeth, designed to avoid the false-pocket problem of erupting permanent teeth. Joint BSP and BSPD guidance updated in 2021 retains the six-index-tooth method but updates the action mapping and referral list to reflect the 2017 classification. The number of index teeth examined is…"},
        {"id": 2, "title": "Six index teeth", "body": "…six. The teeth probed are UR6, UR1, UL6, LR6, LL1 and LL6. The probe used is…"},
        {"id": 3, "title": "Probe of choice", "body": "…the WHO probe, with a 0.5 mm ball end and a black band at 3.5 to 5.5 mm. Six points are assessed per tooth. The codes available depend on the child's age. From 7 to 11 years, only…"},
        {"id": 4, "title": "Codes 7 to 11 years", "body": "…codes 0, 1 and 2 are used, on the index teeth only. This is the mixed dentition phase. The reason for excluding 3 and 4 in this age band is…"},
        {"id": 5, "title": "Why limit codes in mixed dentition", "body": "…to avoid the pseudopockets associated with erupting permanent teeth, which would falsely register as code 3. From 12 to 17 years, the codes used are…"},
        {"id": 6, "title": "Codes 12 to 17 years", "body": "…the full set: 0, 1, 2, 3, 4 and *, still on the index teeth only. Code 0 is healthy. Code 1 is bleeding after gentle probing with the black band fully visible. Code 2 is…"},
        {"id": 7, "title": "Code 2", "body": "…calculus or a plaque retention factor, with the black band still fully visible. Code 3 indicates a shallow pocket of 4 to 5 mm where the black band is…"},
        {"id": 8, "title": "Code 3 and 4 black-band cues", "body": "…partly visible. Code 4 indicates a deep pocket of 6 mm or more, where the black band disappears entirely into the pocket. The asterisk denotes a furcation, recorded alongside the number. Once the codes are recorded, each one drives a specific action. Code 0 means…"},
        {"id": 9, "title": "Action: Code 0", "body": "…no periodontal treatment, with a rescreen at routine recall or within 1 year, whichever is sooner. Code 1 adds…"},
        {"id": 10, "title": "Action: Code 1", "body": "…oral hygiene instruction, with a rescreen at routine recall or within 6 months. Code 2 builds further by adding…"},
        {"id": 11, "title": "Action: Code 2", "body": "…supragingival and subgingival professional mechanical plaque removal, plus removal of plaque retention factors, on top of the OHI. The rescreen interval matches Code 1 at routine recall or within 6 months. Code 3 escalates to…"},
        {"id": 12, "title": "Action: Code 3", "body": "…OHI as for Codes 1 and 2, plus supra and subgingival PMPR with particular emphasis on subgingival PMPR in the shallow 4 to 5 mm pockets, plus removal of plaque retention factors. After 3 months, a 6-point pocket chart is recorded in…"},
        {"id": 13, "title": "Code 3 review", "body": "…the affected sextants only. Code 4 or an asterisk in an under-18 is unusual, and the action steps up to…"},
        {"id": 14, "title": "Action: Code 4 or asterisk", "body": "…a full periodontal assessment with a 6-point pocket chart throughout the entire dentition, plus consideration of specialist referral while initial therapy proceeds as for Code 3. Beyond the score-driven actions, certain cases warrant referral regardless of code. The first referral indication is periodontitis that is…"},
        {"id": 15, "title": "Refer: not responding", "body": "…Stage II or III periodontitis not responding to treatment. Higher up the stage and grade ladder, referral is also warranted for…"},
        {"id": 16, "title": "Refer: Grade C or Stage IV", "body": "…Grade C or Stage IV periodontitis. The next group of indications relates to the medical and systemic picture, namely…"},
        {"id": 17, "title": "Refer: medical and systemic", "body": "…a medical history that significantly affects periodontal treatment or requires multi-disciplinary care, periodontitis as a direct manifestation of systemic disease, and systemic or genetic diseases that affect the periodontal supporting tissues. Anatomy can also drive referral, specifically when…"},
        {"id": 18, "title": "Refer: anatomy", "body": "…there are root morphology or furcation defects adversely affecting the prognosis of key teeth. The remaining referral indications cover…"},
        {"id": 19, "title": "Refer: rare and complex", "body": "…non-plaque-induced conditions requiring complex or specialist care, and cases requiring diagnosis or management of rare or complex clinical pathology. Two final indications complete the list, namely…"},
        {"id": 20, "title": "Refer: gingival overgrowth and surgery", "body": "…drug-induced gingival overgrowth needing surgery, and any case requiring evaluation for periodontal surgery."},
    ],
}


def main() -> int:
    data = json.loads(BSP.read_text(encoding="utf-8"))
    replaced = False
    for subject in data["subjects"]:
        for i, w in enumerate(subject["workflows"]):
            if w["id"] == "bsp-bpe-screening-children":
                subject["workflows"][i] = WF
                replaced = True
                print("Replaced bsp-bpe-screening-children with 2021 BSP/BSPD update")
    if not replaced:
        print("bsp-bpe-screening-children not found")
        return 1
    BSP.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
