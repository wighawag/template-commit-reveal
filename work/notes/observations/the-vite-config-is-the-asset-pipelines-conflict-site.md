---
title: The asset pipeline has to edit the one file the tree has already named a total conflict zone
type: observation
status: spotted
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

## Where the real fix lives

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
