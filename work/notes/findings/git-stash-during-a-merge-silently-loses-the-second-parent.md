---
title: git stash during a conflicted merge silently loses the second parent, and the next cascade replays the whole history
type: finding
status: OPEN
spotted: 2026-09-17
relates-to: the cascade ritual in every README here, reveal-or-die
---

# The tree was right, the history was wrong, and only the NEXT merge said so

## What happened

Resolving the chunked-reveal merge into reveal-or-die, in the middle of the
conflicted merge and before committing it, I wanted to know whether a
`format:check` failure was mine or pre-existing. So:

```sh
git stash -q && pnpm format:check ; git stash pop -q
```

**`git stash` clears `MERGE_HEAD`, and `git stash pop` does not put it back.**
The resolutions came back intact, so `git status` looked exactly as it had, and
`git add -A && git commit` then produced an ORDINARY COMMIT with one parent
instead of a merge with two.

Every gate passed. `check` was clean, 1,695 unit tests passed, the contracts
suite passed, the whole e2e suite passed. The tree was correct in every byte.

**It was found by the NEXT merge**, which was a one-paragraph Markdown change
upstream and arrived as thirty conflicted files and a 7,700-line diff, because
git's merge base had fallen back to the previous cascade: from git's point of
view the template's work had never been merged at all.

## Why it matters more here than it would elsewhere

This tree cascades by merge, repeatedly, into branches and into descendant
repos, and the value of every one of those merges is that git knows what has
already arrived. A lost second parent does not corrupt anything; it makes every
future cascade into that repo re-conflict the entire template history, and the
person doing it has no way to know why. Worse, it invites resolving those
conflicts again, by hand, against a tree that already holds the right answer.

**No gate in this tree can see it.** It is not a code fact, so `check`, the unit
suites, the contracts suite, the e2e suite and `check-shared-divergence.sh` are
all blind to it by construction: they look at the working tree, which was right.

## What to do instead

- **Never `git stash` inside a conflicted merge.** To compare against the
  pre-merge state, read it out of git rather than moving the working tree:
  `git show HEAD:<path>`, or run the command in a throwaway worktree
  (`git worktree add /tmp/x HEAD`). Both answer the same question and neither
  touches `MERGE_HEAD`.
- **Check the parents before believing a cascade landed**, which is one command
  and belongs in the ritual next to the suites:

  ```sh
  git log -1 --format='%h parents: %p'   # a merge has TWO
  ```

- If it has already happened, the fix keeps the verified tree and repairs only
  the history: tag the resolved commit, `git reset --hard` to the pre-merge
  commit, redo `git merge --no-commit --no-ff`, `git read-tree --reset -u <tag>`
  to restore the exact tree that was verified, then commit. `read-tree` touches
  the index and working tree only, so `MERGE_HEAD` survives it and the result is
  a real merge whose tree is byte-identical to the one that passed.

## The general shape

A green suite is evidence about the TREE and says nothing about the HISTORY, and
this tree's cascade machinery runs on the history. That is the same blind spot
`check-shared-divergence.sh` exists for, one level out: there it was a file that
merged cleanly and was still wrong, here it is a merge that committed cleanly and
was still not a merge.
