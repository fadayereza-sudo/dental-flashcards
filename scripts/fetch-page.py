"""
Fetch a web page via Playwright and write it to disk as markdown.

Usage:
    python scripts/fetch-page.py <url> <output.md> [--selector "main"]
                                                   [--headed]
                                                   [--wait-for SELECTOR]

By default runs headless. For Cloudflare/bot-blocked sites, pass `--headed`
and complete the challenge manually in the opened browser window. The
script waits up to 5 minutes for the wait-for selector to appear, then
extracts.

A persistent profile is kept under `.playwright-profile/` so cookies survive
between runs — once you've cleared a Cloudflare challenge for a domain, the
next fetch on the same domain should run without intervention.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from markdownify import markdownify as md
from playwright.sync_api import sync_playwright


DROP_TAGS = ("nav", "footer", "aside", "noscript", "script", "style", "form")
DROP_SELECTORS = (
    "[role='navigation']",
    "[role='banner']",
    "[role='complementary']",
    ".cookie", ".cookies", "#cookies", "#cookie-banner",
    ".social-share", ".share-buttons", ".breadcrumbs",
    ".page-header", ".page-footer",
    ".sidebar", ".related", ".related-articles",
    ".search", "#search",
    "[class*='cookie']", "[id*='cookie']",
)


def fetch(
    url: str,
    selector: str | None,
    headed: bool,
    wait_for: str | None,
) -> str:
    project_root = Path(__file__).resolve().parent.parent
    profile_dir = project_root / ".playwright-profile"
    profile_dir.mkdir(exist_ok=True)

    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(
            user_data_dir=str(profile_dir),
            headless=not headed,
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1280, "height": 1800},
            locale="en-GB",
            args=["--disable-blink-features=AutomationControlled"],
        )
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        # Some sites (Wiley) keep tracking pixels open forever, so don't wait
        # for networkidle. Wait for either the user-supplied selector or a
        # short settle.
        if wait_for:
            timeout = 300_000 if headed else 30_000
            print(
                f"  waiting up to {timeout//1000}s for selector '{wait_for}'"
                + (" (clear any challenge in the browser)" if headed else ""),
                file=sys.stderr,
            )
            page.wait_for_selector(wait_for, timeout=timeout)
        else:
            try:
                page.wait_for_load_state("load", timeout=15_000)
            except Exception:
                pass
            page.wait_for_timeout(2_000)

        page.evaluate(
            """
            ({ selectors, tags }) => {
              for (const sel of selectors) {
                document.querySelectorAll(sel).forEach(el => el.remove());
              }
              for (const tag of tags) {
                document.querySelectorAll(tag).forEach(el => el.remove());
              }
            }
            """,
            {"selectors": list(DROP_SELECTORS), "tags": list(DROP_TAGS)},
        )
        if selector:
            html = page.eval_on_selector(selector, "el => el.outerHTML")
        else:
            html = page.content()
        ctx.close()
        return html


def to_markdown(html: str) -> str:
    return md(
        html,
        heading_style="ATX",
        bullets="-",
        strip=list(DROP_TAGS),
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("output")
    ap.add_argument("--selector", default=None,
                    help="CSS selector to extract instead of full page")
    ap.add_argument("--wait-for", default=None,
                    help="CSS selector to wait for before extracting "
                         "(useful for Cloudflare-protected pages)")
    ap.add_argument("--headed", action="store_true",
                    help="Run browser in headed mode for manual challenge "
                         "completion. Persists cookies between runs.")
    args = ap.parse_args()

    print(f"fetching {args.url} ...", file=sys.stderr)
    html = fetch(args.url, args.selector, args.headed, args.wait_for)
    print(f"  {len(html):,} bytes of HTML", file=sys.stderr)

    text = to_markdown(html)
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print(f"  wrote {len(text):,} chars to {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
