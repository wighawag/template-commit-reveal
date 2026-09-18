---
title: A generated deployments.ts from the wrong branch fails `check` as ONE plausible error, not as a pile of missing contracts
type: finding
status: recorded 2026-09-18
spotted: 2026-09-18
relates-to: HANDOFF.md ("Environment gotchas", the deployments.ts recipe), work/notes/findings/verify-cannot-pass-in-a-fresh-worktree-here.md, work/specs/proposed/games-on-this-foundation.md (Phase 4)
---

# The symptom this tree writes down is the loud one, and the quiet one costs more

**What every document here says to expect.** `web/src/lib/deployments.ts` is generated and gitignored, so after a branch switch it must be rebuilt or "`check` fails naming contracts that do not exist on that branch". That is true, it is the common case, and it is self-announcing: the error names `deployments.contracts.SomethingOrOther` and the fix is obvious from the message.

**What actually happened, in jolly-roger, during Phase 4's cascade.** `pnpm i` on `main` generated the file from that branch's committed sepolia records. Switching to `with/local-signer` - which commits NO deployment records, so the install-time fallback cannot regenerate it and leaves the existing file alone - left main's generated file in place. `check` then reported:

```
svelte-check found 1 error and 0 warnings in 1 file
web/src/routes/demo/lib/setGreeting.ts:141:5
Error: No overload matches this call.
    Object literal may only specify known properties, and 'contract' does not
    exist in type '{ transaction: ... }'.
```

**One error, in a file the merge had not touched, about an overload of a helper that has nothing to do with deployments.** It reads exactly like a real API regression arriving from upstream, and the obvious next move - reading `ensureCanAfford`, diffing the merge, looking for what changed the overload - is a dead end, because nothing changed. A local deploy and a real export made it disappear.

**Why it has this shape.** The generated file's contract map is a TYPE, and the app's helpers are generic over it. Hand them a map from another branch and the failure surfaces wherever inference bottoms out, which can be a single call site a long way from anything named `deployments`. The count is the tell and it is counter-intuitive: MANY errors naming contracts means the file is missing or empty, ONE error naming nothing relevant means the file is present and wrong.

**Two things this cost, both worth avoiding next time.**

- It was briefly read as a merge regression, inside a conflicted merge. The way out without `git stash` (which would have destroyed `MERGE_HEAD`, see the note next door) was to copy the two resolved files aside, `git merge --abort`, measure the branch clean, then redo the merge and restore them. That works and it is worth knowing before needing it.
- The first attempt to establish a baseline used a throwaway worktree at the pre-merge tip, which produced **29 errors in 11 files** - the fresh-worktree failure this repo already has a finding for, one repo up. A throwaway worktree is the right tool for reading a pre-merge FILE and the wrong one for reading a pre-merge SUITE, in any repo whose deployments are generated.

**The instruction that follows, and it is one line.** Regenerate `deployments.ts` after a branch switch BEFORE running anything, rather than after `check` complains - because the version of the complaint that points at the cause is not the only version there is. `REPO=<root> bash regen-deployments.sh <port>` works unchanged in jolly-roger, which was not obvious either: the script is written for this repo and its assumptions (rocketh, `node:local`, `pnpm export --ts`) hold one level up.
