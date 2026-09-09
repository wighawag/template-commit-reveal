---
title: check-shared-divergence.sh's first real run, and the one thing it cannot see here
type: finding
status: fixed
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

### FIXED UPSTREAM, 2026-09-09, which was the only correct place

Not by editing this repo's `tooling` branch. That copy is adopted verbatim and a
local edit would be the same divergence-by-copy the script exists to catch, one
level up - so the change went to **jolly-roger's `tooling` branch** (`80a18e1`)
and was pulled back here with the documented one-line rebuild, which also tested
that instruction.

`EXT` is now a space-separated list defaulting to `ts`, so jolly-roger's own
behaviour is unchanged - verified rather than assumed: its run reports the same
80 shared files and the same allowed `mode.ts` before and after. This repo's
ritual passes `EXT="ts svelte"` and covers **530 shared files instead of 367**.

**Checked for teeth**, because a checker that cannot fail is worse than none. A
deliberate one-line drift added to `routes/play/+page.svelte`: `EXT="ts svelte"`
reports DRIFTED and names it; the default reports "231 shared files checked,
none drifted". That is the blind spot, demonstrated rather than argued.

One detail worth keeping, because writing the guard did not prove it worked. The
first test of "empty EXT must be refused" PASSED FOR THE WRONG REASON:
`${EXT:-ts}` turns an empty value back into the default, so `EXT=` never reaches
the guard and safely falls back. Only `EXT='  '` can reach an empty pattern. The
guard is real and reachable, and the comment now says which case it is for -
found by running the case rather than trusting code I had just written.

The boundary test remains the better protection for the one specific invariant
(it binds to whichever host is selected, so it fails from either side); the two
are complementary rather than alternatives.

## The other half of N6, which is still true and still not built

The plan already records it: **both instances of the failure this script exists
for happened ACROSS a repo boundary** (the input recognisers, and the two
refresh helpers), where it does not look. This run does not change that. What it
adds is a data point about cost: the widest run compared 367 files in well under
a second, so a cross-repo mode is cheap to run once somebody writes the ref
plumbing to compare a descendant against its stem.
