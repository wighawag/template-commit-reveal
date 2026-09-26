---
title: The e2e worktree tests the MAIN checkout's contracts dist, so the offline world runs contracts that are not the code under test
type: finding
status: spotted 2026-09-26; not fixed; worked around by rebuilding dist before a run
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

## The fix, when someone takes it

In the runner, after applying the working tree, build the WORKTREE's contracts package and make the web app resolve it: either replace the linked `web/node_modules/<game>-contracts` with a link to the worktree's `contracts`, or run `tsc` in the worktree and point that one package there. Then assert it: an e2e that deploys in the browser should fail on a contract mutation that has only been compiled. Until then, **rebuild `contracts/dist` (`pnpm --filter ./contracts exec tsc`) before trusting an offline e2e result**, and certainly before a teeth check.
