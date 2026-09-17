---
title: The bond is public, so bonding the exact cost tells everyone how many actions the commitment hides
type: finding
status: OPEN
spotted: 2026-09-17
relates-to: web/src/lib/placement/commit-reveal.ts, contracts/src/game/internal/UsingGameInternal.sol, docs/adr/0002, the credits work
---

# A commitment that hides WHAT is being done, and announces HOW MUCH

## The leak

`makeCommitment(player, commitmentHash, bond, payee)` takes the bond in the
clear. It is then public twice over: `CommitmentMade` carries it, and
`getCommitment(player)` returns it in the `Commitment` struct, which every
client in this lineage already reads on every cycle turn.

The reference game's client bonds **the exact cost of what was planned**:

```ts
const bond = costOfPlacements(config, actions.length);
```

So `bond / placementCost` is the number of placements in the hidden turn,
available to anybody, before a single reveal. The commitment hides WHICH cells
and discloses HOW MANY.

## Why it was written that way, which is not a bad reason

Bonding more would lock the surplus out of the reserve until the submission
settles, and bonding less makes the reveal revert with `BondTooLow` once the
commitment is already immovable. Exact is the only amount with neither problem,
and the leak was simply not the question being asked.

## What it costs, which depends on the game

On `main` it is a genuine but modest disadvantage: cells are shared and claimed
by accumulation, so knowing that a rival is placing six rather than one is worth
something without being decisive. **In a game where the count IS the move it
would be most of the secret** - and this template exists to be built on, so the
next game is where it matters. Stratagems posts more than it needs for exactly
this reason.

## The part that makes it a decision rather than a bug

**Closing it moves the game into the case `acknowledgeMissedReveal` cannot settle
in one call.** With a bond larger than the turn's cost, the contract can no
longer tell the surplus from the stake: forfeiting the remainder punishes the
HIDING rather than the silence, and punishes it hardest on the player who hid
best. So the settlement would have to take the chunks in order to establish what
was really committed and give the surplus back - which is the second of the two
reasons ADR-0002 now gives for a game needing them.

**Both halves have to move together.** Either is harmless alone and wrong
together: over-posting without changing the settlement over-punishes a missed
reveal, and changing the settlement without over-posting is machinery with no
purpose.

## What a fix would look like, none of it decided

- **A fixed bond per cycle** - simplest, leaks nothing, and needs a reserve large
  enough that an honest small turn is not refused.
- **Round the plan up to a whole number of chunks.** Cheap, and it reduces the
  leak to a range rather than removing it - which may be enough, and is
  attractive because the chunk count is observable from the reveals anyway.
- **Bond the whole reserve.** Leaks nothing about the turn and makes the missed
  reveal maximally expensive, which is a different game.

The second is the interesting one precisely because it costs almost nothing and
admits that the chunking already discloses a range.

## Related

ADR-0002 for why one call settles a half-revealed turn today and what would
change that. The chunked reveal task in `work/tasks/done/` for the mechanism.
This note is the reason the ADR's rule is phrased as "a settlement needs the
chunks exactly when it cannot otherwise know what to KEEP and what to RETURN"
rather than as a statement about per-action penalties.
