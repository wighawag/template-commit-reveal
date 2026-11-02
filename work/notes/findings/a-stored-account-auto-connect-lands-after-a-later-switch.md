---
title: A connection's auto-connect, started at construction from the stored account, lands after a later explicit switch and signs the previous account back in
type: finding
status: worked around 2026-11-02 (hotseat); not fixed upstream
spotted: 2026-11-02
relates-to: work/tasks/done/hotseat-in-the-offline-world.md
---

# The stored account comes back after somebody else has signed in

Found by the hotseat e2e (`offline-hotseat.e2e.ts`), on a reload in the middle of a commit phase. Measured with the connection's states logged in order.

`@etherplay/connect` 0.17.0, constructing a connection with `autoConnect` and a `SignedIn` target, reads the stored origin account and, if it has a signer, starts `waitForWallet(name).then(...)`, which later `set`s `step: 'SignedIn'` with THAT stored account (`dist/index.js`, "Auto-connect logic based on targetStep"). Nothing checks, when it lands, that the connection has not moved on in between. In an embedded world the wallet's `getChainId` and `getAccounts` go through the node in the tab, which is busy booting, so the promise landed after the world had connected, switched to the second person and signed in as them: the connection went back to `SignedIn` as the FIRST person (the stored account), with the wallet reporting the second first, then reconnected to the second without a signature, and the second person's signer was gone (`not-connected`), so their commit could derive no secret.

It does not show with one account per wallet (the stored account is the only one), which is every world before hotseat, nor online, where a person who switches account has a wallet that already announced the switch before the page loaded.

**Worked around in the hotseat** (`96a572a1`): the game is shown only while the connection is signed in as the person who has the device, decided synchronously from the connection, and a mismatch switches the right account back. **The fix belongs to `@etherplay/connect`**: an auto-connect attempt should yield to any connection attempt started after it (or the world's connection could be built with `autoConnect: false`, since a world connects and signs in itself on every boot; not done here because jolly-roger's `/offline-demo` may rely on the restore, which was not measured).
