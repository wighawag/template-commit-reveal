---
title: After the paid-commit fix, three gas-budget sentences still disagree with the figures, and the games' paid commits are unmeasured
type: observation
spotted: 2026-10-30
relates-to: contracts/test/js/GasBudget.test.ts, contracts/rocketh/config.ts (main, with/nft-identity, with/all), reveal-or-die and bomber-world contracts/js/gas.ts, stratagems' contracts
---

Found by the independent review of the commit-gas cascade (step 8 item 5), none of it a blocker, none of it changed in that cascade so as not to re-run it for wording:

- `GasBudget.test.ts:154` (main, `with/nft-identity`, `with/all`) still says "if it is ever passed as a LIMIT". The figures ARE the limits; `36fdf6a6` corrected the same claim in `config.ts` only.
- `config.ts` says the credit multiplier "is that plus about 15%". On main 775,000 is about 19% above 652,459; on `with/nft-identity` 580,000 is about 23% above 473,187 (14% above the paid total). Either re-derive the figure or reword the margin.
- `with/nft-identity`'s table says a first commit costs 99,102; its `GasBudget` test now logs 99,918. No threshold is affected; the table is a stale reading.
- reveal-or-die and bomber-world: `commit` forwards to a payee (`GameCommit.sol:17-18`) but `contracts/js/gas.ts` declares `COMMIT_GAS = 100_000n`, never measured with a payment, and those games omit `GasBudget.test.ts`. Not reachable today (their client sends `zeroAddress` and no gas limit), but it is the moment either adopts a scheduler.
- stratagems: `makeCommitment` pays its `remoteAccount` and the legacy client estimates gas, so it is safe today; it declares no `commitGas`. When it moves onto the base adapter (step 8 item 6), which passes `commitGas` as the limit, that figure must cover its paid first commit.
