"""Render a URL with Playwright and dump text + links.

Usage:
  python scripts/crawl-page.py <url> [--out PATH] [--links-only] [--wait SELECTOR]

Outputs:
  - Page title
  - Visible text of <main> (or <body> if no <main>)
  - All in-page links with href and anchor text
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright


def crawl(url: str, wait_selector: str | None, timeout_ms: int) -> dict:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0 Safari/537.36"
            )
        )
        page = ctx.new_page()
        page.goto(url, wait_until="networkidle", timeout=timeout_ms)
        if wait_selector:
            page.wait_for_selector(wait_selector, timeout=timeout_ms)

        title = page.title()

        # Prefer <main>, fall back to <article>, then <body>.
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
                const txt = (a.innerText || '').trim().replace(/\\s+/g, ' ');
                if (href) out.push({ href, text: txt });
              }
              return out;
            }
            """
        )

        browser.close()

    base = url
    resolved_links = []
    seen = set()
    for lk in links:
        full = urljoin(base, lk["href"])
        # Strip fragment for dedupe but keep original for output.
        key = full.split("#")[0]
        if key in seen:
            continue
        seen.add(key)
        resolved_links.append({"href": full, "text": lk["text"]})

    return {"url": url, "title": title, "text": text, "links": resolved_links}


def format_output(result: dict, same_host_only: bool) -> str:
    parts = [f"# {result['title']}", "", f"Source: {result['url']}", "", "## Text", "", result["text"], "", "## Links", ""]
    host = urlparse(result["url"]).netloc
    for lk in result["links"]:
        if same_host_only and urlparse(lk["href"]).netloc != host:
            continue
        label = lk["text"] or "(no anchor text)"
        parts.append(f"- [{label}]({lk['href']})")
    return "\n".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--out", type=Path, default=None)
    ap.add_argument("--wait", default=None, help="CSS selector to wait for")
    ap.add_argument("--timeout", type=int, default=60000)
    ap.add_argument("--same-host-only", action="store_true", default=True)
    ap.add_argument("--all-hosts", dest="same_host_only", action="store_false")
    args = ap.parse_args()

    result = crawl(args.url, args.wait, args.timeout)
    output = format_output(result, args.same_host_only)

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(output, encoding="utf-8")
        print(f"Wrote {len(output):,} chars to {args.out}")
    else:
        sys.stdout.write(output)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
