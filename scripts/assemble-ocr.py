"""
Concatenate per-page OCR outputs into a single full-text.md plus an ocr-meta.json.

Usage:
    python scripts/assemble-ocr.py "<ocr-results-dir>" "<out-dir>"

Example:
    python scripts/assemble-ocr.py \
        "tmp-ocr-results" \
        "source-material/dental biomechanics"

Output:
    <out-dir>/full-text.md    — every page concatenated, preceded by `## [p.N]`
    <out-dir>/ocr-meta.json   — page count, total chars, confidence stats, timestamp
"""

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("ocr_dir")
    parser.add_argument("out_dir")
    args = parser.parse_args()

    ocr_dir = Path(args.ocr_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    txts = sorted(ocr_dir.glob("page-*.txt"))
    if not txts:
        sys.stderr.write(f"error: no page-*.txt in {ocr_dir}\n")
        sys.exit(1)

    md_lines = []
    total_chars = 0
    total_words = 0
    confidences = []

    for t in txts:
        m = re.match(r"page-(\d+)\.txt", t.name)
        if not m:
            continue
        page_num = int(m.group(1))
        text = t.read_text(encoding="utf-8")
        total_chars += len(text)
        total_words += len(text.split())

        md_lines.append(f"## [p.{page_num}]\n")
        md_lines.append(text.rstrip() + "\n\n")

        sidecar = ocr_dir / f"{t.stem}.json"
        if sidecar.exists():
            try:
                data = json.loads(sidecar.read_text(encoding="utf-8"))
                confidences.extend(data.get("page_confidences", []))
            except json.JSONDecodeError:
                pass

    full_text_path = out_dir / "full-text.md"
    full_text_path.write_text("".join(md_lines), encoding="utf-8")

    meta = {
        "source_pdf": "Dental Biomechanics.pdf",
        "ocr_engine": "google-cloud-vision DOCUMENT_TEXT_DETECTION",
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "page_count": len(txts),
        "total_chars": total_chars,
        "total_words": total_words,
        "confidence": {
            "min": min(confidences) if confidences else None,
            "mean": sum(confidences) / len(confidences) if confidences else None,
            "max": max(confidences) if confidences else None,
        },
    }
    (out_dir / "ocr-meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")

    print(f"wrote {full_text_path}  pages={len(txts)} words={total_words} chars={total_chars}")


if __name__ == "__main__":
    main()
