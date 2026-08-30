# Daily operation — Phase 1

## Teacher use

1. Open the teacher lesson from My Hub or the English Classroom library.
2. For Engine-v1 lessons, pass `year`, `class`, and `resume=1` in the URL.
3. Teach using staged reveal.
4. During class, record only generalized observations:
   - misconception
   - question
   - successful explanation
   - addition
   - improvement
5. Do not record student-identifying information.
6. Press `授業終了` at the end of an Engine-v1 lesson session.
7. The current class position is saved to `teaching.v1` and a JSON backup is downloaded.

Evergreen Lesson8 remains legacy in Phase 1, so its automatic class-progress/logger integration is not yet available.

## Class progress

Progress is keyed by:

```text
schoolYear :: className :: permanentLessonId
```

Example:

```text
2026 :: 3A :: clover.lesson9
```

The year is operational state and does not alter the permanent lesson path or lesson ID.

## Student release gate

A lesson is released only after all relevant classes have completed it.

Example:

```text
3A Lesson9 complete
3B Lesson9 complete
3C Lesson9 still teaching
→ do not include Lesson9 in the student yearly build yet
```

When the final class completes the lesson, rebuild the yearly student site with that lesson explicitly included.

## Build a yearly student site

Example:

```bash
python tools/student-export/build_year_site.py \
  --year 2026 \
  --title "English 3 - 2026" \
  --out dist/english3-2026 \
  --lesson materials/clover/lesson9
```

To publish several completed lessons, repeat `--lesson`.

The builder does not read every lesson from the registry automatically. This is intentional: existence in the teacher repository is not permission to release to students.

## Netlify

Deploy only the generated yearly-site directory, not the whole `english-classroom` repository.

The generated site contains:

- student entry files
- public lesson data
- required Engine v1 files
- sanitized public lesson metadata
- explicitly allowlisted legacy files
- `release-manifest.json`
- `robots.txt`

It does not contain `_teacher/`.

`robots.txt` reduces indexing but is not authentication or access control.

## Backup rule

`localStorage` is convenient work storage, not the only copy.

The operating rule is:

> Make data loss recoverable rather than assuming browser storage never disappears.

My Hub should warn when the most recent JSON backup is old or missing.

## Migration rule

During the parallel period:

- keep old lesson repositories as rollback/reference copies;
- do not show both old and new versions in the official My Hub teaching entry;
- connect My Hub to the new system only after the release-gate audit passes.
