---
title: An embedded world persists twice, in two places, and only one of the two keys can tell one chain from another
type: finding
status: spotted 2026-09-18, not fixed; cheap in the template TODAY and not in reveal-or-die
spotted: 2026-09-18
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4's second half, D9, D10), AGENTS.md ("Renaming a persisted key or field forfeits the stake"), web/src/lib/placement/storage.ts, web/src/lib/account/AccountData.ts
---

# "What keeps a turn safe across a reload" has a good answer and a bad one, and they are in different files

Raised while settling the block-time question for Phase 4: if a hotseat world put every player's turn in the MEMPOOL, what keeps them across a browser reload? Tracing it produced one reassuring answer and one hazard that is worse than the question.

## The mempool half is fine, and mostly because it does not exist

**Under `miningConfig: {type: 'auto'}` there is no mempool to lose.** One block per raw transaction means `eth_sendRawTransaction` mines on the spot, so nothing is ever resident. That is a second argument for automine on top of "an interval mines blocks nobody reads": an interval CREATES a mempool, and a mempool in the tab has no other node holding it, so the tab is the only copy. On a real chain a dropped transaction is somebody else's problem; here it is the only copy of it.

**And if a send were lost, the framework already survives it, in the safe direction.** The submission record (actions plus secret) is written locally BEFORE the transaction goes out, and D10's reconciliation compares what is stored against what the chain holds. A lost COMMIT leaves nothing committed and the plan intact, so it is re-sent. A lost REVEAL leaves the commitment standing with the secret still stored, and under the manual policy there is no deadline to miss, so it is revealed again. The expensive direction is the reverse one (the chain holds a commitment and the browser has lost the secret), which is exactly what D9 and D10 are for.

**Batching into a mempool also buys nothing it is reached for.** Hotseat's secrecy problem is the shared screen, not the ledger: the chain only ever shows a hash, which D4 already states ("what the chain shows an NPC is a hash, so cheating through the CHAIN is structurally impossible in every mode"). So holding turns back to land them together is simultaneity theatre paid for in durability.

## The hazard is that an embedded world persists TWICE, independently

- the chain lives in **IndexedDB**, via webevm's `dumpState` / `loadState`
- the submission lives in **localStorage**, via `placement/storage.ts`

Two stores, two lifetimes, restorable to different points in time. And **rewinding the chain is a documented feature of an embedded world**, not an accident, which this plan already says in its own words.

**Only one of the two keys can tell one chain from another.** Compare them:

```
account/AccountData.ts   __private__${chainId}_${genesisHash}_${scopeAddress}_
placement/storage.ts     __placement_submission__${chainID}_${gameAddress}_${player}
```

`accountData` embeds the **genesis hash**. The submission record does not.

**Why that is specifically an embedded-world problem.** An embedded chain's `chainId` is an OPTION rather than a discovery - the worlds doc records this as a verified fact and treats it as good news, because it means a world's identity is known before its node exists. The flip side was not noticed: every fresh embedded chain therefore has the SAME chainId, and if the game is deployed by the same script it has the same address too. So a reset, a re-seed, or a restore from a different dump produces a genuinely different chain that **collides with the previous one's submission records under a byte-identical key**.

What `load()` then hands the client is a record describing a commitment that does not exist on this chain, or whose secret opens nothing on it. `accountData` is immune to the same reset, and that asymmetry is the tell: somebody already solved this for the operations ledger and the submission never got the fix, because until there was a second world no chain could be replaced underneath it.

## What it costs to fix, and it is not the same in the two repos

**In the template it is free right now, and "free" is a claim that was CHECKED rather than assumed**, per AGENTS.md's own rule: `git ls-files contracts/deployments` is **0 files**, so nothing is deployed, no record can be in flight, and a game built from this template starts at its own first deploy. Adding the genesis hash to the key is a rename with nobody to break.

**In reveal-or-die it is not free.** `git ls-files contracts/deployments` is **13 files** (rise-testnet), its key is `__world_submission_${chainID}_${gameAddress}_${avatarID}`, and its own storage module already says the prefix is a WIRE for exactly this reason. Changing it there costs the stake of every player holding an in-flight record, which is the failure AGENTS.md describes and which no suite can see. If it changes there it needs the read-both-shapes-for-a-release treatment.

**So the order is forced and it is worth stating: put the genesis hash in the template's submission key BEFORE the embedded world exists**, not as part of building it. Doing it first is a rename nobody notices; doing it afterwards is a migration in a repo that by then has a second world able to invalidate the first world's records.

One thing deliberately NOT concluded: whether the genesis hash is the right discriminator, or whether an embedded world should carry an explicit world id of its own. The hash is what the neighbouring file already uses, which is the argument for it; an explicit id would survive a chain that legitimately re-seeds to the same genesis, which the hash would not distinguish. That is a decision for whoever builds the world.
