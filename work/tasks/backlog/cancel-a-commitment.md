---
title: A player can take a commitment back while the commit phase is still open, and liveness decides who wins
slug: cancel-a-commitment
spec: games-on-this-foundation
blockedBy: []
---

# Cancelling, and the one case where cancel and liveness want opposite answers

## Start here, from a cold context

```sh
cat CONTEXT.md
git show work:work/specs/proposed/games-on-this-foundation.md   # D10 and the board handover, for the seam precedent
```

**The template currently ships an unreachable contract function.** `cancelCommitment` is on `GameCommit.sol` and `_cancelCommitment` in `UsingGameInternal.sol` enforces the rule properly (commit phase only, a commitment must exist, and it must belong to the current cycle). Nothing in `web/src` calls any of it: the only `cancel` in the client is the connection flow's. `SubmissionStore` has no way to reach it.

`HANDOFF.md` has recorded this as "No `cancel`" under known-not-to-fit for some time, with the note that it is "cheap to add". It is cheap to add and it is not cheap to decide, which is why this is a task rather than a line item.

## Why it was never built, and why that reason expired

**The reason was the tight clock.** A cycle here is short, the commit phase is a matter of seconds on a local chain, and a cancel that has to be signed, broadcast and mined inside that window looked like something a player could never actually use.

**That reason does not survive its own premise.** The game already lets a player commit EARLY, well before the phase closes, which is exactly the situation in which they may then want it back: they have several seconds of clock left and have changed their mind. If committing early is useful, taking it back before the same deadline is useful for the same reason and by the same arithmetic. The contract already permits it and already checks the deadline.

So: **cancel is allowed until the clock has passed**, which is precisely the window the contract already enforces. Nothing new is needed on chain.

## The decision this task exists to make

**A cancel that has been STARTED must suppress the auto-commit** - otherwise the player presses cancel, the phase closes a moment later, `autoCommit` fires on the plan that is still sitting in the store, and the commitment they just took back is immediately re-made. That is the whole feature defeating itself, and it would look like a bug in the button.

**And that is where it collides with liveness, because the two games want OPPOSITE answers.**

- **The reference game here (placement):** the stake is a bonded ERC20, forfeited by `acknowledgeMissedReveal`. Not committing costs nothing beyond not playing. So a deliberate cancel should WIN: the player said take it back, and nothing punishes them for the cycle passing quietly.
- **reveal-or-die:** a commit must be made EVERY cycle. Going silent for `numMissesAllowed` consecutive cycles kills the avatar, which is the only way to die there, and `commitWhenIdle` exists precisely to keep a standing-still player alive. So a cancel must NOT suppress the auto-commit: suppressing it would turn a change of mind into a step towards losing the avatar, and the player would have no idea that is what they did.

So the resolution is not a flag with a right default, it is a SEAM: the framework owns WHEN a cancel suppresses the auto-commit, and the game owns WHETHER it does.

**The precedent is exact and it is worth copying rather than re-deriving.** `game/core/handover.ts` splits the same way: the framework owns the WHEN (hold during the wait, release when the cycle is over) and the game owns the RULE, because the one case neither can decide - an entity seen for the first time mid-window - has opposite right answers in the two games. The spec's own words: "Two games, two defaults, one wrapper. That is the seam being in the right place, stated as a measurement rather than a hope." This is the second instance of that shape, which is itself worth noting.

## What is already true, so nobody re-derives it

- **The contract needs nothing.** `_cancelCommitment` reverts `InRevealPhase` outside the commit phase, `NoCommitmentToCancel` when there is none, and refuses a commitment belonging to another cycle. The bond is released by the same path. Read it before designing the client half.
- **`cancelCommitment(uint256 player)` is delegable**, like `makeCommitment`, and for the same reason: the browser that made the commitment is the one that knows it should go.
- **`SubmissionState` has no cancel-shaped step today**: `Idle | Planning | Committing | Committed | Revealing | Revealed | Missed | Error`. Whether cancelling needs its own step, or whether it is a transition back to `Planning`, is part of what this task decides. Note D10's lesson before adding one: the recovery store had a `Recovered` step that was unreachable by construction and had to be deleted, because it was the one thing able to tell a reconstructed submission from a restored one. Ask what a new step would let the app distinguish, and whether it should be able to.
- **`autoCommit` is a flag and `autoReveal` deliberately is not.** Whatever this adds should respect that asymmetry: auto-reveal protects the stake and is never taken away from the player, so nothing here may make a reveal less likely.

## The questions this task must answer, none of which are settled

1. **What is the state model?** Is there a `Cancelling` step, or does the store go back to `Planning` with a pending on-chain cancel? What does the HUD say while it is in flight?
2. **What happens if the phase closes while the cancel is in flight?** The transaction may be mined after the window shuts, in which case it reverts `InRevealPhase` and the commitment stands. The player will have been told it was cancelled. That is the missed-reveal hazard in a new costume and it is the dangerous case.
3. **What if the cancel lands and the auto-commit was already sent?** Order is the mempool's. Both orders must leave the player somewhere they can understand.
4. **Does cancelling leave the plan in place to re-commit, or clear it?** Placement and reveal-or-die may differ here too.
5. **What does the secret in storage do?** `save()` writes it before the commitment is sent, deliberately. A cancelled commitment's secret is dead, but a cancel that reverts means it is not - so do not clear it on the optimistic path.

## Out of scope

**Anything on chain.** The contract half exists and is correct.

**Cancelling in the reveal phase.** The contract refuses it and it should: a commitment that has reached the reveal phase is one the player owes a reveal on, and letting them withdraw it then would be a costless way not to reveal, which is the one thing this template exists to prevent.

## Acceptance

- The reference game can cancel a commitment from the HUD while the commit phase is open, and the bond returns.
- **A cancel suppresses the auto-commit in the reference game and does NOT in reveal-or-die**, both pinned by tests rather than asserted, and both checked by mutation: flipping the game's answer must fail a test in that repo and only there.
- The in-flight case is covered: a cancel that reverts because the phase shut leaves the player correctly told the commitment still stands, and still able to reveal it.
- `check` 0, both unit suites at their recorded counts plus whatever this adds, `contracts:test` green, on every node the change reaches.
- e2e for the happy path, because a HUD button that never renders passes every other gate.

## Checked by mutation, not just green

The two mutations that matter are the seam's two halves: make the cancel suppress auto-commit in reveal-or-die and confirm a test there fails; make it not suppress in the reference game and confirm a test here fails. If either passes, the seam is decorative.

Third, and it is the one with money in it: make the cancel clear the stored secret optimistically, before inclusion, and confirm something fails. If nothing does, question 5 has no guard.
