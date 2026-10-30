---
title: A tab closed while a commit is still in flight can lose the whole bond, because a later cycle clears the uncommitted record without asking the chain
type: observation
status: spotted
spotted: 2026-10-30
relates-to: web/src/lib/game/core/submission.ts (`restore`, `storedTurnFor`), web/src/lib/game/core/commit-reveal/storage.ts (`storedTurnsFor`), web/src/lib/placement/context.ts (`missedReveal.committedTurn`), work/tasks/done/the-committed-record-is-durable-before-committed.md
---

# A commit still in flight when the tab closes leaves a record a later cycle throws away

**IMPORTANT: this can cost a player their whole bond, silently.** It is the window the durability fix (`the-committed-record-is-durable-before-committed.md`, `main` ee68c542) does NOT close, because nothing has been written yet that could be made durable.

## What happens

`commit()` stores the pre-commit record durably (`committed: false`, the secret, and the `commitmentHash`) and then sends the commitment. It waits for the wallet prompt and for the receipt, and only then writes the committed record. A tab closed anywhere in that wait leaves only the pre-commit record, but the commitment may still land on chain (the transaction was signed and broadcast).

- **In the SAME cycle** this is handled: `storedTurnFor` sees the chain's live commitment hold the plan's `commitmentHash` and takes the plan up as committed (`recovered`).
- **In a LATER cycle** it is not, as far as the code reads: `restore()` finds a record of an earlier cycle with `committed: false` and calls `storage.clear()` ("an uncommitted one costs nothing and is just dropped") without asking the chain. If the commitment did land, that record held the only copy of a random secret, and there is no `committedTurns` entry either, so the missed-reveal settlement cannot be shown the chunks (`storedTurnsFor` falls back to the plan's record only while it still exists). The settlement then forfeits the WHOLE bond instead of what the placements would have cost. A game that derives its secret (`createDerivedSecret`) can still recover it by re-deriving; the reference game's default `randomSecret` cannot.

The HUD does not invite a close in this window (it says the turn is committing, not that it is safe to leave), which is why it is rarer than the gap that was fixed. It is not rare, though: a player who signs in the wallet and closes the tab at once, or whose receipt is slow, is in it.

## Not yet verified

- No test reproduces it. The claim is read from the code (`restore()`'s earlier-cycle branch) on `main` ee68c542.
- Whether the missed-reveal reader (`placement/context.ts`, `createMissedReveal`'s `committedTurn`) can read the plan's record BEFORE `restore()` clears it on load has not been checked. If it can, the settlement may sometimes still get the chunks, by luck of ordering.

## The obvious shape of a fix (a task of its own, not decided)

Before clearing an earlier cycle's uncommitted record that carries a `commitmentHash`, ask the chain, the way `closeEarlierTurn` already does for a committed one (`adapter.commitmentStatus`, or the missed-reveal reader's head): a record the chain holds is a committed turn that was never recorded as committed, and must be kept, and moved into `committedTurns`, for its settlement. Only a record the chain does not hold is a plan that may be dropped. A storage or adapter that cannot be asked should probably KEEP the record rather than clear it, since keeping a stale plan costs nothing and clearing a live commitment costs the bond.

Test-first: a unit test with the pre-commit record stored, the chain holding its hash for the earlier cycle, and a page opened in a later cycle; today it should show the record cleared (red), and the settlement should then be able to read the chunks.
