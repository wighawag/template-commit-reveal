---
title: A removed synqable map item leaves a tombstone that drops every later write to its key, until the item's own deleteAt
type: finding
status: worked around
spotted: 2026-10-29
relates-to: web/src/lib/game/core/commit-reveal/storage.ts, synqable 0.3.1 (src/main/merge.ts, createSyncableStore.ts removeItem)
---

# Removing a key is permanent for as long as the item would have lived

Measured while moving the submission into the account data (stratagems' step 8, item 4). In synqable 0.3.1, `removeItem(field, key)` records a tombstone whose time is the removed item's `deleteAt` (`tombstones[key] = existing.deleteAt`), and `mergeMapField` skips EVERY item whose key is tombstoned (`if (isTombstoned) continue`), whatever its timestamp. `addItem` on the same device does not consult tombstones, so locally the re-added item is there; at the next merge with another device (or another tab through the localStorage adapter's watch) it is dropped on both.

For a map keyed by something stable (the submission's plan, one key per chain, contract and identity), "clear, then plan again" therefore loses the second plan on every device but the one that wrote it, with no error. The plan is now emptied to `{turn: null}` instead of removed, and `test/lib/game/core/commit-reveal/storage.test.ts` ("empties a plan rather than removing it...") pins it; replacing the write with `removeItem` turns that test red.

The same rule makes pruning permanent: `committedTurns` items carry `deleteAt` `Number.MAX_SAFE_INTEGER` (no automatic expiry, decided), so each pruned committed turn leaves a tombstone for ever: one small `key -> number` per settled cycle per identity. Harmless at the scale of a game's cycles, but unbounded.

Worth raising with synqable: a tombstone that loses to a LATER write (compare its removal time with the item's timestamp), and a tombstone lifetime separate from the item's `deleteAt`, would make removal safe for stable keys and bound the tombstones.
