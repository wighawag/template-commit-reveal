---
title: The acquisition rail approves an ERC20 allowance the call spends, from the payer
slug: the-acquisition-rail-approves-an-allowance
spec: games-on-this-foundation
blockedBy: [tables-for-a-fixed-set-of-players]
---

# A stake paid in a token the contract pulls: the payer approves it, inside the rail

Found by stratagems' step L2 (its plan `work/plans/join-template-commit-reveal.md` on its `join-template-commit-reveal` branch), decided with the maintainer on 2026-11-01. stratagems' tables are paid by an ordinary allowance (its PL2-1): a table is an address created by anyone, which no admin can give a global approval on the token, and a table should later take any ERC20 (DAI, a USD stable coin). So a seat is `approve(table, stake)`, then the game's own stake call, which pulls with `transferFrom(payer, table)`.

## What was missing

`$lib/game/acquire`'s `Acquisition` is ONE call, and the account that must approve is the PAYER, which the rail chooses inside `run` (`payerFor`: the account itself, or another wallet connected only then). So a game could not send the approval beforehand without approving from the wrong address whenever another wallet pays.

## Done, 2026-11-01, on local preview branches `pl2/*`, NOT pushed

**`main`** (from `origin/main` cbaef472): `a2490777` an optional `allowance: {token, amount}` on `Acquisition`. When it is there, the rail, after the payer is connected and the signature taken, reads `allowance(payer, address)` and, when it falls short, sends `approve(address, amount)` from the payer and waits for its receipt, then makes the call (`approveIfShort`, exported, with `ERC20_ALLOWANCE_ABI`). Never an unlimited allowance. Reading first means a retry after a reload (the approval landed, the call did not) asks for one transaction. A new state step, `Approving`, between `Authorising` and `Acquiring`, so a game's HUD can say why the wallet opens twice. A game declaring no allowance (the reference game, every world with a global approval) is unchanged. Three unit cases (approves exactly the amount from the payer to the spender, sends nothing when the allowance covers it, fails on a refused approval). The README says what a game supplies.

**Cascaded**, every merge clean: `with/pixi-js` 566ddf7a, `with/nft-identity` 2c4bde63, `with/fuzd` 7d4d6061, `with/indexer` d8ff1f98, `with/all` 0fbc2da3, `with/fuzd-pixi-indexer` 6419bbf3; reveal-or-die f9bd6477, bomber-world 1ef0ba1a, stratagems `main` eb229e4e.

## Measured

Check 0 errors and 0 warnings on every template node and descendant (stratagems `main` its known 2 warnings); unit, each +3 and + 78 (descendants + 72): `main` 1948 (was 1945), `with/pixi-js` 1961, `with/nft-identity` 1956, `with/fuzd` 1989, `with/indexer` 1976 (was 1973), `with/all` 1969, `with/fuzd-pixi-indexer` 2030 (was 2027); reveal-or-die 2102 (was 2099), bomber-world 2150 (was 2147), stratagems `main` 1706 (was 1703); `check-dangling-imports` clean everywhere.

**Found on the way**: in a fresh worktree, the first `pnpm install` sometimes leaves `web/src/lib/deployments.ts` and the contracts' `dist` missing (seen on `with/indexer` and `with/fuzd-pixi-indexer`: 42 and 33 check errors, all "cannot find module"), and a second `pnpm install` generates both. The root `prepare` (`ensure-deployments.mjs`) and the contracts' `prepare` appear to race. Not fixed here.

**The pushes**, every one a fast-forward of the `origin` head it was branched from: `main` cbaef472..a2490777, `with/pixi-js` 20fca85e..566ddf7a, `with/nft-identity` b450c36c..2c4bde63, `with/fuzd` d2c2ee15..7d4d6061, `with/indexer` 2eb622d0..d8ff1f98, `with/all` a632d255..0fbc2da3, `with/fuzd-pixi-indexer` 69c5028f..6419bbf3, `work` (this file); reveal-or-die `main` 0254a02e..f9bd6477; bomber-world `main` 4b881bd3..1ef0ba1a; stratagems `main` 504a1acd..eb229e4e.
