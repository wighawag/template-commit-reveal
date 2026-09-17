---
status: accepted
date: 2026-09-17
---

# The forfeit takes no chunk, because the bond already knows what is outstanding

A turn may now be bigger than a transaction: the commitment is the head of a
hash chain and each reveal opens one chunk. The design this is ported from makes
the SETTLEMENT multi-transaction too - stratagems' `acknowledgeMissedReveal`
takes `moves`, a secret and a `furtherMoves`, and walks the same chain with the
same full-chunk rule. **We do not.** `acknowledgeMissedReveal(player)` takes the
identity and nothing else, and closes a commitment however far the chain got.

**The rule that produced it: a penalty computed from what was revealed must be
shown what was revealed; a penalty fixed at commit time must not be.** Which one
a game has is a property of its stake, not of its chaining.

Here the penalty is the bond, set when the commitment was made, and `_reveal`
decrements it by each chunk's cost as that chunk lands. So the contract already
holds the figure the settlement needs: what is left earmarked is exactly what
was never opened. Nothing the caller could supply would tell it anything it does
not know.

## Considered options

**Walk the chain, as stratagems does.** Rejected, and the strongest argument
against it is not the cost of the code. It would require the SECRET, from a
player who has by definition gone silent - so the settlement would depend on the
very thing that failed. Anyone may settle anyone's missed reveal here
(deliberately: that is what stops a stalled player freezing a manual cycle), and
a settlement only the absent player can perform is not a settlement. It would
also mean a partially revealed turn takes several transactions to void, each one
paid for by whoever is unblocking the game rather than by whoever abandoned it.

**Refuse to settle a partially revealed commitment.** Rejected outright, and it
is the failure the ported design's warning is about: the head points at a chunk
nobody will ever submit, the commitment stays open, and every later
`makeCommitment` by that player reverts with `PreviousCommitmentNotRevealed`.
Forever, with nothing able to resolve it. Pinned by "settles a half-revealed turn
in ONE call, and frees the next cycle", whose second half is the part that
matters: settling that did not unblock the next turn would be a formality.

**Forfeit the WHOLE original bond rather than the remainder**, on the argument
that a player who reveals the profitable half of a turn and abandons the rest has
bought an option. Rejected after checking the economics rather than before. The
bond is the exact cost of the placements, and revealing a chunk spends that cost
out of the reserve in return for board position; abandoning the tail loses the
same tokens and gets nothing. So the proportional forfeit is already
strictly worse for the player than revealing, which is the property the stake
needs, and keeping the original bond would have needed a second stored field to
mean the same thing.

## Consequences

**A game that forfeits per ACTION has to revisit this**, and that is said at
`_acknowledgeMissedReveal` rather than only here. If a game's `_forfeit` burns
per revealed action, the contract no longer knows what is outstanding and the
settlement needs the chunks after all.

**An INDIVISIBLE stake makes the forfeit all-or-nothing however far the chain
got**, which is not a defect of this decision but is worth knowing before
reading the identity branches' tests. On `with/nft-identity` the stake is custody
of an avatar, so a half-revealed turn loses the whole avatar exactly as no turn
revealed would. A game that wants proportionality has to stake something
divisible.

**The tally is where the real hazard lives here, and it is a separate decision
that this one must not be read as covering.** `_recordReveal` fires only on the
chunk that closes the chain. Counting a partial reveal lets unanimity close the
cycle while a player still owes chunks, and those chunks are then unrevealable:
half a turn applied and the rest lost, by somebody else's advance. That is the
analogue of the unsettleable commitment in this framework, and it is what "will
not let the cycle close on a half-revealed turn" pins.
