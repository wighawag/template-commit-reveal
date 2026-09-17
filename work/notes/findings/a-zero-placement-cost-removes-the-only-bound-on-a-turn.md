---
title: A zero placementCost removes the only bound on a turn's size, and the constant that looks like a bound is dead
type: finding
status: OPEN
spotted: 2026-09-17
relates-to: work/specs/proposed/games-on-this-foundation.md (D2, with/nft-identity), contracts/src/game/internal/UsingGameStore.sol
---

# Nothing caps the number of placements in a reveal, and on `with/nft-identity` nothing else does either

Found while measuring `creditsGasMultiplier` for the local chain. The measurement needed the worst-case gas of one turn, which needs to know what bounds a turn, and the answer turned out to differ per branch in a way nobody had written down.

## What is true on `main`, where it is fine

A turn's size is bounded by the RESERVE, not by the contract. `_reveal` computes `cost = placements.length * PLACEMENT_COST` and reverts `BondTooLow` when it exceeds the bond, so the sale's `amount` (10 tokens) over `placementCost` (1 token) caps a turn at **ten placements**. That is what made the credits measurement well-defined: ten fresh cells across ten zones, 1,334,323 gas, which is the top of a 298k-to-1.33M range.

## What is true on `with/nft-identity`, `with/all`, and any game that zeroes the cost

`contracts/deploy/010_deploy_game.ts` sets `placementCost: 0n` there, deliberately and with a good reason: what is at stake on that branch is CUSTODY OF THE AVATAR rather than a bond, the reserve is never funded, and a zero cost is what lets `_makeCommitment` accept a turn against an empty one.

The consequence was not noticed. With `PLACEMENT_COST == 0`:

```solidity
uint256 cost = placements.length * PLACEMENT_COST;   // always 0
if (cost > commitment.bond) revert BondTooLow(...);  // 0 > 0 is false, for any length
```

**So nothing bounds the number of placements in a reveal at all**, at any length, up to the block gas limit.

## The constant that looks like the missing bound is dead

```solidity
/// @notice the number of placements a hash represents
uint8 internal constant MAX_NUM_PLACEMENTS_PER_HASH = 32;
```

`UsingGameStore.sol:22`. **It appears exactly once in the entire tree - that declaration - and is referenced by nothing**: not `_checkHash`, not `_reveal`, not the client, not a test. Added in `095cee4c`, the first commit of the template game, and never used since. Its doc comment states a rule ("the number of placements a hash represents") that nothing enforces, which is worse than having no constant, because a reader auditing the bound finds it and stops looking.

## Why it is more than a gas question

A player pays their own gas for their own reveal, so an enormous turn is mostly their own problem. Two things make it everyone's:

- **`_place` appends to `_occupiedCellsInZone`, which every other player's viewport read walks.** `getCellsInZones` was rewritten precisely because a board read that cost more than the board holds took the chain down for every other caller: the handoff records 19 to 30 second stalls and four of five e2e tests failing on a wallet connect that had nothing to do with the board. One player can inflate that index arbitrarily and permanently, for the price of their own gas, and on that branch each placement also costs them nothing (`_stakeOnCellBy[cellID][player] += PLACEMENT_COST` adds zero).
- **It is silent.** Nothing reverts, nothing warns, and the cost lands on other players' reads rather than on the transaction that caused it.

## What this does NOT claim

Not that the branch is exploitable in a way anybody has tried, and not that a cap is obviously right. `with/nft-identity`'s zero cost is a deliberate expression of a different stake model, and a cap has real questions attached: what value, whether it applies when the cost is non-zero too, whether it belongs in the contract or in what a game configures, and whether it interacts with the order-independence rule (it should not - a cap is per player per turn and reads nothing shared - but that argument should be made rather than assumed).

## What it costs to leave

The credits value landed as `1_500_000` on `main` and cascaded to all three branches and is CORRECT ONLY ON `main`, because its justification is main's ten-placement bound. On a branch with no bound the figure is a display number with nothing behind it, and it will read as a confident move count, which is exactly what the config comment says not to ship. That is the cheap half of the cost.

## Two things to do, in this order

1. **Decide whether the bound is real.** If it is, enforce `MAX_NUM_PLACEMENTS_PER_HASH` (or whatever replaces it) in `_reveal`, with a test, and delete it if it is not. A constant that states a rule nothing enforces should not survive this either way.
2. **Re-measure `creditsGasMultiplier` per branch**, or state at the value that it is main's and why a branch must take its own. One measurement, once the bound is settled.

## The general shape, which is the third instance this month

A value merged cleanly into a branch and its REASONING did not. The same class as the e2e locator that auto-merged against a contract that still exposed the old name, and the `UsingAvatarIdentity.sol` that read a struct component after it was renamed. `check-shared-divergence.sh` cannot see this one either: the file is identical on both sides, which is precisely the problem.
