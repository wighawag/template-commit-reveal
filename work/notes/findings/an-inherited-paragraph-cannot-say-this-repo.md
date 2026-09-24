---
title: The check that arrived in a cascade caught that cascade, and the paragraph that arrived with it was false on arrival
type: finding
status: FIXED 2026-09-24 in template-commit-reveal (all four nodes) and reveal-or-die, unpushed
spotted: 2026-09-24
relates-to: work/tasks/done/extract-the-lobby-and-the-played-player-loop.md (step 0), work/notes/findings/main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint.md, work/notes/findings/a-file-identical-everywhere-must-not-name-one-games-answer.md
---

# Two halves of the same lesson, one of them paying off within the hour

Step 0 of the extraction task sent reveal-or-die's dangling-import check upstream, on the grounds that the task was itself a rename cascade and the guard lived only in the repo the cascade ends in. Both halves of what happened next are worth keeping.

## The check caught the merge that delivered it

The cascade into reveal-or-die reported nine conflicts, all of them where the task predicted. Resolved, suites not yet run, `node scripts/check-dangling-imports.mjs` took a second and said:

```
✗ 1 import name a path this repo does not have:
  web/e2e/tests/offline.e2e.ts
      ../../src/lib/offline-seats
```

That file is reveal-or-die's own, it imports the seat model by RELATIVE path (e2e is outside `$lib`), and the template's rename of `offline-seats.ts` therefore touched nothing it could conflict with. Same shape as 2026-09-09 and 2026-09-23: a hunk that merges cleanly and reports nothing. First time it was caught at the moment of the mistake rather than one step later by `check`.

**The generalisable part is the RELATIVE import.** Both earlier incidents were `$lib/...` specifiers, and it would have been easy to build a check that only resolved those; this one was `../../src/lib/...` from `web/e2e`, which is the same file by another spelling. A check scoped to the alias would have reported success here.

## The paragraph the check arrived with was false one level down

The same commit added an `AGENTS.md` section explaining the check, written in the template where it now lives:

> in 2026-09-23 five files arrived as clean ADDS carrying nine imports of `$lib/placement`, which is **THIS repo's game** and a directory that one had deleted long ago

True in the template. Cascaded into reveal-or-die it claims `$lib/placement` is reveal-or-die's game, which is precisely the confusion the task had already asked to fix in the checker's own error message ("the error message names `$lib/placement` as the template's game, which is true in the template and would read as nonsense in a descendant"). The brief caught the tool's wording and not the documentation's.

**So: a paragraph that cascades cannot say "this repo".** It reads as the repo you are in, and it is the repo it was written in. Both repos are named now, and the section is byte-identical on both sides, which is also what stops it conflicting on every future cascade - the resolution and the upstream fix have to be the SAME TEXT or the conflict is permanent.

This is the documentation form of `a-file-identical-everywhere-must-not-name-one-games-answer.md`. That note is about code naming one game's answer; this is about prose naming one repo's position. The tree already knew the code half.

## What to do with it

- When writing anything into a file that cascades, read it once as though from the last repo in the tree. "This repo", "here", "the template's" and "ours" are the words to look for.
- When resolving such a paragraph in a descendant, write the text you intend to put upstream, then put it upstream in the same session. Divergent-but-correct is a conflict for ever; identical is a clean merge.
- A dangling-import check must resolve relative specifiers as well as aliased ones. This one does, and that is now measured rather than assumed.
