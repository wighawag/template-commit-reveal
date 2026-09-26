---
title: Under a manual cycle the framework reads reveal logs from one block, or from NaN, and says nothing
type: finding
status: spotted 2026-09-26; worked around in bomber-world only; the fix belongs in the template
spotted: 2026-09-26
relates-to: web/src/lib/onchain/state.ts, web/src/lib/game/core/chain-time.ts, work/tasks/done/port-bomber-world-onto-reveal-or-die.md
---

# The reveal-log range is sized in seconds, and a manual cycle has none

**Found by bomber-world's new `offline-bombs.e2e.ts`**, which is the first test anywhere in the tree that asserts on something only the reveal LOG can put on the board. A bomb is placed from `CommitmentRevealed`, so when the log read came back empty the bomb was missing, where a missing walk animation had gone unnoticed.

## What happens

`createPollingOnchainState` in `web/src/lib/onchain/state.ts` hands the game's reader a block range for its `eth_getLogs`:

```ts
const span = Math.floor((4 * cycleDuration) / currentScope.averageBlockTime);
const fromBlock = Math.max(0, toBlock - span);
```

with `cycleDuration = commitPhaseDuration + revealPhaseDuration`. Two ways that goes wrong, both under the MANUAL policy, which is what every offline world deploys:

1. **Zero blocks.** A manual deployment's durations are zero by construction (`UsingGameStore` refuses anything else: "a manual cycle has no clock"). So `span` is 0 and the range is the latest block alone. Every reveal in an earlier block is never read.
2. **`NaN`, intermittently.** `game/core/chain-time.ts` computes `averageBlockTime = (latestBlockTime - olderBlockTime) / blockCount`, and the offline chain (`allowBlocksWithSameTimestamp`) may mine blocks that share a timestamp, so it can be 0. Then `0 / 0` is `NaN`, `fromBlock` is `NaN`, and a reader that chunks the range with `for (from = fromBlock; from <= toBlock; ...)` runs its loop no times: no request, no error, no warning. Whether it happens depends on which blocks were sampled, so it comes and goes between runs.

## Who has it

**template-commit-reveal** (the file is its), and so **reveal-or-die** and everything below. reveal-or-die reads the same logs for its walk replays (`lastTurn`) and for `world/hold.ts`'s "did it enter or was it panned onto" question, so offline its avatars teleport rather than walk, and an entry can appear a few seconds early. Nothing failed, because nothing asserted on either: `offline.e2e.ts` reads avatars from storage.

## What bomber-world did, and why only there

A floor in its OWN reader, `world/state.ts` (`MIN_LOG_BLOCKS`, one request of 1000 blocks), and a non-finite start treated as the degenerate range. On a timed chain the framework's range is already longer, so it changes nothing there; logs are filtered by cycle and zone on the node, so the wider range costs no extra results. Pinned by two unit tests, the NaN one watched failing without the guard.

It is a workaround, done game-locally only because that task was told not to touch the template. **Once the framework is fixed, that constant should go.**

## The fix, when someone takes it

In `onchain/state.ts`: a floor on the span (something like one `MAX_BLOCK_RANGE`), and a guard for a non-finite or zero block time. Better still, a manual cycle could map cycles to blocks directly (the chain knows at which block each phase advance happened), which would make the range exact rather than generous. Either way, add an offline e2e assertion that a turn from an earlier block is visible in `lastTurn`, because that is the assertion whose absence let both defects through.
