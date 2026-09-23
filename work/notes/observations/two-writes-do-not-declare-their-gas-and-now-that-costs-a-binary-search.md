---
title: Two writes do not declare their gas, and since webevm serialises the node that is a binary search in the round's path
type: observation
status: spotted
spotted: 2026-09-23
relates-to: web/src/lib/placement/advance.ts, web/src/lib/placement/missed-reveal.ts, web/src/lib/placement/config.ts (GasBudget), docs/adr/0003-the-deployment-declares-its-gas-budget-because-contracts-are-not-inherited.md, work/notes/findings/a-second-advance-succeeds-in-the-tab-and-the-first-one-did-not-take.md
---

# `advanceCycle` and `acknowledgeMissedReveal` estimate their gas; every other write declares it

**Spotted while verifying webevm 0.6.0**, and it is an OPPORTUNITY rather than a defect: nothing is wrong today and the measurements say so. Recorded because the reason it is worth doing changed underneath it, and the next person to read `GasBudget` will not know that.

## What was seen

Every write in this game passes an explicit `gas` except two:

| write | gas |
|---|---|
| `makeCommitment` (`placement/commit-reveal.ts:494`) | `config.gas.commit` |
| `reveal` (`placement/commit-reveal.ts:636`) | `config.gas.reveal` |
| `StakeSale.purchase` (`placement/acquisition.ts:42`) | `PURCHASE_GAS` |
| the played players' commit and reveal (`offline-players.ts:397,439`) | `config.gas.commit` / `config.gas.reveal` |
| **`advanceCycle`** (`placement/advance.ts:94-107`) | **none: viem estimates** |
| **`acknowledgeMissedReveal`** (`placement/missed-reveal.ts:176-190`) | **none: viem estimates** |

`sendPlacementTransaction` passes the request through to `writeContract` unchanged, so a request with no `gas` makes viem call `eth_estimateGas` first.

## Why it matters MORE than it did last week

`eth_estimateGas` is not one execution. It is a SEARCH: webevm probes candidate limits up to `MAX_ESTIMATE_PROBES` times, each a full `evmCall`.

Until webevm 0.6.0 that was merely wasteful. It is now the case its own ADR 0012 names as pathological, because the node serialises its whole public surface: while an estimate runs, every other request on that node waits. Upstream measured a concurrent `eth_getBalance` going from 0.1 ms to 208 ms behind one heavy estimate.

And this repo is in the arrangement that feels it. `lib/embedded/node.ts` runs the chain on the MAIN THREAD (`createWorkerNode` is an injectable option nothing uses), so the wait is the tab's. An advance happens TWICE per round, under the manual policy, forever.

## And yet it costs nothing today, which is the honest half

Measured against 0.6.0, production build, headless chromium, load ~1.1: the median round is flat at about 230 ms from three seats to twelve, and ten seats ran 0 of 56 rounds over half a second. `advanceCycle` is a cheap call, so its search is cheap; upstream's 209 ms figure was a deliberate `keccakLoop(4000)`.

So this is NOT the reason to act, and a note that implied otherwise would be the "explained before it was measured" failure the plan keeps catching. The reason to act is that the declaration is free, the place for it already exists, and the cost of not having it is now coupled to everything else the tab is doing rather than to this transaction alone.

## What it would take

`GasBudget` (`placement/config.ts:122`) is already `{commit, reveal}`, read from the deployment's `linkedData` under ADR-0003's rule that a deployment declares its gas because contracts are not inherited. A third and fourth member would follow exactly the same path: `advanceGas` and `acknowledgeGas` on the contract's linked data, `readBigInt` beside the other two, and the two call sites above passing them.

Three things to settle first, which is why this is an observation and not a task:

- **`gasPerExpectedTurn` must NOT grow by them.** It sizes the signer's stipend from what a TURN costs, and an advance is not a turn: it is permissionless, anyone may send it, and this browser is simply the one that noticed. Folding it in would fund every player for work most of them never do.
- **`acknowledgeMissedReveal` is the player's press and forfeits the bond**, so the cost of getting its limit wrong is not symmetric with the others. A limit too low reverts a settlement the player deliberately asked for, which is exactly the moment to be most careful.
- **ADR-0003's rule cuts both ways.** A required parameter fails a deployment that does not declare it (`readBigInt` throws). Adding two more REQUIRED ones breaks every existing deployment record, and this repo deliberately commits none, but a descendant may. `optionalBigInt` with an estimate fallback is the compatible shape and is a weaker guarantee; decide which before building it.

## The general point, which outlives this item

**A cost that used to be local is now shared.** Before 0.6.0 an unnecessary `eth_estimateGas` cost only its own caller some milliseconds. After 0.6.0 it costs every other request on that node the same milliseconds, because the node serves one at a time. That is the right trade and it was made deliberately (its ADR prices it), but it changes the accounting for every read and every estimate this app issues against an embedded chain. Anywhere the client can state a bound instead of asking the chain to search for one, it now has a second reason to.
