#!/usr/bin/env python3
"""Fetch English transcripts for YouTube videos and save as .txt with [mm:ss] anchors.

Usage:
    python scripts/fetch-youtube-transcripts.py <channel-index.json> <out-dir> <videoId> [<videoId> ...]

Each video becomes <out-dir>/<slug>.txt where <slug> is derived from the title.
The header block includes videoId, url, duration, and publish date (from the channel index).
"""
import json
import re
import sys
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi


def slugify(title):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", title.lower()).strip("-")
    return s[:80]


def format_time(seconds):
    m, s = divmod(int(seconds), 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h:d}:{m:02d}:{s:02d}"
    return f"{m:d}:{s:02d}"


def chunk_snippets(snippets, chunk_seconds=30):
    """Group snippets into ~30s chunks. Each chunk is (start_time, text)."""
    if not snippets:
        return []
    chunks = []
    current_start = snippets[0].start
    current_parts = []
    for sn in snippets:
        if sn.start >= current_start + chunk_seconds and current_parts:
            chunks.append((current_start, " ".join(current_parts)))
            current_start = sn.start
            current_parts = []
        text = sn.text.replace("\n", " ").replace("\xa0", " ")
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            current_parts.append(text)
    if current_parts:
        chunks.append((current_start, " ".join(current_parts)))
    return chunks


def find_meta(index_path, video_id):
    data = json.load(open(index_path))
    for v in data:
        if v["videoId"] == video_id:
            return v
    return None


def main():
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(1)
    index_path = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    video_ids = sys.argv[3:]
    out_dir.mkdir(parents=True, exist_ok=True)

    api = YouTubeTranscriptApi()
    for vid in video_ids:
        meta = find_meta(index_path, vid)
        if not meta:
            print(f"{vid}: not in index, skipping", file=sys.stderr)
            continue
        print(f"{vid}: fetching transcript for {meta['title'][:70]}", file=sys.stderr)
        try:
            fetched = api.fetch(vid, languages=["en", "en-GB", "en-US"])
        except Exception as e:
            print(f"{vid}: fetch failed: {e}", file=sys.stderr)
            continue
        chunks = chunk_snippets(fetched.snippets)

        slug = slugify(meta["title"])
        out_path = out_dir / f"{slug}.txt"
        lines = [
            f"# {meta['title']}",
            f"videoId: {vid}",
            f"url: https://www.youtube.com/watch?v={vid}",
            f"duration: {meta.get('lengthText', '')}",
            f"publishedTimeText: {meta.get('publishedTimeText', '')}",
            "",
        ]
        for start, text in chunks:
            lines.append(f"[{format_time(start)}] {text}")
            lines.append("")
        out_path.write_text("\n".join(lines))
        print(f"{vid}: wrote {out_path} ({len(chunks)} chunks)", file=sys.stderr)


if __name__ == "__main__":
    main()
