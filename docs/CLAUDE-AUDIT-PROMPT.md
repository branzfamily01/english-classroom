# Claude audit request — English Classroom v1

Please audit the **actual implementation** in:

https://github.com/branzfamily01/english-classroom

Do not design from theory before reading the repository.

## Important exclusions

Ignore `branzfamily01/evergreen-lesson9`. It is an old mislabeled copy of Clover material and is not the real Evergreen Lesson9.

The current valid reference materials are:

- `materials/clover/lesson9/`
- `materials/evergreen/lesson8/`

## Why this audit exists

This is an isolated v1 prototype. It has **not** been connected to production My Hub yet, and it has **not** become the official student distribution route.

We want a release-gate review before doing that.

## Decisions already made

- Permanent lesson IDs and paths do not contain year.
- Year/class live only in operational state/logs.
- Engine v1 supports only `blank / choice / order / translate / write`.
- Evergreen Lesson8 stays legacy in Phase 1.
- `_teacher/v1/` is separate.
- Student export is allowlist-only.
- `localStorage` is work storage; JSON is the Phase 1 portable backup.
- My Hub module is prepared but intentionally not connected.
- Student yearly Netlify site contains only explicitly released lessons.

Do not reopen these decisions merely for stylistic preference. Reopen them only if you find a concrete correctness, security, maintenance, or classroom-operability problem.

## Must-audit areas

### 1. Clover data parity and Engine conversion

Compare the new Clover data with the pinned source:

- source repo: `branzfamily01/clover-lesson9`
- source commit: `d4dd38bf18b0ef8f69a64844f7f7b09e82383c58`

Confirm that the migration changed structure only, not question content, answers, explanations, wrong-answer analysis, translation, or intended audio.

Check whether the section→format mapping is semantically sound.

### 2. Stage/audio leakage

Read `_engine/v1/audio.js` and `_engine/v1/engine.js`.

Try to find any path by which stage 0 can expose:

- answer
- completed sentence
- `audioA`
- teacher/private data

The intended invariant is:

```js
LessonAudio.speak(item, stage)
stage === 0 -> audioQ only
stage >= 1 -> audioA / completed
```

Check the API boundary, not only current callers.

### 3. Engine behavior

Test/reason through:

- cover
- guide
- all stages
- previous/next
- Space/Enter
- ArrowLeft/ArrowRight
- reset
- question drawer
- output reveal
- audio
- mobile layout
- question formats
- end screen

Look for off-by-one, focus, keyboard, state, DOM, accessibility, or rendering bugs.

### 4. Teacher layer

Audit `_teacher/v1/teacher.js`.

Check:

- log creation
- optional note flow
- duplicate/accidental blank records
- current-question association
- past-record retrieval
- class/year progress key
- resume behavior
- saving on end
- JSON backup
- name-warning behavior
- localStorage corruption/recovery
- multiple tabs
- year rollover
- negative/invalid slide states

Identify any issue likely to break a real lesson.

### 5. Privacy boundary

Verify that no teacher data is shipped in the student path.

Audit:

- `materials/clover/lesson9/student-index.html`
- `materials/evergreen/lesson8/student-export.json`
- `tools/student-export/export_lesson.py`
- `tools/student-export/build_year_site.py`

Treat this as a **positive allowlist** review.

Look for path traversal, accidental copying, stale output, teacher metadata leakage, or future footguns.

### 6. Student yearly build

Audit whether a yearly Netlify build can safely contain several released lessons and share Engine v1.

Check URL/path behavior after export, especially absolute vs relative references.

Also note that `robots.txt` is only indexing suppression, not access control.

### 7. Evergreen Lesson8

Confirm that the copied legacy implementation includes the fixed question-audio behavior:

- EX1 must not read `q.full` before answer reveal.
- EX2 must not read `q.answer` before answer reveal.

Do **not** recommend an Engine v1 migration merely for consistency. Recommend it only if the present legacy arrangement has an actual operational cost worth paying.

### 8. My Hub module

Audit `my-hub-module/teaching-panel.js`, but remember it is not installed yet.

Check compatibility with the existing My Hub repo:

https://github.com/branzfamily01/my-hub

Pay special attention to:

- same-origin localStorage assumptions
- registry URL
- class configuration UX
- progress lookup
- resume URLs
- backup import/export
- DOM/CSS collisions
- production integration risk

### 9. Validators

Audit `tools/validate.py` and `.github/workflows/validate.yml`.

Tell us what important invariant is currently **not** being tested.

## Required output

Start with:

**判定：A / B / C / D**

Then:

1. **Blockers before My Hub connection**
2. **Blockers before Netlify/student release**
3. **Bugs or risks that can wait**
4. **What is already correct and should not be redesigned**
5. **Exact file/function/line-level fixes**
6. **Tests to add**

End with:

## 今すぐ直すもの

Maximum **5 items**, ordered by impact.

Do not propose Obsidian, Supabase, authentication, or a concept taxonomy unless a Phase 1 blocker genuinely requires it.
