---
title: webevm 0.7 rejects a pinned eth_call to a past block, and the poller pins to one on purpose
type: observation
status: spotted
spotted: 2026-09-28
relates-to: web/src/lib/onchain/state.ts (createPollingOnchainState), reveal-or-die web/src/lib/world/state.ts (readBatch, blockNumber pin), webevm 0.7.0
---

# The fix upstream turns silent drift into a possible stall here

**What changed in webevm.** Up to 0.6, `eth_call` ignored its block parameter and always answered from the latest state (found 2026-09-27 while diagnosing bomber-world's jumping walks). 0.7.0 fixes that by REJECTING a call pinned to any block other than the head. A follow-up that serves a range of recent blocks is in progress.

**Why it matters to this tree.** The poller reads `getBlockNumber()` (uncached since `f08cbcc4`), and a game's reader pins its entity read to that block (`blockNumber: BigInt(toBlock)` in reveal-or-die's `world/state.ts`) and ends its log range there, so the position and the log of the move that produced it describe the same moment. On a real node that is exactly right. Offline, the world's other players send transactions continuously and the node automines, so a block can land between reading the number and making the call. Under 0.7 that call is refused.

**What the refusal would do.** The reader sees a failed read; the polling store treats that as a failed fetch, retries, and after its budget backs off behind the RPC-health banner. So the release that fixes silent drift could make the offline board stall visibly, most under load (four seats) and around reveals, when most transactions land.

**Not yet exposed.** Every repo here depends on `webevm ^0.6.0`, and for a 0.x package that caret excludes 0.7, so nothing picks it up until someone bumps it deliberately. Decided 2026-09-28 to WAIT for the range support rather than bump now.

**When bumping, do this:**
1. Run the offline frame-sampling probe (4 seats, 30 cycles) in bomber-world and count failed reads, not only jumps. The probe is a throwaway kept outside the repo; rebuild it from the description in bomber-world's commit `9033cb09` if it is gone.
2. If refusals still happen (the range may not cover the gap, or 0.7 is taken without it), the fix is in the POLLER, here: treat a pinned read refused for a past block as "the chain moved", re-read the block number and redo both reads, rather than failing the fetch. It belongs here because the pinning contract (one block for entities and logs) is this template's, and every game reader inherits it.
3. Check the other readers that pin (`getLogs` ranges are fine; only `eth_call` with a block tag is affected).
