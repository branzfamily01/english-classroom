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


def answer_phrase_leaks(answer: object, audio_q: object) -> bool:
    phrase = str(answer or "").strip().lower()
    text = str(audio_q or "").lower()
    phrase = re.sub(r"^[①②③④⑤⑥⑦⑧⑨⑩]\s*", "", phrase)
    if not phrase or not text:
        return False
    pattern = rf"(?<![a-z0-9]){re.escape(phrase)}(?![a-z0-9])"
    return re.search(pattern, text) is not None


errors: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


registry = read_json("registry/lessons.json")
lessons = registry.get("lessons", [])
for lesson in lessons:
    lesson_id = str(lesson.get("id", ""))
    path = str(lesson.get("path", ""))
    check(bool(lesson_id), "registry lesson missing id")
    check(not re.search(r"20\d{2}", lesson_id), f"year leaked into permanent id: {lesson_id}")
    check(not re.search(r"(^|/)20\d{2}(/|$)", path), f"year leaked into lesson path: {path}")
    check((ROOT / path).is_dir(), f"registry path missing: {path}")

    if lesson.get("engine") != "v1":
        continue

    base = path.rstrip("/")
    meta_path = f"{base}/lesson-meta.json"
    data_path = f"{base}/lesson-data.js"
    student_path = f"{base}/student-index.html"
    check((ROOT / meta_path).is_file(), f"v1 lesson missing metadata: {lesson_id}")
    check((ROOT / data_path).is_file(), f"v1 lesson missing data: {lesson_id}")
    if not (ROOT / meta_path).is_file() or not (ROOT / data_path).is_file():
        continue

    meta = read_json(meta_path)
    data = parse_lesson_data(data_path)
    check(meta.get("id") == lesson_id, f"registry/meta id mismatch: {lesson_id}")
    check(bool(data), f"v1 lesson-data.js is not parseable: {lesson_id}")
    if not data:
        continue
    check(len(data) == meta.get("questionCount"), f"questionCount mismatch: {lesson_id}")
    check({q.get("format") for q in data} <= FORMATS, f"unsupported format found: {lesson_id}")

    for q in data:
        key = q.get("key")
        fmt = q.get("format")
        check(str(q.get("id", "")).startswith(f"{lesson_id}."), f"bad permanent question id: {lesson_id} / {key}")
        check(fmt in FORMATS, f"unsupported format: {lesson_id} / {key}")
        check("questionAudio" not in q and "answerAudio" not in q, f"old audio field leaked: {lesson_id} / {key}")
        check("audioQ" in q and "audioA" in q, f"audio fields missing: {lesson_id} / {key}")
        if fmt in {"blank", "choice"}:
            check(not answer_phrase_leaks(q.get("answer"), q.get("audioQ")), f"stage-0 audio leaks answer: {lesson_id} / {key}")
        if fmt in {"order", "write"}:
            check(q.get("audioQ") is None, f"stage-0 English answer audio must be absent: {lesson_id} / {key}")

    if lesson.get("studentExport"):
        check((ROOT / student_path).is_file(), f"student entry missing: {lesson_id}")
        if (ROOT / student_path).is_file():
            student = read(student_path).lower()
            check("_teacher/" not in student and "teacher.js" not in student, f"student entry references teacher code: {lesson_id}")
            check('"teachermode": false' in student, f"student entry must explicitly disable teacher mode: {lesson_id}")

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
check("isHintStage" in engine and "hintPanel" in engine,
      "small-step hint flow missing")
check("backupMarkup" in engine and "hide-more" in engine,
      "Back Up Technique output flow missing")
check("e.key==='ArrowRight'" in engine and "e.key==='ArrowLeft'" in engine,
      "arrow keys must navigate one screen forward/back")
check("setupToolbarToggle" in engine,
      "toolbar minimize control missing")

engine_css = read("_engine/v1/engine.css")
check(".toolbar.is-collapsed" in engine_css,
      "toolbar compact style missing")
check(".backup-chunks" in engine_css and ".hint-panel" in engine_css,
      "hint/output practice styles missing")

teacher = read("_teacher/v1/teacher.js")
check("const STORAGE_KEY = 'teaching.v1';" in teacher, "teacher storage key changed")
check(all(x in teacher for x in ("misconception","question","explanation","addition","improvement")),
      "five teaching log types missing")
check("/(さん|くん|君)/" in teacher, "accidental-name warning missing")
check("resumeQuestionKey" in teacher and "completed" in teacher,
      "progress must store explicit next-question/completion state")
check("resumeQuestionId" in teacher and "findIndex(q=>q.id===saved.resumeQuestionId)" in teacher,
      "resume must prefer permanent question id over slide index")
check("s.slideIndex < 0" in teacher,
      "progress save must reject cover/guide before a question starts")
check("readStoreResult" in teacher and "return {ok:false" in teacher,
      "teacher store must fail closed on corrupt/unknown data")
check("schoolYearNow" in teacher and "d.getMonth()<3" in teacher,
      "teacher default school year must start in April")
check("requireClass" in teacher and "const p=requireClass()" in teacher,
      "class-less teaching logs/progress must be blocked")
check("rec.deletedAt=at" in teacher and "!x.deletedAt" in teacher,
      "teacher log deletion must use tombstones")
check("store.logs=store.logs.filter(x=>x.recordId!==id)" not in teacher,
      "physical teaching-log deletion returned")
check("is-minimized" in teacher and "enableDrag" in teacher,
      "teacher panel must be minimizable and movable")
check("Teacher Guide" in teacher,
      "teacher-only guide missing")

myhub = read("my-hub-module/teaching-panel.js")
check("次回：${saved.resumeQuestionKey}" in myhub,
      "My Hub candidate must display explicit next question")
check("完了画面を開く" in myhub,
      "My Hub candidate must distinguish completed lessons")
check("readStoreResult" in myhub and "return {ok:false" in myhub,
      "My Hub teaching store must fail closed")
check("mergeStores" in myhub and "JSONから復元（統合）" in myhub,
      "My Hub restore must default to merge")
check("!x.deletedAt" in myhub,
      "My Hub must hide tombstoned logs")
check("schoolYearNow" in myhub and "d.getMonth()<3" in myhub,
      "My Hub default school year must start in April")
check("localStorage.setItem(CFG.storeKey,JSON.stringify(obj))" not in myhub,
      "unsafe full-replace restore returned")

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

# Evergreen Lesson 9 keeps extra lesson-specific quality gates on top of registry-driven v1 checks.
eg9_meta = read_json("materials/evergreen/lesson9/lesson-meta.json")
eg9_data = parse_lesson_data("materials/evergreen/lesson9/lesson-data.js")
check(len(eg9_data) == eg9_meta.get("questionCount") == 23, "Evergreen Lesson9 must contain 23 questions")
check({q.get("format") for q in eg9_data} == FORMATS, "Evergreen Lesson9 must exercise all five frozen formats")
for q in eg9_data:
    key = q.get("key")
    check(bool(q.get("focus")), f"Evergreen L9 missing focus: {key}")
    check(isinstance(q.get("mapPath"), list) and q.get("mapPath"), f"Evergreen L9 missing mapPath: {key}")
    check(isinstance(q.get("visual"), dict) and q.get("visual", {}).get("kind"), f"Evergreen L9 missing visual: {key}")

eg9_student = read("materials/evergreen/lesson9/student-index.html").lower()
for needed in ("lesson-references.js","lesson9-learning.js","lesson9-enhance.js","lesson9.css"):
    check(needed in eg9_student, f"Evergreen L9 student entry missing asset: {needed}")
eg9_policy = read_json("materials/evergreen/lesson9/student-export.json")
check(eg9_policy.get("policy") == "allowlist", "Evergreen L9 student export must be allowlist")
check(set(eg9_policy.get("files", [])) == {"lesson-references.js","lesson9-learning.js","lesson9-enhance.js","lesson9.css"},
      "Evergreen L9 optional student asset allowlist changed")

learning = read("materials/evergreen/lesson9/lesson9-learning.js")
check("window.LESSON_FINAL_CHECK" in learning and "outputChunks" in learning and "hints" in learning,
      "Evergreen L9 learning layer missing")
refs = read("materials/evergreen/lesson9/lesson-references.js")
check("window.LESSON_REFERENCES" in refs and "used to / would often" in refs,
      "Evergreen L9 reference map missing")
enhance = read("materials/evergreen/lesson9/lesson9-enhance.js")
check("lesson:render" in enhance and "conceptMapDrawer" in enhance,
      "Evergreen L9 enhancement hooks missing")
check("const afterAnswer=['answer','reason','wrong','translation','output'].includes(state.stage)" in enhance,
      "Evergreen L9 'where am I' must stay hidden during problem/hints")
check("hint-mark" in enhance,
      "Evergreen L9 hint highlighting missing")

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