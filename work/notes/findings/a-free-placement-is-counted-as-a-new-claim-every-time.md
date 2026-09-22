---
title: `numClaimants` counts placements rather than claimants wherever a placement is free, and the comment two lines above shows the case was on somebody's mind
type: finding
status: recorded 2026-09-22, NOT fixed; prose corrected in template-commit-reveal `with/nft-identity` and in the offline e2e on all four branches
spotted: 2026-09-22
relates-to: contracts/src/game/internal/UsingGameInternal.sol (`_place`), contracts/src/game/interfaces/UsingGameTypes.sol (`Cell`), README.nft-identity.md, web/e2e/tests/offline.e2e.ts
---

# A cell's claimant count is a placement count on a zero-cost deployment

**What happened.** Measuring a three-player round in a browser, on both `main` and `with/nft-identity`, the offline board reported **seven** claimants upstream and **nine** on the identity branch - for the same nine placements by the same three players over the same three rounds. Seven is right (the human placed on one cell three times, which is one claimant). Nine is a placement count wearing a claimant's name.

**Why.**

```solidity
if (_stakeOnCellBy[cellID][player] == 0) {
    cell.numClaimants += 1;
}
_stakeOnCellBy[cellID][player] += PLACEMENT_COST;
```

`with/nft-identity` deploys with `placementCost: 0`, because what is at stake there is custody of an avatar rather than a bond. So the stake on the cell is zero before the placement and zero after it, and the guard is true every time: the same identity placing on the same cell in every cycle adds a claimant in every cycle, for ever.

`UsingGameTypes.Cell` documents the field as "how many distinct players have placed here". On that branch it is not.

**The part that makes this worth a note rather than a one-line fix.** Two lines above the bug, in the same function, is this:

> Guarded on numClaimants rather than totalStake so it stays correct for a game configured with a zero placement cost, where an occupied cell can still have a total stake of zero.

So the zero-cost configuration was explicitly in mind for the zone index, and the very next branch - which is the one that needs the same care - reads the stake. The zone index is still correct, because it only asks whether `numClaimants` is zero and the count only ever over-counts upward from the first placement. It is the reported figure that is wrong.

**Nothing reads it today in a way that breaks.** The HUD does not show it, the renderer does not use it, and the two places that do read it are assertions and both are floors or deltas: `web/e2e/fixtures/game.ts` on the identity branch counts claims as a CHANGE, and the offline e2e's new board assertion is `>= 3`. That is why this is recorded rather than fixed.

**What it falsifies, and this is the reusable half.** `README.nft-identity.md` explained why the e2e's swap from stake to claims works there, and gave the wrong reason: "every run buys an avatar, so the identity is new and a claim is always a new claim". That is true and it is not what makes the swap work - what makes it work is that at a zero cost a claim is always a new claim for EVERYBODY, including the same identity on the same cell. A plausible explanation of a correct behaviour, standing in front of a defect. **This document's own recurring shape: a number was explained before it was measured.** The prose is corrected on that branch and the offline e2e now says the quantity is a floor and why, in a file byte-identical on all four branches - which is exactly where naming one deployment's arithmetic as though it were every deployment's has cost this tree before.

**What a fix would cost, for whoever takes it.** A second mapping (`_hasClaimed[cellID][player]`) or a sentinel, in `UsingGameStore`, which is byte-identical across all four branches - so it is a contract change that cascades everywhere, invalidates the measured gas figures for a reveal (ADR-0003, and `GasBudget.test.ts` is what would fail first), and buys a number nobody reads yet. The moment to do it is when something DOES read it: "how many players are on this cell" is exactly the sort of thing a HUD wants, and it would be wrong on one branch the day it was written.
