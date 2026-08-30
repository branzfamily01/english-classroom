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


def parse_lesson_data(path: str) -> list[dict]:
    text = read(path)
    m = re.search(r"window\.LESSON_DATA\s*=\s*(\[.*\]);\s*$", text, re.S)
    if not m:
        return []
    return json.loads(m.group(1))


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
check("getQuestionAt(index)" in engine, "engine question lookup API missing")
check("index > data.length" in engine, "END screen must be a valid resume target")

teacher = read("_teacher/v1/teacher.js")
check("const STORAGE_KEY = 'teaching.v1';" in teacher, "teacher storage key changed")
check(all(x in teacher for x in ("misconception","question","explanation","addition","improvement")),
      "five teaching log types missing")
check("/(さん|くん|君)/" in teacher, "accidental-name warning missing")
check("resumeQuestionKey" in teacher and "completed" in teacher,
      "progress must store explicit next-question/completion state")
check("s.slideIndex < 0" in teacher,
      "progress save must reject cover/guide before a question starts")

myhub = read("my-hub-module/teaching-panel.js")
check("次回：${saved.resumeQuestionKey}" in myhub,
      "My Hub candidate must display explicit next question")
check("完了画面を開く" in myhub,
      "My Hub candidate must distinguish completed lessons")

clover_meta = read_json("materials/clover/lesson9/lesson-meta.json")
clover_data = parse_lesson_data("materials/clover/lesson9/lesson-data.js")
check(bool(clover_data), "Clover lesson-data.js is not parseable")
if clover_data:
    check(len(clover_data) == clover_meta.get("questionCount") == 40, "Clover must contain 40 questions")
    check({q.get("format") for q in clover_data} <= FORMATS, "unsupported Clover format found")
    for q in clover_data:
        check(str(q.get("id", "")).startswith("clover.lesson9."),
              f"bad permanent question id: {q.get('id')}")
        check("questionAudio" not in q and "answerAudio" not in q,
              f"old audio field leaked: {q.get('key')}")
        check("audioQ" in q and "audioA" in q, f"audio fields missing: {q.get('key')}")

clover_student = read("materials/clover/lesson9/student-index.html").lower()
check("_teacher/" not in clover_student and "teacher.js" not in clover_student,
      "Clover student entry references teacher code")
check('"teachermode": false' in clover_student,
      "Clover student entry must explicitly disable teacher mode")

legacy_policy = read_json("materials/evergreen/lesson8/student-export.json")
check(legacy_policy.get("policy") == "allowlist", "Evergreen legacy export must be allowlist")
for name in legacy_policy.get("files", []):
    check("teacher" not in name.lower(), f"teacher-like file allowlisted: {name}")
    check((ROOT / "materials/evergreen/lesson8" / name).is_file(), f"legacy allowlist file missing: {name}")

eg8 = read("materials/evergreen/lesson8/app-main.js")
check('<div class="card-actions">${audioButton(q.full)}<button class="reveal-btn">' not in eg8,
      "Evergreen EX1 problem-stage answer audio returned")
check("${audioButton(q.answer)}<div class=\"choices\">" not in eg8,
      "Evergreen EX2 problem-stage answer audio returned")
check("audioButton(q.en.replace(/\\(\\s*\\)/g, 'blank'))" in eg8,
      "Evergreen EX1 blank audio fix missing")
check("${audioButton(q.prompt)}" in eg8, "Evergreen EX2 prompt audio fix missing")

# Evergreen Lesson 9: first new lesson created against Engine v1.
eg9_meta = read_json("materials/evergreen/lesson9/lesson-meta.json")
eg9_data = parse_lesson_data("materials/evergreen/lesson9/lesson-data.js")
check(len(eg9_data) == eg9_meta.get("questionCount") == 23, "Evergreen Lesson9 must contain 23 questions")
check({q.get("format") for q in eg9_data} == FORMATS, "Evergreen Lesson9 must exercise all five frozen formats")
for q in eg9_data:
    key = q.get("key")
    check(str(q.get("id", "")).startswith("evergreen.lesson9."), f"bad Evergreen L9 id: {key}")
    check(q.get("format") in FORMATS, f"unsupported Evergreen L9 format: {key}")
    check(bool(q.get("focus")), f"Evergreen L9 missing focus: {key}")
    check(isinstance(q.get("mapPath"), list) and q.get("mapPath"), f"Evergreen L9 missing mapPath: {key}")
    check(isinstance(q.get("visual"), dict) and q.get("visual", {}).get("kind"), f"Evergreen L9 missing visual: {key}")
    if q.get("format") in {"blank", "choice"}:
        answer = str(q.get("answer", "")).strip().lower()
        audio_q = str(q.get("audioQ", "")).lower()
        check(not answer or answer not in audio_q, f"Evergreen L9 stage-0 audio leaks answer: {key}")
    if q.get("format") in {"order", "write"}:
        check(q.get("audioQ") is None, f"Evergreen L9 {q.get('format')} must not expose English answer audio: {key}")

eg9_student = read("materials/evergreen/lesson9/student-index.html").lower()
check("_teacher/" not in eg9_student and "teacher.js" not in eg9_student,
      "Evergreen L9 student entry references teacher code")
check('"teachermode": false' in eg9_student,
      "Evergreen L9 student entry must explicitly disable teacher mode")
for needed in ("lesson-references.js","lesson9-enhance.js","lesson9.css"):
    check(needed in eg9_student, f"Evergreen L9 student entry missing asset: {needed}")
eg9_policy = read_json("materials/evergreen/lesson9/student-export.json")
check(eg9_policy.get("policy") == "allowlist", "Evergreen L9 student export must be allowlist")
check(set(eg9_policy.get("files", [])) == {"lesson-references.js","lesson9-enhance.js","lesson9.css"},
      "Evergreen L9 optional student asset allowlist changed")

refs = read("materials/evergreen/lesson9/lesson-references.js")
check("window.LESSON_REFERENCES" in refs and "used to / would often" in refs,
      "Evergreen L9 reference map missing")
enhance = read("materials/evergreen/lesson9/lesson9-enhance.js")
check("lesson:render" in enhance and "conceptMapDrawer" in enhance,
      "Evergreen L9 enhancement hooks missing")
check("state.step >= 1" in enhance,
      "Evergreen L9 'where am I' must stay hidden before answer reveal")

check(not (ROOT / "_bootstrap_parts").exists(), "temporary bootstrap parts still present")
check(not (ROOT / ".github/workflows/bootstrap-v1.yml").exists(), "one-time bootstrap workflow still present")
check(not (ROOT / ".github/workflows/audit-progress-fix.yml").exists(), "one-time audit fix workflow still present")
check(not (ROOT / ".github/workflows/bootstrap-evergreen-l9.yml").exists(), "Evergreen L9 bootstrap workflow still present")

if errors:
    print("VALIDATION FAILED")
    for err in errors:
        print(" -", err)
    raise SystemExit(1)

print("VALIDATION OK")
