---
title: The epoch policy reaches a descendant's CLIENT by merge and its CONTRACT never, so the wiring has to stay behind
type: observation
status: spotted
spotted: 2026-09-15
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 3, decision 1 in HANDOFF.md)
---

# reveal-or-die inherited the policy dispatcher and had to be put back on the timed tracker

Noticed during Phase 3's cascade into reveal-or-die, and it is the sharpest
instance yet of the hazard this tree keeps meeting: **a hunk that merges cleanly
because the two sides were never in textual conflict can still be semantically
wrong in the descendant.**

Phase 3 wires the reference game's composition root to a dispatcher that builds
the tracker the DEPLOYMENT's policy calls for, and hands it a reader that calls
`getRound` on the game contract. That change is six lines in
`web/src/lib/context/game.ts`. In reveal-or-die that file is the game's own -
one of the six it legitimately owns - and the six lines landed in it **without a
conflict**, because the descendant had not touched those particular lines.

The result compiled, `check` reported 0 errors, and 1,692 unit tests passed. And
it could not have worked: **contracts are not inherited in this tree** (decision
1), reveal-or-die's have not adopted the epoch policy, and `getRound` does not
exist on them. The first deployment to use anything other than the timed policy
would have called a selector that is not there.

Nothing in the tree would have said so, either. It is not a type error (the ABI
the client reads is generated from the descendant's own contracts, but the reader
casts), `verify` has no browser in it, and under the timed policy the reader is
never called at all - so even the e2e suite would have stayed green. **The failure
is latent until somebody changes a deploy parameter.**

## What was done, and why it is the right shape rather than a workaround

reveal-or-die stays on `createTimedEpochTrackers`, with the reason at the line:

> Contracts are not inherited in this tree, and this game's have not adopted the
> epoch policy: there is no `advanceRound` and no `getRound` to ask, so the epoch
> here IS what the clock says and asking would be calling a function that does
> not exist. The framework half is inherited and ready; switching to
> `createEpochTrackers` belongs in the same change as the contract that gives it
> something to read.

The framework half arrives anyway and is byte-identical to the stem's, which is
the point: `game/core/epoch.ts` holds all three policies, the prediction, and the
eighteen tests, and the descendant pays nothing for them until it wants them.

## The general form, which is new and worth stating

The tree already knows that a client change cascades and a contract change does
not. What Phase 3 adds is a case where **the client change is only correct if the
contract change travelled with it**, and the two halves are in different
inheritance regimes. Any framework feature that reads a new function off the game
contract has this shape: the seam is inherited, the surface it reads is not.

Two cheap rules follow, and neither needs tooling:

- **Wire a new contract read in the reference game's own composition, and expect
  every descendant to revert that hunk** until its contracts catch up. Say so at
  the line, as above, so the next cascade does not re-apply it by reflex.
- **Prefer a reader that DEGRADES over one that throws.** Here the timed policy
  never calls it, so the bad state is unreachable in practice; a framework
  feature that always reads would have been broken on arrival. That is luck
  rather than design, and a future one should be designed for it: if the
  descendant's contract cannot answer, the framework should have an answer that
  does not need it.

## What it would take for reveal-or-die to adopt it

Its own contracts, and the work is bounded: the shape is one virtual `_round()`,
one anchored formula, a waited-for count hooked to whatever entering means there
(custody of the avatar, exactly as on `with/nft-identity`), and one
permissionless `advanceRound`. The client half is already sitting in its tree,
tested. The trigger is a mode that wants it - hotseat or LAN, which is Phase 6 -
and the same is true of bomber-world and conquest.
