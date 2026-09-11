---
title: offshoot-fanout --verify cannot pass in a fresh worktree in this repo
type: finding
status: DECIDED 2026-09-12 (option 6); not yet built
spotted: 2026-09-10
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 0, the verify gate), scripts/ensure-deployments.mjs
---

# The cascade gate is structurally unable to run here, and it does not say so

**Measured, not predicted.** After cascading `main` into `with/pixi-js` on
2026-09-10, the merged tree was verified by hand in the worktree the fanout
left behind (`/tmp/offshoot-fanout-worktrees/...`). The configured verify is

```
pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit
```

and `check` failed immediately with

```
Error: Cannot find module '$lib/deployments' or its corresponding type declarations.
```

plus a cascade of viem type errors that are all consequences of it.

## Why

`web/src/lib/deployments.ts` is GENERATED and gitignored. `pnpm install` runs
`scripts/ensure-deployments.mjs`, whose whole job is to give a fresh clone one -
and it does that by exporting from **the deployment records committed to this
repo**. This repo commits none: `git ls-files contracts/deployments` is empty,
and a linked worktree gets no untracked files, so the script finds nothing,
explains itself and gets out of the way exactly as designed.

So in a fresh worktree there is no `deployments.ts`, `check` cannot resolve it,
and the gate fails for a reason that has nothing to do with the change being
cascaded.

## Why this has not been noticed before

Every node cascaded so far was merged with the branch CHECKED OUT, in the
developer's own working copy, which has a `deployments.ts` from their last local
deploy. The fanout only uses a temporary worktree when the target branch is not
checked out - which is exactly the case for a repo with three branches and one
working tree, and it is the case that will be normal from now on.

## What it means

- **`--verify` has been reporting on the checkout, not on the tree.** Where the
  branch was checked out it verified something real; where it used a worktree it
  cannot have passed. This session's cascade was verified BY HAND after
  exporting a deployment into the worktree: `with/pixi-js` is green (check 0,
  unit 1483 in 125 files plus 71 in 11, contracts 19 passing).
- It is the second time a gate in this tree turned out to be off (Phase 0 found
  three repos with no `verify` command at all), and the shape is the same: the
  gate reported success because it never ran the thing.

## Four options, and THE ONE THIS NOTE FIRST RECOMMENDED IS WRONG

The first version of this note recommended committing the deployment records,
on the strength of `ensure-deployments.mjs`'s own comment ("exporting the real
records keeps one source of truth"). **That recommendation was made without
measuring them**, and the measurement kills it. Corrected 2026-09-10, before
anybody acted on it.

`contracts/deployments/localhost` is **1.3 MB across 12 files**, and the content
is not addresses: one record is 67 KB of which the ABI is 25%, the rest being
`bytecode`, `deployedBytecode`, `metadata`, `storageLayout` and `solcInput` -
the last being the inlined source of every dependency the contract compiles
from. It regenerates on every contract change and it differs per BRANCH, since
each branch deploys different contracts. Committing it means a megabyte of
churning generated JSON with a conflict on every feature branch forever, which
is N1's own warning being ignored to fix a gate.

| option | cost | verdict |
|---|---|---|
| **1. commit the RECORDS** | 1.3 MB per branch, conflicts forever | **rejected on measurement** |
| **2. verify deploys first** | a node and a chain per verified node | rejected: a gate too slow to run is a gate nobody runs |
| **3. fall back to the parent worktree's records** | machine state, and FALSE FAILURES: the main worktree is usually on a different branch, whose contracts are different ones | rejected, and worse than it looks |
| **4. commit the EXPORT, not the records** | ~170 KB per branch, changes only when the ABI does | the shape to think from |
| **5. synthesise from the compiled ABIs at install time** | a compile in verify (~40s), plus a script that knows `rocketh-export`'s output shape | the other candidate |

**Option 4 is option 1 done to the right artifact.** What `check` and
`test:unit` need is `web/src/lib/deployments.ts` (~170 KB: chain, addresses,
ABIs, linkedData) and not the records it was exported from. It cannot be
committed AT THAT PATH, because `deploy:watch` rewrites it continuously and a
developer's tree would be permanently dirty - so it would be a committed
SNAPSHOT elsewhere that `ensure-deployments.mjs` copies into place when the
real file is absent, exactly as it already copies an export today. Refreshing
it becomes a deliberate command when contracts change. The risk it carries is
the one worth naming: a snapshot that has drifted from `src` makes `check` pass
against an ABI that no longer exists, which is worse than `check` failing.

**Option 5 has no artifact and therefore cannot drift**, because it is derived
from the same source `check` is checking. It buys that with a second copy of
`rocketh-export`'s output shape, which is precisely what that script's author
rejected for a hand-written stub - though a thin one (a chain block and a map
of `{address, abi, linkedData}`) exercised by every verify run is a different
proposition from a stub nobody runs.

**Not decided here, and deliberately not decided at the end of a session that
found it.** Both touch `main` and cascade to every branch, and the choice turns
on how much a stale snapshot frightens you against how much a duplicated shape
does. Whoever takes it should also check whether a synthesised deployment can
satisfy `resolvePlacementConfig`, which reads `linkedData` at RUNTIME through
casts: an empty `linkedData` type-checks and would make the unit suite's
config readers fail rather than the type checker.

## DECIDED 2026-09-12, and it is neither of the two candidates

**The measurement the previous entry asked for was made, and it killed option 5
and produced a better option than option 4.**

The question was whether a deployment synthesised from the compiled ABIs could
satisfy `resolvePlacementConfig`, which reads `linkedData` at RUNTIME through
casts. It cannot, and the failure is exactly the shape predicted:

| with every `linkedData` blanked | result |
|---|---|
| `pnpm --filter ./web check` | **0 errors, 0 warnings** |
| `pnpm --filter ./web run test:unit` | **6 failed in 2 files**, 1488 passed |

The six are `test/lib/context/fatal.test.ts` and `test/lib/context/ssr-context.test.ts` -
the context-construction tests, which build the real config. So a synthesised
deployment would leave `check` green and the unit suite permanently red, which is
the same disease this note is about: a gate that cannot pass.

**Why option 5 cannot be rescued: `linkedData` is not in any ABI.** It is what
the DEPLOY declared - `startTime`, `commitPhaseDuration`, `revealPhaseDuration`,
the token address, `placementCost`, and the sale's `price` and `amount`. Nothing
derives those from a compile, and a synthesiser that invented plausible values
would be a stub that silently disagrees with the deployment, which is the drift
risk that was supposed to be option 5's advantage over option 4.

### The measurement that decides it: 98% of the export is ABI

```
full export      165 KB
  of which abi   162 KB     <- derivable from a compile
  linkedData     422 bytes  <- 2 blocks, and NOT derivable
  chain block    426 bytes  <- properties incl. expectedWorstGasPrice
```

**So the part that cannot be synthesised is under a kilobyte**, and the part that
makes option 4 expensive is exactly the part option 5 can generate.

### Option 6, which is the recommendation

**Synthesise the ABIs and addresses from the compiled artifacts at install time,
and COMMIT the ~1 KB that cannot be derived** (each contract's `linkedData`, the
chain's `properties`, and the addresses).

It takes the strength of each rejected option and drops the cost of both:

- **It cannot drift in the way that killed option 4.** The 162 KB of ABI is
  generated from the same source `check` is checking, so a committed snapshot can
  never describe a contract that no longer exists. That was the one risk worth
  naming about option 4 and it is gone.
- **It passes the unit suite**, which option 5 cannot, because the deployment
  parameters are real rather than invented.
- **It churns almost never.** The committed kilobyte changes only when a deploy
  PARAMETER changes - a phase duration, a price - which is a deliberate act,
  where the ABI changes on every contract edit. Option 4's snapshot changes
  every time either does.
- **~1 KB per branch against option 4's 170 KB and option 1's 1.3 MB.** N1's
  warning about churning generated files in shared paths stops applying at this
  size.

**What it costs, stated rather than hidden:** a script that knows
`rocketh-export`'s output shape, which is precisely what that script's author
rejected for a hand-written stub. The counter-argument the note already makes
still holds and is stronger here - a shape exercised by every `verify` run on
four branches is a different proposition from a stub nobody runs - and the
surface is now much smaller than option 5 implied, since only the assembly is
hand-written and the ABIs come out of the toolchain.

**Two things to check when building it**, neither measured yet: whether contract
ADDRESSES need to be real or whether deterministic placeholders satisfy the six
tests (blanking `linkedData` alone accounts for all six, so addresses may be
free), and whether `ensure-deployments.mjs` can assemble this without a compile
on a fresh clone - if it needs one, that is ~40s added to every `verify`, which
is option 5's cost reappearing.

**Not built here.** It touches `main` and cascades to four branches, and the
sibling finding argues the e2e type-check is the gate to widen first - it is open
in every repo of the tree rather than only in worktrees, and a perfect `verify`
would still have missed the bug that mattered in Phase 2's last cascade.

## The reasoning that led here, kept because the options table is still the argument

### Previously: NOT DECIDED, 2026-09-11, and the reason is sharper than "nobody has picked"

Phase 2's last two nodes did not need it decided, exactly as the task expected,
and verifying by hand cost nothing. Three things that session learned, all of
which narrow the question rather than answering it:

- **The asymmetry is now permanent rather than incidental.** The cascade
  `main -> {with/pixi-js, with/nft-identity} -> with/all -> reveal-or-die` merged
  the three template branches in TEMPORARY WORKTREES (none is checked out; there
  is one working tree and four branches) and reveal-or-die IN PLACE, because its
  `main` is checked out. So in one run, `--verify` genuinely verified the
  descendant and could not have verified any of the three branches. That is not
  a transitional state - it is what this repo's shape produces from now on.
- **It was not needed this time, and it would have been the wrong gate anyway.**
  The bug that mattered in that cascade was in `web/e2e/**`, which `check` does
  not type-check at all (see the sibling finding). A verify that ran perfectly
  would still have been green on it.
- **That is a reason to widen the gate before fixing this one.** Both options
  here cost a change on `main` that cascades to four branches; the e2e
  type-check costs one at the root of the tree and closes a hole that is open in
  every repo, not just in worktrees. If only one of the two gets done, it should
  be that one.

**What would settle THIS one, unchanged and still unmeasured:** whether a
synthesised deployment (option 5) can satisfy `resolvePlacementConfig`, which
reads `linkedData` at RUNTIME through casts. An empty `linkedData` type-checks,
so the failure would land in the unit suite's config readers rather than in the
type checker - which is a half-hour of measuring and would decide it either way.

## What to do until then, which costs nothing

**Verify by hand, and know that you are doing it.** That is what this session
did for `with/pixi-js`: deploy into the worktree the fanout leaves behind, run
`check` and `test:unit` there, and report the numbers. The e2e suite is
unaffected either way - it deploys and exports inside its own worktree, which
is why 51 of 51 passed there while `check` could not run at all.

**Or merge with the target branch checked out**, where a local deploy has
already left a `deployments.ts` behind. That is what every cascade before this
one happened to do, which is why nobody had met this.
