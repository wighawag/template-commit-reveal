---
title: A world's local signer broadcast to the APP's node, not to the world's chain
type: finding
status: fixed 2026-09-22 in template-commit-reveal `main`; the fix belongs upstream in jolly-roger
spotted: 2026-09-22
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, "the connection is a parameter now"), web/src/lib/context/core.ts, web/src/lib/core/connection/remote.ts, web/src/lib/core/connection/types.ts
---

# The connection became a world and the signer's transport did not

**What happened.** The first commit made in the reference game's offline world was posted to `http://127.0.0.1:8545` - the REMOTE chain's node - from a tab whose chain, contracts, wallet and game were all in the browser. It failed with a 503 because nothing was listening there, which is the lucky version: with a local node actually running, the transaction would have been sent, to a different chain, against a contract address that means something else there.

**Why.** `createCoreContext` resolves the local signer's broadcast endpoint from the APP's configuration (`PUBLIC_NODE_URL`, resolved against the page) and hands it to `http(signerRpcUrl)`. That is exactly right for the world the app was built against, and it is a statement about one world made in a function that now builds any of them. `createContext({establishConnection})` made the CONNECTION a parameter in September; the signer's transport was not part of the connection.

**Why nothing caught it, and this is the reusable half.** It needs three things at once: a configured `PUBLIC_NODE_URL`, a `targetStep` of `SignedIn`, and a world that is not the app's own.

- With no node url (a bare `vite dev`), the app has no url either, so `resolveSignerRpc` answers `undefined` and the signer ALREADY falls back to `custom(connection.provider)`, which is the correct behaviour. The world works perfectly. **The development configuration takes the right branch for the wrong reason**, which is the most expensive shape a latent bug can have.
- On `with/embedded-chain` in jolly-roger, where the mechanism was built, `TARGET_STEP` is `WalletConnected`: there is no local signer at all, so there is no transport to point anywhere. The plan recorded that the `SignedIn` combination "exists on no branch upstream and no browser has been pointed at it". This is what was waiting there.
- `check` and `test:unit` cannot see it. It is a URL chosen at runtime from an environment variable, and both worlds type-check identically.

So it was found by building the app for real (`pnpm web:build localhost`), serving it, and playing a round in a headless browser. The dev run before it had played three.

**The fix.** `EstablishedConnection.nodeURL`: the app offers a candidate url TO the factory, and the factory reports back what it actually used. `establishRemoteConnection` passes it through; an embedded world, reachable only through its provider, reports nothing, and the signer falls back to the provider it already knew how to use. The payment rail follows the connection for the same reason - a rail pointed at the app's node would pay on a chain the player is not playing on.

**The general form: a parameter makes a fact per-world, and every OTHER consumer of that fact is now a bug until it is moved.** `deployments` was moved when the parameter landed, and the reasoning was written down at the time ("a second chain has its own contracts at its own addresses, so a factory handing back this app's records for somebody else's chain would be lying about both"). The node url is the same sentence about a different member, and it was not asked. Worth asking of the rest: `chainInfoNodeURL`, and anything else `createCoreContext` reads from `PUBLIC_*` and then uses on a chain.

**One case is named rather than solved.** Under HOSTED sign-in (`walletOnly: false`) `resolveSignerRpc` treats a missing url as fatal, because a hosted account may have no wallet to broadcast through - while a world has no url and always has a wallet of its own. Those two rules disagree, and the combination exists on no branch in this tree today (this repo has no wallet host; `with/hosted-account` has no embedded chain). Whoever puts them together has to decide which rule wins, and the answer is probably "a connection that brought its own transport satisfies the requirement".
