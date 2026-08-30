#!/usr/bin/env python3
"""Allowlist-only student export for english-classroom."""
from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOWED_ENGINES = {"v1", "legacy"}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def safe_target(root: Path, meta: dict) -> Path:
    series = str(meta["series"]).strip().lower().replace(" ", "-")
    lesson = str(meta["lesson"]).strip()
    return root / "materials" / series / f"lesson{lesson}"


def clean_student_meta(meta: dict) -> dict:
    result = dict(meta)
    result["teacherMode"] = False
    result.pop("teacherNotes", None)
    result.pop("private", None)
    return result


def copy_file(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def export_v1(lesson_dir: Path, out_root: Path, meta: dict) -> Path:
    target = safe_target(out_root, meta)
    target.mkdir(parents=True, exist_ok=True)

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

    html_text = (lesson_dir / "student-index.html").read_text(encoding="utf-8")
    html_text = html_text.replace("../../../_engine/v1/", "/_engine/v1/")
    if "_teacher/" in html_text or "teacher.js" in html_text:
        raise RuntimeError("student-index.html references teacher code")
    (target / "index.html").write_text(html_text, encoding="utf-8")

    (target / "lesson-meta.json").write_text(
        json.dumps(clean_student_meta(meta), ensure_ascii=False, indent=2) + "\n",
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
    target.mkdir(parents=True, exist_ok=True)

    for name in names:
        if not isinstance(name, str) or not name or name.startswith(("/", "\\")) or ".." in Path(name).parts:
            raise RuntimeError(f"unsafe allowlist entry: {name!r}")
        if "teacher" in name.lower():
            raise RuntimeError(f"teacher-like file is not allowed in student export: {name}")
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
    bad = []
    for path in out_root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(out_root).as_posix().lower()
        if "/_teacher/" in f"/{rel}" or "teacher.js" in rel or "teacher-notes" in rel:
            bad.append(rel)
    if bad:
        raise RuntimeError("teacher files leaked into student export: " + ", ".join(bad))


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
