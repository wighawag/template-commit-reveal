---
title: with/fuzd's slot is per signing key and cycle, so one key scheduling two turns in a cycle would replace the first
type: observation
status: resolved 2026-10-30 (the slot names the contract)
spotted: 2026-10-30
relates-to: web/src/lib/fuzd/schedule.ts (slotFor), with/nft-identity, with/all
---

fuzd keys a schedule by the account that signed it and the slot, and the slot is `cycle_<n>` (P8 c, as decided). The signing account is the browser key. On `main` one key plays one identity in one game, so this is one turn per slot. Two cases would put two turns in one slot, the second replacing the first while it is queued (measured, see the done task): one browser key playing SEVERAL identities in a cycle (`with/nft-identity`, so `with/all` once it takes `with/fuzd`), or one key playing two contracts on one chain. If either becomes real, the slot should name the identity and the contract (`cycle_<n>_<contract>_<identity>`), a change to the layer's wire (`FuzdSchedule.slot`) made before any game ships with it.

## Resolved, 2026-10-30

The maintainer's reading: fuzd keys a schedule by chain and signing account, and in this tree an identity is driven by one local key, the one signing fuzd's requests, so two identities do not share a slot. What remained was one key playing two games (contracts) on one chain in one cycle, so the slot is now `cycle_<n>_<game contract>` (`with/fuzd` `cb27dcb8`). Revisit only if a branch lets one browser key play several identities.
