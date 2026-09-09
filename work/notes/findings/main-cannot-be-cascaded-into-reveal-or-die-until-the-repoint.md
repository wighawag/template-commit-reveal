---
title: main is not mergeable into reveal-or-die until its stemBranch is re-pointed
type: finding
status: open
spotted: 2026-09-09
relates-to: work/specs/proposed/games-on-this-foundation.md (D11, Phase 2)
---

# Do not cascade `template-commit-reveal@main` into `reveal-or-die` yet

**This is a live hazard with a known fix and a known owner, not a defect.** It
is created by D11's own sequencing and it closes at the end of Phase 2. Written
down because the cascade is a habit, `offshoot-fanout` will offer it, and the
person who runs it next may not be the person who made it true.

## What happens, measured rather than predicted

Measured on 2026-09-09 in a throwaway detached worktree of reveal-or-die,
merging `template-commit-reveal@main` at `b0e527f1`, then removed. reveal-or-die
was left clean and untouched at `4b98f8d`.

`offshoot-fanout --dry-run` reports:

```
✗ reveal-or-die@main CONFLICT — conflict in 3 file(s)
   pnpm-lock.yaml
   web/package.json
   web/src/lib/placement/render/index.ts
```

The three conflicts are all resolvable and none of them is the problem:

- `web/src/lib/placement/render/index.ts` is a **modify/delete**: reveal-or-die
  deleted `lib/placement/` wholesale, as designed, and `main` edited the file.
  Keep the deletion.
- `web/package.json` and `pnpm-lock.yaml` conflict because `main` **removed
  `pixi.js`** while reveal-or-die declares it too. Keep reveal-or-die's.

**The problem is a hunk that merges CLEANLY.** `main` deleted
`web/src/lib/game/render/pixi/PixiCanvas.svelte` and `world.ts`, and that
deletion applies without complaint - while `reveal-or-die/web/src/lib/world/render/index.ts:27`
still says:

```ts
import('$lib/game/render/pixi/PixiCanvas.svelte');
```

So after a merge that reported only three conflicts, all correctly resolved, the
game has a dangling import of its own canvas and fails `check`. Confirmed: the
file is absent from the merged tree.

This is `check-shared-divergence.sh`'s own lesson in its other form, and the
README says it out loud: **conflicts get attention, clean auto-merges do not.**
Here the clean part is a DELETION, which is the variant neither that script nor
the cascade ritual looks for - the script compares files two branches share, and
this file is shared by nobody after the merge.

## The fix, which is already in the plan

reveal-or-die's `stemBranch` moves from `main` to `with/all`, which carries
`with/pixi-js` and therefore the host again. D11 states this explicitly:

> **Phase 2 changes shape.** reveal-or-die needs pixi AND a token identity, so
> its `stemBranch` points at `with/all`, not at `with/nft-identity`.

So the ordering is: `with/pixi-js` (done), `with/nft-identity`, `with/all`,
then re-point. Until the re-point, **`main` is a node reveal-or-die must not
merge from.**

`with/pixi-js` alone would also fix the import, and re-pointing there as a
stopgap is possible - but it would have to be re-pointed again at `with/all` a
step later, and a `stemBranch` that moves twice is two chances to leave a
descendant on the wrong node. Not recommended unless reveal-or-die needs an
unrelated change from `main` before `with/all` exists.

## What WOULD catch it, which the first version of this note understated

It said "nothing in the tree looks for this". That is wrong, and the correction
matters because it changes what is worth building.

**`offshoot-fanout --verify` would catch it.** reveal-or-die's configured verify
is `pnpm install && pnpm --filter ./web check && pnpm --filter ./web run
test:unit`, and `svelte-check` fails on the dangling import - that is exactly
how the dangling import was confirmed. So the ritual already covers the tool
path.

**The gap is narrower and it is the HAND path.** The fanout stops at the
conflict without merging, so verify never runs; a human then resolves three
conflicts, all of which look routine, and has to remember to run `check`
afterwards. That is precisely the situation the plan already warns about for a
different reason - "if you merge by hand it reports up to date and verifies
nothing" - so the failure mode is a known one wearing a new hat.

The honest summary: **the guard exists, and it is one step further away than the
thing that goes wrong.** Which is an argument for the warning being where the
person is, not for a new checker.

Two cheap options if one is wanted anyway, neither built:

- resolve the descendant's imports of `$lib/game/**` against the stem's tree,
  as a test in the descendant, which is the same shape as the existing boundary
  tests and would fail on the merge rather than after it
- or a fanout post-merge step that greps the merged tree for imports of paths
  the merge deleted, which is generic and belongs in `offshoot-fanout`

The second is the more valuable, because this failure is not specific to
renderers: any level boundary that moves a file to a branch has it.
