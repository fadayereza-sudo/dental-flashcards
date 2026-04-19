#!/usr/bin/env python3
"""Fetch a YouTube channel's full upload list via scrapetube.

Usage:
    python scripts/fetch-youtube-channel.py <handle> <output-path>

Example:
    python scripts/fetch-youtube-channel.py Protrusive source-material/protrusive-podcast/channel-index.json

The handle is the '@name' part of the channel URL, without the '@'.
"""
import json
import sys
from pathlib import Path

import scrapetube


def runs_text(field):
    if not field:
        return ""
    if "runs" in field and field["runs"]:
        return "".join(r.get("text", "") for r in field["runs"])
    if "simpleText" in field:
        return field["simpleText"]
    return ""


def length_to_seconds(length_text):
    if not length_text:
        return None
    parts = length_text.split(":")
    try:
        parts = [int(p) for p in parts]
    except ValueError:
        return None
    if len(parts) == 3:
        h, m, s = parts
        return h * 3600 + m * 60 + s
    if len(parts) == 2:
        m, s = parts
        return m * 60 + s
    return None


def flatten(v):
    length_simple = v.get("lengthText", {}).get("simpleText") if v.get("lengthText") else None
    return {
        "videoId": v["videoId"],
        "title": runs_text(v.get("title")),
        "descriptionSnippet": runs_text(v.get("descriptionSnippet")),
        "publishedTimeText": runs_text(v.get("publishedTimeText")),
        "lengthText": length_simple,
        "durationSeconds": length_to_seconds(length_simple),
        "viewCountText": runs_text(v.get("viewCountText")),
    }


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    handle = sys.argv[1].lstrip("@")
    out = Path(sys.argv[2])
    out.parent.mkdir(parents=True, exist_ok=True)

    print(f"Fetching videos for @{handle}...", file=sys.stderr)
    records = []
    for i, v in enumerate(scrapetube.get_channel(channel_username=handle), 1):
        records.append(flatten(v))
        if i % 50 == 0:
            print(f"  {i} videos...", file=sys.stderr)

    out.write_text(json.dumps(records, indent=2, ensure_ascii=False))
    print(f"Wrote {len(records)} videos to {out}", file=sys.stderr)


if __name__ == "__main__":
    main()
