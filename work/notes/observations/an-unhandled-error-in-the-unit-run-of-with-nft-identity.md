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
