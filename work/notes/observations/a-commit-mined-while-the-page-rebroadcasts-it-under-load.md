---
title: Under load, a commit is mined while the page goes on rebroadcasting it, and "Commit now" stays disabled until the phase is over
type: observation
status: spotted
spotted: 2026-11-05
relates-to: web/src/lib/core/transaction (the in-flight ledger, rebroadcast), web/src/lib/game/core/submission.ts, stratagems web/e2e/tests/faucet.e2e.ts
---

# A mined commit the page did not see

Seen in stratagems' step L3 (its plan on its integration branch), in its full parallel e2e run (64 suites on one hardhat node, a table with a short commit phase), twice in three runs; never in the suite run alone, nor in four LAN rehearsals on geth. Not reproduced deliberately, so the cause below is a reading of the evidence, not a diagnosis.

What the run recorded: the creator of a table planned one move, and the page's `makeCommitment` (selector 0x2e4fe8dc) was rebroadcast three times with `eth_sendRawTransaction` and refused each time with "Nonce too low. Expected nonce to be 3 but got 2", so a transaction with that nonce had been mined. "Commit now" stayed disabled for the 60 s the test waited; the table moved on, and the creator's page then said "This browser no longer has the turn you committed for cycle N" and, a cycle later, "Missed the reveal ... The bond is forfeit." In the same run the browser's error list shows `eth_fillTransaction` unsupported (hardhat), which may or may not matter.

Why it matters: the shape is a commitment on chain that the client never recorded as committed, which is exactly the bond-losing window of `a-commit-left-in-flight-can-lose-the-whole-bond-in-a-later-cycle.md`, reached without the tab closing. Worth a look at how the in-flight ledger treats a "nonce too low" answer for a transaction whose own hash it has not seen mined yet: that answer means a transaction with this nonce is already in a block, quite possibly this one. stratagems skips that suite in its normal e2e for now, with this reason in the file.
