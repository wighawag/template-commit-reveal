---
title: An automined chain's clock only moves when somebody sends a transaction, and every READ happens at the last one
type: finding
status: measured 2026-09-19 while building the embedded world; not a defect to fix, a property to design against
spotted: 2026-09-19
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, the block-time correction), webevm 0.5.0, contracts/src/game/internal/UsingGameInternal.sol
---

# The argument for the manual policy turned out to have a second half, and this is it

The plan already says an embedded world runs the MANUAL cycle policy, and the reason it gives is about what a world is FOR: single-player and hotseat, where the human decides when a turn ends, so there is no clock to run on. That reasoning is good and it is not the only one. Measured while building the world, there is a mechanical reason as well, and it is sharper: **a timed game in an automined tab does not work at all.**

## What was measured

webevm mines one block per raw transaction under `miningConfig: {type: 'auto'}`, and a mined block's timestamp is `Date.now()`. So far so expected. The part that is not expected is the READ path:

```js
// webevm 0.5.0, node.js, the read helper every eth_call and eth_estimateGas goes through
block: blockStore.get(latestNumber).block,
```

`eth_call` and `eth_estimateGas` execute against the LAST MINED BLOCK, with that block's timestamp. Under automine a block exists only where a transaction happened. **So between transactions the chain's view of time is frozen at the last one**, however long the human sits there.

It is not a subtle effect and it does not degrade gracefully. Running the gas harness against a TIMED deployment (commit 30s, reveal 10s, the shipped local config) on webevm:

- the first commit lands fine and mines a block at `t`
- the client waits out the commit phase by the wall clock and sends the reveal
- rocketh estimates gas first, the estimate runs at the frozen timestamp `t`, and the contract answers `InCommitmentPhase(44802951)`

The reveal is refused before it is ever sent, at a phase boundary the wall clock passed thirty seconds ago. Adding `await node.mine()` before each send - an empty block, purely to move the clock - makes the whole scenario pass. That workaround is the shape of what a timed embedded world would need: blocks mined for no reason except to advance a clock, which is exactly the interval mining the plan rejected on the grounds that it would mine blocks nobody reads.

## Why this is not a bug report

Nothing here is wrong. An execution-only local chain has no reason to invent blocks, and reading at the latest block is what every node does; the difference is that on a real chain the latest block is never more than a few seconds old. The mistake would be to read this as a webevm limitation and route around it, rather than as the thing it is: **a chain with no traffic has no time, and a game that needs a clock needs traffic.**

## What it settles, and what it leaves open

**Settled: `{type: 'auto'}` with no interval, and the MANUAL policy, are one decision rather than two.** Manual is the policy whose phases never consult `block.timestamp`, which is the only policy this clock can serve honestly. Recorded at the decision in `web/src/lib/embedded/node.ts` on jolly-roger's `with/embedded-chain`, so the next person to consider "an interval would be safer" reads the measurement first.

**Left open, and worth knowing before someone wants it:** a LAN world, or an embedded world someone insists on running timed, needs a block source. The honest options are an interval (which recreates a mempool the tab is the only holder of) or a heartbeat that mines only while a phase boundary is pending. Neither is needed by anything today.

**And it narrows the plan's own correction by one clause.** Phase 4's write-up says a timed embedded world "would consult the block time and would get a number measuring how fast its own player clicks". True, and too kind: it would also estimate, and refuse, at a timestamp from the player's last action. The remedy the plan offers for that case (declare `averageBlockTimeMs` in chain properties) does not touch this, because this is not about the average, it is about there being no new block at all.
