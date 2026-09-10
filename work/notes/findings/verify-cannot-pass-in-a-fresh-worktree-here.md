---
title: offshoot-fanout --verify cannot pass in a fresh worktree in this repo
type: finding
status: open
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

## What to do until then, which costs nothing

**Verify by hand, and know that you are doing it.** That is what this session
did for `with/pixi-js`: deploy into the worktree the fanout leaves behind, run
`check` and `test:unit` there, and report the numbers. The e2e suite is
unaffected either way - it deploys and exports inside its own worktree, which
is why 51 of 51 passed there while `check` could not run at all.

**Or merge with the target branch checked out**, where a local deploy has
already left a `deployments.ts` behind. That is what every cascade before this
one happened to do, which is why nobody had met this.
