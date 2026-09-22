---
title: In a browser, the advance that opens the reveal phase succeeds, emits its event, and leaves the cycle in the commit phase
type: finding
status: open, reproduced 2026-09-22 in template-commit-reveal (all four branches share the code); NOT reproduced under node, so it is the chain in the tab rather than the rules
spotted: 2026-09-22
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 6, the lobby), web/src/lib/offline-seats.ts (MOST_SEATS), web/src/lib/game/core/advance.ts, contracts/src/game/internal/UsingGameInternal.sol
---

# Two `advanceCycle` transactions open the same reveal phase, and the first one did nothing

**What this is about.** The offline world now has a lobby, so a player can sit down at a table of three to five. The plan asked whether a round degrades LINEARLY with the number of seats, since the world acts for its players in one sequential pass and N seats is 2(N-1) transactions in series. The answer is that it does not degrade linearly, it does not degrade with transactions at all, and what it actually degrades with is a lost state write.

## The measurement

Headless chromium, production build (`pnpm web:build localhost` then `vite preview`), five runs per row, load 1.3 to 2.1. A ROUND is the human's commit, an advance, every reveal, and a second advance.

| seats | transactions in a round | a round |
|---|---|---|
| 3 | 6 | 114-237 ms |
| 4 | 8 | **1.33 s** first, then 224-230 ms |
| 5 | 10 | **1.32 s** first, then 210-273 ms |
| 6 | 12 | **3.8-4.4 s**, every round |
| 8 | 16 | **3.8-4.4 s**, every round |

A transaction on a chain in a tab costs 15 to 20 ms, so the arithmetic says sixteen of them is a third of a second. The table is a staircase in whole POLL INTERVALS instead: one second is the advance client's backstop poll and the played players' own, and two seconds is `RETRY_BASE_MS` in `game/core/advance.ts`. 1.33 s is one lost advance; 4.3 s is one lost advance plus one refused advance's backoff.

Boot and restore are flat across the same range (332-370 ms and 178-211 ms at three seats, 353-364 ms and 218-233 ms at eight), which is worth stating because it rules out the obvious suspect: provisioning is per seat, it buys a stake through the real sale for each one, and it costs nothing measurable.

## What is actually happening, read off the chain

Instrumented in the page: subscribe to `cycleAdvance`, and after every attempt read `getCycle` and `getAttendance` repeatedly. At five seats, with all five committed:

```
63ms  advance Advancing
77ms  advance Idle            <- success: the receipt is not reverted
79ms  after: blk 20 c2 commit 5/5 rev 0
      ... eleven more reads over 300ms, all "c2 commit 5/5" ...
955ms advance Advancing       <- the one-second backstop poll
980ms advance Idle
985ms after: blk 22 c2 reveal 5/5 rev 1
```

And the blocks, with their logs:

```
blk 19  makeCommitment   success
blk 20  advanceCycle     success   CycleAdvanced(cycleNumber=2, commiting=false)
blk 21  advanceCycle     success   CycleAdvanced(cycleNumber=2, commiting=false)
blk 22+ reveal x5
blk 27  advanceCycle     success   CycleAdvanced(cycleNumber=3, commiting=true)
```

So **two transactions both took the commit branch of `_advanceCycle` and both emitted the event**, 890 ms apart, and only the second one's write is visible afterwards. The first one is not reverted, is not out of gas, and its event is in its own receipt.

At six seats and above the mirror image also appears: an `advanceCycle` sent after every reveal has landed REVERTS (with `StillWaitingToReveal`, on a state that reads 6 revealed of 6 committed), which starts the framework's exponential backoff and costs the extra two seconds. The next attempt succeeds.

## Why it is not the contract, and not the client

**Not the contract.** The same contract, the same deployment data, the same webevm, driven under NODE (`vitest --project server`, five enrolled members, all committed) advances once and then refuses:

```
advance 0: status=success blk=19 before=2/true after=2/false
advance 1: ContractFunctionRevertedError: StillWaitingToReveal(0, 5)
```

which is exactly right. `_advanceCycle` reads `_cycle()`, and `_cycle()` under `Manual` returns the stored `commiting` flag, so a second advance in the reveal phase cannot take the commit branch.

**Not `advancePermitted`, and not the backoff.** The client-side mirror of the guards refuses silently and records no failure, so it cannot produce a backoff on its own; and the client only re-sent because the chain kept telling it the phase had not moved.

**Not a race between two `check()` calls.** There is a real hole there - `check()` awaits `readAttendance()` before calling `push()`, and `push()` does not re-test `inFlight` - but the two advances here are 890 ms apart, and the second is the backstop poll firing because the first appeared not to work. Repeated fresh reads in between (a dozen over 300 ms) all say the phase is still commit, before any second send exists.

**It is seat-count dependent, which is the only clue about the mechanism.** At three seats it never happens. From four up it happens to the first advance of a round. At six it also happens to the second. The one thing that changes is how much traffic the tab's chain is handling around that moment.

## Why it matters beyond the lobby

It is why `MOST_SEATS` is five. The ceiling is a measurement, not a principle: the largest table at which a steady round is still a fifth of a second. The comment on that constant says so and says to re-measure it when this is fixed.

It is also a warning about a claim this tree has relied on. An offline world exists so the game can be exercised end to end without a node, and the claim underneath it is that what the client sees in a tab is what it would see anywhere. Here a transaction reported success, emitted the event that says what it did, and did not do it. **A receipt that is not reverted is not, in this environment, evidence that the state moved.** Everything that has been measured in the tab so far involved one member and six transactions a round, which is exactly the regime where this does not fire.

## What has NOT been done

Nothing is fixed. In particular:

- webevm has not been read, and no minimal reproduction outside this app exists. The next step is a script that drives the chain in a page directly - no app, no players, no pollers - and sends N unrelated transactions followed by one advance, to find where the threshold is and whether it is concurrency or volume.
- The `inFlight` hole in `createCycleAdvance` is real and is worth closing on its own merits (a second `check()` entering while the first is between its read and its push can send a duplicate advance), but it is NOT the cause here and closing it would not change these numbers.
- Making the client verify that an advance actually moved the phase, and retrying immediately when it did not, would hide this rather than fix it, in framework code that every repo in this tree inherits. Not done, deliberately.
