# Claude audit addendum — Evergreen Lesson9 classroom UX

Read this together with `docs/CLAUDE-AUDIT-PROMPT.md`.

The teacher reviewed the actual Evergreen Lesson9 screens and requested a classroom-oriented redesign. Audit the implementation, not just the design intent.

## New requirements to verify

### Teacher-facing UI
- Teacher panel must no longer obstruct the lesson by default.
- It must be minimizable and draggable.
- The minimized state/position may persist, but must not contain student-identifying data.
- A mistaken teaching log must be deletable from past records.
- Teacher operation instructions must live in a teacher-only `Teacher Guide`, not on a student-facing lesson slide.

### Bottom toolbar and navigation
- Toolbar must be minimizable/compactable.
- `←` and `→`, both buttons and keyboard keys, must move by **one visible lesson screen**, not by whole question.
- Example: Question → Hint 1 → Hint 2 → Answer → Why → Watch out → Meaning → Say it.
- Moving left from Answer should return to Hint 2, not to the previous question.
- Moving left from the first screen of a question should return to the last screen of the previous question.
- The map control must visibly say `🗺 地図`; text must not be clipped.

### Student-facing language
- Avoid lesson-plan language such as “make students state the reason”.
- Instructions should normally be short English first, with short Japanese support beneath.
- Keep the angle consistently teacher → student.
- Avoid developer/system vocabulary such as `Interactive Lesson Engine v1` on student-facing slides.
- The result should feel like one English teacher made it for their own class, not like an AI-generated template.

### Small-step hints
- The generic repeated “考える” panel must be gone.
- Every Evergreen L9 question has question-specific hints before the answer.
- Hints should scaffold thinking without stating the answer.
- Each hint should include concise English + Japanese.
- Where useful, the actual clue in the problem should be highlighted.
- The map-path “Now / 今ここ” must remain hidden during problem and hint screens, because it can leak the answer category.

### Back Up Technique
- The Output/Say-it screen should not simply display Japanese and the full English together.
- Evergreen L9 uses teacher-curated semantic chunks in `lesson9-learning.js`.
- English chunks are hidden one at a time from the **end of the sentence**.
- Japanese cue remains visible.
- At the final hide level, the learner should attempt the whole English sentence from Japanese.
- Long source sentences may deliberately practice only the key target sentence/phrase rather than force full memorization.

### Real Final Check
The end screen is no longer a static completion message. It should contain a short sequence including:
1. Key Grammar Quick Response
2. Quick distinction / Which one?
3. Back Up Challenge
4. One Last Try (Japanese → English)
5. Finish

Verify that answers are not visible before the learner chooses to check them.

### Student guide
- The teacher version must not show a generic operation card in the learning guide.
- The student version may show only a short operation note (arrows, audio, map).
- Teacher-only controls/instructions must never ship through Student Export.

## Files most affected
- `_engine/v1/engine.js`
- `_engine/v1/engine.css`
- `_teacher/v1/teacher.js`
- `materials/evergreen/lesson9/lesson9-learning.js`
- `materials/evergreen/lesson9/lesson9-enhance.js`
- `materials/evergreen/lesson9/index.html`
- `materials/evergreen/lesson9/student-index.html`
- `materials/evergreen/lesson9/student-export.json`
- `tools/validate.py`
- `.github/workflows/validate.yml`

## Specific regression risks to attack
- Stage 0 / hint screens exposing answer category through `focus`, `mapPath`, highlighting, choice styling, audio, DOM text, or visual diagrams.
- Left/right screen navigation off-by-one at cover/guide, first question, last question, final check, and END resume.
- Teacher progress semantics after adding variable numbers of hints.
- Teacher panel drag leaving the panel permanently off-screen after viewport resize.
- Delete-log operation deleting the wrong record or failing with duplicate/older backup data.
- Back Up Technique hiding the wrong end of a sentence, or exposing hidden chunks in visible DOM/accessibility text.
- Final Check state leaking answers from one section into another.
- Student Export omitting `lesson9-learning.js` or accidentally including `_teacher` references.
- Common Engine changes unintentionally degrading Clover Lesson9, which does not yet have curated hint/chunk data.

Report concrete failure scenarios and exact fixes. Do not recommend removing the classroom UX simply because it makes the engine more complex.
