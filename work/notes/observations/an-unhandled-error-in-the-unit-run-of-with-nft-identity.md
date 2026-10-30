---
title: The unit run of with/nft-identity once failed on an "Unhandled Error" with every test passing, and its text was not kept
type: observation
spotted: 2026-10-28
relates-to: with/nft-identity, web `test:unit` (`vitest run --project server && vitest run --project client`)
---

# One failure in nine runs, and no error text

During the cascade of jolly-roger's account data onto synqable 0.3.1 (stratagems' step 8), `pnpm --filter ./web run test:unit` on `with/nft-identity` (preview branch `s8/with/nft-identity`, tree later pushed as 92625ccd) reported **Tests 1828 passed (1828)** in the server project and then failed the run on an `⎯⎯ Unhandled Errors ⎯⎯` block, so the client project never started. The verify loop kept only the summary lines, so **the error's text and the test it was attributed to were not captured**.

It did not come back: four reruns of the server project, two of the full `test:unit`, one beside a concurrent `with/all` server run (load), and a full verify on the next tree with each node's whole log kept: eight clean runs after the failing one. No other node of the tree showed it in the same verify rounds.

What is ruled out: synqable 0.3.1's new error reporting. It reports listener errors with no caller through `reportError` where that exists and `console.error` otherwise; Node 24 has no `reportError` (measured: `typeof globalThis.reportError` is `undefined`), and vitest does not count a `console.error` as an unhandled error. The failure was in the server (Node) project, as the client project never ran. An independent review of the change being cascaded found nothing that could raise one.

**What to do next time:** keep the full log of any red unit run (redirect it to a file rather than filtering it), so the next occurrence names its test and its error. Until then this is one unexplained failure, not a known flake: do not retry past it without reading the log.

## Seen again, 2026-10-29, with its text, and it is not only with/nft-identity

During step 8 item 4's verify, the same signature (every test passing, then an `Unhandled Errors` block, so `vitest run --project server` exits non-zero and the client project never starts) appeared on `with/nft-identity` at its origin head 6bef7e8a, on `with/pixi-js` after the merge, and on bomber-world `main` both at its origin head 81de8c81 and after the merge, each green again on a rerun. The full log was kept this time:

```
ReferenceError: window is not defined
 ❯ Timeout._onTimeout ../node_modules/.pnpm/@etherplay+wallet-connector-ethereum@0.4.0/node_modules/@etherplay/wallet-connector-ethereum/dist/index.js:225:17
This error originated in "test/lib/context/tab-navigation.test.ts" test file.
```

So it is a timer in `@etherplay/wallet-connector-ethereum` 0.4.0 that outlives `tab-navigation.test.ts`'s environment and touches `window` after it is torn down: timing-dependent (2 to 12 errors per occurrence), pre-existing, and nothing to do with the change being verified. The fix is in that test (stop or fake the connector's timers) or in the connector (guard `window`); the test is jolly-roger's, so that is where it belongs.

## Seen on `main` too, 2026-10-30

During step 8 item 5's fix of the commit gas budget, `main` (`s8/main` at `644347e3`, a contracts-only change) showed it in two of its unit runs (18 and 2 `window is not defined` errors, every test passing), and passed on the run between them. So it is `main`'s, inherited, and still jolly-roger's to fix.
