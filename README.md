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

## Current lessons

### Clover Lesson9
Converted to Engine v1 and source-parity checked.

### Evergreen Lesson8 — 助動詞（1）
Rebuilt with Engine v1 using the same classroom method established for Evergreen Lesson9.

- 24 authoritative exercise questions
- Lesson8-specific modal concept map
- question-specific Small Step Hints
- detailed reasons / wrong-answer guidance / Japanese translations
- question diagrams
- Back Up Technique output practice
- Final Check
- Teacher Mode / class progress / automatic progress save
- allowlist-only student export

The old `app-data.js`, `app-main.js`, and `styles.css` files remain only as unused legacy artifacts during review; the active entry points use `lesson-data.js`, `lesson-references.js`, `lesson8-learning.js`, `lesson8-enhance.js`, and `lesson8.css`.

### Evergreen Lesson9 — 助動詞（2）
Engine v1 reference implementation for the current teaching UX.

## Teacher URL parameters

My Hub should open a lesson with:

`?year=2026&class=1A&resume=1`

Teacher progress is keyed by:
`schoolYear + className + permanent lessonId`.

## Student export

Example:

```bash
python tools/student-export/export_lesson.py \
  --lesson materials/evergreen/lesson8 \
  --out dist/student-2026
```

Engine v1 export copies only the common Engine plus the lesson's positive allowlist. `_teacher/`, `source-lock.json`, teaching logs, and teacher storage are not exported.

Evergreen Lesson8 student assets:
- `lesson-data.js`
- `student-index.html` → `index.html`
- `lesson-references.js`
- `lesson8-learning.js`
- `lesson8-enhance.js`
- `lesson8.css`

A yearly Netlify-ready site remains a separate explicit release step.

## Current gate

1. Teacher visually reviews Evergreen Lesson8 in GitHub Pages.
2. Keep its internal lesson status `review` until classroom/content confirmation.
3. Student yearly-site publication remains separately gated.
4. My Hub may expose the teacher lesson through the registry for review/ongoing teaching.
5. Second Brain Bridge teaching-log integration remains deferred until real teaching logs establish the contract.
