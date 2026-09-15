---
title: A contracts suite that starts committing without pinning the phase flakes one run in four
type: finding
status: fixed
spotted: 2026-09-15
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 3), contracts/test/js/EpochPolicy.test.ts
---

# The chain's clock is wall-clock, and a quarter of it is the reveal phase

Found while building the epoch-policy suite (Phase 3), by running the suite
several times rather than once. Three clean runs, then:

```
26 passing (26 nodejs)
6 failing (6 nodejs)
  1) Epoch policy
       refuses to be pushed when the clock is the only thing that decides:
   SolidityError: reverted with custom error 'InRevealPhase(44737102)'
```

Six failures, every one of them `InRevealPhase`, on a tree that had passed twice
in a row minutes earlier.

## The cause, which is arithmetic rather than timing

The hardhat network starts at the real clock, and this game's localhost
configuration is a 30-second commit phase and a 10-second reveal phase. So at
any given moment there is a **25% chance the chain is in a reveal phase**, and a
suite whose first action is `makeCommitment` fails outright when it is.

The existing suites never met this because `Game.test.ts` opens every test with

```ts
const {epoch: startEpoch} = getEpoch(await getTimestamp());
await advanceToEpoch(startEpoch + 2, true);
```

which is easy to read as boilerplate and is in fact the thing that makes the
suite deterministic. The new suite did not copy it, because it deploys a game of
its own with its own durations and the fixture's helper answers for the
deployment's.

## Two details worth keeping

**Advance AFTER the setup, not before it.** Every deploy and every entry mines a
block, and each block advances the chain's timestamp, so a suite that jumps to
the top of a commit phase and then spends a dozen transactions getting ready has
eaten a third of the window it still needs. The new harness deploys, enters its
players, and only then advances to the start of a fresh epoch.

**The mutation numbers were wrong before this was fixed, in the direction that
flatters.** Two mutation runs reported 7 failing tests where the honest answer
was 1 and 3: the flake was adding failures that had nothing to do with the
mutation. Re-running each in isolation is what showed it, and the tell was that
two unrelated mutations produced an identical failure list. **A mutation report
is only as trustworthy as the determinism of the suite it is measured against**,
and a suite that has just been written is exactly the one whose determinism
nobody has established yet.

## The general form

This is the plan's own load finding with the variable swapped. There the
variable is machine load and the symptom is a timeout; here the variable is
**what time of day the suite starts** and the symptom is a revert. Both produce
a red run on a tree that is fine, both are invisible in a single run, and both
are fixed by making the test say what it depends on instead of hoping.

So the rule for this repo's contract suites: **if a test commits, it must first
say which phase it is in.** Six clean consecutive runs is what established the
fix, because three was what the broken version had already produced.
