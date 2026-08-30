# Evergreen Lesson9 build notes

## Status
- `evergreen.lesson9` is the first new Evergreen lesson built directly on Engine v1.
- Registry status is `review`.
- Do not connect it to production My Hub or publish it to the student Netlify site until the release-gate audit.

## Source policy
1. The uploaded PowerPoint is the authoritative source for Lesson 9 explanations, examples, and exercise wording.
2. The model answers and Japanese translations supplied in chat are authoritative for exercise answers/translations.
3. Supplementary modal materials are used only to improve explanations, comparisons, and the optional reference map.
4. Supplementary claims that are pedagogical simplifications are softened rather than presented as absolute grammatical laws.

## New UX tested by this lesson
- Frozen Engine v1 formats remain unchanged: `blank / choice / order / translate / write`.
- Lesson-specific reference layer uses the existing `lesson:render` extension hook.
- Source underlines are restored through escaped `questionParts`.
- `🗺` opens a non-linear concept map.
- `🧭 今ここ` appears only after answer reveal, so it does not give away the grammar point at stage 0.
- Detailed diagrams are rendered on the reason stage.
- Japanese-to-English (`write`) and word-order (`order`) questions expose no English answer audio at stage 0.
- Optional lesson assets are student-exported only through `student-export.json` positive allowlist.

## Audit targets
- Does the concept map accidentally reveal too much when used during problem stage?
- Do diagrams overflow a 16:9 projector viewport?
- Is `used to / would` phrasing accurate enough while remaining teachable?
- Are `need` and `dare` auxiliary/lexical distinctions presented without overgeneralization?
- Do lesson-specific enhancement assets remain isolated from the shared Engine?
