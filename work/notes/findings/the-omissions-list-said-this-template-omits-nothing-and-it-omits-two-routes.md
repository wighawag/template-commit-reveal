---
title: The omissions list said "this template omits nothing", and it omits two routes - so the one conflict it exists to make a lookup had to be excavated instead
type: finding
status: FIXED 2026-09-25 in template-commit-reveal main, cascading
spotted: 2026-09-25
relates-to: work/notes/findings/an-inherited-paragraph-cannot-say-this-repo.md, work/notes/findings/a-required-declaration-cascades-with-the-templates-answer-in-it.md
---

# A file whose whole purpose is to answer "was this deletion deliberate?" answered "there are no deletions"

`.offshoot-omissions` ends with a line saying **"This template omits nothing - it is where the files come from."** Both halves are false, and they have been since the reference game landed. Files come from **jolly-roger**: this repo has a `stem` remote like every other node in this tree, it merges from it, and it DELETES the app demo it inherits because it ships a game in its place. Two paths, both of them routes:

- `web/src/routes/demo` - the app's greeting demo, replaced by `routes/play`
- `web/src/routes/offline-demo` - the same demo against a chain in the tab, replaced by `routes/offline`

## What it cost, which is exactly what the file's own header predicts

A cascade from jolly-roger touched `offline-demo/+page.svelte` (a comment, of all things) and stopped with `CONFLICT (modify/delete)`. That is the case the file was written for, and its header says so: "Listing the path here does not change what git does - the conflict still happens - but it makes the answer a lookup instead of an excavation, and `scripts/apply-omissions.sh` turns the resolution into one command."

The lookup returned nothing, so the excavation happened. And it was worse than the usual one, because **no diff in this repo's history records the deletion**. `git log --diff-filter=D -- <path>` finds nothing; `git log --full-history` lists only commits on the STEM's side of the graph, where the file still exists. The deletion lives in the resolution of an old stem merge, where `git show --stat <merge> -- <path>` prints nothing at all because the result matches one parent. The way it was finally established was to walk the last sixty commits asking `git cat-file -e <commit>:<path>` and find the boundary.

So the cost of the wrong sentence is not "one lookup missed". It is that the intent was recoverable only by a method nobody reaches for, in a repo where the cheap method was supposed to be a file you `cat`.

## Why the sentence was written, and why that reasoning does not survive

It is true of the ROOT of a template tree, and this repo is not one. It is the middle of a chain: `template-svelte` -> `-tailwind` -> `-shadcn` -> jolly-roger -> **here** -> reveal-or-die. The sentence is the same mistake as the one in `an-inherited-paragraph-cannot-say-this-repo.md`, one level up: a claim that is true at whichever level it was written and false one level down. Here it was not even true where it was written - it describes a position this repo has never occupied - which suggests it arrived by being copied from an ancestor that IS the root, along with the file.

**A general check falls out of it:** a repo that has a `stem` remote cannot honestly say it omits nothing without having looked. The one-command version is `git diff --name-status --diff-filter=D $(git merge-base HEAD stem/<branch>) stem/<branch> -- <dir>` , or more bluntly: if `routes/` differs from the stem's by whole directories, the list is not empty.

## The fix

Both paths are listed, each with the reason it is not carried, and the false sentence is replaced by the story above so the next reader knows the list was once wrong and why. `scripts/apply-omissions.sh` now resolves this conflict in one command, as designed, and `web/test/offshoot-omissions.test.ts` fails if either path comes back - which is what makes the record self-enforcing rather than another comment.

**What it does NOT fix, and this is the part worth carrying downstream:** the same thing is almost certainly true of reveal-or-die and of any other game in this tree. Every game deletes the template's game and writes its own, so every game has omissions, and a game whose list is empty has probably not looked rather than genuinely carrying everything. Check each one against its stem before the next cascade touches a deleted path, because the cost is paid at the worst moment - mid-merge, by whoever is least likely to know.

## What would have caught it earlier

- **Not the test.** `offshoot-omissions.test.ts` asserts that listed paths stay absent, so an EMPTY list passes forever. It guards against a listed omission being undone, not against an omission going unlisted, and it cannot do the second: there is no way to tell "deliberately absent" from "never existed" without the list that is missing.
- **Not the dangling-import check.** Nothing was broken; the routes are genuinely gone and nothing imports them.
- **A cascade that touched a deleted path**, which is how it was found, and which is the mechanism working one step too late.
- **A guard that compares the tracked tree against the stem's** would catch it, and is the obvious follow-up: whole directories present in the stem and absent here, not listed, is exactly the query above. It belongs beside `dangling-imports.mjs` for the same reason that check is repo-local rather than in `offshoot-fanout` - and with the same caveat, that the defect is the TREE'S rather than this repo's.
