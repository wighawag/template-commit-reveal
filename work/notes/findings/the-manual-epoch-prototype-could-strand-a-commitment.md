---
title: The manual-epoch prototype could advance the epoch out of a commit phase, stranding every commitment in it
type: finding
status: fixed upstream 2026-09-15; fixed in reveal-or-die 2026-09-26 (53d10d35, `moveToNextEpoch` removed) and so in bomber-world by cascade; the unanimity guard in their `_moveToNextPhase` is still missing
spotted: 2026-09-15
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 3, D10, the mode matrix's epoch axis)
---

# `_moveToNextEpoch` was not merely incomplete, it was unsafe

The plan describes the bomber-world prototype as proven in shape, with "its two
TODOs exactly the missing work":

> `_epoch()` in bomber-world is already `virtual` and already dispatches
> between a stored `ManualEpoch` and the timed formula. So the shape is proven:
> epoch policy is one overridable internal plus a small piece of stored state.

The shape was proven and that sentence is right. **What it understates is that
one of the prototype's two entry points would lose a player their stake**, and
the TODOs do not mention it, because they are about the features that were
missing rather than the behaviour that was there.

## The defect, in four lines

```solidity
function _moveToNextEpoch() internal returns (ManualEpoch memory) {
    ManualEpoch memory currentManualEpoch = _getManualEpoch();
    _manualEpoch.epoch = currentManualEpoch.epoch + 1;
    _manualEpoch.commiting = !SKIP_COMMIT;   // true, unless commits are skipped
    return _manualEpoch;
}
```

Called while the round is in the COMMIT phase of epoch N, that lands the round
in the commit phase of N+1. The reveal phase of N never happens.

So a player who committed in N can never open their commitment: `_reveal`
refuses it (`InvalidEpoch`), and `_acknowledgeMissedReveal` then settles it as a
miss, taking whatever the game puts at stake. Nothing reverts, nothing is
logged, and the player did exactly what the game asked of them.

**It is the arithmetic property D10 rests on, broken by a transaction.** The
timed formula has no trailing segment - `epochDuration = commitPhaseDuration +
revealPhaseDuration` - so a commitment in the current epoch is always still
openable, which is why round reconciliation needed nothing at all for the
too-late case. A manual advance that skips a phase punches a hole straight
through that, and it is the only thing in the tree that can.

## Why nothing caught it

- **It is unreachable on a timed deployment**, which is every deployment this
  tree has. Both `_moveToNextEpoch` and `_moveToNextPhase` begin by refusing
  unless both phase durations are zero, and no deployment sets them so. So the
  function is dead code in practice - which is exactly why it survived: it ships
  in five contracts, is exposed on the router in three of them, and is exercised
  by nothing.
- **`SKIP_COMMIT` made it look deliberate.** With commits skipped, "next epoch"
  and "next phase" really are the same move, and this function is the right one.
  The trap is the OTHER case, where the same flag leaves `commiting` true.
  That is the conflation the plan already names, arriving as a bug rather than
  as a design smell.

## What replaced it

One entry point, `advanceRound()`, whose only transitions are commit -> reveal
within an epoch and reveal -> the next epoch once every commitment in the epoch
has been opened. The skipping case cannot be expressed, which is the fix: it is
not that the dangerous branch is guarded, it is that there is no branch.

Pinned by `advances a manual round into the REVEAL phase, never past it` in
`contracts/test/js/EpochPolicy.test.ts`, and the mutation that reinstates the
old behaviour (`epoch + 1, commiting = true` in the commit branch) fails **six**
tests including the order-independence replay. Both zero-length phases are also
refused at construction now, so the derivation that made this reachable is gone
from the configuration as well as from the code.

## It is still live downstream, and that is the reason this note exists

Contracts are not inherited in this tree (decision 1 in `HANDOFF.md`), so the
fix does not travel:

| repo | state |
|---|---|
| `template-commit-reveal` (all four branches) | fixed |
| `reveal-or-die` | ~~**still has it**~~ **FIXED 2026-09-26** (53d10d35): `moveToNextEpoch` removed from the route, the interface and the internal, pinned by a test that reads the deployed ABI. It had become reachable, because reveal-or-die's offline world is manual |
| `bomber-world` | ~~still has it~~ **FIXED 2026-09-26** by cascade from reveal-or-die |
| `conquest`, `catacombs`, `stratagems` | unchecked - conquest and catacombs both carry the same epoch code |

In reveal-or-die it is as unreachable as it was here, for the same reason: its
deployments declare real durations. **The trigger is somebody wanting a manual
epoch in a game whose contracts predate this phase**, which is precisely what a
hotseat or LAN mode is (Phase 6), so the next person to reach for it is the
person who would be bitten.

Cheapest safe advice for a game that has not adopted the policy: delete
`moveToNextEpoch` and `moveToNextPhase` from the router and the interface. They
do nothing on a timed deployment, so removing them costs nothing and removes the
only route to the defect.
