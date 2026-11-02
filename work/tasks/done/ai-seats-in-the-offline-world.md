---
title: AI seats in the offline world, a level per world seat, the reference game's greedy its first strategy
slug: ai-seats-in-the-offline-world
spec: games-on-this-foundation
blockedBy: [hotseat-in-the-offline-world, the-handover-waits-for-the-persons-data]
---

# AI seats in the offline world

Built from stratagems' port plan, step A1 (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, section "Step A"), its decisions A1-1 to A1-14 taken with the maintainer on 2026-11-02: a game's strategy behind a framework seam, called from the game's own pass (`played.ts` still declines a shared one); a played seat's turn decided once per cycle in the commit phase and stored in `localStorage` BEFORE its commit, the secret still `playedSeatSecret`; a level per world seat chosen at the lobby (`random`, today's derived turn and the default, or a level the game offers); the reference game's `greedy`, scored by its own `Simulation` route.

## Done, 2026-11-02, on local preview branches `pa1/*`, NOT pushed

**`main`** (from `origin/main` 9c7a6a43):

- `9ef90593` `$lib/game/core/strategy.ts`: `Strategy<TAction>`, `seededRandom` (keccak of `'PlayedSeat:random'`, chain, contract, identity, cycle and a counter; not a wire), `createPlayedTurnStore` (one record per chain, contract, identity and cycle, the game's `SubmissionStorageFormat`, the last `COMMITTED_TURNS_KEPT` = 3 cycles per identity, another chain's records dropped when it is created, an unreadable record ignored, a refused write thrown), `decidePlayedTurn` (the stored turn, else the strategy's, stored before it is returned), `RANDOM_LEVEL`, `AiLevel`; 13 unit cases.
- `2704d459` the seat: `the-world` gains an optional `level`, `tableOf(seats, humans, levels?)` (a `random` seat carries no `level`, so every table without levels is unchanged and no address moves), `clampLevels` (total: absent, malformed, unknown and missing read as `random`), `seatsPlayedByTheWorld` passes the level through; 2 cases.
- `1f088d01` the reference game: `placement/strategy.ts` (`PLACEMENT_LEVELS`, `createPlacementStrategy`: the 13 by 13 block's cells read with `getCellsInZones` and `getStakeOnCell`, scored by ONE `resolvePlacements` call, the gain in the player's share of the stake, ties broken by the seat's seeded random); `offline-players.ts` (`OfflinePlayer.level`, `playedTurnCells`, `strategy` and `turns` params, the candidates `[stored, turnFor, []]`, a strategy that throws answered with the derived turn, stored); `offline.ts` (`AI_LEVELS`, `PLAYED_TURNS_STORAGE_KEY` = `offline-world:played-turns`, `playedSeatDecider`: the seats' own sandbox on the world's provider, built only when a seat is not `random`, disposed with the board); seven world cases in `offline-players.test.ts`.
- `93e29b04` the lobby: `levelsStorageKey` and `levels` deps, `LobbyState.levels` and `levelChoices`, `chooseLevel(worldSeat, level)`, `sitDown(seats, humans, levels)`, persisted as a JSON array and forgotten with the world; `offline-lobby.ts` reads `AI_LEVELS` off `$lib/offline` as it reads `LOCAL_HUMANS_AT_MOST` (`offline-world:levels`); the byte-identical route shows a level per world seat when offered, and names a seat's level in the table; 5 lobby cases, 2 wiring cases.
- `5b53f877` `e2e/tests/offline-ai.e2e.ts`: one person against two greedy seats, two cycles; skips where the lobby offers no levels.
- `58ed7f92` the world test says what it means where a placement is free (`with/nft-identity`: no stake moves, every share is zero, greedy plays a seeded-random cell).
- `221b8a45` the offline-lobby test asserts that the real world's levels include `random`, not which levels they are: the file is identical in every game (the finding `a-file-identical-everywhere-must-not-name-one-games-answer.md` applied, after reveal-or-die's unit run caught the first version naming the reference game's two).

**Nodes**: each merged clean, one merge each (`with/all` and `with/fuzd-pixi-indexer` from their stems in order); `offline.ts` auto-merged where it differs (`with/nft-identity` and its descendants).

**Descendants**: reveal-or-die and bomber-world take the framework, their `offline.ts`, `offline-players.ts` and its test their own (no levels offered, every seat `random`); the reference game's `placement/strategy.ts` omitted with `placement/` (git proposed it as a rename into reveal-or-die's `world/`); bomber-world's offline-lobby test keeps its versioned chain-id key (`:v2`). stratagems `main` takes the framework (its offline world omitted there); stratagems' integration branch brings the lobby, its route, its test and `offline-ai.e2e.ts` at the stem's bytes, offering no levels until its step A2.

## Measured

- **The decision's cost**, in node, a board of 32 claimed cells in the block: first 190 to 199 ms per decision, 178 ms of it the one `resolvePlacements` call over 169 cells and 169 placements (the route finds each placement's cell by a scan, some fourteen thousand iterations of interpreted EVM). The rule reads a cell's numbers and never its id, so the strategy now simulates ONE cell per distinct state (3 on that board): **18 to 21 ms**, five runs. A game whose rule reads neighbours cannot batch this way and pays a call per candidate: measure first.
- Unit: `main` **2012 + 81** (from 1983 + 81), `with/pixi-js` 2025, `with/nft-identity` 2020, `with/fuzd` 2054, `with/indexer` 2040, `with/all` 2033, `with/fuzd-pixi-indexer` 2095 (each + 81, each + 29); reveal-or-die 2158 + 75 and bomber-world 2207 + 75 (each + 22), stratagems `main` 1758 + 75 (+ 20); check 0 errors and 0 warnings everywhere (stratagems `main` its known 2 warnings); dangling imports clean (stratagems `main` its generated `$lib/manifest.json`), omissions complete.
- e2e: `main` **57/57** (5.4 min, from the baseline's 56/56); the three offline suites three times in a row at `main` and once each on `with/nft-identity` and `with/fuzd-pixi-indexer`; reveal-or-die's and bomber-world's offline suites (the new one and hotseat skipping); stratagems' integration branch 60 passed and 1 skipped (the new suite).

## Surprises

- **A reveal phase in the offline world lasts less than one 50 ms poll**: the seats and the person reveal right after the advance. So "a reload in the reveal phase" cannot be caught by watching. The e2e takes the two greedy seats' gas with the in-tab node's `evm_setBalance` once they have committed: their reveals fail and retry, the cycle waits, and the reload's provisioning (which refills every seat's gas on every boot) lets the new loop reveal from the store.
- **Patching `provider.request` on the world's provider does not reach the seats**: viem's `custom()` binds `provider.request` when a client is built (`request: provider.request.bind(provider)`), so a test that wraps it afterwards intercepts nothing.
- **On an empty board a greedy seat cannot see a simultaneous placement**, and met one: the comparison test first measured both levels over two cycles and tied, because in the first cycle the greedy seat picked, from 169 empty cells, the one the human placed on at the same time. The test now measures the gain of the turn decided on the fixed board.
- The e2e script defaults its chain to port 8545; on a machine where that port is another project's, pass `E2E_RPC_PORT` (8557 here) and `E2E_PORT` (4183).
