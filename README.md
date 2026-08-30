# english-classroom v1 scaffold

Teaching HTML foundation for My Hub.

## Fixed architecture decisions

- Lesson paths and permanent lesson IDs do **not** contain a school year.
- School year belongs to class progress and teaching logs.
- `_engine/v1/` is frozen after release; changes go to a new version.
- Engine v1 is for one-question-per-screen exercise lessons.
- Formats are frozen to: `blank`, `choice`, `order`, `translate`, `write`.
- `Audio.speak(item, stage)` is the only public audio API.
- Stage 0 can access only `audioQ`.
- Teacher functions live in `_teacher/v1/`; student export uses an allowlist.
- Teacher notes must not contain student-identifying information.
- `localStorage` is working storage, not the only durable copy.
- JSON backup is the Phase 1 portable backup.

## Current migration

### Clover Lesson9
Converted to Engine v1 and included here as the first concrete test lesson.

### Evergreen Lesson8
Keep the existing lecture-oriented implementation during Phase 1.
Only the answer-leaking audio bug is fixed. The corrected legacy files are kept in `materials/evergreen/lesson8/` without schema migration.

## Teacher URL parameters

My Hub should open a lesson with:

`?year=2026&class=1A`

Teacher progress is keyed by:
`schoolYear + className + permanent lessonId`.

## Student export

Example:

```bash
python tools/student-export/export_lesson.py \
  --lesson materials/clover/lesson9 \
  --out dist/student-2026
```

Engine v1 export copies only:
- `_engine/v1/`
- `lesson-data.js`
- `lesson-meta.json`
- `student-index.html` as `index.html`

Legacy lessons use their own explicit `student-export.json` allowlist.
Evergreen Lesson8 is configured to export only:
- `index.html`
- `app-data.js`
- `app-main.js`
- `styles.css`

`_teacher/` is never copied by default.

A yearly Netlify-ready site can be built only from explicitly released lessons:

```bash
python tools/student-export/build_year_site.py \
  --year 2026 \
  --title "English 3 - 2026" \
  --out dist/english3-2026 \
  --lesson materials/clover/lesson9
```

## Next gate

1. Publish GitHub Pages for teacher use.
2. Verify Clover Lesson9 and Evergreen Lesson8.
3. Audit Engine v1 with Claude before using it as the default for new Lesson9 work.
4. Only after audit, add the My Hub teaching tab/progress UI and switch the official entry points.
