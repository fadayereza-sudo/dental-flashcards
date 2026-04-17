"""Recursively crawl a guideline website with Playwright and concatenate all
pages into a single markdown file.

Usage:
  python scripts/crawl-guideline.py <start-url> <output-md> [--include PREFIX]...
      [--exclude PREFIX]... [--max-pages N] [--wait SELECTOR]

Behaviour:
  - BFS from the start URL over same-host links.
  - A link is crawled iff (a) it's on the same host as the start URL, and
    (b) its path starts with at least one --include prefix (default: start URL's
    directory), and (c) it doesn't start with any --exclude prefix.
  - Each page is rendered with Playwright (JS) and the innerText of <main>
    (or <article>/<body>) is extracted.
  - Output is a single markdown file with an H1 per page, source URL, and
    verbatim text. Pages are ordered by first-seen BFS order.
"""

from __future__ import annotations

import argparse
import sys
import time
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0 Safari/537.36"
)


def normalise(url: str) -> str:
    """Strip fragment and trailing slash inconsistency for dedupe."""
    p = urlparse(url)
    path = p.path or "/"
    return f"{p.scheme}://{p.netloc}{path}"


SKIP_EXTENSIONS = (
    ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".pptx", ".ppt",
    ".zip", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".mp3", ".mp4",
)


def should_visit(
    url: str,
    host: str,
    includes: list[str],
    excludes: list[str],
) -> bool:
    p = urlparse(url)
    if p.netloc != host:
        return False
    if p.scheme not in ("http", "https"):
        return False
    path = (p.path or "/").lower()
    if path.endswith(SKIP_EXTENSIONS):
        return False
    if any(path.startswith(ex) for ex in excludes):
        return False
    if includes and not any(path.startswith(inc) for inc in includes):
        return False
    return True


def extract_page(page, url: str) -> dict:
    page.goto(url, wait_until="networkidle", timeout=60000)
    title = page.title()
    text = page.evaluate(
        """
        () => {
          const root =
            document.querySelector('main') ||
            document.querySelector('article') ||
            document.body;
          return root ? root.innerText : '';
        }
        """
    )
    links = page.evaluate(
        """
        () => {
          const out = [];
          for (const a of document.querySelectorAll('a[href]')) {
            const href = a.getAttribute('href');
            if (href) out.push(href);
          }
          return out;
        }
        """
    )
    return {"url": url, "title": title, "text": text, "links": links}


def crawl(
    start_url: str,
    includes: list[str],
    excludes: list[str],
    max_pages: int,
) -> list[dict]:
    host = urlparse(start_url).netloc
    start_norm = normalise(start_url)

    queue = deque([start_norm])
    seen = {start_norm}
    pages: list[dict] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(user_agent=USER_AGENT)
        page = ctx.new_page()

        while queue and len(pages) < max_pages:
            url = queue.popleft()
            print(f"[{len(pages) + 1}/{max_pages}] {url}", flush=True)
            try:
                result = extract_page(page, url)
            except PWTimeout:
                print(f"    TIMEOUT — skipping", flush=True)
                continue
            except Exception as e:
                print(f"    ERROR: {e} — skipping", flush=True)
                continue

            pages.append(result)

            for href in result["links"]:
                full = urljoin(url, href)
                norm = normalise(full)
                if norm in seen:
                    continue
                if not should_visit(norm, host, includes, excludes):
                    continue
                seen.add(norm)
                queue.append(norm)

            time.sleep(0.3)  # gentle pacing

        browser.close()

    return pages


def render_markdown(pages: list[dict], start_url: str) -> str:
    out = []
    out.append(f"# Crawl of {start_url}")
    out.append("")
    out.append(f"Pages captured: {len(pages)}")
    out.append("")
    out.append("## Table of contents")
    out.append("")
    for i, pg in enumerate(pages, 1):
        out.append(f"{i}. [{pg['title'] or pg['url']}](#{slugify(pg['title'] or pg['url'])})")
    out.append("")
    out.append("---")
    out.append("")
    for pg in pages:
        heading = pg["title"] or pg["url"]
        out.append(f"## {heading}")
        out.append("")
        out.append(f"Source: {pg['url']}")
        out.append("")
        out.append(pg["text"].strip())
        out.append("")
        out.append("---")
        out.append("")
    return "\n".join(out)


def slugify(s: str) -> str:
    return "".join(c.lower() if c.isalnum() else "-" for c in s).strip("-")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("start_url")
    ap.add_argument("output_md", type=Path)
    ap.add_argument("--include", action="append", default=[], help="Path prefix to include")
    ap.add_argument("--exclude", action="append", default=[], help="Path prefix to exclude")
    ap.add_argument("--max-pages", type=int, default=200)
    args = ap.parse_args()

    if not args.include:
        # Default: include everything under the start URL's directory.
        start_path = urlparse(args.start_url).path or "/"
        if start_path.endswith("/"):
            args.include = [start_path]
        else:
            args.include = [start_path.rsplit("/", 1)[0] + "/"]

    print(f"Start:    {args.start_url}")
    print(f"Include:  {args.include}")
    print(f"Exclude:  {args.exclude}")
    print(f"Max pgs:  {args.max_pages}")
    print(f"Output:   {args.output_md}")
    print()

    pages = crawl(args.start_url, args.include, args.exclude, args.max_pages)
    md = render_markdown(pages, args.start_url)

    args.output_md.parent.mkdir(parents=True, exist_ok=True)
    args.output_md.write_text(md, encoding="utf-8")
    print(f"\nWrote {len(md):,} chars / {len(pages)} pages to {args.output_md}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
