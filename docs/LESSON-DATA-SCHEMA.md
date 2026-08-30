# Engine v1 lesson-data schema

Engine v1 is intentionally small. The supported formats are frozen to:

- `blank`
- `choice`
- `order`
- `translate`
- `write`

## Lesson metadata

Each Engine-v1 lesson has `lesson-meta.json` and the teacher/student HTML entry also sets the same public lesson identity in `window.LESSON_META`.

Minimum identity fields:

```json
{
  "schemaVersion": 1,
  "id": "clover.lesson9",
  "title": "Clover Lesson9",
  "series": "Clover",
  "lesson": "9",
  "grade": 3,
  "engine": "v1"
}
```

Rules:

- `id` is permanent and contains no school year.
- `id` changes only when the material itself needs a distinct revision identity.
- `grade` is descriptive metadata, not the operational year/class assignment.

## Question object

`lesson-data.js` exposes:

```js
window.LESSON_DATA = [ /* question objects */ ];
```

Recommended shape:

```js
{
  id: "clover.lesson9.1-(1)",
  key: "1-(1)",
  section: 1,
  sectionName: "文法・語法",
  format: "choice",
  focus: "help + O + 原形",

  question: "Special features help camels (    ) in the desert.",
  choices: ["①survival", "②survived", "③survive", "④survivor"],

  answer: "survive",
  completed: "Special features help camels survive in the desert.",
  correct: ["..."],
  wrong: ["..."],
  translation: "...",
  method: "...",
  reuse: ["..."],

  audioQ: "Special features help camels blank in the desert.",
  audioA: "Special features help camels survive in the desert."
}
```

## Required by Engine v1

Every question should have:

- `id`
- `key`
- `format`
- `question`
- `answer`
- `focus`

For ordinary English exercise questions, also provide:

- `completed`
- `correct`
- `wrong`
- `translation`
- `audioQ`
- `audioA`

## Audio invariant

`audioQ` is the **only** question-stage audio source.

It must not reveal the answer.

For blank questions, use `blank` in the spoken text rather than silently inserting the answer.

`audioA` is the completed/correct English and becomes available only after answer reveal.

The data file must never decide the current stage; Engine v1 owns stage logic.

## Stage logic

The lesson data does not contain `maxStep` or a custom stage count.

Engine v1 derives the stage sequence from `format`. This prevents each generated lesson from inventing a new interaction protocol.

## What does not belong here

Do not put these in `lesson-data.js`:

- school year
- class name
- class progress
- teaching logs
- teacher notes
- student names
- individual grades
- Netlify release state

Those belong to operational state or release metadata, not permanent lesson content.
