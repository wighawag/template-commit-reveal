---
title: A table in the offline world, the lobby's default, with humans and AI seats; the world kept as the other choice
slug: a-table-in-the-offline-world
spec: games-on-this-foundation
blockedBy: [a-table-option-may-offer-choices]
---

# A table in the offline world

Built from stratagems' port plan, step OT1 (`main`, `work/plans/join-template-commit-reveal.md`, section "Step OT"), its decisions OT-1 to OT-4 and OT1-1 to OT1-13 taken with the maintainer on 2026-11-14.

**The need**: the offline game was the persistent WORLD in every repo of the tree; nobody played a TABLE offline, and online tables have no AI. The maintainer asked for tables offline with humans and AI seats, a table the default, the world kept.

**The decisions, in one line each**: a game with online tables (a `lobby` in its `$app-specific` module) offers them offline too, held by `web/test/offline-tables-boundary.test.ts` with a `KNOWN_GAPS` list (stratagems until its OT2, reveal-or-die and bomber-world until OT3), the lobby offering such a game the world only meanwhile (OT1-1); the lobby asks "a table or the world?", a table's seats 2 to 8, its cycles and the game's options in one component both lobbies render (OT1-2); every record explicit from its first build, `offline-world:mode`, `:cycles`, `:game-options` and `:table`, a pre-OT1 world's defaults written on its first boot (OT1-3); one table per world (OT1-4); the boot at a table guarded by what the chain holds, the table created by the first person's account through the world's wallet, every seat staked at it, started by the tab (OT1-5, OT1-6); the Forfeit kept, the panel naming the seats as the lobby does (OT1-7); the played seats commit nothing before the start or after the end (OT1-8); the Manual cycle at an offline table (OT-2, OT1-9).

## Done, 2026-11-15, on local preview branches `pot1/*`, NOT pushed

**`main`** (from `origin/main` f11ecaf8):

- `af377fd6` contracts: a MANUAL table, deployed as an offline world deploys one, plays from its start to its end, every cycle closed by its members and none by a clock (`Lobby.test.ts`, OT1-9's measurement).
- `36b032c4`, `6ef856e5` the lobby (`$lib/game/lobby/lobby.ts`, `seats.ts`): `LobbyMode`, `TABLE_SEATS`, `LobbyTables`, `chooseMode`, `chooseCycles`, `chooseOption`; seat bounds per mode (`SeatBounds`, `WORLD_SEATS`); every record written on every sit-down, test first.
- `28422ba9`, `34bc308b` `offline-lobby.ts`: a table offered when the game has a `lobby` and its world a `startOfflineTable`; the mode, cycles and options keys; the table's record forgotten with the world (`TABLE_STORAGE_KEY`, read off `$lib/offline`), test first.
- `d5a7cec1` the boundary test, `test/offline-tables-boundary.test.ts`, failing at the template until the reference game's world offered tables.
- `6dfa6f94` `$lib/game/lobby/ui/TableOptionFields.svelte`, rendered by `routes/lobby` and `routes/offline`; the offline route's first question and a table's cycles and options.
- `37cb6b98`, `3859b4f9` `$lib/game/lobby/offline-table.ts` (`openOfflineTable`, `startOfflineTableOnce`: create or find again, checked against the chain, start once); `createContext({establishConnection, table, seatLabels})` keeps the table with a connection; `CoreServices.tableSeatLabels` and `TableStore.labelOf`; the reference game's `offline.ts` (`startOfflineTable`, `TABLE_STORAGE_KEY`, `stakeForEveryoneAtTheTable` by `StakeSale.purchaseAt`, `data.Lobby` the Manual cycle, everything composed on the table's record) and `offline-players.ts` (no commit before the start or after the end, a table known by its record's `getEnd`); test first in `world.test.ts`, `offline-players.test.ts`, `table.test.ts`.
- `0870c102` `e2e/tests/offline-table.e2e.ts` (one person, a greedy and a random seat, two cycles to the end, a reload inside it; skipped where no table is offered), and `chooseTheWorld` in `e2e/fixtures/test.ts`, pressed by the four world suites.
- `23427752`, `5c041773` an identity asked of the game it plays in (`offlineIdentityOf({game})`, `playedByTheWorld({game})`), which `with/nft-identity` needs (an avatar is in the table's custody, not the world's).
- `b5763dd5` the lobby test reads the chain id key off the world (bomber-world versions it).
- `701420ce` `CONTEXT.md`: an offline world may be a table.

**Nodes**: `with/pixi-js`, `with/fuzd` merged clean; `with/indexer` resolved `offline.ts` keeping `forgetPreviousWorldIndex` beside the table; `with/nft-identity` resolved `offline.ts` (a seat at the table is an avatar bought by `GameAvatarSale.purchaseAt`, found by `offlineIdentityOf` in the table's custody), `world.test.ts` (the restore counts avatars at the table) and `Lobby.test.ts` (the Manual lobby deployed with the avatar routes, seats by `join`); `with/all` took `with/nft-identity`'s three files; `with/fuzd-pixi-indexer` took `with/indexer`'s `offline.ts`. Several merge commits per node, one per round of the cascade.

**Descendants**: reveal-or-die (its own `offline.ts`, `offline-players.ts`, their tests and `offline.e2e.ts` kept; `Lobby.test.ts` stays omitted) and bomber-world (its `offline-lobby.test.ts` keeping its versioned chain-id key) with no edit and no table offered; stratagems by its step-OT1 merge, its `stratagems-offline-ai.e2e.ts` taking the `chooseTheWorld` press by git's rename detection.

## Measured

- `main`: contracts **87 passing** (from 86); check 0 errors and 0 warnings; unit **2076 + 84** (from 2056 + 84); full e2e **62 passed** (5.8 min, from 61), RPC 8557 and app 4183.
- Nodes, check 0 and 0 on each, unit each + 84: `with/pixi-js` 2089, `with/nft-identity` 2086, `with/fuzd` 2118, `with/indexer` 2104, `with/all` 2099, `with/fuzd-pixi-indexer` 2159 (each +20); contracts `with/nft-identity` and `with/all` 89 (from 88); `offline-table`, `offline`, `offline-hotseat`, `offline-ai` and `offline-one-tab` e2e pass on `main`, `with/nft-identity` and `with/fuzd-pixi-indexer`.
- reveal-or-die: check 0 and 0, unit 2256 + 78 (from 2241 + 78); bomber-world: check 0 and 0, unit 2346 + 78 (from 2331 + 78); in both `offline-one-tab.e2e.ts` passes and `offline-table.e2e.ts` skips; dangling imports and omissions clean.
- The indexer at `with/indexer` (OT1-10): the stream's digest includes the source (`source.ts`, the game's address and start block), and the world's database is `${worldName}-${stream}`, so a table's index is a database of its own in the world's namespace, deleted with it by `deleteWorldIndex`. Nothing changed at that node.

## Not done here

stratagems' tables offline (OT2) and reveal-or-die's (OT3), each deleting its `KNOWN_GAPS` entry HERE, at the template, so the deletion cascades; AI at online tables; several tables in one world; a table's lobby screen offline (its loading line shows until the table's first read, then the panel).
