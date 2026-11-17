---
title: The e2e fixtures a game's own fixtures use, exported, and the transaction inspector's suite on the game's contract
slug: a-games-fixtures-on-the-stems
spec: games-on-this-foundation
---

# A game's e2e fixtures on the stem's

Built from stratagems' port plan, step C1 (`main`, `work/plans/join-template-commit-reveal.md`, section "Step C"), decisions C-5, C-6 and C-12 taken with the maintainer on 2026-11-15.

**The need**: stratagems kept modified copies of two shared e2e files, each a conflict on every cascade. Its own fixtures import `isWalletConnected` and `connectWalletDevMode` from `fixtures/test.ts`, which did not export them; and `tests/pending-operation.e2e.ts` drove the contracts page's write without asking for the game's contract, passing here only because `Game` sorts first (a latent defect: stratagems' `Gems` sorts before `Stratagems`, and reveal-or-die had already fixed its own copy).

**What changed here** (`main` cca00cf3): the two functions exported, with a note saying why; `pending-operation.e2e.ts` calls `selectContract(page)` before the Write tab. The account index range check C-5 also named was already in `connectPageAs` (from 2026-11-04), which `connectedPage` calls, so nothing was added for it.

## Done, 2026-11-15, on local preview branches `pc1/*`, since pushed

- `main` (from `origin/main` 94734fe5): jolly-roger `integration` merged twice (6944bf1e, 0ea456ef), carrying template-svelte's `check-stem-drift.mjs` (run by `apply-omissions.sh` during a merge; this repo's variant of that script merged with both halves kept, clean) and jolly-roger's `e2e-link-built.mjs`; then cca00cf3.
- Cascaded as `offshoot-fanout` merges, all clean: `with/pixi-js` 50b06acc, `with/nft-identity` 034cedc6, `with/fuzd` d77fa430, `with/indexer` ba29f069, `with/all` b0b4f2b5, `with/fuzd-pixi-indexer` 70d41990. reveal-or-die merged `with/all` (its own `pending-operation.e2e.ts` kept: it already selected its contract), bomber-world took it from there; stratagems takes `with/fuzd-pixi-indexer` in its step C2.

## Measured

Each node at its `pc1/*` head: check 0 errors and 0 warnings; unit the previous plus 12 (7 drift, 5 link): `main` 2092, `with/pixi-js` 2105, `with/nft-identity` 2102, `with/fuzd` 2134, `with/indexer` 2120, `with/all` 2115, `with/fuzd-pixi-indexer` 2175 (each + 84); `check-omissions`, the drift check against its stem and `check-dangling-imports` clean at every node. The full e2e: `main` 62 passed, `with/nft-identity` 62 passed, `with/fuzd-pixi-indexer` 68 passed (its fuzd stages included), run at the first pass of the cascade (the second changed only the drift check and the link script's formatting). The drift check run in stratagems against `with/fuzd-pixi-indexer`, before and after this cascade, reports exactly its three files left behind (`web/e2e/fixtures/stalling-wallet.ts`, `web/e2e/impersonate-addresses.json`, `web/src/routes/+page.svelte`); it reports nothing in reveal-or-die, bomber-world or any node here.
