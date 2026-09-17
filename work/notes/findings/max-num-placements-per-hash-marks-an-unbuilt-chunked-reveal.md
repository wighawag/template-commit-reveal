---
title: MAX_NUM_PLACEMENTS_PER_HASH is not a turn cap, it is the marker of an unbuilt chunked reveal, and without it a zero placementCost leaves a reveal unbounded
type: finding
status: OPEN
spotted: 2026-09-17
corrected: 2026-09-17, same day, before anything was built on it
relates-to: work/specs/proposed/games-on-this-foundation.md (D2, with/nft-identity), contracts/src/game/internal/UsingGameStore.sol, stratagems contracts/src/game/routes/StratagemsReveal.sol
---

# The constant means PER HASH, and the template never built the thing that makes a hash a chunk

## THE CORRECTION FIRST, because the first version of this note was wrong

This note originally called `MAX_NUM_PLACEMENTS_PER_HASH = 32` a "dead cap": declared, documented as if it were a rule, and enforced nowhere. The measurement behind it stands. **The reading of the constant does not.**

It does not mean "the most placements a turn may have". It means what it says - **the most placements ONE HASH may carry** - and it is the marker of a design this template has not built: a commitment that is a **hash of a hash**, so that one turn is revealed across SEVERAL transactions.

Stratagems has it, in `contracts/src/game/routes/StratagemsReveal.sol`, and it is worth reading before designing anything here:

```solidity
_checkHash(commitment.hash, secret, moves, furtherMoves);
_resolveMoves(player, epoch, moves, ...);
if (furtherMoves != bytes24(0)) {
    if (moves.length != MAX_NUM_MOVES_PER_HASH) revert InvalidFurtherMoves();
    commitment.hash = furtherMoves;      // the chain advances
} else {
    commitment.epoch = 0;                // used
}
```

with `_checkHash` hashing `keccak256(abi.encode(secret, moves, furtherMoves))` when there is a next chunk and `keccak256(abi.encode(secret, moves))` when there is not. So a commitment is the head of a hash chain, each reveal transaction resolves one chunk and rewrites the head to the next, and the commitment stays open until a chunk arrives with `furtherMoves == 0`.

Two details in that code that are the whole design rather than trimmings:

- **A non-final chunk must be EXACTLY full** (`moves.length != MAX_NUM_MOVES_PER_HASH` reverts). That is what stops a player dribbling one move per transaction and spreading a turn over an unbounded number of reveals.
- **`acknowledgeMissedReveal` walks the same chain**, with the same `furtherMoves` argument and the same full-chunk rule. Settling an unrevealed long turn is multi-transaction too. Anyone building this here must build both halves, or a partially revealed turn becomes unsettleable.

## So what is actually true of this template

**Neither the cap nor the chunking exists.** `reveal` takes one `Placement[]` and resolves all of it in one transaction; `_checkHash` has no `furtherMoves`; the constant is referenced by nothing. It is a note-to-self left in `095cee4c`, the template game's first commit, for a feature that was never written.

Which leaves the bound on a single reveal transaction as an accident of the stake model rather than a property of the contract:

- **On `main`**, `cost = placements.length * PLACEMENT_COST` against the bond caps a turn at **ten placements**, because the sale's `amount` (10 tokens) over `placementCost` (1 token) is ten. Measured worst case for the pair: **1,334,323 gas** (ten fresh cells across ten zones; the per-zone index is appended on a cell's FIRST claim only, which is the 308k gap between ten-fresh-in-ten-zones and ten-fresh-in-one-zone).
- **On `with/nft-identity` and `with/all`**, `placementCost` is `0n` - deliberately, because custody of the avatar is the stake and the reserve is never funded - so `cost` is zero, `0 > 0` is false for any length, and **nothing bounds a reveal's placement count at all**.

## Why it matters beyond gas, and why it now blocks something

**Beyond gas:** `_place` appends to `_occupiedCellsInZone`, which every other player's viewport read walks. That index is exactly what stalled the chain for 19 to 30 seconds at a time before `getCellsInZones` was rewritten, and the handoff records four of five e2e tests failing on a wallet connect that had nothing to do with the board. One player can inflate it arbitrarily and permanently, and on that branch each placement also costs them nothing.

**And it blocks a decision that is live right now.** The credits design wants `COMMIT_GAS` and `REVEAL_GAS` to be passed as real gas LIMITS, so that a limit is a guaranteed maximum, a player can never be blocked by a miscalculated worst case, and one credit is exactly one turn. That needs a calculable maximum for ONE TRANSACTION. Three ways to get one, and they are genuinely different products rather than variations:

1. **Cap the turn.** Whatever bounds a turn also bounds the transaction. Works on `main` today (ten, via the reserve) and needs an explicit cap or a non-zero cost on the identity branches. Simplest, and it forecloses long turns.
2. **Build the chunked reveal**, which is what the constant was for. The turn becomes unbounded and the TRANSACTION is bounded structurally, at 32 placements, regardless of stake model - so a fixed gas limit is safe on every branch and in every descendant. It is a real feature: the reveal signature changes (an ABI change, which is still free because nothing is deployed), `acknowledgeMissedReveal` has to walk the chain, the client has to build a hash chain and track progress across transactions, and "one credit is one turn" becomes "one credit is one commit plus one reveal STEP".
3. **Derive the limit from the plan's size** rather than from a constant. Always safe, needs no cap and no chunking, and gives up the 1:1 - a big turn costs more credits than a small one.

## Also true, and cheap to fix either way

`COMMIT_GAS = 100_000n` in `web/src/lib/placement/config.ts` is **below a real commit**. Measured: a first commitment costs **116,898** (`0x1c8a2`, verified twice, independently). The comment above it calls it "deliberately generous". It is 16.9% short.

It is harmless today because it only sizes the stipend and the pair is generous in total (2.1M reserved against 1.33M used). It stops being harmless the moment it is used as a limit, and the same comment says what that costs: "Running out of gas mid-submission is not a slow turn, it is a missed reveal, which loses the bond AND blocks the next cycle until it is acknowledged."

Note the commit varies with whether it is the player's FIRST (99,798 against 116,898), which is zero-to-nonzero storage rather than anything about placements. The worst case is a first commit.

## What landed meanwhile, and what it is worth

`creditsGasMultiplier: 1_500_000` on 31337 (`668fb24c`), measured, the top of the observed range plus ~12%. It is a correct FLOOR for `main` under today's single-transaction reveal, and it is superseded by whichever of the three options above is chosen. It was worth landing because the measurement is what found all of this.

## The general shape, which is the third instance this month

A value merged cleanly into a branch and its REASONING did not, and `check-shared-divergence.sh` cannot see it because the file is identical on both sides. Same class as the e2e locator that auto-merged against a contract still exposing the old name, and the `UsingAvatarIdentity.sol` that read a struct component after it was renamed. The credits value also auto-merged into reveal-or-die, where a turn is a maze walk with no placements at all; that one was caught and the merge is a recorded no-op.
