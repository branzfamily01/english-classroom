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

## Pre-audit fixes already implemented

The following were found and fixed before this audit. **Verify the fixes and try to break them; do not merely recommend them again.**

1. Evergreen Lesson8 question-stage audio leakage was fixed: EX1 now speaks a `blank` version and EX2 speaks the prompt, not the completed answer.
2. Clover Lesson9 now has CI source-parity verification against the pinned source commit. `tools/verify_clover_source_parity.py` requires exact equality after removing only `id`/`format` and mapping `audioQ/audioA` back to the legacy audio field names.
3. Progress/resume now stores explicit `resumeQuestionKey` and `completed` state. Engine `jumpTo(data.length)` is valid so a fully completed lesson can resume at END. My Hub candidate distinguishes `前回 ... / 次回 ...` and completion.
4. Student export now uses an allowlist not only for files but also for metadata keys. `series`/`lesson` slugs are validated, resolved targets must remain under the output root, and an existing lesson target is cleared before re-export so stale files cannot survive.
5. Student output scanning rejects teacher file paths/references, `teaching.v1`, and `teacherMode:true`. CI tests unsafe path metadata, stale-file removal, metadata-key allowlisting, individual lesson exports, and a multi-lesson yearly build.

Current CI has passed these checks. Your job is to find what these checks still miss.

## Must-audit areas

### 1. Clover data parity and Engine conversion

Compare the new Clover data with the pinned source:

- source repo: `branzfamily01/clover-lesson9`
- source commit: `d4dd38bf18b0ef8f69a64844f7f7b09e82383c58`

Confirm that the migration changed structure only, not question content, answers, explanations, wrong-answer analysis, translation, or intended audio.

Also audit `tools/verify_clover_source_parity.py` itself: try to find any normalization or parser weakness that could let a real content change pass.

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
- `jumpTo(0)`, `jumpTo(last)`, and `jumpTo(data.length)`

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
- resume behavior from a partially completed question
- resume behavior after an Output-completed question
- save from the END screen
- saving before any question begins
- JSON backup
- name-warning behavior
- localStorage corruption/recovery
- localStorage quota/write failure
- multiple tabs and lost updates
- year rollover
- negative/invalid slide states
- compatibility with older Phase 1 backup JSONs that lack the newer progress fields

Identify any issue likely to break a real lesson.

### 5. Privacy boundary

Verify that no teacher data is shipped in the student path.

Audit:

- `materials/clover/lesson9/student-index.html`
- `materials/evergreen/lesson8/student-export.json`
- `tools/student-export/export_lesson.py`
- `tools/student-export/build_year_site.py`

Treat this as a **positive allowlist** review for both files and metadata.

Try to bypass:

- slug/path validation
- output-root containment
- stale-output cleanup
- teacher-reference scanning
- metadata allowlisting
- replacement of embedded `window.LESSON_META`

Look for symlinks, unusual filenames, crafted metadata/string content, path traversal, accidental copying, stale output, teacher metadata leakage, or future footguns.

### 6. Student yearly build

Audit whether a yearly Netlify build can safely contain several released lessons and share Engine v1.

Check URL/path behavior after export, especially absolute vs relative references and Netlify deployment at the site root.

Check duplicate lesson arguments, duplicate target paths, mixed v1/legacy lessons, release-manifest correctness, and rebuild behavior.

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
- display of previous vs next question
- completed-lesson handling
- resume URLs
- backup import/export and older backup compatibility
- DOM/CSS collisions
- production integration risk

### 9. Validators and CI

Audit:

- `tools/validate.py`
- `tools/verify_clover_source_parity.py`
- `.github/workflows/validate.yml`

The current CI already tests source parity, syntax/invariants, student export, stale-file cleanup, unsafe target paths, metadata allowlisting, and multi-lesson yearly build.

Tell us what important **behavioral or security invariant is still not tested**, and distinguish:

- static test that should be added now
- browser/E2E test worth adding before production
- risk that does not justify automation in Phase 1

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

For every blocker, state a concrete reproduction/failure scenario. Do not label a theoretical preference as a blocker.

End with:

## 今すぐ直すもの

Maximum **5 items**, ordered by impact.

Do not propose Obsidian, Supabase, authentication, or a concept taxonomy unless a Phase 1 blocker genuinely requires it.
