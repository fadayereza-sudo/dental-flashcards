"""Migrate data/guidelines/<slug>.json from flat workflows[]/firstPrinciples[]
to a subjects[] hierarchy.

Idempotent: if a file already has `subjects`, it is left alone.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDELINES_DIR = ROOT / "data" / "guidelines"


# ---------------------------------------------------------------------------
# Subject layout per category.
#
# Each entry:
#   slug, title, [optional description],
#   wfPrefixes: list of workflow id prefixes that match into this subject
#   fpIds:      explicit list of firstPrinciple ids that go here
# ---------------------------------------------------------------------------

LAYOUTS: dict[str, list[dict]] = {
    "sdcep": [
        {
            "slug": "antibiotic-prophylaxis",
            "title": "Antibiotic prophylaxis",
            "wfPrefixes": ["sdcep-antibiotic-prophylaxis-"],
            "fpIds": ["sdcep-001", "sdcep-002", "sdcep-003"],
        },
        {
            "slug": "mronj",
            "title": "MRONJ",
            "wfPrefixes": ["sdcep-mronj-"],
            "fpIds": ["sdcep-004", "sdcep-005", "sdcep-006", "sdcep-007"],
        },
        {
            "slug": "anticoagulants",
            "title": "Anticoagulants & antiplatelets",
            "wfPrefixes": ["sdcep-anticoag-"],
            "fpIds": ["sdcep-008", "sdcep-009", "sdcep-010", "sdcep-011"],
        },
        {
            "slug": "amalgam",
            "title": "Dental amalgam",
            "wfPrefixes": ["sdcep-amalgam-"],
            "fpIds": ["sdcep-012", "sdcep-013", "sdcep-014"],
        },
        {
            "slug": "child-caries",
            "title": "Child caries",
            "wfPrefixes": ["sdcep-child-caries-"],
            "fpIds": ["sdcep-015", "sdcep-016", "sdcep-017", "sdcep-018", "sdcep-019"],
        },
        {
            "slug": "prescribing",
            "title": "Prescribing & emergencies",
            "wfPrefixes": ["sdcep-prescribing-"],
            "fpIds": [
                "sdcep-020", "sdcep-021", "sdcep-022", "sdcep-023",
                "sdcep-024", "sdcep-025", "sdcep-026",
            ],
        },
    ],
    "dboh": [
        {
            "slug": "caries-prevention",
            "title": "Caries prevention",
            "wfIds": [
                "dboh-caries-prevention-by-age",
                "dboh-fluoride-toothpaste-prescribing",
                "dboh-fluoride-varnish-application",
                "dboh-diet-advice-caries",
            ],
            "fpIds": [
                "dboh-001", "dboh-002", "dboh-003", "dboh-004",
                "dboh-015", "dboh-016", "dboh-017",
            ],
        },
        {
            "slug": "periodontal",
            "title": "Periodontal",
            "wfIds": ["dboh-bpe-perio-management", "dboh-perio-diabetes-protocol"],
            "fpIds": ["dboh-005", "dboh-007", "dboh-012"],
        },
        {
            "slug": "smoking-alcohol",
            "title": "Smoking & alcohol",
            "wfIds": ["dboh-vba-smoking", "dboh-alcohol-iba-audit-c"],
            "fpIds": ["dboh-006", "dboh-013", "dboh-014", "dboh-018", "dboh-019"],
        },
        {
            "slug": "oral-cancer",
            "title": "Oral cancer",
            "wfIds": ["dboh-oral-cancer-detection"],
            "fpIds": ["dboh-008", "dboh-009", "dboh-010"],
        },
        {
            "slug": "tooth-wear",
            "title": "Tooth wear",
            "wfIds": ["dboh-tooth-wear-bewe"],
            "fpIds": ["dboh-011"],
        },
    ],
    "bsp": [
        {
            "slug": "disease-basics",
            "title": "Disease basics",
            "wfIds": [],
            "fpIds": ["bsp-001", "bsp-002", "bsp-003"],
        },
        {
            "slug": "examination-diagnosis",
            "title": "Examination & diagnosis",
            "wfIds": [
                "bsp-bpe-screening-adult",
                "bsp-bpe-screening-children",
                "bsp-radiographs-perio",
                "bsp-full-diagnosis",
            ],
            "fpIds": ["bsp-004", "bsp-005", "bsp-012"],
        },
        {
            "slug": "treatment-maintenance",
            "title": "Treatment & maintenance",
            "wfIds": [
                "bsp-non-surgical-therapy",
                "bsp-antimicrobials-perio",
                "bsp-supportive-periodontal-therapy",
                "bsp-smoking-cessation-perio",
                "bsp-referral-decision",
            ],
            "fpIds": ["bsp-006", "bsp-007", "bsp-011"],
        },
        {
            "slug": "implants",
            "title": "Implants",
            "wfIds": ["bsp-peri-implant-disease"],
            "fpIds": ["bsp-008", "bsp-009", "bsp-010"],
        },
    ],
    "fgdp": [
        {
            "slug": "general-principles",
            "title": "General principles",
            "wfIds": ["fgdp-justify-radiograph"],
            "fpIds": ["fgdp-001", "fgdp-002", "fgdp-003"],
        },
        {
            "slug": "caries",
            "title": "Caries",
            "wfIds": ["fgdp-caries-bitewing-interval"],
            "fpIds": ["fgdp-004", "fgdp-005"],
        },
        {
            "slug": "periodontal",
            "title": "Periodontal",
            "wfIds": ["fgdp-periodontal-radiograph-selection"],
            "fpIds": [],
        },
        {
            "slug": "endodontics",
            "title": "Endodontics",
            "wfIds": ["fgdp-endodontic-radiographs"],
            "fpIds": ["fgdp-006", "fgdp-007"],
        },
        {
            "slug": "implants",
            "title": "Implants",
            "wfIds": ["fgdp-implant-imaging-strategy"],
            "fpIds": ["fgdp-008"],
        },
        {
            "slug": "specific-situations",
            "title": "Specific situations",
            "wfIds": [
                "fgdp-panoramic-selection",
                "fgdp-developing-dentition",
                "fgdp-new-adult-imaging",
            ],
            "fpIds": [],
        },
    ],
    "iadt": [
        {
            "slug": "examination",
            "title": "Examination",
            "wfIds": ["iadt-trauma-examination"],
            "fpIds": ["iadt-003"],
        },
        {
            "slug": "crown-root-fractures",
            "title": "Crown & root fractures",
            "wfIds": [
                "iadt-enamel-infraction",
                "iadt-uncomplicated-crown-fracture",
                "iadt-complicated-crown-fracture",
                "iadt-crown-root-fracture",
                "iadt-root-fracture",
                "iadt-alveolar-fracture",
            ],
            "fpIds": ["iadt-002", "iadt-005", "iadt-009"],
        },
        {
            "slug": "luxation-injuries",
            "title": "Luxation injuries",
            "wfIds": [
                "iadt-concussion",
                "iadt-subluxation",
                "iadt-extrusive-luxation",
                "iadt-lateral-luxation",
                "iadt-intrusive-luxation",
            ],
            "fpIds": ["iadt-008", "iadt-012"],
        },
        {
            "slug": "avulsion",
            "title": "Avulsion",
            "wfIds": [
                "iadt-avulsion-first-aid",
                "iadt-avulsion-closed-apex",
                "iadt-avulsion-open-apex",
            ],
            "fpIds": [
                "iadt-001", "iadt-006", "iadt-007",
                "iadt-011", "iadt-013",
            ],
        },
        {
            "slug": "primary-dentition",
            "title": "Primary dentition",
            "wfIds": [
                "iadt-primary-tooth-luxation",
                "iadt-primary-tooth-fracture",
                "iadt-primary-root-fracture",
            ],
            "fpIds": ["iadt-004"],
        },
        {
            "slug": "healing-response",
            "title": "Healing response",
            "wfIds": [],
            "fpIds": ["iadt-010"],
        },
    ],
    "orthodontic-referral": [
        {
            "slug": "referral-by-dentition-stage",
            "title": "Referral by dentition stage",
            "wfIds": [
                "orthodontic-referral-deciduous-dentition",
                "orthodontic-referral-mixed-dentition",
                "orthodontic-referral-permanent-dentition",
            ],
            "fpIds": [
                "orthodontic-referral-001",
                "orthodontic-referral-002",
                "orthodontic-referral-003",
                "orthodontic-referral-006",
            ],
        },
        {
            "slug": "nhs-process",
            "title": "NHS process",
            "wfIds": [
                "orthodontic-referral-iotn-mocdo-assessment",
                "orthodontic-referral-eform-process",
            ],
            "fpIds": [
                "orthodontic-referral-004",
                "orthodontic-referral-007",
            ],
        },
        {
            "slug": "patient-treatment-factors",
            "title": "Patient & treatment factors",
            "wfIds": [],
            "fpIds": [
                "orthodontic-referral-005",
                "orthodontic-referral-008",
            ],
        },
    ],
}


def assign_workflow(wf: dict, layout: list[dict]) -> str | None:
    wid = wf["id"]
    for subj in layout:
        if "wfIds" in subj and wid in subj["wfIds"]:
            return subj["slug"]
        if "wfPrefixes" in subj and any(wid.startswith(p) for p in subj["wfPrefixes"]):
            return subj["slug"]
    return None


def assign_fp(fp: dict, layout: list[dict]) -> str | None:
    fid = fp["id"]
    for subj in layout:
        if fid in subj.get("fpIds", []):
            return subj["slug"]
    return None


def migrate_file(path: Path) -> tuple[bool, str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    slug = data.get("slug")
    if slug not in LAYOUTS:
        return False, f"no layout for {slug}"

    if "subjects" in data:
        return False, "already migrated"

    layout = LAYOUTS[slug]

    # Build subject skeletons in order
    subjects = []
    for i, subj in enumerate(layout, start=1):
        subjects.append({
            "slug": subj["slug"],
            "title": subj["title"],
            "order": i,
            "workflows": [],
            "firstPrinciples": [],
        })
    subj_by_slug = {s["slug"]: s for s in subjects}

    workflows = data.get("workflows", [])
    fps = data.get("firstPrinciples", [])

    unassigned_wf = []
    for wf in workflows:
        ss = assign_workflow(wf, layout)
        if ss is None:
            unassigned_wf.append(wf["id"])
            continue
        subj_by_slug[ss]["workflows"].append(wf)

    unassigned_fp = []
    for fp in fps:
        ss = assign_fp(fp, layout)
        if ss is None:
            unassigned_fp.append(fp["id"])
            continue
        subj_by_slug[ss]["firstPrinciples"].append(fp)

    if unassigned_wf or unassigned_fp:
        return False, f"unassigned wf={unassigned_wf} fp={unassigned_fp}"

    # Drop empty subjects so the UI doesn't render hollow toggles
    subjects = [s for s in subjects if s["workflows"] or s["firstPrinciples"]]

    new_data = {
        "slug": data["slug"],
        "title": data["title"],
        "organisation": data["organisation"],
        "order": data["order"],
        "description": data.get("description", ""),
        "subjects": subjects,
    }

    path.write_text(
        json.dumps(new_data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    counts = ", ".join(
        f"{s['slug']} ({len(s['workflows'])}w/{len(s['firstPrinciples'])}fp)"
        for s in subjects
    )
    return True, counts


def main() -> int:
    files = sorted(GUIDELINES_DIR.glob("*.json"))
    files = [f for f in files if f.name not in ("index.json", "progress.json")]

    failures = 0
    for path in files:
        ok, msg = migrate_file(path)
        prefix = "OK " if ok else "-- "
        print(f"{prefix}{path.name}: {msg}")
        if not ok and msg not in ("already migrated",):
            failures += 1
    return failures


if __name__ == "__main__":
    sys.exit(main())
