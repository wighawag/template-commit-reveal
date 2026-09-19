---
title: Under the manual cycle policy the state reader's block span is zero, and only a log-reading game can tell
type: finding
status: spotted 2026-09-18, not fixed
spotted: 2026-09-18
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4's block-time correction, Phase 6, the conquest port), web/src/lib/onchain/state.ts, web/src/lib/placement/state.ts, web/src/lib/game/core/cycle.ts
---

# A value that is correct for the reference game and wrong for the seam

**Where it is.** `web/src/lib/onchain/state.ts` sizes the block range it reads over as

```ts
const cycleDuration =
    Number(linkedData.commitPhaseDuration) + Number(linkedData.revealPhaseDuration);
...
const span = Math.floor((4 * cycleDuration) / currentScope.averageBlockTime);
const fromBlock = Math.max(0, toBlock - span);
```

with the comment "ask for roughly two cycles' worth, doubled, so late blocks cannot hide an event".

**Under the manual cycle policy both durations are zero**, and not by accident or by a stale deployment: the policy exists precisely to stop the durations and the policy disagreeing, and the contract refuses a configuration where they do. So `cycleDuration` is `0`, `span` is `0`, and `fromBlock === toBlock`. The reader asks for a one-block window on every poll, for the whole life of the deployment.

**Nothing catches it, and the reason is a seam doing its job.** `placement/state.ts` reads the board out of contract storage, so it never looks at `fromBlock`; only `toBlock` matters, as the pin that keeps batched calls from stitching together a board that never existed at any instant. Its own comment names who would care:

> `fromBlock`/`toBlock` are part of the seam because a game that builds its state from LOGS needs them (conquest does). This game reads the board straight out of contract storage, so the range is not used for content.

So the reference game is structurally unable to notice, every suite is green, and the value is wrong only for the consumer this repo does not contain yet.

**The near-miss is the interesting part.** `cycle.ts` already warns, in prose, that "a manual deployment read as timed would divide by a zero cycle and put the client on a clock the chain is not running". Zero-cycle arithmetic was on the author's mind. This site MULTIPLIES by the zero rather than dividing by it, so instead of an `Infinity` or a `NaN` that would show up somewhere, it produces a perfectly plausible `0` and degrades silently. **A guard written against division does not cover the multiplication next door.**

**How it was found: by trying to justify a claim rather than by a failure.** Phase 4's first write-up asserted that an embedded world's instant mining would make the reveal-window bound vacuous. Reading the code to support that showed the bound is not consulted at all under a manual policy, and the grep for the other consumers of `averageBlockTime` is what surfaced this. Three consumers, one of them wrong; the wrong one was not the one the claim was about.

**Not fixed, deliberately.** It is not Phase 4's: the embedded world does not read logs either, so landing a fix here would be a change with no consumer to verify it, which is the same mistake as the paragraph that found it. It belongs to whichever arrives first of Phase 6 (manual and hotseat) and the conquest port.

**And the fix is a decision, not a line.** Under a policy with no clock there is no "two cycles' worth of blocks" to ask for, because a cycle has no duration; the span has to come from something else. Three shapes, none obviously right: a block COUNT declared alongside the policy, a high-water mark of the last block the reader actually consumed, or a game-supplied span since the seam already belongs to the game that needs it. Whoever takes it should also decide whether `nodeCatchupBudgetMs` (`max(2000, averageBlockTime * 2000)`) still means anything on a chain whose block time measures how long a human deliberated, which is the same question one layer down.
