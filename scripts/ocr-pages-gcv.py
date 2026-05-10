"""
OCR a directory of page PNGs via Google Cloud Vision DOCUMENT_TEXT_DETECTION.

Usage:
    python scripts/ocr-pages-gcv.py "<pages-dir>" "<out-dir>" [--workers 8]

Example:
    python scripts/ocr-pages-gcv.py \
        "source-material/dental biomechanics/pages" \
        "tmp-ocr-results"

Output:
    <out-dir>/page-NNN.txt   — extracted text per page
    <out-dir>/page-NNN.json  — raw response with confidences (sidecar, kept for audit)

Behaviour:
    - Fails fast if auth is missing or Vision API is unreachable (probes on page 1).
    - Idempotent: skips any page whose .txt already exists (allows resume).
    - Concurrency via ThreadPoolExecutor (default 8 workers).

Auth:
    Requires either GOOGLE_APPLICATION_CREDENTIALS pointing at a service-account JSON,
    or Application Default Credentials from `gcloud auth application-default login`.
"""

import argparse
import concurrent.futures
import json
import sys
import time
from pathlib import Path

try:
    from google.cloud import vision
    from google.api_core.exceptions import GoogleAPIError, Unauthenticated, PermissionDenied
except ImportError:
    sys.stderr.write(
        "error: google-cloud-vision not installed. Run:\n"
        "    pip3 install --user google-cloud-vision\n"
    )
    sys.exit(2)


def ocr_one(client, png_path: Path, out_dir: Path) -> tuple[int, str]:
    """Return (chars_written, status). Skips if .txt already exists."""
    stem = png_path.stem  # page-001
    txt_path = out_dir / f"{stem}.txt"
    json_path = out_dir / f"{stem}.json"
    if txt_path.exists():
        return (txt_path.stat().st_size, "skip")

    with open(png_path, "rb") as f:
        content = f.read()
    image = vision.Image(content=content)
    response = client.document_text_detection(image=image)

    if response.error.message:
        raise RuntimeError(
            f"Vision API error for {png_path.name}: {response.error.message}"
        )

    text = response.full_text_annotation.text if response.full_text_annotation else ""
    txt_path.write_text(text, encoding="utf-8")

    # Keep a trimmed JSON sidecar: confidences + block count, not the full byte blob.
    pages = response.full_text_annotation.pages if response.full_text_annotation else []
    page_confidences = [p.confidence for p in pages]
    json_path.write_text(
        json.dumps({
            "page_confidences": page_confidences,
            "char_count": len(text),
            "block_count": sum(len(p.blocks) for p in pages),
        }, indent=2),
        encoding="utf-8",
    )
    return (len(text), "ok")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pages_dir")
    parser.add_argument("out_dir")
    parser.add_argument("--workers", type=int, default=8)
    args = parser.parse_args()

    pages_dir = Path(args.pages_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    pngs = sorted(pages_dir.glob("page-*.png"))
    if not pngs:
        sys.stderr.write(f"error: no page-*.png in {pages_dir}\n")
        sys.exit(1)

    try:
        client = vision.ImageAnnotatorClient()
    except Exception as e:
        sys.stderr.write(
            f"error: could not construct Vision client: {e}\n"
            "Make sure ADC is set up: `gcloud auth application-default login`\n"
            "or set GOOGLE_APPLICATION_CREDENTIALS.\n"
        )
        sys.exit(3)

    # Probe on page 1 before the batch — fail fast on auth / API-disabled.
    try:
        _ = ocr_one(client, pngs[0], out_dir)
        print(f"probe OK on {pngs[0].name}", file=sys.stderr)
    except (Unauthenticated, PermissionDenied) as e:
        sys.stderr.write(
            f"error: auth or permission failed on probe: {e}\n"
            "Check that the Vision API is enabled on the active project and that\n"
            "your ADC identity has `roles/serviceusage.serviceUsageConsumer` + Vision access.\n"
        )
        sys.exit(4)
    except GoogleAPIError as e:
        sys.stderr.write(f"error: Vision API probe failed: {e}\n")
        sys.exit(5)

    start = time.time()
    ok = skip = fail = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(ocr_one, client, p, out_dir): p for p in pngs}
        for i, fut in enumerate(concurrent.futures.as_completed(futures), 1):
            p = futures[fut]
            try:
                _, status = fut.result()
                if status == "ok":
                    ok += 1
                elif status == "skip":
                    skip += 1
            except Exception as e:
                fail += 1
                sys.stderr.write(f"FAIL {p.name}: {e}\n")
            if i % 20 == 0:
                dt = time.time() - start
                print(f"{i}/{len(pngs)}  ok={ok} skip={skip} fail={fail}  {dt:.1f}s", file=sys.stderr)

    print(f"done: ok={ok} skip={skip} fail={fail} total={len(pngs)} dir={out_dir}")


if __name__ == "__main__":
    main()
