#!/usr/bin/env python3
"""Build a yearly Netlify-ready student site from explicitly released lessons."""
from __future__ import annotations

import argparse
import html
import importlib.util
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("export_lesson", HERE / "export_lesson.py")
module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(module)


def prepare_out(path: Path, force: bool) -> Path:
    path = path.resolve()
    if path == Path(path.anchor):
        raise RuntimeError("refusing to use filesystem root as output")
    marker = path / ".student-site-build"
    if path.exists() and any(path.iterdir()):
        if not force:
            raise RuntimeError(f"output is not empty: {path}; pass --force to rebuild")
        if not marker.exists():
            raise RuntimeError(f"refusing to delete non-build directory without marker: {path}")
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)
    marker.write_text("english-classroom student build\n", encoding="utf-8")
    return path


def card(meta: dict, target: Path, out_root: Path) -> str:
    rel = target.relative_to(out_root).as_posix().rstrip("/") + "/"
    return (
        '<article class="card">'
        f'<div class="kicker">{html.escape(str(meta.get("series","")))}</div>'
        f'<h2>Lesson {html.escape(str(meta.get("lesson","")))}</h2>'
        f'<p>{html.escape(str(meta.get("title","")))}</p>'
        f'<a href="./{html.escape(rel)}">▶ Interactive</a>'
        '</article>'
    )


def build_index(title: str, year: str, cards: list[str]) -> str:
    cards_html = "".join(cards)
    return f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style>
:root{{--ink:#172033;--paper:#faf8f4;--line:#ddd6cc;}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans JP",sans-serif}}
main{{max-width:980px;margin:auto;padding:36px 18px 60px}}.eyebrow{{font-weight:900;letter-spacing:.14em;color:#8a642b;font-size:12px}}
h1{{font-size:clamp(34px,6vw,62px);margin:.15em 0}}.sub{{color:#687489;margin-bottom:28px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px}}.card{{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:0 10px 28px rgba(0,0,0,.05)}}
.card h2{{margin:.2em 0}}.card p{{color:#687489}}.kicker{{font-size:12px;font-weight:900;color:#8a642b}}
a{{display:inline-block;text-decoration:none;background:#172033;color:#fff;border-radius:999px;padding:10px 15px;font-weight:850}}
.notice{{margin-top:30px;color:#7a8495;font-size:12px}}
</style>
</head>
<body><main>
<div class="eyebrow">STUDENT MATERIALS · {html.escape(year)}</div>
<h1>{html.escape(title)}</h1>
<p class="sub">授業後の復習用教材です。</p>
<div class="grid">{cards_html}</div>
<p class="notice">このURLは授業用配布ページです。検索エンジンへの掲載を抑制していますが、URL自体はアクセス制御ではありません。</p>
</main></body></html>'''


def assert_release_ready(lesson: Path, allow_review: bool) -> dict:
    meta_path = lesson.resolve() / "lesson-meta.json"
    if not meta_path.is_file():
        raise RuntimeError(f"lesson-meta.json missing: {meta_path}")
    meta = module.read_json(meta_path)
    status = str(meta.get("status", ""))
    export_enabled = meta.get("studentExport") is True
    if not export_enabled:
        raise RuntimeError(f"student export disabled: {meta.get('id', lesson)}")
    if status != "ready" and not allow_review:
        raise RuntimeError(
            f"lesson is not release-ready: {meta.get('id', lesson)} status={status!r}; "
            "complete the audit and set status='ready' before yearly student release"
        )
    return meta


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--lesson", action="append", required=True, type=Path,
                    help="explicitly released lesson directory; repeat for each lesson")
    ap.add_argument("--force", action="store_true")
    ap.add_argument(
        "--allow-review",
        action="store_true",
        help="test-only escape hatch: permit status=review in a disposable build; do not use for production release",
    )
    args = ap.parse_args()

    # Validate all requested lessons before touching the output directory. This keeps a
    # failed release gate from leaving a half-built student site behind.
    for lesson in args.lesson:
        assert_release_ready(lesson, args.allow_review)

    out = prepare_out(args.out, args.force)
    cards = []
    release_manifest = []
    for lesson in args.lesson:
        target, meta = module.export_lesson(lesson, out)
        cards.append(card(meta, target, out))
        release_manifest.append({
            "id": meta["id"],
            "title": meta.get("title"),
            "path": target.relative_to(out).as_posix() + "/",
        })

    (out / "index.html").write_text(build_index(args.title, args.year, cards), encoding="utf-8")
    (out / "robots.txt").write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")
    (out / "release-manifest.json").write_text(
        json.dumps({"year": args.year, "title": args.title, "lessons": release_manifest},
                   ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    module.assert_no_teacher_files(out)
    print(f"BUILT {out} ({len(release_manifest)} lessons)")


if __name__ == "__main__":
    main()
