---
title: A table ends after the cycles its creator chose, and carries the game's own options
slug: a-table-ends-and-carries-the-games-options
spec: games-on-this-foundation
blockedBy: [tables-for-a-fixed-set-of-players]
---

# A table ends, and carries the game's options

Built from stratagems' port plan, step L4 (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, section "Step L4"), its decisions L4-10 to L4-12 and L4-22 taken with the maintainer on 2026-11-02: the end is generic (a cycle count set at creation, nothing committed or advanced after it, a hook a game's routes read), so it lands in the commit-reveal base and the lobby client, the reference game its first user; the score and the settlement are stratagems'. A table also carries an opaque `bytes32 gameOptions` the base stores and never reads, because a route of the base cannot call a game's hook: the game's own routes read it.

## Done, 2026-11-03, on local preview branches `pl4/*`, NOT pushed

**`main`** (from `origin/main` 221b8a45):

- `a973f1b3` the tests first (failing): `CommitRevealRoster.test.ts` (a roster of no cycles refused; the cycles, the options and `startedWith` read back; `RosterOpened` and `GameStarted` carry them; a game of two cycles takes its last reveals, then refuses a commit, an advance and a forfeit with `GameEnded`, and still settles a missed reveal; a last cycle closed early ends it at once; open entry has no end), `Lobby.test.ts` (a two-cycle table played to its end through the factory, its options read back, the world beside it with no end).
- `e1716592` the base: `createGame(uint8 seats, uint16 cycles, bytes32 gameOptions)`; `Roster` gains `uint16 cycles` and `uint8 startedWith` (still one slot); the layout appends `bytes32 gameOptions`; `CycleState` gains `uint64 lastCycleNumber` in the slot `commiting` is in (zero is no end), written by `start`; a commit, an advance past the last cycle and a forfeit revert `GameEnded(lastCycleNumber)`, checked first in each so the error says so; closing the last cycle early is not refused (it ends the game sooner); `_hasEnded`, `_lastCycleNumber` and `_gameOptions` are the game's hooks; the lobby route adds `getEnd`, `hasEnded`, `getGameOptions`. The roster stub keeps only `registerDelegate` of the delegation routes: compiled unoptimised it was at 25,314 bytes, past EIP-170, once the end was in (19,087 now).
- `cea6c075` the lobby client: `create(seats, {cycles, gameOptions})` (2 to 100 cycles, 10 by default), `readRoster` reads the end and the options, `tableProgressOf` ("Cycle k of N", "Ended after N cycles"), `tableAllowsPlay` refuses once ended, the lobby page asks for the cycles, `TableLobby` shows them, `TablePanel` the progress and no forfeit after the end; `table.e2e.ts` creates a three-cycle table and plays it to its end (its forfeit's cycle is its last).
- `6334f4f2` `TableLobby.options`: a game that reads `gameOptions` declares its fields (bounded numbers with defaults), how to encode them and how to describe a table's; the lobby page asks for each, `TableLobby.svelte` shows a description it is given. A game without options is unchanged.

**Nodes**: each merged clean twice (`with/all` and `with/fuzd-pixi-indexer` from their stems in order); `with/nft-identity` needed one commit of its own, `b1e88f6d`, because its `Lobby.test.ts` names a player by its avatar (`table.id`), merged on into `with/all`.

**Descendants**: reveal-or-die and bomber-world take the base and the lobby client (their `Lobby.test.ts` and `table.e2e.ts` omitted, as before), no edit of their own; stratagems `main` takes the lobby client (its base omitted there), and its integration branch the base at the stem's bytes.

## Measured

- Contracts: `main` **84 passing** (from 78: 5 roster cases, 1 lobby case); every node's suite passes (`with/nft-identity` after `b1e88f6d`, 86 with its own).
- Unit: `main` **2018 + 81** (from 2012 + 81), `with/pixi-js` 2031, `with/nft-identity` 2026, `with/fuzd` 2060, `with/indexer` 2046, `with/all` 2039, `with/fuzd-pixi-indexer` 2101 (each + 81, each + 6); reveal-or-die 2164 + 75 and bomber-world 2213 + 75 (each + 6); stratagems `main` 1764 + 75 (+ 6, its known 2 warnings); check 0 errors and 0 warnings everywhere else; dangling imports clean.
- e2e: `main` **57/57** at `cea6c075` (5.8 min, from the baseline's 57/57 at 221b8a45, the table suite now played to its end); `table.e2e.ts` alone passes on `with/nft-identity` and `with/fuzd-pixi-indexer`. Not re-run after `6334f4f2`, which changes the lobby page only for a game that declares options (the reference game declares none).
- Gas: a commit pays one warm read for the end check (stratagems' first commit 112,716 to 112,914); a reveal pays 26 gas for the wider `CycleState` read (stratagems' 32-move chunk 6,140,942 to 6,140,968).

## Surprises

- **solidity-proxy 0.5.2's `Router10X60` routes only 48 selectors correctly, not 60**: its constructor packs selectors 49 to 54 and 55 to 60 into `tmp_sigs_07` (copy-pasted branches), so `sigs_08` and `sigs_09` stay zero and the binary search misses selectors across the whole map. Found by stratagems' table implementation at 56 selectors (`getConfig`, `getRoster` and others answered `UNKNOWN_METHOD`). Home: solidity-proxy. Until then a router must stay at 48 or fewer.
- A test stub compiled without the optimizer hits EIP-170 long before its optimised size would: the roster stub grew 870 bytes with the end.
