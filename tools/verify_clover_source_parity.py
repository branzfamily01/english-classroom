#!/usr/bin/env python3
"""Verify Clover Lesson9 content parity against its locked source commit."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LESSON_DIR = ROOT / "materials" / "clover" / "lesson9"
LOCK = json.loads((LESSON_DIR / "source-lock.json").read_text(encoding="utf-8"))


def extract_json_assignment(text: str, variable: str):
    match = re.search(rf"window\.{re.escape(variable)}\s*=\s*", text)
    if not match:
        raise RuntimeError(f"assignment not found: {variable}")
    value, _ = json.JSONDecoder().raw_decode(text[match.end():])
    return value


def source_url() -> str:
    repo = LOCK["sourceRepo"]
    commit = LOCK["sourceCommit"]
    return f"https://raw.githubusercontent.com/{repo}/{commit}/index.html"


def normalize_new(item: dict) -> dict:
    out = dict(item)
    out.pop("id", None)
    out.pop("format", None)
    out["questionAudio"] = out.pop("audioQ", "")
    out["answerAudio"] = out.pop("audioA", "")
    return out


def main() -> None:
    req = urllib.request.Request(source_url(), headers={"User-Agent": "english-classroom-ci"})
    with urllib.request.urlopen(req, timeout=20) as response:
        source_text = response.read().decode("utf-8")

    current_text = (LESSON_DIR / "lesson-data.js").read_text(encoding="utf-8")
    old = extract_json_assignment(source_text, "LESSON9_DATA")
    new = extract_json_assignment(current_text, "LESSON_DATA")

    if len(old) != len(new):
        raise SystemExit(f"PARITY FAILED: question count {len(old)} != {len(new)}")

    for i, (before, after) in enumerate(zip(old, new), start=1):
        normalized = normalize_new(after)
        if before != normalized:
            keys = sorted(set(before) | set(normalized))
            changed = [k for k in keys if before.get(k) != normalized.get(k)]
            key = before.get("key", f"#{i}")
            raise SystemExit(
                f"PARITY FAILED at {key}: changed fields: {', '.join(changed)}"
            )

    print(f"SOURCE PARITY OK: {len(new)} questions match {LOCK['sourceRepo']}@{LOCK['sourceCommit']}")


if __name__ == "__main__":
    main()
