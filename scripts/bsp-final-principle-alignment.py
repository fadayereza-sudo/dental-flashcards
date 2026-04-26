"""Final alignment of bsp-005 and bsp-010 with the 2018 classification.

bsp-005: §2 used the old SPT 'more rigorous RSD at >4mm' rule. Replace with
         the 2018 stability boundary (PPD ≥5mm OR PPD ≥4mm with BoP).

bsp-010: §2 said 'no consensus definition of periodontitis' — that was true
         pre-2018, but the 2018 classification provided one. Drop the line.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BSP = ROOT / "data" / "guidelines" / "bsp.json"


FP_005 = {
    "id": "bsp-005",
    "title": "Probing depth above 4 mm is the threshold for active intervention",
    "broaderContext": "Once a pocket is too deep for a brush and floss to reach the bottom, host hygiene alone cannot maintain it. The 4 mm rule is what divides stable from unstable.",
    "body": (
        "## What 4 mm means biologically\n\n"
        "The probing depth at any site dictates the patient's ability to maintain soft tissue health by optimal plaque control. "
        "**Probing depths of 4 mm or more are considered to be too deep to be controlled by tooth brushing and interdental cleaning alone**, and these sites should be considered for active periodontal therapy [1].\n\n"
        "## Why this drives the stability definition\n\n"
        "The 2018 classification turns this biology into the operational line between maintenance and active therapy. A patient is **currently unstable** when there is a probing depth of **5 mm or more, or a probing depth of 4 mm with bleeding on probing** [2]. "
        "Either trigger ends maintenance and re-routes the patient into active therapy at S3 Step 3. A 4 mm pocket without BoP, by contrast, is compatible with stability."
    ),
    "citations": [
        {
            "id": 1,
            "quote": "Probing depths of 4mm or more are considered to be too deep to be controlled by tooth brushing and interdental cleaning alone. These sites should be considered for active periodontal therapy.",
            "source": "BSP Good Practitioners Guide (2016), Diagnosis",
        },
        {
            "id": 2,
            "quote": "Currently Unstable: PPD ≥5mm or PPD ≥4mm & BoP",
            "source": "BSP Implementing the 2018 Classification (2024)",
        },
    ],
}


FP_010 = {
    "id": "bsp-010",
    "title": "Periodontitis is associated with systemic disease, but causality is not established",
    "broaderContext": "Periodontitis sits alongside cardiovascular disease and diabetes as common chronic non-communicable diseases. The link is real, but its direction and weight are still uncertain.",
    "body": (
        "## What the link looks like\n\n"
        "Gingival inflammation in periodontitis compromises the barrier function of the gingival epithelium, allowing bacteria, bacterial products and inflammatory products into the systemic circulation. "
        "In severe cases the wound area from periodontal inflammation can be as large as the palm of the hand, and this inflammation may be present for decades [1].\n\n"
        "## Why causality is hard to nail down\n\n"
        "Periodontitis and other common chronic non-communicable diseases share risk factors (smoking, obesity, diabetes, sedentary lifestyle, poor diet, increasing age). "
        "The impact of periodontitis on these disease processes is likely to be small, requiring large trials to demonstrate [2].\n\n"
        "## The clinically defensible message\n\n"
        "Patients can be told periodontal disease is associated with other diseases, but it is not clear if it actually causes them. "
        "What is important for general health is also likely to be protective for periodontal health [3]."
    ),
    "citations": [
        {
            "id": 1,
            "quote": "The biological mechanisms by which periodontitis might influence systemic health are linked to the fact that periodontitis causes gingival inflammation which compromises the barrier function of the gingival epithelium leading to an ingress of bacteria or bacterial products or inflammatory products into the systemic circulation. In severe cases, the wound area from periodontal inflammation can be as large as the palm of the hand.",
            "source": "BSP Good Practitioners Guide (2016), Systemic disease and periodontal health",
        },
        {
            "id": 2,
            "quote": "Periodontitis and other common, chronic, non-communicable diseases share common risk factors such as smoking, obesity, diabetes, lack of exercise/a sedentary lifestyle, poor diet and increasing age. Secondly, the impact of periodontitis on these disease processes is likely to be small hence large-scale trials are needed to demonstrate this effect or lack of effect conclusively.",
            "source": "BSP Good Practitioners Guide (2016), Systemic disease and periodontal health",
        },
        {
            "id": 3,
            "quote": "Consequently, people can be advised that periodontal disease is associated with other diseases but it is unclear if it actually causes them. However, what is important for general health is likely also to be protective for periodontal health.",
            "source": "BSP Good Practitioners Guide (2016), Systemic disease and periodontal health",
        },
    ],
}


def main() -> int:
    data = json.loads(BSP.read_text(encoding="utf-8"))
    changes = []

    for subject in data["subjects"]:
        for i, p in enumerate(subject["firstPrinciples"]):
            if p["id"] == "bsp-005":
                subject["firstPrinciples"][i] = FP_005
                changes.append("bsp-005 rewritten")
            elif p["id"] == "bsp-010":
                subject["firstPrinciples"][i] = FP_010
                changes.append("bsp-010 rewritten")

    BSP.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for c in changes:
        print(c)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
