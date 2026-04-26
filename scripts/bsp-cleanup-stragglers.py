"""Final cleanup of 1999-classification language in bsp.json:

1. bsp-001 citation 3 source label: 'Chronic periodontitis' → neutral wording
2. bsp-007: rewrite body and citations to align with S3 (no chronic/aggressive)
3. bsp-peri-implant-disease overview: 'advanced or aggressive disease' → neutral wording
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BSP = ROOT / "data" / "guidelines" / "bsp.json"


FP_007 = {
    "id": "bsp-007",
    "title": "Antibiotics are an adjunct to mechanical therapy, never a substitute",
    "broaderContext": "Periodontitis is biofilm disease. Drugs cannot reach an organised biofilm; mechanical disruption has to come first.",
    "body": (
        "## The general rule\n\n"
        "Systemic antibiotics should only ever be used as an adjunct to professionally administered mechanical therapy, and not in isolation [1]. "
        "The S3 stepwise pathway makes this explicit: systemic antimicrobials sit at **Step 2** (subgingival instrumentation), and only when prescribed by a **Level 2 or 3 accredited practitioner** [2]. "
        "A general dental practitioner managing periodontitis at primary care does not initiate them. If a patient is not responding despite good plaque control and adequate instrumentation, the action is referral.\n\n"
        "## What this means for prescribing decisions\n\n"
        "Local delivery antibiotics are not first-line either: they are reserved for isolated pockets that have failed repeated conventional treatment, with no detectable calculus, in patients maintaining good plaque control, and the benefit is modest [3]. "
        "The default position in periodontics is mechanical therapy plus risk factor control; antibiotics are a narrow exception, used for specific indications such as necrotising periodontal disease or an abscess with systemic involvement."
    ),
    "citations": [
        {
            "id": 1,
            "quote": "Systemic antibiotics should only ever be used as an adjunct to professionally-administered mechanical therapy, and not in isolation.",
            "source": "BSP Good Practitioners Guide (2016), Antimicrobials",
        },
        {
            "id": 2,
            "quote": "Use of adjunctive systemic antimicrobials determined by Practitioner accredited for Level 2 and 3 care",
            "source": "BSP UK Clinical Practice Guidelines for the Treatment of Periodontal Diseases (2021), Step 2",
        },
        {
            "id": 3,
            "quote": "Their use can be considered in cases where isolated periodontal pockets have failed to respond to conventional non-surgical treatment on a number of occasions, where there is no detectable calculus at the site, and where the patient is maintaining good levels of plaque control. However, the benefit resulting from their use appears modest.",
            "source": "BSP Good Practitioners Guide (2016), Local delivery antibiotics",
        },
    ],
}


def main() -> int:
    data = json.loads(BSP.read_text(encoding="utf-8"))
    changes = []

    for subject in data["subjects"]:
        # Fix bsp-007
        for i, p in enumerate(subject["firstPrinciples"]):
            if p["id"] == "bsp-007":
                subject["firstPrinciples"][i] = FP_007
                changes.append("bsp-007 rewritten")
            elif p["id"] == "bsp-001":
                # Fix citation 3 source label
                for cit in p.get("citations", []):
                    if cit.get("id") == 3 and "Chronic periodontitis" in cit.get("source", ""):
                        cit["source"] = "BSP Good Practitioners Guide (2016), Periodontitis susceptibility"
                        changes.append("bsp-001 citation 3 source relabelled")

        # Fix bsp-peri-implant-disease overview wording
        for w in subject["workflows"]:
            if w["id"] == "bsp-peri-implant-disease":
                old = "advanced or aggressive disease requiring clearance"
                new = "advanced or rapidly progressing disease requiring clearance"
                if old in w["overview"]:
                    w["overview"] = w["overview"].replace(old, new)
                    changes.append("bsp-peri-implant-disease overview neutralised")
                # Slides too
                for slide in w["slides"]:
                    if old in slide["body"]:
                        slide["body"] = slide["body"].replace(old, new)
                        changes.append(f"  slide {slide['id']} updated")

    BSP.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    for c in changes:
        print(c)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
