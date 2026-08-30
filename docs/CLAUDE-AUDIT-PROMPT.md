# Claude audit request — English Classroom v1

Please audit the **actual implementation** in:

https://github.com/branzfamily01/english-classroom

Do not design from theory before reading the repository.

## Important exclusions

Ignore the separate repository `branzfamily01/evergreen-lesson9`. It is an old mislabeled copy of Clover material and is **not** the real Evergreen Lesson9.

The current valid materials are:

- `materials/clover/lesson9/`
- `materials/evergreen/lesson8/`
- `materials/evergreen/lesson9/` ← **the real Evergreen Lesson9; first lesson newly authored on Engine v1**

## Why this audit exists

This is an isolated v1 prototype. It has **not** been connected to production My Hub yet, and Evergreen Lesson9 has **not** been released through the production yearly Netlify student site.

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
- Evergreen Lesson9 uses PPT + supplied model answers/translations as the authoritative exercise source. Supplementary modal materials may improve explanations/maps but must not silently change questions or official answers.

Do not reopen these decisions merely for stylistic preference. Reopen them only if you find a concrete correctness, security, maintenance, or classroom-operability problem.

## Pre-audit fixes already implemented

The following were found and fixed before this audit. **Verify the fixes and try to break them; do not merely recommend them again.**

1. Evergreen Lesson8 question-stage audio leakage was fixed: EX1 now speaks a `blank` version and EX2 speaks the prompt, not the completed answer.
2. Clover Lesson9 now has CI source-parity verification against the pinned source commit. `tools/verify_clover_source_parity.py` requires exact equality after removing only structural migration fields.
3. Progress/resume now stores explicit `resumeQuestionKey` and `completed` state. Engine `jumpTo(data.length)` is valid so a fully completed lesson can resume at END. My Hub candidate distinguishes `前回 ... / 次回 ...` and completion.
4. Student export now uses an allowlist not only for files but also for metadata keys. `series`/`lesson` slugs are validated, resolved targets must remain under the output root, and an existing lesson target is cleared before re-export so stale files cannot survive.
5. Student output scanning rejects teacher file paths/references, `teaching.v1`, and `teacherMode:true`. CI tests unsafe path metadata, stale-file removal, metadata-key allowlisting, individual lesson exports, and a multi-lesson yearly build.
6. Evergreen Lesson9 has `tools/verify_evergreen9_source_parity.py`, which locks all 23 question keys/order, problem text, model answers, completed sentences, supplied Japanese translations, choice options, and Exercise 1 source underlines.
7. Evergreen Lesson9 is currently `status: review`. `build_year_site.py` rejects non-`ready` lessons before touching output. `--allow-review` exists only as a disposable-test escape hatch and CI verifies the production gate rejects Lesson9 while it is under review.
8. Evergreen Lesson9 includes a question-specific visual layer and an always-available `🗺 地図` reference drawer; `🧭 今ここ` is intentionally hidden until the answer has been revealed.

Current CI has passed these checks. Your job is to find what these checks still miss.

## Must-audit areas

### 1. Clover data parity and Engine conversion

Compare the new Clover data with the pinned source:

- source repo: `branzfamily01/clover-lesson9`
- source commit: `d4dd38bf18b0ef8f69a64844f7f7b09e82383c58`

Confirm that the migration changed structure only, not question content, answers, explanations, wrong-answer analysis, translation, or intended audio.

Also audit `tools/verify_clover_source_parity.py` itself: try to find any normalization or parser weakness that could let a real content change pass.

Check whether the section→format mapping is semantically sound.

### 2. Evergreen Lesson9 — first greenfield Engine-v1 lesson

This is especially important because it tests whether the architecture works for a **new lesson**, not merely a migrated Clover lesson.

Audit:

- `materials/evergreen/lesson9/lesson-data.js`
- `materials/evergreen/lesson9/lesson-references.js`
- `materials/evergreen/lesson9/lesson9-enhance.js`
- `materials/evergreen/lesson9/lesson9.css`
- teacher `index.html`
- `student-index.html`
- `student-export.json`
- `source-lock.json`
- `tools/verify_evergreen9_source_parity.py`

Authoritative content policy:

- PowerPoint `10_Evergreen English Grammar 47_Lesson9(1).pptx` is the basic lesson source.
- The teacher supplied the model answers and Japanese translations separately; they are authoritative too.
- Supplementary modal documents are explanation/reference material only.

Verify all 23 questions and especially check:

- exact problem/answer/translation preservation
- Exercise 1 underline preservation
- `used to` vs `would (often)` explanation
- `need` as modal vs lexical verb
- `needn’t` vs prohibition
- `wouldn’t` as past refusal
- `Shall I` vs `Shall we`
- `Will you` vs `Would you`
- `be supposed to`
- `dare not + V`
- `will often` current habit/tendency
- TRY model-answer alternatives such as `will[am going to]`

Try to identify any place where a supplementary explanation has been promoted into an unsupported "official answer" or where model knowledge has accidentally overwritten the authoritative source.

### 3. Evergreen Lesson9 visual/reference layer

The teacher explicitly requested diagrams and a zoomed-out map that students can consult while learning.

Audit the real browser behavior of:

- `🗺 地図` button
- concept-map opening/closing
- all reference tabs
- `🧭 今ここ` breadcrumb
- per-question diagrams at the reason stage
- source-underlined expressions
- desktop projector layout
- 320 / 375 / 768 / 1440 widths
- keyboard behavior while the map dialog is open
- focus return on close
- Escape behavior
- interaction with the existing question drawer

Look specifically for:

- answer leakage before reveal
- modal/map overlays behind or above the wrong layer
- clipping on 16:9 projectors
- excessive text density
- buttons becoming unreachable on small screens
- visuals that are semantically misleading even if visually attractive

Do not recommend removing the visual system merely to simplify code. Identify concrete problems.

### 4. Stage/audio leakage

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

For Evergreen Lesson9, pay special attention to:

- blank / choice questions: `audioQ` must not contain the answer
- order / write questions: no stage-0 English answer audio
- translation questions: source English audio is acceptable because the English sentence itself is the question

### 5. Engine behavior

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
- all five question formats
- end screen
- `jumpTo(0)`, `jumpTo(last)`, and `jumpTo(data.length)`

Look for off-by-one, focus, keyboard, state, DOM, accessibility, or rendering bugs.

### 6. Teacher layer

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

### 7. Privacy boundary

Verify that no teacher data is shipped in the student path.

Audit:

- `materials/clover/lesson9/student-index.html`
- `materials/evergreen/lesson8/student-export.json`
- `materials/evergreen/lesson9/student-index.html`
- `materials/evergreen/lesson9/student-export.json`
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

### 8. Student yearly build / release gate

Audit whether a yearly Netlify build can safely contain several released lessons and share Engine v1.

Check URL/path behavior after export, especially absolute vs relative references and Netlify deployment at the site root.

Check duplicate lesson arguments, duplicate target paths, mixed v1/legacy lessons, release-manifest correctness, and rebuild behavior.

For the new release gate, try to bypass the rule that `status != ready` must not enter a production yearly build. Verify that failure happens before output mutation and that `--allow-review` cannot be triggered accidentally by normal production usage.

Also note that `robots.txt` is only indexing suppression, not access control.

### 9. Evergreen Lesson8

Confirm that the copied legacy implementation includes the fixed question-audio behavior:

- EX1 must not read `q.full` before answer reveal.
- EX2 must not read `q.answer` before answer reveal.

Do **not** recommend an Engine v1 migration merely for consistency. Recommend it only if the present legacy arrangement has an actual operational cost worth paying.

### 10. My Hub module

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

### 11. Validators and CI

Audit:

- `tools/validate.py`
- `tools/verify_clover_source_parity.py`
- `tools/verify_evergreen9_source_parity.py`
- `.github/workflows/validate.yml`

The current CI already tests source parity, syntax/invariants, student export, stale-file cleanup, unsafe target paths, metadata allowlisting, release gating, and a multi-lesson yearly build.

Tell us what important **behavioral or security invariant is still not tested**, and distinguish:

- static test that should be added now
- browser/E2E test worth adding before production
- risk that does not justify automation in Phase 1

## Required output

Start with:

**判定：A / B / C / D**

Then:

1. **Blockers before using Evergreen Lesson9 in a real teacher-led class**
2. **Blockers before My Hub connection**
3. **Blockers before Netlify/student release**
4. **Bugs or risks that can wait**
5. **What is already correct and should not be redesigned**
6. **Exact file/function/line-level fixes**
7. **Tests to add**

For every blocker, state a concrete reproduction/failure scenario. Do not label a theoretical preference as a blocker.

End with:

## 今すぐ直すもの

Maximum **5 items**, ordered by impact.

Do not propose Obsidian, Supabase, authentication, or a concept taxonomy unless a Phase 1 blocker genuinely requires it.
