---
title: The e2e worktree tests the MAIN checkout's contracts dist, so the offline world runs contracts that are not the code under test
type: finding
status: FIXED 2026-09-26 in the runner at its home, jolly-roger `main` a1919a4, cascaded to every node
spotted: 2026-09-26
relates-to: scripts/run-e2e-tests.sh, web/src/lib/offline.ts, contracts/package.json (exports into dist)
---

# A mutation that is only compiled is silently not tested by the offline e2e

**Found checking a teeth claim in reveal-or-die** (the unanimity guard, commit 7bf2c797). With enrolment removed from the contract's `_deposit`, `offline.e2e.ts` should fail: the world then waits for nobody and the contract refuses every push. It PASSED. Rebuilding `contracts/dist` in the main checkout from the mutated source made it fail, at `Committed`, as it should.

## Why

`scripts/run-e2e-tests.sh` runs in a throwaway git worktree, applies the working tree's changes to it, compiles and deploys the contracts there for the hardhat node, and then **links** `node_modules` from the main checkout rather than installing ("the worktree is the same commit with the same lockfile"). The web workspace's link to its own contracts package (`<game>-contracts`, `workspace:*`) is relative to its REAL path, which is the main checkout. So everything the web app imports from the contracts package resolves to the MAIN checkout's `contracts/dist`, and nothing in the run rebuilds that.

What imports it: the offline world (`web/src/lib/offline.ts`) takes the deploy scripts and the artifacts from the contracts package and deploys them into the chain in the browser. So in e2e the **in-tab chain runs whatever `dist` was last built in the developer's tree**, while the hardhat node runs the code under test. The two can differ with no sign of it.

## Who has it

Every repo with an offline world: template-commit-reveal (all four nodes), reveal-or-die, bomber-world, and jolly-roger `with/embedded-chain` / `integration`. The runner is inherited from jolly-roger `main`; the offline world arrives with `with/embedded-chain`.

## Fixed

jolly-roger `main` **a1919a4** ("e2e: test the worktree's contracts package, not the main checkout's dist"). In `scripts/run-e2e-tests.sh`:

- `web/node_modules` in the e2e worktree is now a real directory of per-entry links into the main checkout's, except the contracts package (its name read from `contracts/package.json`), which links to the worktree's own `contracts`. The runner asserts that link's real path is inside the worktree. Where the web app does not depend on the package (jolly-roger `main`), `web/node_modules` stays one link. Root and contracts `node_modules` are still linked whole, so there is no second install, and the main checkout's `node_modules` are only read. `.vite` is left out so the build cache stays in the worktree.
- Right after `pnpm compile`, the worktree runs `pnpm exec tsc` in `contracts`, so `dist` comes from the artifacts just compiled.

Cascaded with `offshoot-fanout fanout --verify --leave-conflicts`, no conflicts, verify green on every node: jolly-roger `with/local-signer` 4e9af35, `with/hosted-account` a2771ec, `with/embedded-chain` 16e7a39, `integration` 41d9afe, `website` 946e81f; template-commit-reveal `main` 2c8deaba, `with/pixi-js` e1a18464, `with/nft-identity` 8949abc4, `with/all` f5fc0028; reveal-or-die `main` 642cec8a; bomber-world `main` ffc9a313. The caveat in reveal-or-die's `web/e2e/tests/offline.e2e.ts` was dropped in reveal-or-die 265141b8 and reached bomber-world in d4ea18fe.

**Watched fail first**, in reveal-or-die with `_startWaitingFor(avatarID)` removed from `_deposit`, compiled only, and the main checkout's `dist` built from the CLEAN source: before the fix `offline.e2e.ts` passed (1 passed, 3.2 s); after it, the same run fails with `Expected: "Revealed"`, `Received: "Committed"`. The rebuild-dist workaround this note used to recommend is no longer needed.

Full suites after the fix (`E2E_RPC_PORT=8638 E2E_PORT=4638`): reveal-or-die 51/51, bomber-world 52/52, jolly-roger `main` and `website` 58, `with/embedded-chain` 58, `with/local-signer` 63, `integration` 63, `with/hosted-account` 65, template-commit-reveal `main`, `with/pixi-js`, `with/nft-identity`, `with/all` 53 each. One reveal-or-die full run first failed `board.e2e.ts` at `Missed` (a reveal window missed under load, against the hardhat node, which this change does not touch); the rerun was 51/51.
