---
title: A branch whose defining difference is reverted passes every gate in this tree
type: finding
status: open
spotted: 2026-09-11
relates-to: work/specs/proposed/games-on-this-foundation.md (N6, D11), jolly-roger `tooling`:check-shared-divergence.sh
---

# `check-shared-divergence.sh` looks for drift in one direction only, and the other direction is silent

Found by mutation while building `with/all` (Phase 2). The mutation was meant to
confirm that the integration node has teeth for BOTH axes. It does for the
identity axis. **It has none at all for the renderer axis, and neither does
anything else in the tree.**

## The mutation, and what survived it

`web/src/lib/placement/render/index.ts` is `with/pixi-js`'s entire reason to
exist: the one file that selects the pixi host instead of `main`'s canvas-2d
one. It is the `mode.ts`/`TARGET_STEP` shape applied to the renderer axis, and
it is the single entry on that branch's `ALLOWED` list.

Reverting it to `main`'s version - which is EXACTLY what a cascade does when a
conflict there is resolved the wrong way, the failure `check-shared-divergence.sh`
was written for - was measured against every gate this repo has:

| gate | result with the branch's whole point reverted |
|---|---|
| `pnpm --filter ./web check` | **0 errors, 0 warnings** |
| `pnpm --filter ./web test:unit` | **1491 passed in 126 files, plus 71 in 11** |
| `web/test/render-host-boundary.test.ts` | **2 passed** |
| `check-shared-divergence.sh`, ritual `ALLOWED` | **"OK: 549 shared files checked, none drifted"** |
| `check-shared-divergence.sh`, `ALLOWED=` empty | names **12** files instead of 13, and says nothing about the 13th |
| `offshoot-fanout --verify` | green, because it is `check` + `test:unit` |
| e2e | would pass, and this is not a guess: D11 verified 51 of 51 on the immediate host |

So `with/pixi-js` and `with/all` can silently stop being pixi branches, and the
only thing that would ever tell anyone is a human opening the app and noticing
the board looks different - which it barely does, because both hosts draw the
same board.

## Why each gate misses it, since none of them is broken

- **`render-host-boundary.test.ts` is not the guard for this and should not be.**
  It binds to whichever host the selector names and asserts the play route only
  passes props that host declares. Both hosts declare `cellSize` and `gridCells`
  - the canvas-2d one accepts and ignores them, deliberately, which is the whole
  reason the route is byte-identical on both nodes. The test is doing its job;
  its job is a different one.
- **`check` and `test:unit` cannot see it by construction.** Both hosts are real,
  both compile, both are covered. There is no broken state to find.
- **The script only reports DRIFT.** `ALLOWED` means "this shared file is
  SUPPOSED to differ, here is why". A file on that list that has STOPPED
  differing has had its reason falsified, and the script has no opinion, because
  it never asks whether an allowed file still differs - it only subtracts it from
  the list of things to complain about.

That last one is the finding. **`ALLOWED` is an expectation, and the script only
enforces half of it.** Its own README says the failure it exists for is a cascade
whose conflicts were all resolved correctly and which still left a shared file
holding two versions of the same logic; this is the mirror image, a cascade that
resolved a conflict by throwing the branch's switch away, and it is strictly
quieter because the result is a tree where every file is identical and everything
is green.

## It is not this repo's problem, and jolly-roger's is worse

The hole is in the script, so it is every adopter's. Upstream the single
`ALLOWED` entry is `web/src/lib/core/connection/mode.ts`, which holds
`TARGET_STEP` - the one line that decides whether a signer exists at all. A
cascade that reverted it would turn `with/hosted-account` back into
`with/local-signer` with no error anywhere, and the symptom would be an
authentication mode silently not being the one the branch is named for. Same
mechanism, more at stake.

## The fix, which is cheap and belongs upstream

**Fail when a file on `ALLOWED` is identical to the base's.** Three or four lines
beside the existing comparison, and it turns `ALLOWED` from a mute list into a
two-sided contract: everything on it must differ, everything else must not.

It belongs on **jolly-roger's `tooling` branch**, not on the copy adopted here -
a local edit to an adopted tool is the divergence-by-copy the tool exists to
catch, one level up, and that is the route the `EXT` fix took on 2026-09-09
(`80a18e1`) including the documented one-line rebuild.

Two details for whoever writes it, both learned from the `EXT` fix's own
write-up:

- **Check it has teeth by running the case**, not by reading the patch: revert an
  `ALLOWED` file on a scratch branch and confirm the script names it. That is how
  this was measured, and the first attempt measured nothing, because the script
  compares REFS and the mutation was sitting uncommitted in the working tree.
- **An absent file must stay legal.** The script already tolerates a shared file
  existing on one side only, and an `ALLOWED` entry that the feature branch
  DELETED is a legitimate state (the deletion is the difference). Only "present
  on both and byte-identical" is the error.

## What to do in the meantime

The `ALLOWED=` empty run already surfaces it, and nobody reads it that way. It
named twelve files where the README's table says thirteen, and that discrepancy
is the whole signal. So, until the script does it: **count the no-`ALLOWED` run
against the README's table, rather than reading it for surprises.** A number that
is too SMALL is as much a failure as a name that should not be there.

That is also the argument for the `with/all` README prescribing three runs rather
than one. Against each parent separately, a dropped switch shows up as a MISSING
drift in a list short enough to count by eye - one file, or twelve.
