#!/usr/bin/env python3
"""Fetch the full description for every video in a channel index.

Usage:
    python scripts/fetch-full-descriptions.py <channel-index.json> <out-path>

Caches results keyed by videoId so re-runs only fetch missing ones.
"""
import json
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests

SHORT_DESC_RE = re.compile(r'"shortDescription":"((?:[^"\\]|\\.)*)"')
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US,en"})
SESSION.cookies.set("SOCS", "CAI")


def fetch_one(video_id):
    try:
        r = SESSION.get(f"https://www.youtube.com/watch?v={video_id}", timeout=15)
        m = SHORT_DESC_RE.search(r.text)
        if not m:
            return video_id, None
        raw = m.group(1)
        # Decode common escapes
        desc = bytes(raw, "utf-8").decode("unicode_escape")
        return video_id, desc
    except Exception as e:
        return video_id, f"__ERR__{e}"


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    index_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])
    out_path.parent.mkdir(parents=True, exist_ok=True)

    index = json.load(open(index_path))
    cache = {}
    if out_path.exists():
        cache = json.load(open(out_path))
        print(f"Loaded {len(cache)} cached descriptions from {out_path}", file=sys.stderr)

    todo = [v["videoId"] for v in index if v["videoId"] not in cache]
    if not todo:
        print("All descriptions already cached.", file=sys.stderr)
        return
    print(f"Fetching {len(todo)} descriptions with 8 workers...", file=sys.stderr)

    done = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(fetch_one, vid) for vid in todo]
        for f in as_completed(futures):
            vid, desc = f.result()
            cache[vid] = desc
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(todo)}", file=sys.stderr)
                out_path.write_text(json.dumps(cache, ensure_ascii=False))

    out_path.write_text(json.dumps(cache, ensure_ascii=False))
    failed = sum(1 for v in cache.values() if v is None or (v and v.startswith("__ERR__")))
    print(f"Done. {len(cache)} total, {failed} failed/empty.", file=sys.stderr)


if __name__ == "__main__":
    main()
