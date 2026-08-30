#!/usr/bin/env python3
"""Static invariants for English Classroom v1."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMATS = {"blank", "choice", "order", "translate", "write"}


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def read_json(path: str) -> dict:
    return json.loads(read(path))


errors: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


registry = read_json("registry/lessons.json")
for lesson in registry.get("lessons", []):
    lesson_id = str(lesson.get("id", ""))
    path = str(lesson.get("path", ""))
    check(bool(lesson_id), "registry lesson missing id")
    check(not re.search(r"20\d{2}", lesson_id), f"year leaked into permanent id: {lesson_id}")
    check(not re.search(r"(^|/)20\d{2}(/|$)", path), f"year leaked into lesson path: {path}")
    check((ROOT / path).is_dir(), f"registry path missing: {path}")

audio = read("_engine/v1/audio.js")
check("window.LessonAudio = Object.freeze({ speak });" in audio,
      "audio public API must expose only speak(item, stage)")
check("speakText" in audio and "Object.freeze({ speakText" not in audio,
      "raw text speaker must remain private")

engine = read("_engine/v1/engine.js")
check("Audio?.speak(current(), 0)" in engine, "stage 0 must call Audio with stage=0")
check("const FLOWS = Object.freeze" in engine, "format flow table missing")

teacher = read("_teacher/v1/teacher.js")
check("const STORAGE_KEY = 'teaching.v1';" in teacher, "teacher storage key changed")
check(all(x in teacher for x in ("misconception","question","explanation","addition","improvement")),
      "five teaching log types missing")
check("/(さん|くん|君)/" in teacher, "accidental-name warning missing")

clover_meta = read_json("materials/clover/lesson9/lesson-meta.json")
clover_js = read("materials/clover/lesson9/lesson-data.js")
m = re.search(r"window\.LESSON_DATA\s*=\s*(\[.*\]);\s*$", clover_js, re.S)
check(bool(m), "Clover lesson-data.js is not parseable")
if m:
    data = json.loads(m.group(1))
    check(len(data) == clover_meta.get("questionCount") == 40, "Clover must contain 40 questions")
    check({q.get("format") for q in data} <= FORMATS, "unsupported Clover format found")
    for q in data:
        check(str(q.get("id", "")).startswith("clover.lesson9."),
              f"bad permanent question id: {q.get('id')}")
        check("questionAudio" not in q and "answerAudio" not in q,
              f"old audio field leaked: {q.get('key')}")
        check("audioQ" in q and "audioA" in q, f"audio fields missing: {q.get('key')}")

student_index = read("materials/clover/lesson9/student-index.html").lower()
check("_teacher/" not in student_index and "teacher.js" not in student_index,
      "Clover student entry references teacher code")
check('"teachermode": false' in student_index,
      "Clover student entry must explicitly disable teacher mode")

legacy_policy = read_json("materials/evergreen/lesson8/student-export.json")
check(legacy_policy.get("policy") == "allowlist", "Evergreen legacy export must be allowlist")
for name in legacy_policy.get("files", []):
    check("teacher" not in name.lower(), f"teacher-like file allowlisted: {name}")
    check((ROOT / "materials/evergreen/lesson8" / name).is_file(), f"legacy allowlist file missing: {name}")

eg = read("materials/evergreen/lesson8/app-main.js")
check('<div class="card-actions">${audioButton(q.full)}<button class="reveal-btn">' not in eg,
      "Evergreen EX1 problem-stage answer audio returned")
check("${audioButton(q.answer)}<div class=\"choices\">" not in eg,
      "Evergreen EX2 problem-stage answer audio returned")
check("audioButton(q.en.replace(/\\(\\s*\\)/g, 'blank'))" in eg,
      "Evergreen EX1 blank audio fix missing")
check("${audioButton(q.prompt)}" in eg, "Evergreen EX2 prompt audio fix missing")

check(not (ROOT / "_bootstrap_parts").exists(), "temporary bootstrap parts still present")
check(not (ROOT / ".github/workflows/bootstrap-v1.yml").exists(), "one-time bootstrap workflow still present")

if errors:
    print("VALIDATION FAILED")
    for err in errors:
        print(" -", err)
    raise SystemExit(1)

print("VALIDATION OK")
