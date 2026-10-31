---
title: A bytecode sandbox that runs a contract's own code off chain, and the reference game's rule as its first user
slug: a-bytecode-sandbox-and-the-reference-games-simulation-route
spec: games-on-this-foundation
blockedBy: []
---

# A game previews a turn by running its contract's own bytecode, not a copy of its rules

Drafted and decided in stratagems as PX2 of its step X (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, the section "Step X" has every decision with the alternative rejected), decided with the maintainer on 2026-10-31, including the refinement that the reference game is the sandbox's first user on `main`.

## What was missing

- **No way to preview a turn but a copy of the rules.** stratagems keeps three copies of its rules (the contract, a TypeScript reimplementation in `common/`, and its indexer's); catacombs runs its contract's bytecode through its own `@ethereumjs/evm`. Nothing in the tree offered the general way.
- **The reference game previewed nothing**: `placement/view.ts` only flagged planned cells.

## Done, 2026-10-31, on local preview branches `px2/*`, NOT pushed

- **`main`, the sandbox** (`web/src/lib/game/simulation/`, with a README stating the pattern): `createBytecodeSandbox({contracts, provider, node?})` runs `eth_call` with a code override on a bare webevm node (`createNode({})`), in a Worker in the browser (`worker.ts`, the node served over the Worker's own port with `@eip-1193/over-port`, now a direct dependency) and on the calling thread elsewhere. A contract's code is `{address}`, read once with `eth_getCode` through the provider (the deployed bytes, immutables included), or `{creationCode, abi?, args?, at?}`, run into the sandbox once (catacombs' `GameUtils` shape). Reverts are decoded into `SandboxRevert`; a failed load is retried on the next call; nothing is imported or started before the first call; `dispose` stops it and a later call starts it again. `latestResult(inputs, run)` publishes only the answer for the current input, so the synchronous view seam does not change. Unit tests on a toy contract committed as bytes (`test/fixtures/simulation/`).
- **`main`, the reference game on it**: `_place` is load (`_loadPlayerCell`), a pure rule (`_placementOutcome(PlayerCell, cost)`, the cost a parameter because a pure function may not read an immutable) and apply (`_applyPlacement`: the writes, the zone index, `Placed`); the order-independence argument is unchanged and sits in apply. A `Simulation` route (`GameSimulation.resolvePlacements`, `view` only for the immutable) runs the same rule over cells a client hands it, refusing a cell it was not given (`CellNotGiven`). `contracts/test/js/Simulation.test.ts` holds the route to the reveal (preview, reveal, compare), written against the deployment's cost and `TURN_BOND` so `with/nft-identity` runs it too. The client (`placement/preview.ts`) loads each planned cell as the player sees it (`getStakeOnCell` once per cell and cycle), runs the route from its deployed bytecode in the sandbox, and the view draws what each planned cell will hold (`CellView.next`); both renderers draw it (`with/pixi-js`'s `CellObject` and its change test). The game e2e holds the preview to the reveal.
- **Cascaded** to `with/pixi-js`, `with/nft-identity` (its deploy script and its game e2e resolved by hand: free placements move the claimant count, so its preview assertion is on that), `with/fuzd`, `with/all`, `with/fuzd-pixi`; reveal-or-die `main` (the two new contract files listed in its omissions, and a deploy-script hunk that had merged CLEANLY into its own deploy script removed), bomber-world `main` (its own omissions kept: its stem does not carry the files), stratagems `main`.

**Measured**: the GasBudget test's worst reveal 533,508 to 536,813 (+0.6%), commit 117,714 to 117,740, paid commit 152,154 to 152,180, all within the declared figures (recorded in `rocketh/config.ts`); contracts 57 to 61 passing on `main`, 63 on `with/nft-identity`. Unit (server + client, check 0 errors and 0 warnings everywhere): `main` 1929 + 78 (from 1908), `with/pixi-js` 1942, `with/nft-identity` 1937, `with/fuzd` 1970, `with/all` 1950, `with/fuzd-pixi` 1983 (+ 78 each); reveal-or-die 2084 + 72, bomber-world 2132 + 72; stratagems `main` 1662 + 72. The e2e: `main` 54 of 54, the game file on `with/nft-identity` 4 of 4. `vite build` emits the sandbox's worker as its own chunk (459 kB).

**Found on the way**: the specification said `with/nft-identity` only adds files under `contracts/src/game`; it also edits the deploy script and the game e2e, which is where its two conflicts were. And a clean hunk carried the template's `Simulation` route into reveal-or-die's OWN deploy script, which only the contracts build caught (`check-dangling-imports` cannot see a deploy artifact name): read a cascade's clean hunks in a descendant's deploy scripts, not only its conflicts.
