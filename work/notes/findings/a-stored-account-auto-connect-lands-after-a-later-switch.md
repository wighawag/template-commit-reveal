---
title: A connection's auto-connect, started at construction from the stored account, lands after a later explicit switch and signs the previous account back in
type: finding
status: FIXED 2026-11-17 upstream: the race in @etherplay/connect 0.17.1 (etherplay-connect 77afb17), and the re-sign-in its fix caused for an action during a reload in 0.17.3 (d295e11, b4b92ad); the tree on 0.17.3 (jolly-roger steps C1a and C1a2 of its template-tree-features plan; this repo and every node below it, C1b); pinned by jolly-roger with/embedded-chain's "a reload whose restore lands late" (c8d2dd31) and "a reload that acts at once" (24b667bf); the hotseat cover kept
spotted: 2026-11-02
relates-to: work/tasks/done/hotseat-in-the-offline-world.md
---

# The stored account comes back after somebody else has signed in

Found by the hotseat e2e (`offline-hotseat.e2e.ts`), on a reload in the middle of a commit phase. Measured with the connection's states logged in order.

`@etherplay/connect` 0.17.0, constructing a connection with `autoConnect` and a `SignedIn` target, reads the stored origin account and, if it has a signer, starts `waitForWallet(name).then(...)`, which later `set`s `step: 'SignedIn'` with THAT stored account (`dist/index.js`, "Auto-connect logic based on targetStep"). Nothing checks, when it lands, that the connection has not moved on in between. In an embedded world the wallet's `getChainId` and `getAccounts` go through the node in the tab, which is busy booting, so the promise landed after the world had connected, switched to the second person and signed in as them: the connection went back to `SignedIn` as the FIRST person (the stored account), with the wallet reporting the second first, then reconnected to the second without a signature, and the second person's signer was gone (`not-connected`), so their commit could derive no secret.

It does not show with one account per wallet (the stored account is the only one), which is every world before hotseat, nor online, where a person who switches account has a wallet that already announced the switch before the page loaded.

**Worked around in the hotseat** (`96a572a1`): the game is shown only while the connection is signed in as the person who has the device, decided synchronously from the connection, and a mismatch switches the right account back. **The fix belongs to `@etherplay/connect`**: an auto-connect attempt should yield to any connection attempt started after it (or the world's connection could be built with `autoConnect: false`, since a world connects and signs in itself on every boot; not done here because jolly-roger's `/offline-demo` may rely on the restore, which was not measured).

## Fixed upstream (2026-11-17)

`@etherplay/connect` 0.17.1 (etherplay-connect 77afb17, "a late answer yields to anything that moved the flow since it was asked") makes the auto-connect at construction, and every other slow attempt, publish only if nothing moved the flow since it asked, so the restore of A no longer lands over a later sign-in as B. That fix counted ANY later call as moving the flow, so an action made while a page was still loading (every action calls `ensureConnected()`) overtook the restore and asked the person to sign in again: this repo's `table.e2e.ts` met it (reload, create a table at once) on 0.17.2. 0.17.3 (d295e11, and b4b92ad from that repo's review) makes a call that names nothing new JOIN the restore and carry on signed in; a call naming another account or wallet still wins. The tree is on 0.17.3, from jolly-roger `main` down.

**What pins it**: jolly-roger `with/embedded-chain`'s `web/test/lib/embedded/wallet-switch.svelte.test.ts`, two cases that reach every node of this repo and every game below it through `integration`: "a reload whose restore lands late" (c8d2dd31: a previous visit signed in as A, the reload's restore held on `eth_chainId`, B selected and signed in meanwhile; on 0.17.0 it ends `WalletConnected`, this note's symptom; on 0.17.3 it stays SignedIn as B with B's signer) and "a reload that acts at once" (24b667bf: the same reload, `ensureConnected()` called while the restore waits; on 0.17.2 the call waits for a sign-in nobody asked for; on 0.17.3 it resolves SignedIn as A with A's signer, no picker and no signature). `offline-hotseat.e2e.ts` (the reload in the middle of a commit phase) passes on 0.17.3 on every node of this repo and on infinite-gambit; reveal-or-die and bomber-world skip it by its own condition.

**The cover stays** (`$lib/game/lobby/hotseat.ts`, its comment updated with this fix): it answers ANY move of the connection away from the person with the device, an account switched by hand in the wallet included, not only this race, and it costs one synchronous comparison. The `autoConnect: false` alternative above is not needed.

