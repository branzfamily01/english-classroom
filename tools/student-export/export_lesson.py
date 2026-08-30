#!/usr/bin/env python3
"""Allowlist-only student export for english-classroom."""
from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOWED_ENGINES = {"v1", "legacy"}
SAFE_META_KEYS = (
    "schemaVersion", "id", "title", "series", "lesson", "grade", "subject",
    "engine", "status", "questionCount", "formats", "studentExport",
)


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_target(root: Path, meta: dict) -> Path:
    series = str(meta["series"]).strip().lower().replace(" ", "-")
    lesson = str(meta["lesson"]).strip()
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", series):
        raise RuntimeError(f"unsafe series slug: {series!r}")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", lesson):
        raise RuntimeError(f"unsafe lesson slug: {lesson!r}")
    root = root.resolve()
    target = (root / "materials" / series / f"lesson{lesson}").resolve()
    if not target.is_relative_to(root):
        raise RuntimeError(f"student target escapes output root: {target}")
    return target


def clean_student_meta(meta: dict) -> dict:
    result = {key: meta[key] for key in SAFE_META_KEYS if key in meta}
    result["teacherMode"] = False
    return result


def json_for_script(value: dict) -> str:
    return (
        json.dumps(value, ensure_ascii=False)
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
    )


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def reset_target(target: Path) -> None:
    if target.exists():
        if target.is_dir():
            shutil.rmtree(target)
        else:
            target.unlink()
    target.mkdir(parents=True, exist_ok=True)


def validate_allowlist_name(name: object) -> str:
    if not isinstance(name, str) or not name or name.startswith(("/", "\\")):
        raise RuntimeError(f"unsafe allowlist entry: {name!r}")
    rel = Path(name)
    if ".." in rel.parts:
        raise RuntimeError(f"unsafe allowlist entry: {name!r}")
    if "teacher" in name.lower():
        raise RuntimeError(f"teacher-like file is not allowed in student export: {name}")
    return name


def copy_lesson_allowlist(lesson_dir: Path, target: Path) -> None:
    """Copy optional lesson-specific student assets through a positive allowlist."""
    policy_path = lesson_dir / "student-export.json"
    if not policy_path.is_file():
        return
    policy = read_json(policy_path)
    if policy.get("policy") != "allowlist":
        raise RuntimeError("student export policy must be allowlist")
    names = policy.get("files") or []
    if not isinstance(names, list):
        raise RuntimeError("student export files must be a list")
    for raw in names:
        name = validate_allowlist_name(raw)
        src = lesson_dir / name
        if not src.is_file():
            raise FileNotFoundError(f"allowlisted file missing: {src}")
        copy_file(src, target / name)


def export_v1(lesson_dir: Path, out_root: Path, meta: dict) -> Path:
    target = safe_target(out_root, meta)
    reset_target(target)

    engine_src = ROOT / "_engine" / "v1"
    engine_dst = out_root / "_engine" / "v1"
    if engine_dst.exists():
        shutil.rmtree(engine_dst)
    shutil.copytree(engine_src, engine_dst)

    for name in ("lesson-data.js", "student-index.html"):
        src = lesson_dir / name
        if not src.is_file():
            raise FileNotFoundError(f"required student file missing: {src}")

    copy_file(lesson_dir / "lesson-data.js", target / "lesson-data.js")
    copy_lesson_allowlist(lesson_dir, target)

    student_meta = clean_student_meta(meta)
    html_text = (lesson_dir / "student-index.html").read_text(encoding="utf-8")
    html_text = html_text.replace("../../../_engine/v1/", "/_engine/v1/")
    meta_pattern = r"window\.LESSON_META\s*=\s*\{.*?\};"
    if not re.search(meta_pattern, html_text, re.S):
        raise RuntimeError("student-index.html is missing window.LESSON_META")
    html_text = re.sub(
        meta_pattern,
        f"window.LESSON_META = {json_for_script(student_meta)};",
        html_text,
        count=1,
        flags=re.S,
    )
    if "_teacher/" in html_text or "teacher.js" in html_text:
        raise RuntimeError("student-index.html references teacher code")
    (target / "index.html").write_text(html_text, encoding="utf-8")

    (target / "lesson-meta.json").write_text(
        json.dumps(student_meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return target


def export_legacy(lesson_dir: Path, out_root: Path, meta: dict) -> Path:
    policy_path = lesson_dir / "student-export.json"
    if not policy_path.is_file():
        raise FileNotFoundError(f"legacy lesson requires allowlist: {policy_path}")
    policy = read_json(policy_path)
    if policy.get("policy") != "allowlist":
        raise RuntimeError("legacy student export policy must be allowlist")

    names = policy.get("files")
    if not isinstance(names, list) or not names:
        raise RuntimeError("legacy allowlist must contain files")

    target = safe_target(out_root, meta)
    reset_target(target)

    for raw in names:
        name = validate_allowlist_name(raw)
        src = lesson_dir / name
        if not src.is_file():
            raise FileNotFoundError(f"allowlisted file missing: {src}")
        copy_file(src, target / name)

    (target / "lesson-meta.json").write_text(
        json.dumps(clean_student_meta(meta), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return target


def assert_no_teacher_files(out_root: Path) -> None:
    bad_files = []
    bad_refs = []
    text_suffixes = {".html", ".js", ".json", ".css", ".txt", ".md"}
    forbidden_refs = ("_teacher/", "teacher.js", "teaching.v1", '"teachermode": true')
    for path in out_root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(out_root).as_posix().lower()
        if "/_teacher/" in f"/{rel}" or "teacher.js" in rel or "teacher-notes" in rel:
            bad_files.append(rel)
        if path.suffix.lower() in text_suffixes:
            try:
                text = path.read_text(encoding="utf-8").lower()
            except UnicodeDecodeError:
                continue
            if any(token in text for token in forbidden_refs):
                bad_refs.append(rel)
    if bad_files:
        raise RuntimeError("teacher files leaked into student export: " + ", ".join(sorted(set(bad_files))))
    if bad_refs:
        raise RuntimeError("teacher references leaked into student export: " + ", ".join(sorted(set(bad_refs))))


def export_lesson(lesson_dir: Path, out_root: Path) -> tuple[Path, dict]:
    lesson_dir = lesson_dir.resolve()
    out_root = out_root.resolve()
    meta_path = lesson_dir / "lesson-meta.json"
    if not meta_path.is_file():
        raise FileNotFoundError(meta_path)
    meta = read_json(meta_path)
    engine = meta.get("engine")
    if engine not in ALLOWED_ENGINES:
        raise RuntimeError(f"unsupported engine: {engine}")

    if engine == "v1":
        target = export_v1(lesson_dir, out_root, meta)
    else:
        target = export_legacy(lesson_dir, out_root, meta)

    assert_no_teacher_files(out_root)
    return target, meta


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lesson", required=True, type=Path, help="lesson directory")
    ap.add_argument("--out", required=True, type=Path, help="student site root")
    args = ap.parse_args()

    target, meta = export_lesson(args.lesson, args.out)
    print(f"EXPORTED {meta['id']} -> {target}")


if __name__ == "__main__":
    main()
