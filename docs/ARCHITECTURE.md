# English Classroom architecture — Phase 1

## Purpose

A permanent teacher-side home for interactive English classroom materials. It is not organized by school year because the lesson itself is reusable across years.

## Identity boundaries

### Permanent material identity

Examples:

- `evergreen.lesson8`
- `clover.lesson9`

Permanent paths:

- `materials/evergreen/lesson8/`
- `materials/clover/lesson9/`

A year must not be embedded in either permanent ID or permanent path.

### Operational teaching state

Year belongs here:

- school year
- class
- lesson ID
- current question
- resume position
- teaching logs

Current work-storage key: `teaching.v1`.

## Engine v1

Scope: one-question-per-screen exercise lessons.

Frozen formats:

1. `blank`
2. `choice`
3. `order`
4. `translate`
5. `write`

Do not add a sixth format casually. If a fundamentally different content type is needed, audit whether it belongs in Engine v2 or a separate module.

### Audio invariant

Only this API is public:

```js
LessonAudio.speak(item, stage)
```

At stage 0, the implementation can read only `audioQ`.

At stage 1+, it can read `audioA` or the completed sentence.

No public raw-text speech function is exposed.

## Evergreen Lesson8

Evergreen Lesson8 is deliberately **not** migrated to Engine v1 in Phase 1.

It contains lecture/reference structures in addition to 24 exercise items:

- big-picture map
- chapters A/B/C
- reference modal/table
- meaning comparison
- Exit Ticket

The existing implementation is copied unchanged except for the corrected answer-leaking question audio.

It remains usable as a teacher-presented legacy lesson, but automatic class progress/logging is not attached to it in Phase 1.

## Teacher layer

`_teacher/v1/teacher.js` is loaded only by the Engine-v1 teacher entry.

It provides:

- misconception
- question
- successful explanation
- addition
- improvement
- past logs for the current question
- class progress
- resume position
- JSON backup on lesson end

Student-identifying information must not be stored. The `さん / くん / 君` warning is only an accident guard and is not a security control.

## Storage

`localStorage` is work storage, not the sole durable record.

Phase 1 portable backup: JSON.

The design goal is not “storage never disappears”; it is “storage loss is recoverable”.

## Student export

Student export is allowlist-only.

Teacher code is never copied by default.

Two lesson modes are supported:

- Engine v1: copy shared `_engine/v1/`, lesson data, sanitized metadata and student entry.
- Legacy: copy only files enumerated by `student-export.json`.

The yearly site builder receives an explicit list of released lessons. Therefore a lesson is not added just because it exists in the repository.

## Netlify role

Netlify is the student distribution layer, normally one yearly URL per course/grade.

Examples:

- `english1-2026.netlify.app`
- `english3-2026.netlify.app`

Year is appropriate here because this is a distribution artifact, not permanent lesson identity.

## My Hub

My Hub remains the teacher cockpit.

The prepared integration module is intentionally not connected until audit. Once approved, old lesson repositories remain backups but should not appear next to the new official entry, to reduce classroom launch errors.

## Phase 2 candidates

Only after real Phase 1 use:

- Second Brain Bridge / Obsidian export
- durable knowledge promotion
- concept taxonomy if the observed logs justify it
- richer lecture/reference modules
- Evergreen Lesson8 Engine migration, if it is actually beneficial
