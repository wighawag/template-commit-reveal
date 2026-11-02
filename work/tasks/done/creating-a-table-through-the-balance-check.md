---
title: Creating a table goes through the balance check, so a creator with no ether is offered the faucet
slug: creating-a-table-through-the-balance-check
spec: games-on-this-foundation
blockedBy: [tables-for-a-fixed-set-of-players]
---

# Creating a table goes through the balance check

Found by stratagems' LAN rehearsal (its plan's step L2), decided with the maintainer on 2026-11-02. On a LAN box every newcomer starts with no ether, and creating a table is the first thing a host does: `createTablesLobby`'s `create` sent `createGame` straight from the account, so a creator with nothing got the node's raw "the total cost ... exceeds the balance of the account" under the button, and no remedy.

## Done, 2026-11-02, on local preview branches `pl2/*`, NOT pushed

**`main`**: `5f93a089` (merged as `9df6ac5e`, beside jolly-roger's gas-tip floor) `create` goes through `balanceCheck.ensureCanAfford` with the account's balance, as every transaction the account pays for does, so the insufficient-funds modal names the shortfall and offers the faucet; a creator who stops there goes back to idle, which is not a failure to paint again. Two unit cases (`test/lib/game/lobby/create-table.test.ts`): the check is asked first with the account paying and what it returns is sent; an `InsufficientFundsError` sends nothing and leaves the lobby idle. In stratagems' rehearsal, a host with 0 ETH creates a table from `/lobby/` through the modal's "Get ETH".

**Cascaded** with jolly-roger's gas-tip floor (`gas-tips-never-below-the-nodes-minimum` on jolly-roger `work`): `with/pixi-js` cfba27ea, `with/nft-identity` 28c28303, `with/fuzd` 6795c436, `with/indexer` 7b8e4db5, `with/all` 238a2402, `with/fuzd-pixi-indexer` 852d7725; reveal-or-die aad00066, bomber-world 8d729740, stratagems `main` dba3c6dd. Every merge clean.

## Measured

Check 0 errors and 0 warnings everywhere (stratagems `main` its known 2 warnings); unit, + 78 (descendants + 72), each +5 from `the-acquisition-rail-approves-an-allowance`'s numbers (+3 jolly-roger, +2 here): `main` 1953, `with/pixi-js` 1966, `with/nft-identity` 1961, `with/fuzd` 1994, `with/indexer` 1981, `with/all` 1974, `with/fuzd-pixi-indexer` 2035; reveal-or-die 2107, bomber-world 2155, stratagems `main` 1711; dangling imports and omissions clean in every descendant.

**The pushes** (superseding the list in `the-acquisition-rail-approves-an-allowance.md`, which they contain), every one a fast-forward of `origin`: `main` cbaef472..9df6ac5e, `with/pixi-js` 20fca85e..cfba27ea, `with/nft-identity` b450c36c..28c28303, `with/fuzd` d2c2ee15..6795c436, `with/indexer` 2eb622d0..7b8e4db5, `with/all` a632d255..238a2402, `with/fuzd-pixi-indexer` 69c5028f..852d7725, `work` (this file); reveal-or-die `main` 0254a02e..aad00066; bomber-world `main` 4b881bd3..8d729740; stratagems `main` 504a1acd..dba3c6dd.
