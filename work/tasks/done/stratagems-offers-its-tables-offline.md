---
title: stratagems offers its tables offline, so its KNOWN_GAPS entry goes
slug: stratagems-offers-its-tables-offline
spec: games-on-this-foundation
blockedBy: [a-table-in-the-offline-world]
---

# stratagems offers its tables offline

Built from stratagems' port plan, step OT2 (`main`, `work/plans/join-template-commit-reveal.md`, section "Step OT", after OT1), decision OT2-7 taken with the maintainer on 2026-11-15.

**The need**: OT1's invariant (`web/test/offline-tables-boundary.test.ts`: a game with online tables offers them offline) listed stratagems in `KNOWN_GAPS` until its OT2. stratagems now exports `startOfflineTable` and `TABLE_STORAGE_KEY` from its `$lib/offline`, so the test fails there while the entry stands (a listed game that offers tables is reported). The entry is deleted HERE, at the template, so the deletion cascades and the file stays byte-identical down the tree.

**What changed here**: one line, `stratagems: "stratagems' plan, step OT2"` removed from `KNOWN_GAPS`. Nothing else. reveal-or-die's and bomber-world's entries stand until OT3.

## Done, 2026-11-15, on local preview branches `pot2/*`, NOT pushed

- `main` (from `origin/main` 701420ce): `706b27c6`.
- Cascaded along the path to stratagems' stem, as `offshoot-fanout` merges: `with/pixi-js` `2cdc7a41`, `with/fuzd` `78cee602`, `with/indexer` `8b054b45` (each `merge main`), `with/fuzd-pixi-indexer` `8d53dff6`, `2a91f571`, `3d062a7c` (merging `with/fuzd`, `with/pixi-js`, `with/indexer`), all clean. stratagems merged `3d062a7c` on its `step-OT2`.
- Not cascaded: `with/nft-identity` and `with/all`, and through them reveal-or-die and bomber-world, which take the deletion with OT3's cascade (OT2-7: a line that changes nothing for them, not worth two more full verifies now).

## Measured

Each branch's verify (`pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit`), at its `pot2/*` head: check 0 errors and 0 warnings on every one; unit exactly OT1's: `main` 2076 + 84, `with/pixi-js` 2089 + 84, `with/fuzd` 2118 + 84, `with/indexer` 2104 + 84, `with/fuzd-pixi-indexer` 2159 + 84 (the deletion changes no count here: the boundary test reads this repo's name, which was never listed). In stratagems, the boundary test passes with the entry gone, and failed with it while stratagems' table was already offered.

## Not done here

reveal-or-die's tables offline (OT3), which deletes the next two entries here; the shared half of an offline table's boot (`openTheTable` but its stake, `creatorThrough`, `seatLabelsOf`), copied into stratagems' `offline.ts` by OT2-3 and to be measured as a move into `$lib/game/lobby/offline-table` when OT3 is its third user.
