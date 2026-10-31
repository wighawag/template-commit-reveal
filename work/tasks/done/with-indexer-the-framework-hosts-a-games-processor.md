---
title: with/indexer, the framework hosts a game's etherfold processor in its three places
slug: with-indexer-the-framework-hosts-a-games-processor
spec: games-on-this-foundation
blockedBy: [a-bytecode-sandbox-and-the-reference-games-simulation-route]
---

# A 24-hour game's state comes from its own processor, and only its processor is its own

Decided in stratagems (its plan `work/plans/join-template-commit-reveal.md` on its `join-template-commit-reveal` branch, PX6 and PX7 of step X, decided with the maintainer on 2026-10-31), built as its step X1. The rule it follows is the maintainer's: a game's indexer LOGIC is its own; what is shared is its hosting.

## What was missing

- **No node of the tree hosted an indexer.** stratagems carried 696 lines of hosting it had written for itself (two worker entries, the worker choice, the indexed `OnchainStateStore` with its cycle stamp, the follower, and the Node runner its contracts tests use), all generic but for a database prefix, an ABI type, a processor import and a contract name. Every 24-hour game would copy them.
- **Not on `main`**, because the state layer follows the cycle length (the two fast games read logs or poll), and not at jolly-roger, whose layers reach games only through `integration`, so into every game.

## Done, 2026-10-31, on local preview branches `px1/*`, NOT pushed

- **`with/indexer`**, a new node from `main` 4d56cbe5:
  - `8d4d7633` etherfold's and libSQL's dependencies; `contracts/utils/indexer.ts`, `indexInProcess` (a processor in Node over SQLite, GraphQL read back with `localExecutor`), compiled into `dist/utils` and exported as `./utils/*`.
  - `3fe91539` `web/src/lib/indexer/`: `host.ts` (`hostLiveIndexer`, one tab indexing and the others reading under a per-deployment election, a published snapshot installed when the tab names a publication, the processor imported or the published bundle; `hostWorldIndexer`, an offline world's, no election and no publication; `appRoot`), `worker-choice.ts` (`indexerWorkerFor(prefix, deployment, game)`, `worldIndexDatabasePrefix`, `deleteWorldIndex`), `indexed-state.ts` (`createIndexedState`: the port, the follower, the progress, the refusal and failure statuses, the cycle stamp, `present` shaping what the seam publishes, `host` for a test), `cycle-stamp.ts` (timed from the block's timestamp, Manual from the game's folded `CycleAdvanced` through `cycleOf`, hybrid refused), `follower.ts` (`createStateFollower(spec, execute)`: one full read, then only the moved parts, pinned by block hash, serialised, a reorged pin read again silently, `accountPart` re-read when who plays changes), a README. 24 unit cases.
  - `18e6489e` The reference game is its first user: `$lib/placement/indexer/` (a processor of `Placed` and `CycleAdvanced`, keeping each player's stake per cell to count a new claimant the way `_placementOutcome` does; the source; two parts and `readBoard`; the two worker entries; `board.ts`), `placement/context.ts` hands it to the skeleton as `board`, `offline.ts` deletes a forgotten world's index. `test/lib/placement/indexer.test.ts` plays an offline world three cycles with the two played seats and holds the fold to `getCell` cell by cell and to `getCellsInZones` as a set, in process (`indexInProcess`) and through `createIndexedBoard` on a main-thread host (the published board stamped with the chain's cycle, 5); a mutation of the claimant rule fails it.
  - `90abf3a5` `README.indexer.md`; `29b96684` a publication's locations are asked when the worker starts (they are found relative to `location.href`).
- **`with/fuzd-pixi-indexer`**, a new node: `with/fuzd-pixi` (that is, `with/fuzd` merged with `with/pixi-js`) merged with `with/indexer` (540a5496, the lockfile the one conflict, regenerated; c1cc711a), `README.fuzd-pixi.md` renamed and rewritten as `README.fuzd-pixi-indexer.md` (e5869d46). It replaces `with/fuzd-pixi`, which stratagems alone stemmed from; deleting the old branch on `origin` waits for the maintainer.
- **`offshoot`** (f3956bdc): `with/indexer` from `main`; `with/fuzd-pixi-indexer` from `[with/fuzd, with/pixi-js, with/indexer]` in place of `with/fuzd-pixi`.
- **Cascaded** to stratagems `main` (its `px1/main`, 87a49311 and b36a9d47: the placement files fall under its omissions; `fake-indexeddb` and `@etherfold/state-store` added to its `web/package.json`; its own `contracts/utils/indexer.ts` replaced by this one). No other node changes: `main`, `with/pixi-js`, `with/nft-identity`, `with/fuzd`, `with/all`, reveal-or-die and bomber-world are untouched.

**Measured**: `with/indexer` check 0 errors and 0 warnings, unit 1956 + 78 (`main` 1930 + 78), e2e **54 of 54** (4.4 min, RPC 8555, app 4183, nothing left after), its two workers built as chunks of 392 and 408 kB; `with/fuzd-pixi-indexer` check 0 and 0, unit 2010 + 78 (`with/fuzd-pixi` 1984); stratagems `main` 1687 + 72 (from 1663), check 0 errors and its known 2 warnings.

**Found on the way**: `stateFactoriesFrom` takes `entities` for an imported processor, so the live host serves a game that publishes nothing as well as one that does; `indexer.mainThreadHost()` is a ready host for a test of the whole store in Node, joined with `{watch: false}` and nothing else, since it is already initialised.
