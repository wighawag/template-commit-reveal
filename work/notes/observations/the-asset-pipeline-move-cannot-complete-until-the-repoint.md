---
title: The asset pipeline backport is a move whose second half is blocked on the re-point
type: observation
status: DONE 2026-09-11
spotted: 2026-09-09
relates-to: work/specs/proposed/games-on-this-foundation.md (Decision 2, D11, Phase 2)
---

# The pipeline can be taken up now; the descendants' copies cannot be deleted yet

> **DONE 2026-09-11, in the same commit as the re-point, and THE LIST WAS WRONG
> ABOUT ONE OF ITS THREE ITEMS.** This note said the load gate should go "to
> whatever extent the inherited versions actually cover them (this needs a diff
> at the time, not an assumption now)". That hedge earned its keep: the diff says
> they do not.
>
> | item | what happened |
> |---|---|
> | `reveal-or-die/web/vite.assetpack.ts` | **deleted**, replaced by the branch's 225-line reconciliation. Same three path constants, same assetpack config, so the swap is safe; what it gains is conquest's `fixManifest` and the self-disable |
> | the `existsSync` / `writeEmptyManifest` block in `web/vite.config.ts` | **deleted.** Both decisions it made now live inside the plugin, and `extraPlugins()` arrives by merge, so what is left of this repo's edit to that file is `basicSsl` and `hookup()` |
> | `web/src/lib/world/render/assets.ts` | **deleted**, inherited at `$lib/game/render/pixi/assets.ts`. Checked rather than assumed: the same four exports with the same signatures, three consumers repointed |
> | `web/src/lib/ui/loading/` | **KEPT, and the list was wrong to put it in question** |
>
> **Why the load gate stays.** The inherited `LoadingGate.svelte` is 55 lines
> that put a progress bar over the CANVAS. reveal-or-die's `ui/loading/` is 288
> lines of branded, staged, full-screen splash with a logo, a stage machine and a
> first-visit memory in localStorage. They are not two copies of one thing; they
> are a framework gate and a game's brand, and Decision 2 leaves brand with the
> game. The inherited gate's own doc comment says exactly that, having been
> written with this repo's splash in front of it.
>
> Both read the same progress store, and the splash outlasts the gate by
> construction (it waits on its own stage machine as well as on the store), so
> the gate is never visible from behind it. Redundant-but-invisible, at 55 lines,
> and removing it would cost a shared-file edit. Left alone deliberately.
>
> **conquest-v1's copy is still untouched and still legitimate**, exactly as this
> note says: it stems from jolly-roger directly and inherits nothing from here.
>
> The instruction to re-run against real art was followed: reveal-or-die has five
> authored sprites plus the template's `cell.png`, which now arrives in
> `assets/sprites/` and joins its atlas. See the observation on branch material
> cascading for why that was left rather than deleted.

Decision 2 states the rule this repo has already paid to learn: **a backport is
a MOVE, not a re-implementation, and the descendant's copy is deleted in the
same change.** The input recognisers are the worked example of what breaking it
costs.

D11 assigns the sprite pipeline to `with/pixi-js`, deduplicated out of
reveal-or-die (139 lines) and conquest-v1 (117). The first half of that is done.
**The second half cannot be done in this phase, and it is important that this is
recorded as a debt rather than discovered later as a duplicate.**

## Why the deletion is blocked

The deletion is only safe once the descendant INHERITS the thing being deleted.
Neither descendant does, and neither can yet:

| repo | stems from | inherits `with/pixi-js`? |
|---|---|---|
| `reveal-or-die` | `template-commit-reveal@main` | no |
| `conquest-v1` | `jolly-roger@main` directly | no |

reveal-or-die's `stemBranch` moves to `with/all` in this same phase, by D11's
own sequencing - but `with/all` does not exist until `with/nft-identity` does,
and the re-point is explicitly the last step of Phase 2. Deleting
`reveal-or-die/web/vite.assetpack.ts` before then does not move it anywhere; it
just removes a working art build from a finished game.

So the ordering is forced, and it is the plan's own ordering. What is NOT forced
is whether anybody remembers.

## The exact debt

Three deletions, all in the same change as the re-point:

- `reveal-or-die/web/vite.assetpack.ts` (139 lines), and the `existsSync` /
  `writeEmptyManifest` block in its `web/vite.config.ts` that calls into it
- reveal-or-die's load gate: `web/src/lib/ui/loading/` and
  `web/src/lib/world/render/assets.ts`, to whatever extent the inherited
  versions cover them (this needs a diff at the time, not an assumption now)
- `conquest-v1/web/vite-assetpack.ts` (117 lines) - but only if and when
  conquest moves onto this tree, which is "Ongoing" in the plan rather than
  Phase 2. Until then conquest keeps its copy legitimately, because it inherits
  nothing from here at all.

**The trigger is the `stemBranch` re-point**, and it should be treated as part
of that commit rather than as follow-up work.

## What makes this different from the input-recogniser failure

That one was undetected: two copies, five days, nobody diffing. This one is
written down before the duplicate exists, with the trigger named. The window
where the tree holds two copies is therefore deliberate and bounded, which is
the distinction Decision 2 actually draws - a re-implementation is
indistinguishable from a move *until somebody diffs it*, so the fix is to make
the diff scheduled rather than to hope.

## One thing to carry into the deletion

The branch's copy is not either descendant's verbatim: it is the reconciliation
of the two. In particular it takes **conquest's `fixManifest`**, which handles a
non-array `src` (reveal-or-die's assumes `src` is always an array and would
throw on a manifest shape it has not met yet), and **reveal-or-die's explicit
`OUTPUT_FOLDER`** rather than conquest's derivation from `publicDir`, because
SvelteKit's `static/` is the served root here and deriving it was the more
fragile half. When the descendants' copies are deleted, that is what they are
being replaced BY, and reveal-or-die should be re-run against real art rather
than assumed to be unaffected.
