---
title: The vite config was a conflict zone for the whole tree, and now has a plugin seam
type: observation
status: fixed
spotted: 2026-09-09
relates-to: work/specs/proposed/games-on-this-foundation.md (D11, N1), jolly-roger
---

# `web/vite.config.ts` is where `with/pixi-js` pays, and the fix is not in this repo

The sprite pipeline is a **vite plugin**. So putting it on `with/pixi-js` means
the branch edits `web/vite.config.ts`, and that file is the one this tree has
already identified as the worst possible place to hold a difference:

- It is **byte-identical to jolly-roger's** here. Verified this session:
  `git diff stem/with/local-signer -- web/vite.config.ts` is empty.
- reveal-or-die **restructured it wholesale** (its own note in
  `vite.assetpack.ts` says the art build used to be ~300 lines inside it).
- So it is developed upstream, diverged downstream, and now needs a third
  version on a branch in the middle.

That makes it a permanent conflict site in exactly N1's sense, and unlike the
renderer selector (`placement/render/index.ts`, which is this repo's own file
and which nothing upstream will ever touch) it is a file that keeps changing
under us for reasons that have nothing to do with art.

## What the branch actually did, and why

It edits `vite.config.ts`, and accepts the conflict. Two lines: an import and a
push into `plugins`. Everything else lives in `vite.assetpack.ts`, which is a
file no other node has, so it can never conflict.

The alternative was considered and rejected **for this phase**: give `main` a
`vite.plugins.ts` that `vite.config.ts` imports, so the branch adds a file
instead of editing a shared one. That is strictly better for the branch and
strictly worse for the repo, because it moves the divergence from
`main`-vs-branch to `main`-vs-jolly-roger, on the same file, forever. Trading a
conflict with a branch we own for a conflict with our own stem is not obviously
a trade worth making, and it is not a decision that should be taken as a side
effect of shipping a sprite.

## FIXED AT THE ROOT, 2026-09-09

Done at **`template-svelte`**, the root of the tree, not in jolly-roger as this
note first guessed and not on the branch. `web/vite.plugins.ts` exports
`extraPlugins()`, spread into the plugin list immediately before `sveltekit()`,
and it is empty there.

**The evidence that it belonged at the root was that every level had already
paid the same tax**, measured before writing it:

| repo | its entire change to `vite.config.ts` |
|---|---|
| `template-svelte-tailwind` | one import, one line: `tailwindcss()` |
| `template-svelte-shadcn` | inherited exactly that, added nothing |
| `jolly-roger` | the same `tailwindcss()` line |
| `conquest-website-2` | `enhancedImages()`, with a comment saying it must precede sveltekit |
| `reveal-or-die` | restructured the file wholesale to get ~300 lines of art build out of it |
| `with/pixi-js` | two lines for the sprite pipeline |

Six repos, four independent authors, and every one of them put its plugin in the
SAME SLOT between `devtoolsJson()` and `sveltekit()`. That is the seam saying
where it is.

**Two design points that turned out to be load-bearing.**

- **A function, not a constant array.** `vite.config.ts` is also the vitest
  config and declares `projects` that `extends` it, so it is evaluated several
  times in one process. A module-level array hands all of them the SAME plugin
  objects, and vite plugins hold per-build state.
- **The spread's POSITION is the contract.** Before `sveltekit()` is what
  Tailwind requires and what `enhancedImages` independently documented. Two
  plugins from two repos wanting the same guarantee is what makes it a contract
  rather than a default.

**What it bought, per repo:** `vite.config.ts` is now byte-identical across
`template-svelte`, `-tailwind`, `-shadcn`, `-tailwind-blog` and
`conquest-website-2`; and separately identical across `jolly-roger` (all four
branches), `bleeps`, `mandalas` and `template-commit-reveal` (both branches).
jolly-roger's group differs from the root's for a real reason that stays - it
imports `defineConfig` from `vitest/config` and adds the browser-test project.

**For `with/pixi-js` specifically**, the shared-file edit list did NOT get
shorter - it is still four - but `vite.config.ts` came off it and
`vite.plugins.ts` went on, which is the difference between a conflict site and a
switch.

**Verified per repo rather than assumed**, because `check` and unit tests pass
whether or not a plugin runs: Tailwind's emitted CSS was measured in each repo
(21,434 bytes here, 110,949 in jolly-roger, 113/107/36 utility occurrences in
bleeps/mandalas/ronan-eth), `enhancedImages` was confirmed by 20 emitted `.avif`
files, and the sprite pipeline by a real build emitting the spritesheet and
rewriting the manifest. A probe plugin was also used at the root to prove the
seam is wired at all, since an indirection nobody has run is the thing most
likely to type-check and do nothing.

**One thing the cascade exposed:** `bleeps`, `mandalas` and `ronan-eth` have NO
`offshoot` config and therefore no `verify` command, so the fanout merged into
all three completely ungated. That is Phase 0's finding recurring in three repos
nobody had checked. Verified by hand this time; worth giving them configs.

## Where the fix was first guessed to live



**In jolly-roger, not here.** The general shape of the problem is not about
assets at all: it is that `vite.config.ts` in this tree is a template file that
every descendant needs to extend and none of them may edit cheaply. Two
candidate shapes, both jolly-roger's to choose between:

- an optional `./vite.plugins.ts` that the template's config imports if it
  exists, so extending the build is adding a file rather than editing one
- or the config taking its plugin list from a small exported constant, so a
  descendant's edit is one line in a known place rather than a hunk in the
  middle of a growing object literal

Either one would also retire reveal-or-die's reason for having restructured the
file, which is the second-order win: that restructure is why the file cannot be
merged down there today.

## Why this is written down rather than fixed

It is off this phase's path in the way the task explicitly named: the phase is
the renderer axis, and jolly-roger is a different repo with its own cascade. The
cost of leaving it is bounded and known (one two-line hunk, in one branch), and
the cost of fixing it in the wrong repo is a divergence from the stem that every
future merge pays.

**The trigger to act:** the second branch that needs to add a vite plugin. At
that point the same two lines exist twice, in two branches that have to be
combined at `with/all`, and it stops being a conflict and becomes a merge.
