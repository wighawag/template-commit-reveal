---
title: A node with both fuzd and pixi, a smooth pixi host, and a render-host boundary test every game keeps unedited
slug: with-fuzd-pixi-and-a-smooth-pixi-host
spec: games-on-this-foundation
blockedBy: []
---

# stratagems' renderer needs pixi, fuzd and smooth art, and no node had the three

Drafted and decided in stratagems as P9-1, P9-2 and P9-9 of its step 9 (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, the section "Step 9" has every decision with the alternative rejected), decided with the maintainer on 2026-10-31, and refined by that step's item 1 (the measurements).

## What was missing

- **No node had both fuzd and pixi.** stratagems stems from `with/fuzd`; pixi lives on `with/pixi-js`; `with/all` is `with/pixi-js` with `with/nft-identity`. Adding fuzd to `with/all` would bring it to reveal-or-die and bomber-world (and the identity axis to stratagems); copying pixi into stratagems is a divergence by copy.
- **The pixi host could only draw pixel art**: `resolution: 1`, no antialiasing, rounded positions and `image-rendering: pixelated`, all fixed. stratagems' chosen look is smooth (gradients, fine rings).
- **`render-host-boundary.test.ts` named the selector by path** (`src/lib/placement/render/index.ts`), so every game either edited it (reveal-or-die: `world/render`) or omitted it (stratagems).

## Done, 2026-10-31, on local preview branches `p9/*`, NOT pushed

- **`main`**: the boundary test finds the selector through the play page's `import {loadCanvasComponent} from '$lib/...'`, resolving `$lib/a/b` to `src/lib/a/b.ts` or `src/lib/a/b/index.ts`, with four cases of its own (`6bc08808`). The canvas-2d host accepts `smooth` and ignores it, so the two hosts keep the same props (`4e0990cf`).
- **`with/pixi-js`**: `smooth` on `PixiCanvas.svelte`, its settings a pure function in `pixi/surface.ts` with four cases: pixel art by default; smooth is the device ratio, antialiasing, unrounded positions and `image-rendering: auto`. Never `autoDensity`: with the host's `resizeTo: canvas` it locks the canvas at pixi's default 800 by 600 (measured). Texture filtering stays `nearest` by default in `assets.ts`; a smooth game sets `linear` on the textures it makes. README paragraph (`1bf49544`).
- **`with/fuzd-pixi`**, a new node: `with/fuzd` merged with `with/pixi-js` (one conflict, the lockfile, regenerated), plus `README.fuzd-pixi.md`. Its diff against the union of its parents is empty but for `web/package.json` (both parents' lines) and the lockfile. `offshoot` lists it, stemming from `[with/fuzd, with/pixi-js]`.
- **Cascaded**: `with/fuzd`, `with/nft-identity`, `with/all`; reveal-or-die `main` (its edited boundary test resolved to the template's file, so the edit is gone) and bomber-world `main` (clean).

**Measured** (check 0 errors and 0 warnings everywhere, unit server + client): `main` 1908 + 78; `with/pixi-js` 1921; `with/fuzd` 1949; `with/nft-identity` 1916; `with/all` 1929; `with/fuzd-pixi` 1962 (+ 78 each); reveal-or-die 2068 + 72, bomber-world 2116 + 72, the boundary test passing in both unedited.

**Found on the way**: pixi 8.22 falls back by itself to its Canvas renderer when WebGL cannot start, drawing everything but filters (skipped with a warning); a pixi game that wants a no-WebGL fallback needs no second host, only a look without filters. And `with/nft-identity`'s first `pnpm install` in a fresh worktree again left no `deployments.ts` (the observation already filed); the second was fine.
