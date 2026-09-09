---
title: check-shared-divergence.sh's first real run, and the one thing it cannot see here
type: finding
status: spotted
spotted: 2026-09-09
relates-to: work/specs/proposed/games-on-this-foundation.md (N6, D11), jolly-roger `tooling`
---

# It passes, and its `.ts` filter is the thing to watch in THIS repo

N6 says to adopt jolly-roger's `tooling` branch here and run
`check-shared-divergence.sh` once there is something to compare.
`with/pixi-js` is that something, so this is its first run in this repo.

## What it found

Adopted as a local orphan branch `tooling` (from `stem/tooling`, no shared
history with anything, so it can never arrive through a merge).

| run | `WATCH` | result |
|---|---|---|
| defaults | jolly-roger's connection + transaction paths | 42 shared files, none drifted |
| the ritual | `game/render` + `placement/render`, `ALLOWED=placement/render/index.ts` | 16 shared files, none drifted |
| widest | all of `web/src` + `web/test` | **367 shared files, none drifted** |
| no `ALLOWED` | as the ritual | correctly names `index.ts` as the single drift |

So the branch is `main`, plus files `main` does not have, plus exactly one
switched file - which is the `with/hosted-account` shape Decision 3 sets as the
acceptance criterion, and the same shape as `mode.ts`/`TARGET_STEP` upstream.

**The no-`ALLOWED` run is the one worth keeping**, because it is the check
checking itself: it proves the 367 clean files are clean because they are
identical, not because the script matched nothing.

## The gap: it compares `.ts` and nothing else

`grep '\.ts$'` is hardcoded in the file list, and the script says why:

> `.svelte` is deliberately NOT watched. Apps are expected to restyle their own
> wallet flows, which is why the extraction seam was drawn at `.ts`.

That reasoning is exactly right for the layer it was written for - a connection
layer whose `.svelte` files are wallet dialogs that every app repaints. **It
does not transfer to a RENDER branch**, where the interesting shared files
include `routes/play/+page.svelte` and the canvas hosts, and where the whole
affordability argument rests on the page being byte-identical on both nodes.

Not a theoretical worry: keeping that page identical is what
`web/test/render-host-boundary.test.ts` was written for, and the two props it
protects (`cellSize`, `gridCells`) are exactly the kind of thing a cascade could
quietly resolve in one branch's favour.

**Checked by hand this time**: 158 shared `.svelte` files between `main` and
`with/pixi-js`, none drifted. So nothing is wrong today; what is missing is the
thing that would tell us.

### What to do about it, and what not to

Do NOT edit the script on this repo's `tooling` branch to widen the filter. It
is jolly-roger's file, adopted verbatim, and a local edit is the same
divergence-by-copy the script itself exists to catch - one level up.

Two honest options, in order of cost:

1. **Make the filter configurable upstream** (`EXT="${EXT:-ts}"` or a glob), so
   this repo passes `.ts` and `.svelte` and jolly-roger's default is unchanged.
   Small, and it is the change that makes the tool serve a second kind of
   branch, which is the point at which a shared tool has earned its generality.
2. **Leave it, and cover the specific invariant with a test**, which is what has
   actually been done: the boundary test binds to whichever host the selector
   names, so it fails from either side. That is stronger than a diff for this
   one property and covers nothing else.

The two are complementary rather than alternatives. (1) is worth doing when
something else in this tree needs it; the trigger is a branch whose intended
difference is in a `.svelte` file, which `with/nft-identity` may well be, since
identity acquisition is a UI.

## The other half of N6, which is still true and still not built

The plan already records it: **both instances of the failure this script exists
for happened ACROSS a repo boundary** (the input recognisers, and the two
refresh helpers), where it does not look. This run does not change that. What it
adds is a data point about cost: the widest run compared 367 files in well under
a second, so a cross-repo mode is cheap to run once somebody writes the ref
plumbing to compare a descendant against its stem.
