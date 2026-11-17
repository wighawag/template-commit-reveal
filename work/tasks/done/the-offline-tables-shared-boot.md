---
title: The offline table's game-agnostic boot half moves into the framework, and the last KNOWN_GAPS close
slug: the-offline-tables-shared-boot
spec: games-on-this-foundation
blockedBy: [a-table-in-the-offline-world, stratagems-offers-its-tables-offline]
---

# The offline table's shared boot half, and KNOWN_GAPS empty

Built from stratagems' port plan, step OT3 (`main`, `work/plans/join-template-commit-reveal.md`, section "Step OT", after OT2), decisions OT3-2 and OT3-10 taken with the maintainer on 2026-11-15.

**The need**: OT1 left the boot of an offline table as a worked example in the reference game's `$lib/offline` (`openTheTable`, `creatorThrough`, `seatLabelsOf`), and OT2 copied it into stratagems. reveal-or-die was the third user and bomber-world the fourth; measured function by function, the copies were identical but for the game's stake call and how an account's identity is spelled. So that half moves here, once.

**What changed here**:

- `$lib/game/lobby/offline-table.ts` gains `offlineTableCreator(wallet, chain)` (the first person's account as the creator, a wallet client over the world's own wallet), `seatTheOfflineTable({reader, creator, factory, implementation, storage, storageKey, seats, cycles, gameOptions, stake, onStep})` (open, the game's `stake` hook, start once, each step reporting what it does) and `offlineSeatLabels({table, accounts, identityOf, levels})` (the panel's names, the identity sync or async). `OfflineTableCreator.writeContract` takes any ABI and an optional `value`, because reveal-or-die joins an ETH seat from the person's own account, paying the stake.
- The reference game's `offline.ts` uses them; its `creatorThrough` and `seatLabelsOf` go.
- `web/test/offline-tables-boundary.test.ts`: `KNOWN_GAPS` is empty (reveal-or-die's and bomber-world's entries deleted, and stratagems' with them at `with/nft-identity` and `with/all`, which OT2 did not reach). The list stays for a game that joins short.
- Tests: `test/lib/game/lobby/offline-table.test.ts` (4: the creator sends as the first account through the wallet's provider, a value included; a record the chain does not hold stakes and starts nothing; the labels with levels and an async identity, and without), and the world test's table boot now runs through `seatTheOfflineTable`, asserting its three steps.

## Done, 2026-11-15, on local preview branches `pot3/*`, since pushed

- `main` (from `origin/main` 706b27c6): `a7d29050` (the helpers, the reference game on them, `KNOWN_GAPS` empty), `94734fe5` (the creator's request takes any ABI and a value).
- Cascaded as `offshoot-fanout` merges, all clean: `with/pixi-js` `27dc9827`, `with/nft-identity` `0bb1179a`, `with/fuzd` `b553349e`, `with/indexer` `6a26882e` (each `merge main`, twice), `with/all` `356ab087` (merging `with/pixi-js`, `with/nft-identity`), `with/fuzd-pixi-indexer` `a050fdc9` (merging `with/fuzd`, `with/pixi-js`, `with/indexer`). Each node's own `offline.ts` took the change with no conflict (`with/nft-identity` and `with/all` had the same `openTheTable` and `seatLabelsOf` as `main`).
- reveal-or-die merged `with/all` on its `pot3/main`, bomber-world took it from there, stratagems merged `with/fuzd-pixi-indexer` on its `step-OT3`, each adopting the helpers.

## Measured

Each node's verify at its `pot3/*` head: check 0 errors and 0 warnings on every one; unit exactly the previous plus the 4 new cases: `main` 2080, `with/pixi-js` 2093, `with/nft-identity` 2090, `with/fuzd` 2122, `with/indexer` 2108, `with/all` 2103, `with/fuzd-pixi-indexer` 2163 (each + 84). The offline e2e suites (`offline`, `offline-hotseat`, `offline-ai`, `offline-one-tab`, `offline-table`) 5 passed on `main`, `with/nft-identity` and `with/fuzd-pixi-indexer`. Once, under load (three verifies at once beside a game's full e2e), `with/all` and `with/fuzd-pixi-indexer` reported an unhandled `window is not defined` from `@etherplay/wallet-connector-ethereum`'s timer after `test/lib/context/tab-navigation.test.ts` (every test passing); run alone, both are clean. Not this change's: a timer outliving its test environment.

## Not done here

reveal-or-die's own offline tables (its `work` task `tables-offline`), bomber-world's by cascade, stratagems' adoption: each in its repo.
