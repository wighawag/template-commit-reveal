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

## Three fixes, none done

1. **Commit the localhost deployment records.** `ensure-deployments.mjs` was
   written expecting exactly this, and its own comment says so ("exporting the
   real records keeps one source of truth"). The cost is a directory of
   addresses and ABIs in git that a developer's own deploy overwrites locally.
   Cheapest, and it makes a fresh CLONE work too, which is the case that script
   exists for.
2. **Have `verify` deploy first.** Correct and far too slow for a gate; a gate
   nobody runs is worse than none.
3. **Let `ensure-deployments.mjs` fall back to the parent checkout's records**
   when it is running in a linked worktree. Narrow, and it makes the verify
   depend on a developer's machine state, which is what the whole worktree
   arrangement exists to avoid.

(1) is the recommendation. Whoever takes it should check what
`rocketh-export` writes for a chain id 31337 deployment and whether the
addresses are stable across a fresh node, because a record that is wrong is
worse than none: `check` would pass against contracts that do not exist.
