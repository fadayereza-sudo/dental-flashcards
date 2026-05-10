"""
Render every page of a PDF to PNG for downstream OCR.

Usage:
    python scripts/render-pdf-pages.py "<path-to-pdf>" "<output-dir>" [--dpi 200]

Example:
    python scripts/render-pdf-pages.py \
        "source-material/dental biomechanics/Dental Biomechanics.pdf" \
        "source-material/dental biomechanics/pages"

Output:
    <output-dir>/page-001.png ... page-NNN.png
    (Idempotent: skips pages whose PNG already exists.)
"""

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf_path")
    parser.add_argument("out_dir")
    parser.add_argument("--dpi", type=int, default=200)
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    n = doc.page_count
    width = len(str(n))
    zoom = args.dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    rendered = 0
    skipped = 0
    for i in range(n):
        out_path = out_dir / f"page-{str(i + 1).zfill(max(3, width))}.png"
        if out_path.exists():
            skipped += 1
            continue
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        pix.save(out_path)
        rendered += 1
        if rendered % 20 == 0:
            print(f"rendered {rendered}/{n}", file=sys.stderr)

    doc.close()
    print(f"done: rendered={rendered} skipped={skipped} total={n} dir={out_dir}")


if __name__ == "__main__":
    main()
