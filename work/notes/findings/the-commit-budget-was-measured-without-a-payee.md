---
title: The commit gas budget was measured without a payee, so a first commit paying a reveal scheduler ran out of gas
type: finding
status: fixed on main (644347e3), cascaded 2026-10-30
spotted: 2026-10-30
relates-to: contracts/rocketh/config.ts (COMMIT_GAS), contracts/test/js/GasBudget.test.ts, game/core/commit-reveal/adapter.ts (the commit's gas limit), with/fuzd
---

# A paid first commit costs 152,154 gas, and the limit was 150,000

The scheduler seam (step 8 item 4, P3) makes `makeCommitment` carry the scheduler's payment, which the contract forwards to `payee`. The first payment goes to an account that holds nothing, and a value transfer to an empty account costs the transfer, the cold account and the account's creation on top of the commit. Measured on a local node: an unpaid first commit 117,714, the same commit paying a fresh payee 0.0012 ETH **152,154**. The adapter passes the deployment's `commitGas` (150,000) as the gas LIMIT, so every player's first scheduled commit reverted: found by `with/fuzd`'s first e2e run ("Transaction failed" on `makeCommitment`), invisible to every unit test, because the adapter's tests fake the chain and `GasBudget.test.ts` measured only `payee` zero.

**Fixed on `main`** (`644347e3`): `GasBudget.test.ts` measures the paid first commit with the same 10% headroom rule (red at 150,000), and `COMMIT_GAS` is 175,000. `creditsGasMultiplier` is derived from it, so a credit's price rises by about 3%.

**Cascaded** the same day: `with/pixi-js` (main's contracts, clean); `with/nft-identity` and `with/all` MEASURED their own (a paid first commit 134,358 against the 125,000 they declared, now 155,000). reveal-or-die, bomber-world and stratagems `main` took the merge with no tree change: their contracts and budgets are their own and `GasBudget.test.ts` is omitted there. **Still owed by each game that adopts a scheduler**: measure its own paid first commit (stratagems' `makeCommitment` forwards to a payee, so its step 8 item 6 has to).

**The general lesson:** a seam that adds a payment to a transaction changes that transaction's gas, and the budget is a limit, not an estimate. When a seam adds an argument with a cost, the gas test gains the case in the same change.
