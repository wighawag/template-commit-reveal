---
title: Games on this foundation - the game tree, the level boundary, and the mode matrix
type: prd
status: proposed
created: 2026-09-07
relates-to: work/specs/proposed/play-modes.md, jolly-roger `work:work/specs/proposed/service-layers.md`
---

> **If you scaffolded a game from this template, delete this file.** It is maintainer material: it plans the TEMPLATE TREE (which repo stems from which, what lives at which level, which branches exist), not the game you are building. Nothing in your app reads it, and keeping it means it cascades into your descendants forever.

# Games on this foundation

## What this decides, and what it deliberately does not

Two decisions are already made elsewhere and are treated here as settled:

- **Service layers are `with/*` branches on jolly-roger**, in a flat fan with exactly one integration branch, under rules R1 to R6. See `work:work/specs/proposed/service-layers.md` in jolly-roger. This document does not reopen the fan.
- **Play modes are a seam, not a branch**, because modes are mutually exclusive alternatives while layers are additive capability. See `work/specs/proposed/play-modes.md`. This document does not reopen that either; it answers that spec's four open questions with evidence, and adds the axes it does not cover.

What is genuinely undecided, and what this document is for:

1. Where each of the five games stems from, given that four more are coming and two are dormant.
2. Where the level boundary sits between this template and reveal-or-die, now that reveal-or-die is a finished game and the template is not.
3. How `with/nft-identity` is shaped so that it does not become a permanent conflict zone.
4. What the mode matrix actually consists of, which parts are contract work, and in what order they have to be taken.

## Status, measured 2026-09-07

`HANDOFF.md` still says reveal-or-die is untouched. It is not, and that changes the plan.

| repo | stem | state |
|---|---|---|
| `jolly-roger` | template-svelte tree | `main`, `with/local-signer`, `with/hosted-account`, `website`. Clean. |
| `template-commit-reveal` | `jolly-roger@with/local-signer` | fully merged with its stem. Clean. |
| `reveal-or-die` | `template-commit-reveal@main` | **126 ahead, 0 behind.** Adds ~40 files under `lib/world`, `lib/input`, `lib/ui/loading`, `lib/debug`; deletes `lib/placement` exactly as designed. **Modifies only 10 inherited files**, one of them framework (`game/core/round.ts`, +68, one option). |
| `bomber-world` | `reveal-or-die@main` | **1067 commits behind.** Different layout (`onchain/evm`, not `contracts`). **CORRECTED 2026-09-26: current.** It was 1481 behind by the time it was ported (D3); it is now reveal-or-die cc43fb2b plus bombs and its brand, with a `stem` remote and an `offshoot` config, on `contracts/`. |
| `catacombs`, `stratagems` | none | separate stack generation; dormant by decision, see below. |
| `conquest-v1` | `jolly-roger@main` directly | 24 ahead, own pre-seams `lib/game` and `lib/render`, move pipeline unported. |

### Baselines, measured at the start of Phase 0

Written down because `HANDOFF.md`'s numbers have moved twice already and a suite that silently stops being collected looks exactly like a clean run. Both repos clean, both green, measured against `template-commit-reveal@22cccc83` and `reveal-or-die@b0c2691`.

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 13 passing (13 nodejs, 0 solidity) | 9 passing (9 nodejs, 0 solidity) |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` | 1348 in 110 files (server) + 65 in 10 files (client) | 1618 in 128 files (server) + 72 in 11 files (client) |
| `test:e2e` | 50 passed | 49 passed |
| `test:e2e`, `CI=1`, re-measured at the end | 50 passed, no retries | 49, one retried |
| `contracts lint` | 29 errors, pre-existing | 67 errors, pre-existing |
| `format:check` | **green** | web green; contracts 7 files, pre-existing |

After Phase 0, the only number that moves is reveal-or-die's unit count, and it moves by exactly the duplicated suite: 1592 in 126 files (server) and 65 in 10 files (client), which is 26 and 7 fewer in three fewer files. Everything else is unchanged, including both e2e counts.

After the derived secret (Phase 1's first item), both unit counts rise by exactly the new suite and nothing else moves: 1356 in 111 files here, 1600 in 127 files in reveal-or-die, both +8 (seven for `secret.test.ts`, one for the round test the mutation demanded). e2e: 50 here and 49 there, both under `CI=1`, the second with no retries at all.

After the liveness move, this repo gains the seven tests it did not have (1363 in 111 files) and reveal-or-die's count does not move at all (1600), because those tests were already running there and now simply arrive by merge instead of being maintained locally. That non-movement is the measurement: nothing was written twice and nothing was lost. e2e green in both, 50 here with no retries.

After the acquisition rail, four numbers move and every one of them is accounted for. Re-measured from scratch first, because that is the point of measuring: **the pre-change numbers were exactly the ones written above**, so nothing had gone stale this time.

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 13 -> **17** (four for `StakeSale`) | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1363 in 111 -> **1400 in 114** | 1600 in 127 -> **1603 in 128** |
| `test:unit` client | 65 in 10, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 50 passed | 49 passed |
| `contracts lint` | 29 -> **33** | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

The two unit deltas say different things and both are the measurement rather than a side effect. Here, +37: 32 for the rail's own suite, 4 for the reference game's arguments to `StakeSale.purchase`, and one more case on the setup gate for the read it now asks about first. In reveal-or-die, **+3 on a move of 37 tests**, which is the number that matters: 37 tests were deleted there and 40 arrive, the 3 being `stipendFor`'s, and nothing was written twice.

**`contracts lint` moving 29 -> 33 is the one number to read carefully.** All four are `no-global-imports` and `compatible-pragma`, the two rules that account for 27 of the 29 that were already there, so `StakeSale.sol` is written in this repo's house style and the red grew by four instances of a rule nothing obeys. Making the new file the only one that obeys them would be divergence in the service of a gate that is off; fixing all 29 is a separate job. Recorded so that the next person to measure does not read it as a regression.

After the epoch countdown, three numbers move here and two there, and the shape is the same as the rail's: **+7 upstream for a suite that did not exist, and reveal-or-die's count moves by the same 7 rather than by the tests it deleted**, because the four tests it had for `roundPhaseOf` were replaced by seven for the model as a whole.

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17, unchanged | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1400 in 114 -> **1407 in 115** | 1603 in 128 -> **1608 in 129** |
| `test:unit` client | 65 in 10, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 50 passed (see the load note above) | 49 passed |
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

After the board handover, D10, diagnostics and the config readers - one session, landed together because the first two are one subject - **five numbers move here and four there, and the two that did NOT move are the measurement.**

Re-measured from scratch first, on `template-commit-reveal@b1623449` and `reveal-or-die@7a5be61`, and **every pre-change number was exactly the one written above**, so nothing had gone stale this time either.

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17, unchanged | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1407 in 115 -> **1453 in 120** | 1608 in 129 -> **1622 in 131** |
| `test:unit` client | 65 in 10, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 50 -> **51 passed**, no retries | 49 -> 49 passed, no retries either side |

And after reveal-or-die's enumerating recovery, which followed in the same session:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17, unchanged | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1453 in 120 -> **1454 in 120** | 1622 in 131 -> **1656 in 133** |
| `test:unit` client | 65 in 10, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 51 passed | 49 -> **50 passed**, no retries |
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**+1 upstream and +34 there** is the shape a move should have when the framework part already exists: the recovery store's nine tests were already upstream and simply changed file, the one that is new guards the nonce checker against reading a single claim, and the thirty-four are the search, its wiring and the HUD rule that must not ask a player a question the app is about to answer.

And after N3, the identity refactor, where the interesting number is that the two repos moved by the SAME amount:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17, unchanged | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1454 in 120 -> **1460 in 121** | 1656 in 133 -> **1662 in 134** |
| `test:unit` client | 65 in 10, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 51 -> 51, no retries either side | 50 passed, no retries |
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**+6 in one new file, in BOTH repos, which is the measurement.** Five of them are the boundary test and the sixth is the token-zero case, and reveal-or-die's arrive entirely by merge: not one line of the identity work was written twice, and the descendant's own reconciliation cost no test at all, only renames. **Every pre-change number was re-measured from scratch and every one was exactly what this document already said**, which is now three sessions running that nothing had gone stale.

One honest gap in that table: **reveal-or-die's e2e was measured only AFTER the merge.** The two repos cannot run e2e at once (they share the gateway ports), so the before/after pair was spent on the template, where the change actually lands; the 50 in the left-hand column of that row is this document's existing record rather than a fresh reading. The change is client-only and the count agrees with it, which is evidence and not proof.

**Both e2e runs are also a clean data point for the load finding**: the template ran 51 of 51 twice, at load 6 to 18, and reveal-or-die 50 of 50 at load 10 to 15, with no retries in any of them. The suite is not flaky at these loads; the failures this document records were at 20 and above.

And after D11's renderer axis - the reference game's port onto the immediate host on `main`, and the creation of `with/pixi-js`:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17, unchanged | 9, unchanged |
| `web:check` | 0 errors, 0 warnings | 0 errors, 0 warnings |
| `test:unit` server | 1460 in 121 -> **1471 in 123** on `main`, **1477 in 124** on `with/pixi-js` | 1662 in 134, unchanged |
| `test:unit` client | 65 in 10 -> **71 in 11** | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | 51 passed before and after, no retries either side | **50 passed, no retries**, measured fresh |
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**Every pre-change number in both repos was re-measured from scratch and every one was exactly what this document already said**, which is now four sessions running that nothing had gone stale.

**The +17 is the whole point of the phase and none of it is new behaviour.** All seventeen tests cover the 405 lines that were exercised on no node at all: 6 in a browser reading real pixels off a real canvas, 8 against a recording context for the culling a pixel test cannot see, 2 for the host-props boundary that keeps the play route identical on both nodes, and 1 for the subscription leak. The branch adds 6 more, for the manifest workaround that earned the node, which neither existing copy of that pipeline has a test for.

**reveal-or-die did not move, and that is the measurement rather than an omission**: nothing was cascaded into it, deliberately, because `main` is not mergeable there until the `stemBranch` re-point (see Phase 2). All five of its suites were re-measured to confirm it was untouched, and it is clean at `4b98f8d`.

**Its e2e WAS re-run this time, and that closes a gap the last two sessions had to leave open.** 50 of 50, no retries, at load 8 to 16. The N3 session could only quote this document's existing figure for that row, because the two repos share the gateway ports and the before/after pair had to be spent on the template. Here the template's pair was affordable AND reveal-or-die's could follow it, so the 50 is a reading rather than a record - which matters precisely because it is the number this document has had to correct twice, and because a suite that silently stops being collected looks exactly like a clean run.

It is also a third clean data point for the load finding: 51 of 51 twice on the template at load 3.4 to 7.3, and 50 of 50 here at load 8 to 16, which is the highest load yet recorded without a failure. The documented failures remain at 20 and above.

And after `with/nft-identity`, which is Phase 2's second node:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 17 -> **19** on `main` and on `with/pixi-js`, **21** on `with/nft-identity` | 14, unchanged |
| `web:check` | 0 errors on all three branches | 0 errors, 0 warnings |
| `test:unit` server | 1471 in 123 -> **1477 in 124** on `main`; **1483 in 125** on `with/pixi-js`; **1485 in 125** on `with/nft-identity` | 1662 in 134, unchanged |
| `test:unit` client | 71 in 11 on all three | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | **51 passed on `main`, 51 on `with/nft-identity`, 51 on `with/pixi-js`**, no retries in any of the three | not run: `main` is not mergeable there until the re-point |
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**Every pre-change number in both repos was re-measured from scratch and every one was exactly what this document already said**, which is now five sessions running that nothing had gone stale. reveal-or-die's `contracts:test` reads 14 rather than the 9 older tables in this document quote, because of the mint work (`c18220b`); that is a correction to the older rows rather than a movement.

**EVERY CONTRACT COUNT IN THIS DOCUMENT IS INFLATED BY EXACTLY ONE, AND THE EXTRA IS NOT A TEST.** `contracts/test/js/utils/index.ts` is a HELPER with no `it()` in it, and `hardhat.config.ts` points `nodejs` at the whole `test/js` DIRECTORY, so the runner collected it and counted it as one passing item. Every number this document records was a faithful reading of what the runner printed; what it printed included a file that asserts nothing.

Measured 2026-09-15 on a toolchain that no longer collects it: `main` and `with/pixi-js` run **18**, `with/nft-identity` and `with/all` run **20**, where this document says 19 and 21. The arithmetic reconciles exactly (18+1 and 20+1), and `contracts/` is byte-identical across the commits in question, so nothing was lost and nothing regressed. reveal-or-die reads **13** on the same toolchain, against its recorded 14, which is the same +1 and confirms the cause generalises beyond this repo. The inflation dates from `516d9ec0`, which added the fixture directory.

**A FIRST VERSION OF THIS CORRECTION, WRITTEN THE SAME DAY, GOT THE CAUSE WRONG, AND IS RECORDED BECAUSE THE WRONG VERSION IS INSTRUCTIVE.** It concluded that the tables held an off-by-one arithmetic error which had propagated for three sessions, on the evidence that the run listed 18 tests by name and that `git log` showed the suite growing 16 -> 17 -> 18. All of that was true, and the conclusion did not follow. The session-start run in that very same session had printed a line reading `✔ .../contracts/test/js/utils/index.ts` immediately above `21 passing`, which names the cause outright. **The evidence was already in hand and was read past, because the count had a plausible explanation and a plausible explanation feels like a finished one.**

So the rule this document keeps restating applies to its own corrections: prefer the explanation that accounts for ALL the readings rather than the first one that accounts for the reading in front of you. Here two readings existed (19 then, 18 now, same bytes) and only the collection change accounts for both.

**What is worth carrying.** A suite's count is an artifact of how its runner globs, not a property of the code: point a runner at a directory and it will count whatever is in there. This one was inflated for months and survived because a number that only ever moves by the size of a change nobody made looks stable. When a table says a suite is UNCHANGED, that is the row most worth re-running, not the least.

And after `with/all` and the re-point, which are Phase 2's last two nodes and close the phase:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | **18** on `main` and `with/pixi-js`, **20** on `with/nft-identity` and on `with/all` (all corrected 2026-09-15: the old 19 and 21 counted a helper file, see above) | **13**, corrected from 14 for the same reason |
| `web:check` | 0 errors on all four branches | 0 errors, 0 warnings |
| `test:unit` server | 1477 in 124 on `main`; 1483 in 125 on `with/pixi-js`; 1485 in 125 on `with/nft-identity`; **1494 in 126 on `with/all`** | 1662 in 134 -> **1674 in 136** |
| `test:unit` client | 71 in 11 on all four | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | **51 of 51 on `with/all`, no retries, 16.0 min at load 8** | **50 of 50, no retries, 16.4 min at load 4** |
| `contracts lint` | 33 on `main`/`with/pixi-js`, 46 on `with/nft-identity`/`with/all` | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**Every pre-change number was re-measured from scratch and every one was exactly what this document already said**, which is now six sessions running. That includes reveal-or-die's e2e row, which this document had been carrying as a RECORD rather than a reading since N3: it is a reading again.

**`with/all` is exactly the union of its parents and holds no code of its own**, which is the criterion rather than a description. Measured three ways with `check-shared-divergence.sh`, all with `ALLOWED=` empty: against `with/pixi-js` it differs in exactly `with/nft-identity`'s twelve files, against `with/nft-identity` in exactly `with/pixi-js`'s one, and against `main` in exactly the thirteen. **The merge was clean in every file - 0 conflicts**, against the `with/hosted-account` shape of 3 in 24 merges that Decision 3 sets as the bar. That is N1 and N2 working, tested for the first time against each OTHER rather than each against `main`.

**The template's +9 on `with/all` is 6 inherited from `with/pixi-js` plus 3 written this session**, for a hazard that branch's own doc comment brags about having been caught and which nothing pinned; see the mutation notes below. reveal-or-die's **+12 in 2 files** is 9 of those, plus 2 for the render-host boundary test it now inherits, plus 1 for the subscription-leak test arriving by merge - every one accounted for, none written twice.

### What the re-point actually cost, against what was predicted

The finding note measured a merge from `main` and found three conflicts. **From `with/all` it is forty**: 21 content, 17 modify/delete, 1 add/add, 1 file-location. That is not the note being wrong - it measured a different merge - and 14 of the 40 are `contracts/`, which are not inherited (decision 1 in `HANDOFF.md`) and resolve one way.

**AND NONE OF THE FORTY WAS THE PROBLEM, which is the note's own thesis arriving in the opposite shape to the one it predicted.** The note is about a clean DELETION leaving a dangling import. What actually broke things was clean ADDS, three times:

- `contracts/src/game/avatar/`, `GameAvatars.sol`, `GameAvatarSale.sol` and a deploy script arrived with no conflict and broke the compile with duplicate declarations against the game's own avatar contracts.
- four inherited test files arrived naming a `$lib/placement` this game deleted wholesale, two of them (`reserve.test.ts`, `board-immediate.test.ts`) as pure adds with nothing to conflict with.
- **a clean hunk rewrote `escape-hatch.e2e.ts`'s seven test inputs from addresses to digits**, because `main` had just renumbered its own for a `uint256` signature. This game's write takes an `address`.

`check` caught the first two. **Only e2e caught the third**, and its symptom named the wrong thing entirely: `the stalling wallet was never handed a transaction within 60000ms`, whose own error text sends you to the node and the worker count. An invalid address leaves the form unsubmittable, so nothing is ever sent.

So the general form is wider than a deletion: **any hunk that merges cleanly because the two sides were never in TEXTUAL conflict can still be semantically wrong in the descendant**, and the level boundary is exactly where that happens.

### Two gates were found to be blind, and one of them is the cascade's own

**`check-shared-divergence.sh` only looks for drift in one direction.** `ALLOWED` says "this shared file is SUPPOSED to differ"; a file on that list that has STOPPED differing has had its reason falsified and the script has no opinion. Measured by reverting `placement/render/index.ts` - `with/pixi-js`'s entire reason to exist - to `main`'s version on a scratch branch: `check` 0 errors, `test:unit` 1491 passed, the render-host boundary test 2 passed, and the script says `OK: 549 shared files checked, none drifted`. e2e would pass too, and that is not a guess - D11 verified 51 of 51 on the immediate host. **So `with/pixi-js` and `with/all` can silently stop being pixi branches and nothing in the tree would say so.** Upstream the single `ALLOWED` entry is `mode.ts`, holding `TARGET_STEP`, so the same hole would turn `with/hosted-account` back into `with/local-signer` in silence. Fix is three or four lines and belongs on jolly-roger's `tooling` branch; see the finding.

**`web/e2e/**` is type-checked by nothing.** It is in no tsconfig `include`, so `pnpm check` does not look at it - and `check` plus `test:unit` ARE the configured `verify`. Measured: an import of a name that does not exist, added to an e2e test, passes both. **`offshoot-fanout --verify` will cascade a broken e2e suite into every descendant and report green on each.** Not fixed here because `web/tsconfig.json` is a shared file near the root of the tree; see the finding for the three candidate shapes.

### The backport that was queued, and what it cost

reveal-or-die's `e2e/fixtures/contracts-page.ts` is moved up, which is the first session that could do it. The two copies differed in **one executable line** (`WRITE_FUNCTION`), the descendant's copy is deleted, and it buys two things: `selectContract`, so the four tests that silently relied on `Game` sorting first now ask; and the page locators leaving `stalling-wallet.ts`, where `e2e-account-claims.test.ts` was counting anyone who wanted a form locator as claiming a stalling account.

**A one-line diff did not make it a safe move, and that is the lesson worth more than the fixture.** `selectContract` reads the trigger to decide whether it must pick, and until `$deployments` loads the trigger shows a placeholder and the dropdown has no items - so it clicked and waited out 30 seconds for an item that did not exist yet. Four tests failed all three attempts and two came out flaky. reveal-or-die never lost that race because its own opening test asserts the placeholder is gone before calling the fixture: the wait was in the CALLER, by luck. **What differed between the two repos was not the file, it was what their callers happened to do first, and no diff of the moved artifact could show it.** A 25-minute browser run is what showed it.

**The +6 on `main` is the seam's own coverage and none of it is new behaviour**: 2 assert what the commit-reveal adapter actually puts on the wire, 1 the same for the missed-reveal read, and 3 are a suite for `placement/reserve.ts`, which had none at all - the store that reads what is at stake. Writing that suite is what found `if (!player)` back in shared code, correct for an address and wrong for a token id of zero, which is the same defect N3 fixed in the framework arriving in the game layer.

**The branch's +2 on top is `reserve.test.ts` becoming a custody suite**, and the +6 it inherits arrive by merge. **`with/pixi-js` sits at +6 exactly as it did before**, which is the measurement that the cascade carried the whole change and added nothing of its own.

**One number in that table was NOT produced by the gate that is supposed to produce it.** `with/pixi-js` was verified by hand, because `offshoot-fanout --verify` cannot pass in a temporary worktree here at all; see the finding note. The cascade merged cleanly into it (28 files, no conflicts), and its e2e was run afterwards - 51 of 51, no retries, 15.2 minutes at load 8.1 - which closes the one gap this phase would otherwise have handed on: nothing had run a browser against that branch since its contracts and its e2e fixtures changed underneath it.

**The e2e pair on the template is the load-bearing measurement of this phase**, because the swap is a rendering change and `verify` deliberately proves nothing about a browser. 51 of 51 with no retries on the pixi renderer at load 4.8 to 7.3, then 51 of 51 with no retries on the immediate renderer at load 3.4 to 6.2, each about 14 minutes. The second run is the only thing in the tree that could establish that the canvas-2d host draws a board a player can actually click.

**The red run in between is worth keeping, because it is the load note's own case and it nearly fooled me.** reveal-or-die's first full run with the recovery suite went 47 passed, 2 flaky, 1 failed at load average 20 to 28, taking 31 minutes; the new test failed all three attempts. The same test then passed alone at load 14, and the full suite went **50 of 50 with no retries at load 12, in 15 minutes**. So the evidence is consistent with the documented finding - the variable is load, the failures are waits rather than wrong answers - and it is NOT proof: three reds in a row is exactly what a real defect looks like, and the only thing that separated them was running it again somewhere quieter. Do not read a single run of this suite, in either direction.
| `contracts lint` | 33, unchanged | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**+46 upstream in five new files**, and the split says what each item cost: 5 for `adopt`, 10 for the handover, 9 for the linked-data readers plus the epoch config, 9 for the reference game's recovery, 5 for its hold rule, 4 for the HUD's two new sentences and 4 for `errorSummary` arriving with the trace.

**+14 in reveal-or-die on a move of far more than 14**, which is the number that matters and it is the sum of three different things: +9 and +10 arrive by merge (the framework halves of the handover and the linked-data readers), +4 for `errorSummary`'s suite arriving with diagnostics, and **-10 for a duplicate that was never this backport's** - the two refresh helpers `context/game.ts` had been carrying its own copies of. Nothing was written twice and nothing was lost; ten tests stopped being maintained in two places.

**The e2e count moving 50 -> 51 is one new test and not a renumbering.** It commits, deletes the round's own record, reloads, is told the chain holds a commitment, re-enters the turn and watches the recovered round reveal itself. It is the only thing in the tree that can prove the hash the client builds a candidate into is the hash the CONTRACT stored, because a disagreement surfaces as the adopted round's reveal reverting.

**The template ran 51 of 51 with no retries at load average 5.4**, and the run before it - the same tree bar the e2e fix - went 49 passed, 1 flaky, 1 failed at load 12 to 14, the flaky one being `out-of-gas` in the family this document already names. The failure was the new test asking for 22 seconds of a play phase that is 19.9 seconds long, and it is worth recording as **the shape of a REAL failure sitting next to a load flake in the same run**: it failed all three attempts and named the same wait every time, which is exactly what the flake does not do. The rule the load note already states held - a single red run is not evidence either way - and the thing that separated the two was not re-running, it was reading which assertion failed.

**reveal-or-die was measured on BOTH sides at 49 with no retries**, which took a second full run against the pre-merge commit rather than trusting the number written here. Worth the twenty minutes: that number is the one this document has had to correct twice, and a suite that stops being collected looks exactly like a clean run.

**The play phase's ceiling is worth writing down because it is not obvious and it is now load-bearing for a test.** It is `commitPhaseDuration - commitTimeAllowance`, and `commitTimeAllowance` is `revealPhaseDuration + 0.1`, so on the localhost deployment the window in which a player may plan is 19.9 seconds of a 40 second epoch, not 30.

Two of those correct `HANDOFF.md` rather than merely updating it. Its unit figure (744 in 66 files) and its e2e figure (21) are roughly half of what is actually collected now, and its standing instruction to leave `web/playwright.config.ts` and `web/src/lib/core/metadata/Head.svelte` unformatted is spent: upstream has since reformatted both, `format:check` is green here, and following the instruction now would be the divergence it was written to prevent.

Two readings of that table matter.

**The seams held.** A whole game ported onto them and changed one framework file. That is the strongest evidence available that the framework/game split is real, and it is what makes everything below affordable.

**The descendant that nobody cascades to becomes a fork.** 1067 commits is not a merge any more, it is a hand port. That is the cost this plan is trying not to pay twice.

## The one rule that assigns everything

Three mechanisms are available, and the whole design is knowing which one a thing wants.

| mechanism | varies with | price |
|---|---|---|
| **repo or branch** | the project | merge tax and a verification node, paid forever |
| **package or optional dependency** | the build | a version boundary and a release cadence |
| **seam plus configuration** | the deployment or the session | none structural |

The test that assigns a thing: **can two values of it coexist in one built app and be chosen at runtime?**

If yes, it is not a branch. Conquest wants a launch menu offering online, offline, hotseat and lobby in one build, so for the game that needs modes most, modes cannot be branches. If they cannot be branches there, they must not be branches upstream either. That is the same conclusion `play-modes.md` reaches from composability, arrived at from a different direction, which is why it is worth trusting.

The corollary that is easy to miss: **the deciding cost of a branch is install and CI, not bundle size.** A layer that drags a service, a workspace or a dev pane costs a non-adopter something real. A capability that is only code costs them nothing that a dynamic import does not already solve.

## Decision 1: the game tree

```
jolly-roger@main
├─ with/indexer, with/embedded-chain            (service-layers PRD: stem main, no signer needed)
└─ with/local-signer
   ├─ with/hosted-account, with/messaging, with/sync
   ├─ with/notifications        stem: [with/indexer, with/local-signer]
   │
integration                     the integration node, stem: [with/local-signer, with/embedded-chain]
└─ template-commit-reveal@main              framework + address-keyed reference game
      │                                        (stratagems' identity shape)
      ├─ stratagems                            dormant, compile-only member (twgl)
      ├─ with/pixi-js                          pixi + assetpack + one sprite (D11)
      ├─ with/nft-identity                     identity is a token; acquisition proven
      └─ with/all                              the single integration branch (D11)
         ├─ reveal-or-die  ──▶ bomber-world    current since 2026-09-26 (D3), no longer dormant
         ├─ catacombs                          dormant, compile-only member
         └─ conquest-v1                        moves off jolly-roger onto here
```

**The renderer axis and `with/all` are D11**, taken after this decision and after Decision 2's asset-pipeline row was scoped. `main` carries the render seam and the host that needs no install; `pixi.js` is 79M and earns a node, with the art pipeline on it because assetpack emits a pixi manifest and means nothing away from it. Every real game therefore stems from `with/all` rather than from `with/nft-identity` alone. catacombs is listed under it for identity, not for pixi: it is twgl and supplies its own host, as stratagems does.

**Why `with/nft-identity` and not a second template repo.** Four of the five games identify a player by a token (`avatarID`, `characterID`, `empireID` over an owned avatar); one identifies by address. Decision 3 in `HANDOFF.md` deliberately makes the reference game address-keyed so that `PlayerIdentity` is exercised as a type parameter rather than assumed. That decision is right and stays. But it leaves identity ACQUISITION (mint, buy, deposit, choose which one you are playing) with no user in the template, and unproven code in a template is the thing everyone regrets. A branch where the reference game becomes token-keyed gives acquisition a user without giving up the address case.

**Why the dormant games still join the tree.** Stratagems and catacombs are not being revived now. Joining them anyway is worth it for one reason: a compile-only member is a real test of whether a seam fits, and it is the cheapest test there is. A cascade that breaks stratagems' build has found something. The commitment is deliberately small: they participate in `check`, not in e2e, and their `verify` command says so.

**Where a game gets a service layer from.** This is the one place the tooling does not currently reach. Cross-repo inheritance in `offshoot-fanout` is single-branch (`stemBranch` is a string), and in-repo integration nodes (`stem: [a, b]`) only combine branches inside one repo. So a game cannot inherit `jolly-roger@with/messaging` and `template-commit-reveal@with/nft-identity` through the tool.

Three answers, in the order they should be reached for:

1. **Hand merge.** The game shares history with jolly-roger, so `git merge jolly-roger/with/messaging` is a real merge with a real merge base, today, with no tool change. Cheapest for the first game that wants one layer.
2. **Earn a branch.** If a second game wants the same combination, that combination has earned a node: it becomes a branch in this repo whose cross-repo edge names the jolly-roger branch that carries the layer, and the games re-point their `stemBranch` at it. Re-pointing is cheap precisely because history is shared.
3. **Extend offshoot.** We own it. The minimal principled change is to let a branch carry BOTH an in-repo `stem` and a cross-repo `stemBranch`, making the graph a DAG across repos rather than only within one. Do not do this speculatively: the trigger is (2) recurring, and a refusal that keeps recurring is the demand signal, exactly as the service-layers PRD argues for `with/all`.

## Decision 2: the level boundary, or "what does reveal-or-die add?"

reveal-or-die was built as an almost-template with branding. Most of it is not reveal-or-die's.

**The test, per file: would another game on this foundation have to write this?** If yes, it belongs upstream, whatever it is currently called. The precedent is already in the tree: `lib/input/README.md` in reveal-or-die applies exactly this test to itself and concludes it is a backport candidate.

That precedent is also the warning. The backport was done by **writing the same thing again upstream** (`d16a3d95`, "render: keyboard and gamepad, as intent recognisers beside gestures") while reveal-or-die kept using its own copy (`57f5375`, "input: keyboard and gamepad as intent recognisers, in gestures.ts's shape"). Both now exist in reveal-or-die's tree, they differ by about thirty lines each, only the local copy is imported, and the inherited one is referenced only by a README. That is `check-shared-divergence.sh`'s failure mode happening across a repo boundary, where nothing checks it. **A backport is a move, not a re-implementation, and the descendant's copy is deleted in the same change.**

**What the thirty lines turned out to be, measured in Phase 0, because it changes what the warning is about.** The two copies are identical in every executable line, in all three modules and in all three test files; every differing line is a doc comment, plus the import path in the tests. Upstream is not a divergent re-implementation, it is the same code with its provenance generalised: where reveal-or-die names `docs/audits/03-renderer.md` 3.4, the deleted `render/keyboard-controller.ts` and `render/gamepads.ts`, `$lib/world/controls.ts` and "a turn is three moves long", upstream says "a game built on this template" and "a handful of moves". It had also already absorbed the descendant's one substantive change: the two-kind focus guard that reveal-or-die added in `26a1362` (a text field consumes every key, a focused button consumes only Enter and Space) landed upstream two days later inside `d16a3d95`. So the reconciliation was a pure deletion, and upstream's copy needed nothing.

Do not read that as the duplication having been harmless. **It was caught while it was still one commit old, and the cost was paid in the only currency available to it**: for five days two repos each maintained their own copy of the same recognisers and their own copy of the same tests, and the second substantive change to either would have been the one that diverged. What the measurement narrows is the lesson, not the rule. The failure mode is not "a re-implementation drifts"; it is that **a re-implementation is indistinguishable from a move until somebody diffs it**, and nothing in the tree does that across a repo boundary. The rule stands unchanged, and it is cheaper to obey than to audit.

### What goes up to `main`

| what | where it is now | why it is not reveal-or-die's |
|---|---|---|
| ~~input recognisers~~ | ~~`lib/input/*`~~ | **DONE, Phase 0.** Nothing to reconcile upstream (the copies were identical bar their comments), so the move was the deletion: `lib/input/` and its tests are gone from reveal-or-die and `lib/world/controls.ts` imports the inherited `game/render/*` |
| ~~the acquisition rail~~ | ~~`lib/world/purchase.ts` (858), `pending-purchase.ts`, `PurchaseModal`~~ | **DONE, Phase 1.** `game/acquire/` upstream, with the descendant's three files and their two test files deleted in the same change. The reference game buys its ERC20 stake through it, which needed a contract (`StakeSale`) to make the stake one transaction at all. See "The acquisition rail" below for what the generalisation decided and what it cost |
| asset pipeline and load gate | `vite.assetpack.ts`, `world/render/assets.ts`, `LoadingSprite`, `ui/loading/*` | **DONE as far as it can go, Phase 2** - see the note below on the half that is blocked. **Re-homed by D11, and no longer a Phase 1 move to `main`.** The pipeline goes to `with/pixi-js` in Phase 2, because it emits a pixi manifest and `pixi.js` is a 79M install that `main` should not carry. It has already been written twice (reveal-or-die 139 lines, conquest 117, same two workarounds), which is what earns the node. The renderer-agnostic half, the load gate that turns a progress store into a splash, follows it there rather than shipping to `main` with nothing to load |
| ~~epoch countdown UI~~ | ~~`world/ui/GameClock.svelte`~~ | **DONE, Phase 1.** Bigger than the row implied: the dial renders a FOUR-part model that did not exist upstream, so `RoundPhase`, `roundPhaseOf` and the board-behind-the-clock comparison went up with it as `game/core/round-phase.ts`, and a name collision was cleared out of the way. The reference game draws the dial, so it ships with a consumer |
| ~~liveness~~ | ~~`game/core/round.ts`'s `commitWhenIdle`~~ | **DONE, Phase 1.** Moved up with all seven of its tests; reveal-or-die's `round.ts` is now byte-identical to this one |
| ~~board handover~~ | ~~`world/hold.ts` (218), `display-plan.ts`, `reveal-outcome.ts`~~ | **DONE, Phase 1**, alongside D10 rather than after it, because they are the same subject. `game/core/handover.ts` upstream; what stayed downstream is the RULE, and the two games want opposite defaults for the one case neither can decide. `reveal-outcome.ts` did not move at all: see the write-up |
| ~~diagnostics~~ | ~~`lib/debug/diagnostics.ts` (322)~~ | **DONE, Phase 1.** `game/core/diagnostics.ts` upstream with the mechanism and every store the template composes; each app keeps a small `debug/diagnostics.ts` for its own. It took `AcrossPages.svelte` back to byte-identical, which was its only reason for differing |
| ~~config-off-linkedData, including absent parameters~~ | ~~`world/config.ts`~~ | **DONE, Phase 1.** `game/core/linked-data.ts`. Bigger than "the absent parameter": two of the three failures it now names are silent, and one of them was live in `resolveEpochConfig` |

### What goes to `with/nft-identity`

`world/active-avatar.ts` (which token am I playing), `world/deposited.ts` (is it in custody), the identity type binding, the ownership reads, and the `Avatars` / `Locker` / sale contracts.

### What stays reveal-or-die

The game and the brand: terrain and maze generation, walk animation, `AvatarObject`, the avatar renderer, the d-pad mapping, tutorial content, the death notice's wording, the art, `web-config.json`, and the movement, collision and exit rules in its contract.

After this, reveal-or-die is **the reference finished game**: the place where a complete experience, real art, a real deployment and an e2e suite that plays a real round are proven together. That is a valuable role and it is not the same role as the template's.

## Decision 3: shaping `with/nft-identity` so merges stay cheap

The acceptance criterion is the one the service-layers PRD already set: `with/hosted-account` shape (24 merges, 3 conflict events, none in application source), not `with/local-signer` shape (44 merges, 65 conflict events). A branch that comes out local-signer-shaped means the seam is wrong, not that the feature is big.

Six rules, each aimed at a specific conflict source.

**N1. The branch ADDS files. Every edit to a file that also exists on `main` is a permanent conflict site**, because `main` keeps developing that file. The branch's README lists its shared-file edits explicitly, and the list is a budget: growing it needs a reason.

**N2. Shared files change by ONE LINE, following `mode.ts`.** `TARGET_STEP` is the proven pattern: one constant, one line of difference across three branches, everything else byte-identical. Identity gets the same treatment: a single module on `main` (`game/identity.ts`) exports the identity type alias and constructs the identity provider, and it is the only shared file the branch edits.

**N3. No shared file names `address` as the identity.** Everything goes through the alias, including tests. This is what makes N2 possible at all, and it is a refactor on `main` that must land BEFORE the branch exists, not alongside it.

**N4. Contracts vary by overriding a virtual internal, never by editing a store.** The precedent is in the tree and it works: bomber-world's `_epoch()` is `virtual` and dispatches timed against manual internally. Do the same for identity resolution, so the branch overrides `_playerOf(sender, id)` and touches nothing else. Contracts are not inherited by games (decision 1 in `HANDOFF.md`), but they ARE cascaded within this repo, so this is about the branch, not about descendants.

**N5. Enforce it with a test, not with prose.** This repo already has boundary tests that fail a build (`framework-boundary.test.ts`, `svelte-conventions-boundary.test.ts`). Add one that fails when a shared module names the concrete identity type.

**Built 2026-09-08 as `web/test/identity-boundary.test.ts`, and this list of generics was wrong in one place.** `RecoveryStore` is parameterised by the ACTION only (`RecoveryStore<TAction>`); the identity-carrying half of that module is `createRoundRecovery`. So the policed set is `RoundStore`, `createRound`, `CommitRevealAdapter`, `createDerivedSecret` and `createRoundRecovery`. The test also polices the MIRROR rule, which this decision never stated and which matters as much: `game/core/` must NOT name the alias, because its genericity is what makes a one-line difference possible, and a well-meaning simplification that hard-coded the alias into the framework would leave every other assertion passing while destroying what they protect.

**N6. Adopt jolly-roger's `tooling` branch here**, and run `check-shared-divergence.sh` with `FEATURES=with/nft-identity` after every cascade. Its whole point is the failure this branch will otherwise hit: a cascade whose conflicts were all resolved correctly, where other hunks merged cleanly in the descendant's favour and left the shared file holding two versions of the same logic.

## Decision 4: the mode matrix has seven axes, not two

The A/B split (fixed roster versus open entry) is real but it is not the top of the tree. The modes wanted are points in a product of seven independent axes. Naming them separately is what stops the matrix from becoming a lattice of branches.

| axis | values | lives in | status |
|---|---|---|---|
| **World** | remote persistent / remote LAN / embedded in the tab | client wiring: a world is a CONTEXT, an identity is a CONNECTION | the unlocking change is DONE (`createContext` takes its connection as a parameter, 2026-09-18); the world itself is Phase 4's second half. The branch is `with/embedded-chain`, NOT `with/webevm`: the capability is where the chain runs, and the library has already been renamed once under us. The design doc has MOVED, 2026-09-19: it is the second half of `README.embedded-chain.md` on jolly-roger's `with/embedded-chain`, annotated with what measurement has since corrected, so it is the branch's rationale rather than an orphan on an archived branch |
| **Membership** | open entry / closed roster | **contract**, plus a lobby | nothing anywhere. The lobby is not only roster formation: it is where everyone is PROVISIONED (account funded, identity acquired) before the game starts, which is what makes a closed roster possible at all |
| **Epoch advance** | fixed timer / timer with early advance / unanimity only | **contract** (`_epoch()`), and the client's epoch store | prototyped in bomber-world: `ManualEpoch` state, `_moveToNextEpoch`, `_moveToNextPhase`. Its two TODOs are exactly the missing work |
| **Reveal agency** | this browser / scheduler / fallback / third party | seam, done | `autoReveal` is a three-way and `commit()` already carries secret, epoch and `revealDueAt`. No fuzd adapter in this lineage yet (`with/fuzd`, Wave 4) |
| **Identity** | address / token / token plus controlling entity | type parameter, done. **Acquisition has no seam** | Decision 1 above |
| **State source** | poller / indexer / local simulation | seam, one implementation | indexer adapter unwritten; `with/indexer` is Wave 1 |
| **Opponents** | humans / NPC keys / hotseat | client: several ACCOUNTS against one world | the worlds doc's cheap case: a world gets a context, an identity gets a connection |

### The contract side is cheaper than it looks

`_epoch()` in bomber-world is already `virtual` and already dispatches between a stored `ManualEpoch` and the timed formula. So the shape is proven: **epoch policy is one overridable internal plus a small piece of stored state**, not a fork of the game contract. What is missing is the hybrid (timed with early advance), and the membership count it needs.

**BUILT 2026-09-15, and the shape held with one change: the overridable internal is `_round()`, not `_epoch()`.** A client has to know when the phase ENDS in order to draw a countdown, and under a policy that a transaction can move it cannot compute that - so the seam returns the phase bounds too, and `_epoch()` is derived from it rather than the other way round. Two overridable views of one fact would be two things to keep in step, and the second one is the one every consumer needs.

**One sentence above was too kind to the prototype, and the correction is a defect rather than a scope note.** "Its two TODOs are exactly the missing work" is right about what was missing and wrong about what was there: `_moveToNextEpoch`, called in a commit phase, landed in the NEXT epoch's commit phase and stranded every commitment made in the one it left - unopenable, then settled as a miss, with nothing raised anywhere. It is the one thing in the tree that can break D10's no-gap property, and it is still live in reveal-or-die's and bomber-world's contracts (unreachable in both, for the same reason it was unreachable here: no deployment sets both durations to zero). See `work/notes/findings/the-manual-epoch-prototype-could-strand-a-commitment.md`.

One thing in that prototype does not survive. `SKIP_COMMIT` (skip the commit phase entirely, derived from both phase durations being zero) is **dropped rather than formalised** - done 2026-09-15, and the conflation was even tighter than this section says: ONE boolean expression (`COMMIT_PHASE_DURATION == 0 && REVEAL_PHASE_DURATION == 0`) was both the definition of `SKIP_COMMIT` and the test for "this is a manual game", so the two could not be told apart by reading. The policy is declared by the deployment now, and a configuration whose durations disagree with it is refused at construction, so neither can be inferred from the other again. It was hotseat's mechanism and hotseat has a better one (D4), which leaves it with no consumer: catacombs commits against randomness rather than against opponents so it needs commitments even solo, and the other four games are PvP. Keeping it would mean a second resolution path through the round, forever, for nobody. Development and testing do not justify it either, since a test that skips the commit exercises a path nothing ships. The bomber-world port therefore keeps manual epochs, drops the commit-skipping, and stops deriving one from the other; conflating them is what made it look like a mode.

### Five derived constraints, which are the actual design

These follow from the axes rather than being choices, and each one closes a trap.

**C1. Early advance requires a closed roster, and the denominator is not the player list.** "Everyone has committed" has no denominator under open entry, so the epoch-advance axis is constrained by the membership axis and early advance can never be offered as an independent switch. What the contract needs is a count, not a roster, and it needs the RIGHT count: **members the epoch waits for**, which is not the same set as members who are alive. A game may keep a silent player in the world while no longer blocking on them (reveal-or-die's `numMissesAllowed` is exactly that shape: three missed rounds before the avatar dies, and it is a deployment parameter rather than a constant). So the count decrements when a member stops being waited for, and the game decides separately, and later, what becoming silent costs them.

**C2. Advance early only on unanimity, never on a majority or a quorum.** If a subset can close a phase, fast players time out slow ones and the reveal phase becomes a race, which is the order-independence failure one level up: whoever is quickest decides the outcome, and committing bought nothing.

**C3. An early advance may only WIDEN a window, never shorten one.** Early advance opens the next phase early; it never closes the current one early. This is what keeps a 24-hour game with early turnaround coherent: the reveal window becomes "as soon as everyone has committed, until the nominal deadline", so a scheduled reveal encrypted against the nominal time still lands inside it, and a player who has not acted still has their full clock. Stated the other way round, C2 and C3 together make early advance a **strict Pareto improvement**: it can never make a game worse than the timer alone, which is the property `play-modes.md` hoped could be stated explicitly.

**C4. Under C2 and C3, a scheduled reveal can only ever be redundant, never lost.** If the epoch advanced early, everyone revealed, so a scheduler firing afterwards submits a duplicate. A duplicate reveal costs one reverted transaction; a missed one costs the stake. So scheduled reveals and early advance compose, which was not obvious and is the reason to write C3 down rather than discovering it.

**C5. Advancing the round is its OWN transaction, never a rider on the last reveal.** Tempting to have the contract advance automatically when the last player reveals, and wrong for three reasons. It makes `reveal` mean something different depending on whether you happened to be last, so the mode leaks into the one call every mode shares. It makes that reveal's gas depend on winning a race, which is the worst possible input to the classify-and-remedy path this app already has for out-of-gas failures, and it matters for a game that budgets a reveal tightly. And it is not retriable: a bundled advance stranded by an unrelated revert leaves the round stuck, while a separate call can be made again, by anyone.

Two constraints on that call. It is **permissionless but strictly conditional**: it may only do what the rules already permit (the timer expired, or unanimity), never anything discretionary, so allowing anyone to call it grants nothing. And the liveness assumption it introduces is bounded, because it only exists in the modes where somebody is present anyway: a purely timed epoch needs no call at all, since the epoch simply is what the clock says.

### Three things the matrix contains that are not free

**Offline play keeps the code path and none of the guarantee.** The foundation rests on "something must be at stake, or nobody has to reveal". In an embedded world the player owns the chain, and webevm's `dumpState` / `loadState` makes rewinding a documented feature rather than an attack. So single-player and hotseat keep commit-reveal for fidelity, not for safety, and the framework must never grow an assumption that the two are equivalent. The sharp corollary, and it is narrower than it first looks now that hotseat keeps commitments (D4): what the chain shows an NPC is a hash, so cheating through the CHAIN is structurally impossible in every mode. What is not enforced is the browser, where the player's plan sits in memory before it is committed. So the rule for an NPC is that it may read only what the chain would tell it, and in an embedded world that is a discipline rather than a guarantee.

**There are two reasons to commit, and only one of them is about opponents.** Committing hides a move from another player (PvP), and it binds a player before randomness resolves (PvE anti-grinding, which is catacombs' whole solo design). That is why "solo, so nothing to hide" does not follow, and it is the reason `SKIP_COMMIT` has no consumer even in a single-player game with randomness in it.

**A zero-timer game can deadlock, and the way out is a forfeit, not a clock.** With no clock nothing protects the round from a player who never acts. On one device that is not a problem, and on a LAN it is usually not one either, because the players can talk to each other; what they cannot do by talking is unblock the contract. So a zero-timer world needs an explicit forfeit: someone can remove a member from the set the epoch waits for.

Three things follow, and they are why this is a seam rather than a rule.

- **Forfeit and the existing missed-reveal settlement are the same mechanism at different triggers.** In a timed game the clock produces the missed reveal; with no clock a peer has to produce it. `acknowledgeMissedReveal` is already the settlement path, so what is new is who may fire it and when, not what it does.
- **A third party firing it must be bounded**, or forfeiting an opponent becomes a move. Two bounds are available and a game picks one: unanimity of the other waited-for members, or wall-clock silence. The second is available even here, because an untimed EPOCH does not mean an untimed CHAIN: `block.timestamp` still advances, so "has not acted for an hour" is answerable on chain while epochs remain manual.
- **What forfeiting COSTS is the game's, and it is not one answer.** Dropping out of the denominator has to be immediate, since that is what unblocks the round. Whether the avatar dies with it, or becomes prey for three turns the way a silent player already does, is the game's rule and belongs behind the same seam as the death rule. This is C1's two-count distinction showing up as a user-visible feature rather than as bookkeeping.

### Answers to `play-modes.md`'s open questions

1. **Which hotseat option?** The one that keeps commit-reveal, per D4. Not per game, and not the one that drops the commit phase.
2. **Roster or count?** A count of waited-for members is enough for early advance, and it must be maintained on join and on leave, death or forfeit (C1). Do not store the roster until something else needs it.
3. **Does early advance need griefing protection?** No: the clock is the protection, and under C2 and C3 early advance is a strict Pareto improvement. Except with no clock at all, where the deadlock above is real.
4. **Do modes interoperate?** Yes, and this settles the shape: hotseat is inherently a closed roster, and conquest wants several modes in one build behind a launch menu. So they are independent seams selected together, never one mode enum.

## Order of work

Sequenced by what gets more expensive if deferred, not by size.

**Phase 0: stop the bleeding. DONE, 2026-09-07.** Finish the input backport as a MOVE (delete reveal-or-die's copy, reconcile the thirty-line delta upstream). Add `verify` to the `fanout.config.json` on `template-commit-reveal@offshoot` and `reveal-or-die@offshoot`; both are currently ungated, which means a cascade can land red and nothing says so. Acceptance: a fanout with `--verify` is green end to end. Adopting jolly-roger's `tooling` branch is deliberately NOT part of this phase: `check-shared-divergence.sh` compares files shared between a base and its feature branches, and this repo has none until Phase 2 creates one, so adopting it now would install a check with nothing to check.

Four things it found, none of which change the phase's outcome.

- **The delta was documentation, not behaviour**, so the reconciliation was a deletion and upstream's copy needed no change. See Decision 2 for the measurement and for what it does and does not narrow about the rule. reveal-or-die's suite drops by exactly the 26 server and 7 client tests those three files held, and the identical inherited copies under `web/test/lib/game/render/` still run them, so the coverage is unmoved rather than merely believed to be.
- **reveal-or-die had no `offshoot` branch at all**, rather than one carrying a config without `verify`. The practical difference matters for the next repo: `offshoot-fanout config set` creates the orphan branch with plumbing, so nothing is checked out and the working tree is never touched, and the config lists `main` explicitly so that `deployment/rise-testnet` cannot wander into a cascade later.
- **`verify` is copied from jolly-roger verbatim** (`pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit`) and deliberately carries no e2e. e2e needs ports, a chain and about twelve minutes per node; it is run by hand for the nodes a change touches, which is what was done here. A gate that is too slow to run is a gate nobody runs. Note the consequence, since it is the gate's one blind spot and Wave 0.3 of the service-layers PRD is a list of things it would have missed: **`verify` proves the text still compiles and the units still pass, and proves nothing about behaviour in a browser.**
- **The parallel e2e run flakes, in BOTH repos, one test per run**, which matters because `HANDOFF.md` records the opposite ("e2e used to fail in parallel and no longer does", fixed by the `getCellsInZones` index). Measured across four parallel runs on trees that differ from a green baseline by nothing or by markdown: one failure each, a DIFFERENT test every time, and every one of them a timeout or a wait rather than a wrong answer (`layout-shell` on a `page.goto` `ERR_ABORTED`; `contracts` write-function reading `AvatarsSale_Proxy` where it wanted `Game`; `out-of-gas` waiting out 120s for `Revealed` and getting `Idle`). Each passes alone, and the serial `CI=1` runs are clean: 50 of 50 here with no retries, 49 in reveal-or-die with one retried.

  **THE 20-AND-ABOVE THRESHOLD IS WRONG IN BOTH DIRECTIONS, measured 2026-09-11 across six full runs.** This document says elsewhere that "the documented failures remain at 20 and above" and treats loads of 8 to 16 as clean. Neither half holds. A `with/all` run at load 8 to 10 produced ONE RETRY, in this note's own family (120s waiting for `Revealed`, getting `Idle`); a reveal-or-die run at load 15 to 17 failed a test on all three attempts, inside the `connectedPage` fixture, and took 29.5 minutes against a 20-minute baseline; a second at load ~15 failed three tests in one file whose assertions are 15-second waits. Every one of them passed in isolation at load 4 to 9, the three-test file in 2.6 seconds each. So: **the variable is load, as this note says, and there is no threshold - there is a probability that rises with it.** The practical rules are unchanged and worth restating because they are what separated four flakes from two real bugs this session: run the suite when the machine is quiet, read WHICH assertion failed, and re-run in isolation before concluding. Wall-clock RUN TIME against the baseline is the cheapest load signal available and is worth recording next to the count.

  **Serial `CI=1` is NOT immune, which this note implied and should not have.** Measured 2026-09-07 during the epoch-countdown item, with the load average attached this time: a `CI=1` run of this repo went 49 passed plus one flaky retry at load 12.00, and the identical tree re-run twenty minutes later went 50 of 50 with no retries at load 4.73. The failing test was the round test, and it failed in the family this note already names - a missed reveal, then 120s waiting for `Revealed` and getting `Idle`, three epochs after the miss. So the variable is LOAD, not the worker count, and `CI=1` only lowers the probability. Two practical consequences: a single flaky serial run is not evidence that a change broke something, and it is not evidence that it did not, so re-run before concluding either way; and the retry that `CI=1` enables is doing real work and should not be read as the suite being clean.

  **The first version of this note said the template's own run was 50 of 50 and concluded the problem was reveal-or-die's. That was wrong, and it was wrong in the most ordinary way: it generalised from one earlier green run taken hours before, on a quieter machine.** The template flaked on the very next parallel run, on a tree whose only difference from that green one is two markdown files. So it is shared, and the load matters: the green baselines were taken at the start of the session and the failures came after several hours of back-to-back suites, at a load average of about 12 on 16 cores.

  It is NOT this phase's and did not arrive with this phase's change, which moves an import path and nothing else. The handoff's own lesson applies unchanged and is the reason to leave it alone until it is measured: **a failure whose only symptom is under parallel load is a resource problem until proven otherwise**, and the tempting fixes (raise the timeout, add a retry, run serially) all hide it. The last one of these was cracked in ten minutes with `curl` in a loop against the node from outside the suite. Do that before touching a test.

**Phase 1: raise the floor. DONE; every row landed 2026-09-07/08 and the phase was verified and marked 2026-09-17.** It was never labelled at the time, which is why it sat looking open for ten days while Phases 2 and 3 were marked around it. All three parts of the acceptance below are met, measured rather than asserted:

- **Every row of Decision 2's backport table is struck through**: the input recognisers, the acquisition rail, the asset pipeline (re-homed to `with/pixi-js` by D11), the cycle countdown, liveness, the board handover, diagnostics, and config-off-`linkedData`.
- **reveal-or-die modifies FIVE inherited files under `web/src/lib`**, against a budget of ten: `context/game.ts`, `context/types.ts`, `game/identity.ts`, `index.ts`, `kit/environment.ts`. Measured file by file against `with/all` on 2026-09-17. `lib/core` is zero. The single difference under `lib/game` is `identity.ts`, which is N2's designated seam and exists SO THAT it can differ - the number to watch is "files under `lib/game` that differ AND were not put there to", and that is still zero.
- **A turn survives clearing local storage between commit and reveal.** reveal-or-die's `recover-submission.e2e.ts` deletes every storage key under its prefix and asserts the turn comes back with nothing asked of the player; it passed in the 2026-09-17 run. Per D9 that needed both halves - the framework's derived secret and the game's own enumeration - and both exist.

The original text follows, because it is what the phase was measured against.

The backport list in Decision 2, one change per item, each with the descendant's copy deleted in the same change. One fix belongs here rather than in a mode: **reveal-or-die supplies no `makeSecret`, so its secret is 32 random bytes living only in local storage.** Bomber-world, which is the pre-port code, still derives it from a signature (`Commit:${chainId}:${contract}:${epoch}`, `lib/private/localState.ts`), so the port dropped a capability and `HANDOFF.md` still records reveal-or-die as having it. In a game whose stake is the avatar's life after three missed rounds, clearing site data mid-round costs the avatar. Restore it through the seam. **D9 settles what it derives from and what recovery actually means; read it before starting, because the twelve lines that restore the secret are not the piece of work.** Acceptance: reveal-or-die's diff against this template shrinks to its game and its brand, the count of inherited files it modifies stays at or below today's ten, and a round survives clearing local storage between commit and reveal - which, per D9, means the game supplies the action half of the recovery as well as the framework supplying the secret half.

**The liveness item is DONE too, and it is the one that moves the acceptance number.** `commitWhenIdle` and `nothingPendingFor` came up with their seven tests (`6b26a68d`, merged at `a71118b`), so **reveal-or-die now modifies ZERO of the 157 inherited files under `lib/game` and `lib/core`** - `round.ts` was the only one, and both it and its test are byte-identical to this repo's. That is the level boundary actually holding rather than being asserted.

Two things worth keeping from it. The conflict was **both sides adding the same thing**, which is what a backport-as-a-move looks like from the descendant, and taking "theirs" there is not losing the descendant's work, it IS that work arriving from where it belongs. And the valuable part was the tests rather than the option: keying the idle commit on `step === 'Idle'` stops the liveness loop after exactly one turn, because a revealed round stays `Revealed` and nothing returns it to `Idle`, so a player who moved once and then stood still is killed by the silence the option exists to prevent. That was found in play, not in review, and the mutation confirms the two tests that cover it are the only two that notice.

One honest cost recorded rather than glossed: the template's own game does NOT set `commitWhenIdle`, because its stake is a bonded ERC20 that is forfeited rather than decayed. So the option ships upstream exercised only by its tests. That is accepted here because it genuinely cannot be expressed downstream (`plan([])` means "nothing pending", not "send an empty turn"), but it is the second such module after `keys.ts`/`gamepad.ts`, and a third would be a pattern worth questioning rather than repeating.

**The third was not a third**, and it is worth saying so here rather than only under the item: the acquisition rail ships with the reference game buying its ERC20 stake through it on `main`, which cost a contract nobody had planned for (`StakeSale`) and was worth it. The count stands at two, deliberately.

**N3 produced a candidate for the third, and it is recorded rather than counted**: `Game.activeIdentity` is exposed on the `Game` surface and no UI on `main` reads it, while reveal-or-die has three readers. It is materially weaker than the other two - the STORE is threaded through ten sites and exercised by the unit suite and the e2e round, and it is only the exposure on `Game` that has no consumer - so it is not being called a third here. See `work/notes/observations/upstream-members-with-no-consumer.md` for the argument and for the two things that would settle it, both of which belong to `with/nft-identity` rather than to N3.

**The secret half is DONE, 2026-09-07** (`e7599b35` here, merged into reveal-or-die at `b0f6cb6`). `game/core/secret.ts` derives it, `makeSecret` is handed the identity as D7 requires, and both games use it - the template's own, which gives the derivation a consumer upstream rather than an untested helper, and reveal-or-die's, where the identity is the avatar. Signing is injected and the template signs with the local signer off the signer executor, whose `account` is already a viem local account: no wallet prompt, no key in the game, and **no new member on `CoreServices`**, which was worth finding because the composition root is the most conflicted file in the tree.

Three things it turned up, all worth carrying:

- **The two ways to get a derivation wrong are both silent.** A checksummed address and a lowercased one are the same address and different text; an identity missing from the message gives every identity of an account the same secret. Neither throws. Each produces a commitment the player cannot open, discovered when the reveal window shuts on the stake. That is the argument for the derivation living in the framework rather than being written per game, and both are pinned by tests that were checked by mutation (3 of 7 fail on either).
- **The round suite had no teeth for the identity reaching `makeSecret`.** Removing it passed all sixteen existing round tests. There is now a seventeenth, and this is the second time in two phases that a mutation found a gap a green suite was hiding.
- **The acceptance criterion is not met by this, exactly as D9 predicted, and e2e says so out loud.** reveal-or-die's missed-reveal test still misses: it commits, returns in a fresh context with empty local storage, and the round has no memory that it committed at all. The secret is recoverable now; the ACTIONS and the knowledge that a commitment exists are not. What remains is the game's enumeration plus item 1 of the known-not-to-fit list (`restore()` never asks the chain, though `getCommitment(identity)` is right there). **Do not read the derived secret as having closed this item: it was the PREREQUISITE, not the fix.** D10 is the fix, and it is smaller than this item looked before the secret existed.

**The acquisition rail is DONE, 2026-09-07**, and it is the first item in this phase whose upstream copy ships with a real consumer on `main` rather than only tests. `game/acquire/` holds the rail (`acquire.ts`, `pending.ts`, `AcquireModal.svelte`, a README); reveal-or-die's `world/purchase.ts`, `world/pending-purchase.ts`, `world/ui/PurchaseModal.svelte` and both of their test files are deleted in the same change, and what is left there is a 60-line `world/acquisition.ts` that says what an avatar purchase's arguments are.

**Decision 2's own sentence about this item was almost right and understated the cost by one contract.** It said "main's reference game buys its ERC20 stake through it", on the strength of `addToReserve(player, amount)` already letting the wallet pay while the account is credited. That is true and it is not enough: the rail's defining property is ONE transaction, and an ERC20 stake is three (mint, approve, add to the reserve), none of which can forward a gas stipend. So the rail needed a contract to have a consumer at all, and `contracts/src/tokens/StakeSale.sol` is it: one payable call that mints, stakes for `player`, and forwards the stipend, with `msg.value` split exactly the way the descendant's sale splits it. That is a good outcome rather than a scope leak - the value split, the payer-is-not-the-player rule and the exact-payment check are now exercised by two independent contracts instead of one - but the estimate was wrong and the sentence is corrected in the table above.

**It subsumes item 8 of `HANDOFF.md` rather than leaving it, and the subsumption is better than the thing that was asked for.** That item wanted a STEPPER over the mint/approve/stake sequence. A stepper narrates three transactions; the rail removes two of them. `reserve.fund()` is deleted, and with it the only code in the app that sent three transactions for one intention. What the player now signs is one thing, and the one dialog in front of it says who is paying and how much.

**The setup gate's order flips, and the reasoning behind it is unchanged.** `HANDOFF.md` records "the setup gate asks for the authorisation BEFORE the stake", because both were wallet transactions and a player who abandons setup half way should have spent as little as possible. That argument now points the other way: acquiring is ONE transaction that also funds the signer, and the signer registers itself out of that stipend, so acquiring IS authorising and asking to authorise first demands a transaction the very next step includes. The descendant had already made exactly this flip for exactly this reason, which is the clearest possible sign the rail is at the right level. `authorise` stays as a reachable step for the player who has a stake already and is opening a second browser.

Four things it turned up.

- **`context/core.ts` was reveal-or-die's only remaining divergence in an inherited composition file, and it was this rail's fault.** The descendant had added exactly two members to `CoreServices` (`gasFee`, `payment`) and nothing else in that 1400-line file. They exist because the payer is not necessarily the player, which is the rail's own requirement, so moving the rail up moved their reason up and the file goes back to byte-identical. That takes the inherited files reveal-or-die modifies under `web/src/lib` from seven to six (`AcrossPages.svelte`, `context/game.ts`, `context/types.ts`, `index.ts`, `kit/environment.ts`, `manifest.json`), against the phase's acceptance of "at or below ten", and it is still zero under `lib/game` and `lib/core`. **Look for this shape on every remaining item in the table**: a descendant's edit to a shared file is often not a divergence at all, it is the shared file already carrying half of a thing that has not been backported yet.
- **A mutation found a third gap, in the place with money in it.** Removing the pairing of "who gets the stipend" and "how much is forwarded" passed the whole rail suite. It is a real failure in both directions: a stipend with no recipient is either kept by the sale, or - where the contract refuses to keep it, as this one does - reverts every purchase the moment a returning player buys a second time, which is the case nobody tests by hand. It is `stipendFor` now, three lines with its own name, and three tests that fail when it is inlined wrongly. **Three phases, three gaps, all found the same way.** The pattern in all three is the same: the behaviour was correct, obvious in the diff, and covered by nothing.
- **The e2e proves the rail rather than merely passing beside it**, and that was checked rather than assumed. With the gate's order flipped, the `authorise` button is never shown to a fresh account, so the ONLY route by which the browser becomes a delegate is the rail's third step. Disabling that step fails the round test at `planOnCanvas` - the board never becomes playable - which is the strongest available evidence that the reference game is a real consumer and not a decoration.
- **It shrinks `with/nft-identity` (D2) more than the decision assumed.** D2 lists three things the branch changes, and "acquisition (mint and deposit instead of buying a bond)" was the vaguest of them. It is now one file: an `Acquisition` value naming an address, a function, a price, a stipend and an argument builder. That is an N1 ADD, not an edit to a shared file, which is exactly the shape the branch's budget wants - and it means the branch's acquisition work is a contract plus about sixty lines rather than a flow.
- **The rail's own recovery guard now applies to a REPEATABLE purchase, which the descendant's never had to be.** An avatar is bought once; a stake can be topped up. `findPendingAcquisition` counts a landed-but-not-final transaction as pending, so "Add stake" is refused for as long as the ledger holds the last one. That is the correct bias (it is the player's money and a double-click is cheap to make) but it is a behaviour difference worth knowing about before someone reports it as a bug.

Two things noticed while doing it, neither acted on.

- **The rail assumes the delegation registry is the contract called `Game`.** It reads `deployments.contracts.Game.address` in three places (deciding the signature route, fetching the credential, and submitting the registration), which is true in this lineage and is an assumption rather than a seam. It was true of the descendant's copy too, so nothing regressed; it becomes a question the first time a game's delegation record lives somewhere other than its game contract. Phase 2 is where identity is being reshaped and is the cheapest place to notice it.
- **`AcquireModal.svelte` imports `$lib/shadcn` directly, and that is NOT the D8 hole**, which was checked rather than assumed so nobody has to check it again. D8's hole is specifically `core/ui/confirm/ConfirmationModal.svelte`, because `core/` is jolly-roger's and its copy has no such import anywhere. `lib/game/` is this repo's own layer, where importing the kit is the normal thing every component does. The boundary D8 wants a test for is `core/`, and this file is outside it.

**The epoch countdown is DONE, 2026-09-07**, and it was three times the row's size for a reason worth carrying to the remaining items: **a UI component is only as movable as the MODEL it draws.** `GameClock.svelte` is 112 lines, props-only, and every executable line of it was already generic - but its `phase` prop was a four-part union that exists nowhere upstream, so moving the picture without the model would have meant widening the prop to something the template cannot produce, or keeping two copies of the model. The model went up with it: `game/core/round-phase.ts` holds `RoundPhase`, `roundPhaseOf` and `boardIsBehindClock`, and the dial is `game/ui/GameClock.svelte`, the first member of a `game/ui/` folder for framework-offered presentational components.

Three things it turned up.

- **There were already two types called `RoundPhase` in one repo**, and neither a compiler nor a reviewer would flag it, because both are structurally about phases: `game/core/refresh.ts` exported `{phase: 'play' | 'wait'}` (what `refreshDuringReveal` reads) while the descendant's context exported the four-part union. It is `PlayWindow` now, named for the question it answers. Blast radius was seven sites, all upstream, and `refresh.ts` was byte-identical downstream so the rename arrived by merge. **Look for this on the remaining rows too**: a backport that cannot use the obvious name is telling you the obvious name is already wrong somewhere.
- **`canTakeTurnNow` deliberately did NOT go up**, which is where the seam actually falls. It is `setup === undefined && phase === 'play'`, and the first half is the GAME's rule about what a player must hold before acting, while only the second is the framework's. Splitting a two-line function across the boundary looks pedantic and is the whole point of having one.
- **The reference game draws the dial**, so this ships with a consumer, and that was not decoration either: the template's HUD was a dot and a progress bar, which had nowhere at all to put the catch-up. The template has the same client-clock-ahead-of-board problem as the descendant and was reporting it as "resolving the round" - telling a player something is being waited for when nothing is except a poll.

**The acceptance count holds at six and the honest reading is that it did not improve.** `AcrossPages.svelte` goes back to byte-identical (diagnostics was its only reason for differing), and `debug/diagnostics.ts` takes its place, because the template now ships one at that path and each app owns its own. So the list is `context/game.ts`, `context/types.ts`, `debug/diagnostics.ts`, `index.ts`, `kit/environment.ts`, `manifest.json` - six, against the phase's acceptance of "at or below ten", and still ZERO under `lib/game` and `lib/core`. Every one of the six is a file an app is SUPPOSED to own, which is a different thing from a divergence, and the metric cannot tell them apart. Worth knowing before someone tries to drive it to zero.

**N3 moves the second half of that count from ZERO to ONE, and the one is the point rather than a regression.** `web/src/lib/game/identity.ts` now differs between the two repos, and nothing else under `lib/game` or `lib/core` does - verified file by file rather than assumed. That file exists SO THAT it can differ: it is N2's designated seam, and its executable difference is the alias line plus the provider a choosing game replaces. So the metric has moved in the direction it measures as bad while the thing it stands for got better, which is the same blind spot the paragraph above describes, one level further in. The number to watch is not "files under `lib/game` that differ" but "files under `lib/game` that differ AND were not put there to", and that is still zero.

**D10 and the board handover are DONE, 2026-09-08, and they were done together.** The plan said those three files were "the client half of the round never reconciling with the chain", which is D10's own subject; deciding the seam once for both was cheaper than twice and it turned out to be the same seam twice over.

**`round.adopt` is twelve lines and the constraint is what made it twelve.** No new `RoundState` member, because a reconstructed round IS a restored round, so `restore()` is now `adopt()` plus the past-epoch branch. It refuses two things and both refusals are the work: a round from a past epoch (whose reveal window has shut, so adopting it would spend gas on a reveal the contract refuses), and a round adopted WHILE a commitment of this browser's own is in flight, because `adopt` writes to storage and storage is where the secret for an unlanded commitment lives. The second was not in the task and is the more dangerous one: it is the loss the round is arranged to prevent, arriving silently.

**A test reached for a state that must not exist, and that is the sharpest evidence the constraint is right.** The game's recovery store had a `Recovered` step; it is unreachable by construction, because the moment `adopt` takes the round the round reports `Committed` and the store goes quiet. A `Recovered` state would have been the one thing in the app able to tell a reconstructed round from a restored one - exactly what D10 forbids - and it was written before it was noticed. It is gone, and its absence is documented at the type.

**The reference game cannot ENUMERATE, and that is what makes it the right consumer.** A turn here is any subset of the cells on an open board, so the route it drives is D10's third one: the player re-enters the turn and the hash judges it. That is the general route, it serves conquest as well as reveal-or-die, and it cannot be abused - you cannot recover a plan you did not commit. Enumeration remains reveal-or-die's, unbuilt, and it is now the interesting half rather than the obvious one.

**The board handover splits into a WHEN and a RULE, and the two games want OPPOSITE rules.** `game/core/handover.ts` owns the when: hold during the wait, release when the round is over, publish the release so both halves of the swap turn on one moment. The rule - which parts of a game's board the resolving round changed - is the `hold` callback, and the case neither can decide is an entity seen for the first time mid-window: newly arrived, or merely panned onto? The reference game HIDES it, because on an open board "a cell became claimed" is the outcome and is the common case; reveal-or-die SHOWS it, because hiding an avatar that was panned onto removes something that has stood in the world since before the round began. Two games, two defaults, one wrapper. That is the seam being in the right place, stated as a measurement rather than a hope.

**Three files were listed and two of them shared one primitive, while the third contributed nothing further.** `display-plan.ts` and `reveal-outcome.ts` each kept their OWN copy of the same memory, because the round drops its actions at `Revealed` and both had something left to say about the turn. That memory is a fact about the ROUND, so it went up as `rememberTurn` and both now read it; `reveal-outcome.ts` itself did NOT move, because everything left in it is this game's vocabulary (entered / left / moved / stayed) and the reference game has no use for it - its HUD says one sentence after every reveal and is right to. Moving it would have been a module upstream with no consumer, which is the pattern the plan already says to question.

**Holding the board CREATED the second half in the reference game, which is how the pair proved itself.** Until now the planned overlay handed over safely because `onSettled` refreshed the board before the round reported itself revealed. With the board deliberately withholding, that stopped being enough and `display-plan` became necessary upstream rather than merely available. The reference game was also, until this change, drawing reveals in the order players paid - the exact thing this template exists to prevent, in the template's own game.

**Diagnostics is the third item whose real payload was a shared file going back to byte-identical.** `AcrossPages.svelte` differed for one reason and one only: reveal-or-die started the trace there. The mechanism belongs upstream by its own argument - it watches `core/` from OUTSIDE precisely so `core/` stays inheritable, which is a reason every descendant shares and none can satisfy locally - and upstream describes what it needs STRUCTURALLY rather than naming `Context`, because `context/types.ts` is one of the files a game replaces. The reference game's `Context` satisfies the structural type with no cast, which is the check that the description is honest.

**The config item was bigger than "the absent parameter", and one of the failures was live.** `resolveEpochConfig` read its phase durations with `Number()`, so a deployment missing one produced `NaN`, and a NaN duration makes every comparison against the clock false: the epoch simply stops advancing, the round never commits, and nothing is raised anywhere. That is upstream and inherited, so it was every game's. `game/core/linked-data.ts` turns it into a sentence naming the parameter, and carries the other two silent cases with it - a `uint256` arriving as a decimal string, and a parameter a deployment predates, which is reveal-or-die's contribution and answers `undefined` rather than a default.

**A duplicate was found in reveal-or-die that PREDATES this work, and it is the tripwire firing.** `context/game.ts` there was carrying its own copies of `refreshDuringReveal` and `settleBoardWhenRoundStarts` while the inherited `game/core/refresh.ts` had them too: identical in every executable line, differing only in doc comments, with only the local pair reachable and ten tests maintained against them. That is the input-recogniser failure exactly, across a repo boundary, and it survived several cascades because **nothing in this tree diffs a descendant against its stem.** Both copies and their ten tests are deleted; the inherited ones run unchanged. This is the second instance of the same failure and it is the argument for N6 (`check-shared-divergence.sh`) being worth having BEFORE `with/nft-identity` needs it, and for it needing a cross-repo mode, which it does not have.

**One behaviour worth knowing before someone reports it as a bug.** While a lost round is pending recovery, `autoCommit` will fire on the re-entered plan if the player is still typing when the commit phase closes, and COMMIT it rather than recovering. It is benign in both directions - the same plan hashes to the same commitment, and a different one replaces an unopenable commitment with an openable one, which is strictly better than forfeiting - but it takes the recovery notice off the screen, and a test cannot tell that from the feature not working.

**N3 IS DONE, 2026-09-08** (`d4fe4475` here, merged into reveal-or-die at `4b98f8d`), and it is the first item in this plan whose result can be stated as a measurement rather than a description: **the entire identity difference between this repo and reveal-or-die is now one line of code**, `GameIdentity = bigint` against `` `0x${string}` ``, plus the provider a choosing game replaces. `game/core/` is byte-identical between the two repos, and so is the test that enforces the rule. That is N2's `TARGET_STEP` pattern demonstrated across a REPO boundary before the branch it was designed for exists, which is stronger evidence than the branch itself could have produced.

**`Game.identity` keeps meaning the ACCOUNT, and the new member is `Game.activeIdentity`.** Both readings were defensible and the deciding argument is not aesthetic: on `with/nft-identity` the account still exists and still owns the token, so a consumer asking "who am I signed in as" needs an answer that survives the branch. Had `identity` become the alias, that member would have changed type under the branch and the account would have needed a NEW member - a shared-file edit, in the most conflicted file in the tree, to say something that was already true. reveal-or-die reached the same answer independently while porting, which is what settled it.

**Three things this decision said or implied that turned out to be wrong, all found by building it.**

- **"No shared file names `address` as the identity, INCLUDING TESTS" cannot mean the framework's own tests.** `test/lib/game/core/round.test.ts` and its neighbours instantiate `createRound` with a concrete address, and that is a test FIXTURE choosing one instance of a type parameter, not an application declaring what its players are. Converting them would have broken reveal-or-die on the first cascade, where the alias is a `bigint` and the fixtures are addresses - and it would have DELETED something valuable, because in that repo those inherited suites are the only coverage the address half of `PlayerIdentity` has. The framework and its tests stay generic; application code and its tests use the alias. The boundary test encodes exactly that split.
- **The provider cannot be parameterised into serving both cases.** The first build gave `createActiveIdentity` an optional `candidates` list so a branch could supply a selection without touching the call site. The one real consumer says otherwise: reveal-or-die's identity comes from a store that reads custody, drops avatars with no life left, prefers one already in the world and remembers the choice per owner across reloads. None of that is a list of candidates. So a game that CHOOSES replaces the provider rather than configuring it, and the speculative parameter was removed before landing rather than shipped unexercised.
- **The identity was never only a naming problem.** `if (!player)` is a correct emptiness test for an address and wrong for the other half of `PlayerIdentity`, because a token id of `0n` is falsy. It was in the FRAMEWORK, in three places, so it belonged to every game already; token zero's turns would simply never have been sent, with nothing logged and every other player working. reveal-or-die is safe only by accident, its avatar ids being `owner << 96 | subID`. Pinned by a test that fails when the check is reverted, which the other twenty-nine tests in that file do not notice - the fourth phase running in which a mutation found a gap a green suite was hiding.

**Two smaller things worth keeping.** Splitting the names turned up `signAsSigner`'s local `account`, which meant the SIGNER's viem account and would have shadowed the player's the moment the outer name existed: three things called the account in one file, which is the confusion the split exists to remove, so it is `signerAccount` now. And the boundary test's first version failed on its own PROSE, because a rule about generics cannot be written down without naming them; it strips comments before matching, which is the cheapest possible demonstration that a checker has to look at code rather than text.

**What the branch still has to edit, which is N1's budget and the number this decision gets judged on: two shared files.** `game/identity.ts` (the alias line, and the provider it replaces) and one line in `context/game.ts` (building the identity from custody instead of from the account). Everything else `with/nft-identity` touches - acquisition, what is at stake, the contract's `_playerOf` - is its own subject rather than identity naming, and none of it is a file `main` keeps developing for other reasons.

**THAT PREDICTION WAS RIGHT ABOUT IDENTITY AND WRONG ABOUT THE BRANCH, and the correction is the useful part. The measured list is SEVENTEEN.** It was right about the two: `game/identity.ts` is the whole identity difference and `context/game.ts` is six lines in one hunk. What it did not count is that D2 names THREE differences, and the other two - acquisition, and what is at stake - have designated files of their own that a token game must also replace. The sentence above concludes "none of it is a file `main` keeps developing", which is the claim that turned out to matter, and it holds: every entry is a file whose job is to say what THIS game is.

The seventeen, by kind:

| kind | count | what they are |
|---|---|---|
| files that exist in order to differ | 5 | `game/identity.ts`, `placement/stake.ts`, `placement/reserve.ts`, `placement/acquisition.ts`, `context/game.ts` |
| contracts and their suites | 5 | two deploy scripts, `Game.test.ts`, `StakeSale.test.ts`, `test/js/utils` |
| test fixtures naming an identity concretely | 3 | the three `placement` suites that instantiate the round |
| what is at stake, tested | 1 | `reserve.test.ts` |
| the e2e, where the board is different | 2 | `e2e/fixtures/game.ts`, `e2e/tests/game.e2e.ts` |

**Four of the first five say they are seams in their own doc comments on `main`, written before the branch existed**, and the fifth (`placement/stake.ts`) was extracted upstream FOR the branch, which is the part worth repeating rather than the count: it took `placement/ui/hud.ts` (523 lines, edited whenever the HUD gains a state) and `routes/play/+page.svelte` (a route, and one `with/pixi-js` depends on being byte-identical) OFF the list, in exchange for a file that holds six sentences and exists to be different. That is the difference between a conflict site and a switch, and it is the same trade `with/pixi-js` made when `vite.plugins.ts` replaced `vite.config.ts`.

**Phase 2: identity, and the branch tree (D11). DONE, 2026-09-11.** Build the fan once rather than twice: N3's refactor on `main` (the alias, and the test that enforces it) - **done** - then `with/pixi-js` (which is also where the reference game's port onto the immediate renderer lands, and where the asset pipeline is deduplicated out of reveal-or-die and conquest) - **done, 2026-09-09** - then `with/nft-identity` - **done, 2026-09-10** - then `with/all` and the re-point of reveal-or-die's `stemBranch` at it rather than at `with/nft-identity` - **done, 2026-09-11.**

The tree at the top of D11 is now the tree on disk. `fanout.config.json` on `offshoot` carries `with/all` with `stem: ["with/pixi-js", "with/nft-identity"]`, which `offshoot-fanout` reports as an integration node and merges from both parents in one step; reveal-or-die's carries `stemBranch: "with/all"`. A cascade now runs `main -> {with/pixi-js, with/nft-identity} -> with/all -> reveal-or-die` in one pass, and the first one that was allowed to reach reveal-or-die passed its `verify`.

**~~`main` IS NOW UNMERGEABLE INTO reveal-or-die, and stays that way until the re-point.~~ CLOSED 2026-09-11** - the re-point has happened and the `AGENTS.md` warning it justified is deleted from both repos. Kept below because the ANALYSIS is what generalises, and because the way it came true is a correction: the thing that broke the merge was not a clean deletion but three clean ADDITIONS, including one that rewrote a descendant's e2e inputs to match a contract signature the descendant does not have. See the finding note, which is now closed with that measurement.

**The original entry, for the reasoning:** This is D11's own sequencing rather than a defect, but it is a live hazard because the cascade is a habit and `offshoot-fanout` will offer it. Measured, not predicted: the merge conflicts in three files, all of them resolvable and none of them the problem, and then a hunk that merges CLEANLY deletes `game/render/pixi/PixiCanvas.svelte` while `reveal-or-die/web/src/lib/world/render/index.ts:27` still imports it. So a merge that reported three conflicts, all correctly resolved, leaves the game with a dangling import of its own canvas. Conflicts get attention, clean auto-merges do not - and this is the DELETION variant of that, which neither `check-shared-divergence.sh` nor the cascade ritual looks for, because the script compares files two branches share and after the merge this one is shared by nobody. Full write-up, and two candidate guards, in `work/notes/findings/main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint.md`.

**~~This is also where reveal-or-die's open mint gets decided~~ DECIDED AND FIXED, 2026-09-09**, ahead of the branch rather than on it, because the defect was live in a finished game and contracts are not inherited anyway (decision 1 in `HANDOFF.md`), so there was nothing for the branch to carry.

**The decision: an avatar must be PAID for, in the native token for now, with a token payment kept possible.** The mechanism was already there and only the door was open - `SaleViaNativePayment` already charged, and `Avatars.mint` was `external` with no access control, so the sale was advisory. `mint` now reverts unless the caller is `Avatars.minter`, which the deployment points at the `AvatarsSale` PROXY; `minter` is zero until wired, so a deployment that forgets mints nothing rather than minting for free.

**What paying MEANS stays in the sale, and that is what makes the later token payment cheap.** `Avatars` knows only that exactly one address may mint, so charging in an ERC20 is a new sale contract plus one `setMinter` call - no change to `Avatars`, no migration of existing avatars, and `SaleViaERC20Payment.sol` is already in the tree for it. `setMinter` is re-settable rather than one-shot for exactly that reason, and it costs no trust that is not already spent: the sale sits behind an upgradeable proxy owned by the same admin, who could always have upgraded it to hand avatars out. **One minter and not a set**, deliberately - a mapping would allow two live sales and nothing wants that yet, and a speculative parameter shipped unexercised is the thing this project keeps having to delete.

Two smaller things it fixed on the way. `mint` was `payable`, took `msg.value` and did nothing with it, and neither it nor `EnumerableERC721` has any withdrawal - so every wei ever sent to it was permanently locked; it is no longer payable. And `docs/plans/identity-without-consent.md` in that repo now records that BOTH halves of the composed impersonation are shut, which is the correction this document asked for: while only the payload half was closed, the note still described the whole attack, and **a half-fixed composed vulnerability is the most misleading kind of record there is** - it invites a reader to dismiss the live half along with the dead one.

**Five tests, checked by mutation**, and they assert the INVARIANT rather than the price, so they keep their meaning when payment moves to a token: removing the access control, leaving the minter unwired, opening `setMinter` to anyone, and removing the payment check each fail them. Leaving the minter unwired fails ten of fourteen, which is the "zero means nobody" default being loud rather than silent.

**What the branch inherits from this is the RULE, not the code**: whatever `with/nft-identity` uses as its token must be acquirable only through something that charges, because that is what makes it a stake. **bomber-world still has both halves** and is ~1067 commits behind; that is one more thing D3's re-sync buys.

Adopt jolly-roger's `tooling` branch here, with `FEATURES=with/nft-identity`, since this is the phase that gives it something to compare (N6). Acceptance: hosted-account shape, and the branch README's shared-file edit list fits on one screen.

**`with/nft-identity` IS BUILT, 2026-09-10.** The reference game is token-keyed on it: identity is an ERC721 id, entry is one call that mints an avatar into the game's custody, and what a missed reveal costs is the avatar. `main` is unchanged as an address game.

**The contract half of N3 had never been done, and doing it is what made N4 possible.** N3 took the concrete identity out of every shared TypeScript module in Phase 1 and left the other side of the ABI alone: `IGame` still said `address player`, the store still keyed by one, every event still indexed one. A branch that changed the identity would therefore have had to edit the interface, the store, the events and three routes - and a store edit is exactly what N4 forbids. So `main` now keys every player by a `uint256`, everywhere the contract names one, and the branch overrides two virtual internals and touches no shared contract at all.

**It is deliberately NOT an `address` that a token game casts into**, and that is the one design point in this phase worth carrying to the ports. Twenty bytes holds every account and does not hold every token id: reveal-or-die's are `owner << 96 | subID` and conquest's are derived the same way, so a game that truncated would alias two players onto one reserve and one commitment with nothing raised anywhere. The cheap version of this branch (pad a token id into an `address` and change no signatures) is a trap laid for precisely the four games this axis exists for. `_playerOf` on `main` refuses an id that is not an account, which is the guard, and it is pinned (removing it passes 17 of 18).

**The seams are two functions and both are named for the question they answer:** `_playerOf(sender, id)` (who the caller is acting for, having checked they may) and `_forfeit(player, bond)` (what not revealing costs). Resolution and authority are ONE function on purpose - splitting them would let a caller reach a resolved identity without having passed the check - and `_reveal` needs neither, because a reveal is validated by the commitment hash and anyone may submit one.

**CUSTODY RATHER THAN OWNERSHIP, and the difference IS the stake.** If the contract merely READ `ownerOf`, a player who disliked what they had committed to could sell the avatar inside the reveal window and walk away whole, leaving the buyer to be seized from: a costless exit with an extra step, which voids the invariant the template rests on. So the NFT lives in the game while it plays and `withdrawAvatar` refuses while a commitment is open - in the current epoch (you committed) and in a past one (you are already forfeit, and rescuing it would make the penalty optional).

**Acquisition costs something, which is the rule the mint fix left for this branch rather than code.** `GameAvatars.mint` reverts unless the caller is `minter`; `minter` is zero until wired, so a deployment that forgets the sale mints nothing rather than minting for free; and what paying MEANS lives in the sale, so charging in an ERC20 later is a new contract plus one call. Five tests assert the mechanism rather than the price, so they keep their meaning through that change.

**A placement costs nothing on the branch, and that is what "custody instead of the bond" means in one number.** `placementCost: 0` is what lets a commitment be made against a reserve nothing ever funds. The ERC20 and the reserve mapping stay, unused, because deleting them means editing shared contracts to remove something a cascade keeps bringing back. Visible consequence: the board is claimed rather than bought, and two e2e assertions count claims instead of stake.

**Acceptance, measured.** `check-shared-divergence.sh` with `EXT="ts svelte"` over `web/src`, `web/test` and `web/e2e`: **549 shared files, none drifted**, with the twelve web entries of the budget as `ALLOWED`. The run with `ALLOWED` empty names exactly those twelve and nothing else, which is what proves the other 537 are clean because they are identical rather than because the script matched nothing. **Zero `.svelte` difference**, which is `placement/stake.ts` earning its existence: the HUD and the play route are byte-identical here.

**The e2e is the load-bearing measurement**, because `verify` proves nothing about a browser: **51 of 51, no retries, 14.0 minutes at load 5.7**, and 51 of 51 on `main` in the same session. The same suite that clicks a real board, misses a reveal, runs out of gas and recovers a lost round passes against a game whose players are tokens.

Four things it turned up, all of them found by running rather than reading:

- **THE E2E FOUND TWO REGRESSIONS THAT `check` AND 1,485 UNIT TESTS COULD NOT.** The `uint256` identity broke a fixture that fills an ADDRESS into `addToReserve`'s first argument, and three suites then waited thirty seconds for a wallet that was never going to be asked - the exact failure that fixture's own comment says it exists to prevent. And `stake()` pressed the setup gate by its LABEL, which says what the game sells, so it timed out naming a button nobody had removed. Both fixed on `main`: the form is filled per the contract's real signature, and the two acquisition controls have testids. **A fixture that matches on COPY is coupled to the game's vocabulary, which is exactly what a descendant changes.**
- **`offshoot-fanout --verify` CANNOT PASS in a temporary worktree in this repo**, and it fails for a reason unrelated to whatever is being cascaded: `web/src/lib/deployments.ts` is generated and gitignored, `ensure-deployments.mjs` exports it from COMMITTED deployment records, and this repo commits none. Every node cascaded so far was merged with its branch checked out, where a local deploy had left the file behind. This is Phase 0's own finding recurring in a new place - a gate reporting success because it never ran the thing. The cascade into `with/pixi-js` was therefore verified BY HAND: check 0, unit 1483 in 125 files plus 71 in 11, contracts 19 passing, and e2e 51 of 51 with no retries.

  **The obvious fix is wrong, and measuring it is what showed that.** The finding note first recommended committing the deployment records, quoting `ensure-deployments.mjs`'s own reasoning. They are 1.3 MB across 12 files, of which the ABI is a quarter and the rest is bytecode, metadata and the inlined source of every dependency; they regenerate on every contract change and differ per branch. Committing them means a megabyte of churning generated JSON with a conflict on every feature branch forever - N1's own warning ignored in order to fix a gate. The note now carries five options with that measurement, of which two are worth building (commit the ~170 KB EXPORT as a snapshot; or synthesise a deployment from the compiled ABIs at install time), and it is deliberately left undecided rather than settled at the end of the session that found it.
- **The `/contracts` page opens on whichever contract sorts first**, so a sale called `AvatarSale` moved it off the Game and failed four inherited tests that never name a contract. reveal-or-die already has the fix (a `selectContract` fixture) and it was never backported - Decision 2's test answered "yes" by an existing second copy, and blocked by the same re-point as the asset pipeline. The branch renamed its sale to `GameAvatarSale` and the workaround is recorded as one.
- **The framework's own test suites are the only coverage the ADDRESS identity has on this branch**, which is the exemption in `identity-boundary.test.ts` paying off in the direction it was written for. Three application suites had to change their fixture; `test/lib/game/core/` did not.

**Phase 2's last two nodes: five mutations, three caught first time, and BOTH survivors were real.** That is seven phases running in which mutation found a gap a green suite was hiding, and the first time the survivors were not flaws in the tests so much as holes where no test existed.

- **Caught:** a `withdrawAvatar` that ignores an open commitment (2 contract tests fail), and an identity provider that trusts `getAvatarsOf` instead of filtering on custody (3 fail). Both prove the integration node inherited the identity axis's teeth.
- **SURVIVOR 1, and it is the finding above:** pointing `placement/render/index.ts` at `main`'s host - reverting the whole reason `with/pixi-js` exists - passes everything, including the checker written to catch exactly this.
- **SURVIVOR 2:** making `ensureManifest` write its placeholder only when there is NO art, which is the bug `vite.assetpack.ts`'s own doc comment describes at length as having been got wrong the first time and caught by hand. Nothing pinned it, because the file's six tests are all about the OTHER workaround. It is invisible in an ordinary run for a good reason: the manifest is on disk in any tree that has ever built, so the broken branch is only taken on a FRESH clone - the case no developer is in and CI is always in. Three tests now, each failing on its own mutation, landed on `with/pixi-js` so `with/all` and reveal-or-die inherit them.

That is the recorded rule firing again: **when a module justifies its existence by taking over a hazard, that hazard is the first thing its suite should assert about it.** It is the second time on the same branch.

**Eleven mutations, ten caught first time.** Six on the contracts (no custody check, a forfeit that keeps the avatar, a withdrawal that ignores an open commitment, a `_playerOf` that skips delegation, a delegable withdrawal, a sale that mints to the buyer instead of the game) and five on the client. **The survivor was a flaw in the test rather than in the code**, as it has been in most previous phases: the account-change test called `update()` itself, so it passed with the subscription deleted. That is six phases running in which mutation found a gap a green suite was hiding.

**Phase 3: the epoch becomes a policy. DONE, 2026-09-15.** Formalise bomber-world's `_epoch()` prototype: timed, manual, timed-with-early-advance, plus the waited-for count, and drop `SKIP_COMMIT` rather than carrying it. Advancing is its own permissionless conditional call (C5). On the client, `EpochInfo` gains the hybrid, whose value is READ from chain with the clock as a local predictor rather than computed. Do this before any mode is built on it: the pure-arithmetic epoch appears character for character in five contracts and every client, and retrofitting after three ports is the expensive version. Acceptance: the reference game runs under all three policies, and the order-independence replay test passes under each.

**Acceptance is met, and the replay test needed no new assertion - only a loop.** `contracts/test/js/Game.test.ts` replays the same two commitments in both orders under each policy and compares the contested cell AND the zone listing; the body is unchanged, the policy is a parameter, and all three agree. Under the two policies that can be pushed, the reveal phase is opened by `advanceRound` rather than by waiting, so the test also proves the advance is not a player's move: either order of reveals, after either route into the reveal phase, leaves the same board.

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 18 -> **36** on `main` and `with/pixi-js`; 20 -> **38** on `with/nft-identity` and `with/all` | **13, unchanged** (its contracts are its own) |
| `web:check` | 0 errors on all four branches | 0 errors, 0 warnings |
| `test:unit` server | 1477 -> **1496 in 126** on `main`; 1486 -> **1505 in 127** on `with/pixi-js`; 1485 -> **1504 in 127** on `with/nft-identity`; 1494 -> **1513 in 128** on `with/all` | 1674 -> **1693 in 138** |
| `test:unit` client | 71 in 11 on all four, unchanged | 65 in 10, unchanged |
| `test:e2e`, `CI=1` | **51 of 51 with no retries on all four**: `main` 6.8 min, `with/pixi-js` 6.7, `with/nft-identity` 6.9, `with/all` 7.2 | **50 of 50, no retries, 7.4 min** |
| `contracts lint` | 33 -> **34** on `main`/`with/pixi-js`, 46 -> **47** on the identity branches | 67, unchanged |
| `format:check` | green | web green; the same 7 contracts files |

**Every pre-change number was re-measured from scratch, on all five nodes, and every one was exactly what this document already said** - including the corrected contract counts (18 / 20 / 20 / 13). That is seven sessions running. The `+18` is IDENTICAL on every node including the descendant, which is the measurement that nothing was written twice: 11 for the hybrid tracker and its prediction, 3 for the no-gap property, 3 for the policy reader, 1 for the round telling a scheduler when the reveal is due. The contract suites move by +15 upstream and NOT AT ALL in reveal-or-die, which is decision 1 working as designed rather than an omission.

**`contracts lint` moving 33 -> 34 is the one number that is not an instance of the two rules nothing obeys.** It is `max-state-vars`: `UsingGameStore` now holds 16, because the epoch gained an anchor, a waited-for count, a per-player membership flag and a per-epoch tally. The available way to get back under the bar is to pack the persistent count into the same struct as the per-epoch tally, which would put two different lifetimes in one slot and make an innocent whole-struct assignment wipe the denominator. Recorded rather than done; it is a counter, and what it is counting is a real new axis.

### What the three policies are, and why the arithmetic is one formula

`_round()` replaces `_epoch()` as the virtual seam, and returns where the round is AND when the phase ends. Two overridable views of one fact would be two things to keep in step, and a client cannot draw a countdown without the second - which is the whole reason the old pair was not enough.

One anchored formula serves all three readings, because **they differ only in where the anchor is**. The anchor is the start of an epoch's commit phase: for `Timed` it never moves from (epoch 2, `START_TIME`), which is exactly the formula this repo and four other games have always used; for `TimedWithEarlyAdvance` an early epoch advance re-origins it at the moment of the advance and the clock carries on from there; `Manual` has no clock, so the stored state IS the answer.

**The early open is recorded as a FLAG and not as a re-anchoring, and that is C3 in one implementation detail.** Opening the reveal phase early leaves the epoch's deadline exactly where it was, so the window is widened at the front and a reveal scheduled against the nominal time still lands inside it. Re-anchoring instead would have shifted the deadline FORWARD by the amount brought forward, which loses precisely those reveals, silently, at the cost of the stake. Pinned: the mutation that re-anchors fails two tests, one of which reveals at the nominal time after an early open.

**Early advance out of the reveal phase DOES re-origin the grid, and it has to, or the feature buys nothing.** A 24-hour game where everyone acts in five minutes still takes 24 hours per round if the next epoch has to wait for the original grid. So the next epoch runs its full nominal length from the advance - which is a widening, not a shortening, because nobody was owed anything in the window that was cut short: it is only permitted once every commitment in the epoch has been opened.

### D10's no-gap property: all three policies preserve it, and it is pinned rather than argued

The hazard this phase created, and it was not in the plan as a warning. D10's "the too-late case needs NOTHING" rests on `epochDuration = commitPhaseDuration + revealPhaseDuration` with no trailing segment, so a commitment in the current epoch is always still openable. Nothing tested it, because it was true by construction - and "true by construction" is exactly what a new parameter quietly stops being.

- **`Timed`** preserves it by the original arithmetic, and that arithmetic is unchanged.
- **`Manual`** preserves it by construction of the advance: the only transitions are commit -> reveal within one epoch, and reveal -> the next epoch once everything committed has been opened. **The prototype did NOT preserve it**, and that is a defect rather than a missing feature: `_moveToNextEpoch` called in a commit phase landed in the next epoch's commit phase, stranding every commitment made in the one it left. See `work/notes/findings/the-manual-epoch-prototype-could-strand-a-commitment.md` - it is still live in reveal-or-die's and bomber-world's contracts, unreachable there for the same reason it was unreachable here.
- **`TimedWithEarlyAdvance`** preserves it because an early open never moves the deadline and an early epoch advance is refused while any commitment in the epoch is unopened. The refusal is read at EXECUTION time, which is what makes it airtight: a reveal still in the mempool has not been counted, so an advance mined before it reverts rather than stranding it.

Pinned in three places. A contract test per policy that commits and then opens the commitment by whatever route the policy allows; a client property test (`web/test/lib/game/core/epoch-no-gap.test.ts`) that sweeps the formula and asserts an epoch is only ever LEFT from its reveal phase, plus that the predicted phases tile time with no hole; and a constructor check that refuses a zero-length phase outright, since a zero reveal phase makes every commitment unopenable and a zero commit phase makes every commitment impossible, both silently.

That constructor check is also what finally kills the derivation `SKIP_COMMIT` came from: the policy is declared, and a configuration whose durations disagree with it is refused, so the two can never be inferred from each other again.

### C1's count, and where a game says who it waits for

`_waitedFor` is a count and not a roster, exactly as answer 2 to `play-modes.md` requires, with a per-player flag so a member cannot be counted twice. Two internals, `_startWaitingFor` and `_stopWaitingFor`, and **what makes someone a member is the GAME's answer**: on `main` it is a funded reserve (topping it up joins, emptying it leaves), and on `with/nft-identity` it is CUSTODY - an avatar deposited into the game is a player who can commit, so `_depositAvatar` starts, `_withdrawAvatar` stops, and so does `_forfeit`.

**That last one is the interesting line on the branch.** A seized avatar can never commit again, so leaving it in the denominator would mean that settling a missed reveal froze a game with no clock: punishing the player who froze it would be the thing that kept it frozen. C1's "members the epoch waits for rather than members who are alive" turns out to cut both ways - the count must shed a member the game has finished with, as well as keep one the game is still carrying.

Leaving costs nothing beyond the departure, which is D5 held to: `_stopWaitingFor` settles nothing, returns nothing and burns nothing, and on the branch the contract refuses a withdrawal while a commitment is open, so it can never become a costless exit.

### On the client: the chain is the answer, the clock is a floor

`EpochInfo` gains `hybrid`, carrying the same timings as `timed` so that everything which draws a countdown works unchanged - an early advance changes when a phase runs, never what a phase is. The tracker polls `getRound`, predicts forward from the last reading with the chain clock, and publishes **whichever is further on**.

**The direction is the whole design and it is provable rather than a convention: the prediction can only ever be behind.** The one thing arithmetic cannot model is a phase opening EARLY, which takes a transaction, so the chain is never behind a stale prediction. The same ordering also guards against a lagging RPC node answering for an old block, which is why the last known round is kept as a floor rather than replaced.

Two smaller decisions that cost nothing and would have cost a stake:

- **`revealDueAt` is read off the round, not recomputed from the deployment.** They agree on a purely timed chain, which is why nothing noticed for a while; under a policy that re-origins the grid the recomputed answer is for a schedule the chain has left behind, and a scheduled reveal is the one thing that cannot be re-asked later.
- **A deployment that declares no policy is read the way it actually RAN**, which is not the same as assuming `timed`: before the policy existed there was one rule, and it read manual off both durations being zero. Reproducing it is what keeps reveal-or-die playable across the cascade, where the contracts are its own and declare nothing. An UNKNOWN policy value is refused with a sentence naming it, because a client newer than it thinks it is would otherwise pick a clock the chain is not running.

### What the cascade cost, and the hazard that fired three more times

`main -> {with/pixi-js, with/nft-identity} -> with/all -> reveal-or-die`, by hand (`--verify` still cannot run in a temporary worktree here, and every node was merged with its branch checked out so a local deploy could supply `deployments.ts`).

| merge | conflicts | where |
|---|---|---|
| `main -> with/pixi-js` | **0** | 23 files, clean |
| `main -> with/nft-identity` | **3** | the deploy script's `placementCost`, and the two test files that name the way in |
| `with/pixi-js -> with/all` | **3** | the same three, resolved by taking the identity branch's, which IS the union for them |
| `with/nft-identity -> with/all` | **0** | one file, the custody hook |
| `with/all -> reveal-or-die` | **15** | 13 in `contracts/`, which are not inherited and resolve one way; its composition root; one file arriving in a directory it renamed |

**Not one conflict was in application source that both sides develop.** Every one was a file whose job is to say what THIS game is, which is the shape Decision 3's N1 budget asks for.

**And three hunks that merged CLEANLY were wrong in the descendant, which is the fifth, sixth and seventh instance of this tree's recurring hazard.** Two were the known shape - an inherited contract test reading helpers the descendant does not have, and the identity branch's avatar contract arriving against reveal-or-die's own. The third is new and worse: **reveal-or-die's composition root inherited the policy DISPATCHER, six lines that read `getRound` off a contract which does not have it.** It compiled, `check` was green, 1,692 unit tests passed, and the e2e suite would have passed too, because under the timed policy the reader is never called. The failure was latent until somebody changed a deploy parameter. Written up in `work/notes/observations/the-epoch-policy-cannot-reach-a-game-until-its-contracts-do.md`, with the general form: **a framework feature that reads a new function off the game contract has a seam that is inherited and a surface that is not.**

One upstream change was made purely so the descendant would inherit something true: the epoch-policy suite and the replay test no longer name what is at stake. `deployGameWith` takes the fixture bag and picks up what the game is made of itself, `TURN_BOND` is what a turn bonds here, and `leaveGame` is whatever leaving means - all three behind `utils`, the file that already exists in order to differ. The one test that really is about this game's way in (topping a reserve up twice is still one member) moved to `Game.test.ts` rather than becoming an eighteenth entry on a branch's divergence list. **On the branch that test asserts the opposite number**, and correctly: an owner who buys two avatars really is two of the things the epoch waits for.

**`check-shared-divergence.sh`, per branch, each with its own `ALLOWED` list plus the empty run.** `main` vs `with/pixi-js`: 535 shared files, none drifted, and the empty run names exactly the 1. `main` vs `with/nft-identity`: 553, none drifted, empty run names exactly the 12. `with/all` three ways: 553 against `main` with the union, 560 against `with/pixi-js` with the identity list, 554 against `with/nft-identity` with the renderer list, all green; the empty run against `main` names exactly the 13 and nothing else. **Phase 3 added no shared-file divergence at all** - the new round reader is byte-identical on every branch, because reading where the round is does not depend on who the players are.

### Mutation: sixteen mutations, twelve caught first time, and all four survivors were real holes

That is eight phases running in which mutation found a gap a green suite was hiding, and the second running in which the survivors were holes rather than flaws in the tests.

- **Caught on the contracts (11 of 12):** advancing out of a commit phase to the next epoch (6 tests fail, including the replay), unanimity becoming a majority, leaving an epoch with an unrevealed commitment, an early open that shifts the deadline, a replaced commitment counted twice, advancing as a rider on the last reveal (3 fail), no denominator check, a departure that does not stop the epoch waiting, a cancelled commitment still counting, the early-open flag ignored (4 fail), and a timed game that can be pushed.
- **SURVIVOR 1, and it is the most expensive of the four:** making `_startWaitingFor` non-idempotent passes everything. Topping up a reserve twice would then count one member as two, which raises the denominator above the number of people who can ever answer it - so unanimity becomes unreachable, a game with no clock stops advancing for good, and the revert names a member who does not exist. Pinned now, in `Game.test.ts`, where the reserve is the subject.
- **SURVIVOR 2:** deleting the hybrid tracker's clock unsubscribe. The exact shape of the finding from Phase 2 (`a-subscription-with-no-side-effect-is-invisible-to-its-own-suite`), in a module written the same week that note was in front of me: the test asserted that no further READS happened, which is not the same question as whether anything is still listening. It counts the store's subscribers now.
- **SURVIVOR 3:** recomputing `revealDueAt` from the deployment instead of reading it off the round. Nothing asserted what the adapter is handed at commit time, and the two expressions agree on a timed chain.
- **SURVIVOR 4:** a dispatcher that always builds the timed tracker whatever the policy says. It would leave a manual or hybrid deployment drawn from pure arithmetic, with no error anywhere.
- **One mutation is recorded as deliberately unpinned:** `_stopWaitingFor`'s idempotence guard is unreachable from outside today (`withdrawFromReserve` refuses a zero amount and an empty reserve), so removing it passes the suite. The reason is a comment at the guard rather than a test that would have to reach through a route that does not exist - and the guard is there for the second caller Phase 6 will add, where without it a subset could satisfy "unanimity".

**The mutation numbers were wrong the first time, in the direction that flatters, and the cause is its own finding.** Two runs reported seven failures where the honest answers were one and three, because the new suite was flaky: the chain's clock is wall-clock, the localhost reveal phase is a quarter of the cycle, and a suite whose first act is a commitment fails outright one run in four. Six clean consecutive runs is what established the fix. **A mutation report is only as trustworthy as the determinism of the suite it is measured against**, and a suite that has just been written is exactly the one whose determinism nobody has established. See `work/notes/findings/a-contracts-suite-that-does-not-pin-the-phase-flakes.md`.

### A COLD REVIEW FOUND THREE HOLES IN THIS PHASE AFTER IT HAD LANDED GREEN

**Phase 3 shipped, on five nodes, with 51 of 51 e2e and sixteen mutations, and it
contained a denial-of-service and two routes to a lost stake.** A subagent review
with no memory of building it found all three; every one was verified against the
tree before being acted on. See `work/notes/findings/unanimity-counted-two-different-sets.md`.

- **Unanimity compared two different sets.** `_makeCommitment` never asked
  whether the committer was a member, and a zero bond against a zero reserve
  passes every other check, so any address could inflate the count the advance is
  measured against. Enough throwaway addresses close the commit phase before a
  real player acts, every block, for gas; on a manual game they simply never
  reveal and freeze the cycle for good, locking every committed bond.
- **A member could leave with a turn still open**, because `locked` is the BOND
  and an empty turn bonds zero. The denominator shrinks, the numerator does not,
  and a subset satisfies unanimity. An idle player's automatic commit is exactly
  an empty turn, so this was ordinary play rather than an attack.
- **Auto-commit and the fallback reveal were off on the new policy.** Both gated
  on `type === 'timed'` where the question is whether there is a clock;
  TypeScript narrows that happily when a third member joins the union.

Fixed as `NotInGame`, `CommitmentStillOpen` and `!== 'manual'`, with four
mutations and three new contract tests plus one client test.

**The reason mutation missed all of it is worth carrying**, because this document
has praised mutation for eight phases: a mutation perturbs code that EXISTS, and
these were missing checks with no line to mutate. **Mutation tests the code you
wrote; review tests the code you did not.** The suites' own blind spot was the
same shape: every committer in them was a member by construction, so the two
counts were never given a chance to disagree.

**And two of the three are invisible on a timed deployment**, which is every
deployment in this tree. The policies they break are the two this phase exists to
add, so they would have shipped as features and been found by the first game to
use one.

### Neither open item was taken, and the e2e numbers on this machine are not comparable

**The e2e type-check at `template-svelte` and `verify` option 6 are both still open.** Phase 3 touched four branches and a descendant and spent its budget on the axis; taking a change at the root of the tree in the same session would have put a ten-node cascade and a five-node one in the same measurement.

**Every e2e run in this phase took 6.7 to 7.4 minutes against a recorded baseline of 14 to 18**, on a 32-core host at a load average under 2. That is the machine, not the suite: the plan's advice that "run time against the baseline is the cheapest load signal available" still holds, but **the baseline is per machine**, and comparing this session's 7 minutes against the previous host's 16 would read as a spectacular improvement rather than as a different computer. Five runs, no retries in any of them (`main`, all three branches, and reveal-or-die), which is the largest clean sweep this document has recorded and says as much about the host as about the change.

### Between the phases: a turn may be bigger than a transaction. DONE, 2026-09-17

**Not a phase and not on the list, which is worth saying because that is what its shape argues for.** It came out of a finding rather than the plan: `MAX_NUM_PLACEMENTS_PER_HASH = 32` sat in `UsingGameStore` referenced by nothing, and it was never a cap - it was the marker of a chunked reveal this template had not built. `Config.actionsPerReveal` replaces it, `reveal` takes `bytes24 furtherActions`, and a commitment is now the head of a hash chain. The task, with the full record and the counts, is `work/tasks/done/a-turn-bigger-than-a-transaction.md`; the decision that most needed writing down is ADR-0002.

**It changes one of this document's own claims and the change is a correction rather than an addition.** A credit was "one turn"; a turn is no longer a transaction, so a credit is one commit plus one reveal STEP and a long turn honestly costs more than a short one. `creditsGasMultiplier` was re-measured for that, and the re-measurement is the part worth carrying: **it differs per BRANCH, and the file it lives in does not.** `main` measures 116,898 for a first commit and 535,561 for a full fresh chunk; `with/nft-identity` measures 99,102 and 374,085 for the same two transactions, because a placement costs nothing there so a reveal writes no stake. Merging `main`'s figure in unchanged would have priced a credit 58% above what a step there costs, cleanly, in a file whose text does not differ at all. That is the third recorded instance of "a value merged cleanly and its reasoning did not", and the first one where the value was caught by measuring on the branch rather than by noticing afterwards.

**Three things about it were stated too narrowly and are corrected in place, all three by the same question: is this a property of the MECHANISM or of THIS GAME?** Worth reading as a set, because the answer was "this game" every time.

- **A half-revealed turn settles in one call because this game's bond is exactly what it will spend.** A settlement needs the chunks whenever it cannot otherwise tell what to KEEP from what to RETURN, and there are two ways into that: a penalty computed from the actions, and a bond deliberately larger than the turn's cost. The second is a HIDING requirement - the bond is public, so `bond / placementCost` discloses the action count before anyone reveals - and it is the more general of the two. **This game's client bonds exactly, so it leaks the length of its turns.** Closing that leak moves it into the case the simple settlement cannot handle, so both halves move together or neither does. ADR-0002 and its finding carry it.
- **`REVEAL_GAS` bounds a TRANSACTION and nothing bounds a TURN** wherever an action costs nothing. So the stipend and the credit count cannot be sized from a maximum and must be sized from an explicit EXPECTATION of actions per turn. The stipend counts STEPS today, which is honest and does not answer "how many turns can I play"; pricing a credit per action is exact and gives up the 1:1 that credits exist for.
- **A reveal phase sized for `k` sequential sends is sized against the CLIENT.** Nonces are strictly sequential per account, so a turn's chunks could go out in one burst and still execute in order. On the identity branches that is the only thing that could ever make an unbounded turn openable, because it turns `k` round trips into block space, which is a bound that exists.

**What all three have in common is worth more than any of them.** Each was a sentence that was true of the reference game and read as a statement about the framework, and none of them would have been caught by a test: the code was correct in every case and only the claim was too wide. That is the same failure mode as a value merging cleanly while its reasoning does not, one level up - in the DOCUMENTATION of a mechanism rather than in a branch of it.

**What it does NOT do is cap a turn, and the reason is a decision this plan should hold on to.** A per-identity cap only binds where identity is SCARCE: where an identity costs nothing, a player who wants more than the cap makes another account, so the cap inconveniences the honest and taxes whoever does not think of it. So the framework takes the chunk, which is a mechanism every game needs, and takes no position on the cap, which is a game rule some games cannot have. The three ways to bound a turn - the action costing something, the identity being scarce, or nothing - are a property of a game rather than a choice, and the third row is reachable by accident: **`with/nft-identity` is in it.** A placement costs nothing there and the identity is scarce, so the chunk is now the only bound on a REVEAL, and the TURN is still unbounded - which means the number of reveals it takes is unbounded and a long enough turn cannot fit in any reveal window. Nothing enforces that yet. It is recorded at that branch's deploy config and it is the next thing somebody should want.

### After it: the window was the bound, and the gas budget was in the wrong repo. DONE, 2026-09-18

**The chunked reveal left a ceiling nobody had measured, and it was twelve
actions.** At the shipped local config a client revealing one chunk at a time
landed THREE chunks before the reveal phase shut, not the two this document
inferred from the e2e suite and not more. A sixteen-action turn committed, got
three quarters of the way through revealing, and forfeited the stake - seven
avatars, in the measuring harness that found it. `with/nft-identity` is where it
bites, because a placement costs nothing there so nothing bounded a plan at all.

**The binding term was the CLIENT's poll interval, not the send pattern**, which
is the part worth carrying. The cost of one sequential chunk is
`max(block time, poll interval)`, and the app built its `publicClient` on viem's
4,000ms default against a 1s chain. Sizing the poll from the reveal phase takes
the ceiling from three chunks to nine and costs nothing. The burst this document
pointed at would take it to 104+, and it is now measured rather than argued
(104 chunks, 416 actions, one block, 29.9M gas) - but it is DEFERRED, because it
cannot be built without passing a gas limit, and estimating any chunk after the
first is an estimate of a reverting call. **So the burst depends on the credits
work rather than preceding it**, which is the reverse of the order this document
had.

**And the gas figures were in the wrong repo, which is ADR-0003.** `COMMIT_GAS`
and `REVEAL_GAS` were constants in `web/src/lib/placement/config.ts`, a file
INHERITED by every repo here, measured against `contracts/src`, which no repo
inherits. This document already recorded the symptom - `with/nft-identity`
measuring 30% lower in a file whose text does not differ - and treated it as a
value to re-measure per branch. It was a value in the wrong place. The deploy
declares them now, `linkedData` carries them, the client reads them, and
`GasBudget.test.ts` fails when the contracts outgrow what the deployment claims.
That is half of what the credits work needs; the other half, an explicit
EXPECTATION of actions per turn, is still open and still the reason a limit
cannot be imposed yet.

**One claim of this document's was too wide and is corrected in place.** "A
reveal phase sized for `k` sequential sends is sized against the CLIENT" is
right, and the sentence under it treated the burst as the remedy. The remedy was
one argument to `waitForTransactionReceipt`. The general shape is the same one
this section already names: the thing that looked like a property of the
mechanism was a property of one client's configuration.

**And the credits half that everything was blocked on is done, 2026-09-18.**
`expectedActionsPerTurn` is declared by the deploy, and the stipend counts TURNS
again rather than transactions. It is the parameter this document said was
needed and did not name: `revealGas` bounds a transaction, nothing bounds a
turn, so a count of turns has to be sized from a number the game states rather
than from a maximum that does not exist. It is `4` on `main`, where a turn is
bounded economically at ten placements for a whole stake, and `12` on the
identity branches, where a placement is free and there was nothing to size a
stipend from at all - which is the first parameter in this tree whose VALUE is
argued differently per branch and whose reasoning was caught merging cleanly and
falsely into the branch it mattered on.

**It is deliberately not how credits are priced**, and that is the line to keep:
a credit count is shown to the player as what they can still do, so it must be a
FLOOR, and an expectation is not one. Credits stay denominated in what a
TRANSACTION costs, which is a real bound. Only the stipend - a starting float
with the top-up flow as its remedy - is sized from what a turn is expected to
cost.

**What remains of the credits work is the flip to gas LIMITS, and it is now one
question rather than three.** The per-deployment figures exist (ADR-0003) and a
test fails when the contracts outgrow them. What is not established is that the
declared figure has enough headroom to be a CEILING rather than a reservation:
`main` declares 600,000 against a measured 535,525, which is 12%, and the test
only checks the figure is not exceeded. It also measures on the LOCAL chain
while the `default` deploy data is what a real chain would use. Both are small
and neither is done.

**Phase 4: worlds. FIRST HALF DONE 2026-09-18; the MECHANISM IS BUILT 2026-09-19; THE STRUCTURE IS DONE 2026-09-20 (`integration`, the re-point, the cascade, and jolly-roger's divergence ritual); ACCEPTANCE CLAUSE ONE IS MET 2026-09-22; CLAUSE TWO - the chrome - IS MET 2026-09-25, so PHASE 4 IS DONE.** The reference game plays a full round against a chain in the tab, on all four template nodes, gated by an e2e test: `advanceCycle` has a caller, the world is `lib/offline.ts`, and the round costs 137-166ms in a browser. The structural piece was the last one about the TREE; the rest was about the GAME. See "The split, and what it leaves" for what the re-point cost, which was one conflict and five clean merges that were wrong. `createContext` takes its connection as a parameter in jolly-roger (small, already designed), then an embedded world in the reference game. Acceptance: the reference game plays a full round against a chain in the tab, and the chrome names the world it is describing rather than the one it assumed.

**What exists: `with/embedded-chain` in jolly-roger, at `cb3cc0d`, unpushed, with jolly-roger `main` one commit ahead of origin too (`6b73d7f`).** `web/src/lib/embedded/` boots a webevm node on a minted chain id, runs the app's own rocketh deploy scripts on it through `@rocketh/web`, provisions through a game-supplied hook, and returns a `ConnectionFactory` describing that world. `web/test/lib/embedded/world.test.ts` builds a real chain, runs the real deploy and constructs a real `createContext({establishConnection})` on it, in node - so the parameter has a second caller and the test that pinned it is no longer alone. Suites on the branch: check 0/0, unit 942 in 82 server (+18 in 4 over `main`) and 39 in 7 client (unchanged), format clean, divergence 40 shared files with one allowed difference.

**One of those tests was wrong in a way worth recording, and it was found by running the app rather than by any gate.** It asserted that the in-tab contract address DIFFERS from the one in the generated `$lib/deployments`. The deploy is deterministic, so an embedded world lands its contracts at exactly the addresses a fresh LOCAL deploy does; the assertion passed only because a clean clone's generated file is the install-time SEPOLIA fallback, and it failed the moment somebody ran `pnpm start`, which deploys locally and re-exports. **A test that passes on a clean clone and fails on a machine where the stack has been run is the mirror image of the hazard this document already records in the other direction** (a stale generated file failing `check` as one plausible error). What makes the records a world's own is that the code is there, on that chain, which is what the test says now.

**And the route exists too, which the first version of this entry said it would not.** `/offline-demo` boots the world and renders jolly-roger's EXISTING greetings demo inside a nested `<Context>`, importing the component rather than copying it - that the same page works against two worlds without knowing it is the whole claim a world makes. Measured in a headless chromium against the production build: **264ms** from page load to a booted world, and **5.7s** from page load to a MINED transaction including the wallet picker. So a full round against a chain in the tab is DONE for jolly-roger's own demo game; acceptance clause one is about the REFERENCE game, which is in another repo that does not inherit this branch yet.

**What does NOT exist: the chrome, `integration`, the re-point, and the reference game's own offline option.** See "The split, and what it leaves" below.

**AND THE THIRD ONE IS A BUG THAT WAS FOUND BY PLAYING, NOT BY ANY GATE, AND IT IS THE MOST INSTRUCTIVE THING IN THIS PHASE.** Reported from a browser: three greetings sent, the newest shown pending, none ever completing. The transactions were fine - block mined, receipt `0x1`, message written, block resolvable by hash - and the row kept spinning. The cause is an APP-WIDE SINGLETON INSIDE A PER-WORLD CONTEXT: the transaction observer only runs while its `TabLeaderService` says this tab leads, and that election used one `BroadcastChannel` and one `localStorage` lock PER ORIGIN. Two contexts in one tab therefore competed; the layout's took the lock on mount, the world's backed off, and the world's observer never processed a single tick (`processCount: 0`, `isLeader: false`). **Nothing anywhere reported it, because from every other angle the transaction had succeeded.** The election is namespaced by CHAIN now, which is what it was always about - which tab polls for THIS chain's transactions - and an app with one context is unaffected by construction. Measured before and after, three sends each: before, all three stay pending past a 30s timeout; after, 31.4s (including the pickers), 0.6s, 1.1s.

**The general form is worth more than the fix, and it is the same shape as the chrome.** `createContext` was made per-world; the things it BUILDS were not all per-world, and the one that matters is invisible because it is a singleton by design. The chrome lies about which world it describes and you can see that; a leader election silently elects between worlds and you cannot. Anything else in `core/` that coordinates ACROSS TABS or across the origin is a candidate for the same bug, and the test is not "does it work with two contexts" but "does it have exactly one of something that should have one per chain".

**One correction, made by experiment before it shipped.** The first fix attempt blamed `finality: 1`: under automine the newest transaction is always in the latest block, so a confirmation above it never arrives. Plausible, written into a comment, and falsified by the experiment - with the leader fixed, three sends confirm under `finality: 1` too, because the spinner is about INCLUSION. What is measurably true is smaller: a nonzero finality leaves the operation in the ledger forever as `final: false` instead of completing, so `finality: 0` stays, for that reason and because a chain in one tab has no competing producer to reorg it. That is twice in one session that a number was explained before it was measured; the other was the 24-gas one above.

**Three answers the owner asked for, and the last two are one decision.** The player is never ASKED which wallet to use: the world hands its connection a connector announcing one wallet holding one account, which is the honest shape rather than a suppressed dialog, since every other wallet the player owns has no account on this chain. The chain and its deployment records are PERSISTED by default, namespaced per world, so a reload restores the chain and skips the deploy. And "should pending transactions be saved" turns out not to be a separate question: the operations ledger always persisted, keyed by chain id, and what it lacked was a chain to still be about - not persisting the chain would leave the app holding transactions on a chain that no longer exists.

**That makes THREE persistences, and the finding's hazard is now a live one with a guard.** `work/notes/findings/an-embedded-world-has-two-persistences...` named two; the deployment records are the third, and they are the dangerous one. Records that outlive their chain make rocketh SKIP a deploy it believes it has done, and the script then reads a contract that is not there - measured, by wiping the chain's IndexedDB: the boot does not limp, it THROWS while decoding `0x`. So the check runs BEFORE anything is deployed, because one placed afterwards never runs, and on a mismatch the world mints a NEW chain id rather than repairing the old one: everything the player kept is keyed by that id, so minting orphans the dead records instead of mixing them into a live world. That is the chainId-per-world decision paying for itself in a way nobody predicted - it was taken to separate two worlds, and it turns out to be what makes a FAILED restore safe.

**THE SAME-HOST CHANGE IS CASCADED AND EVERYTHING IS PUSHED, 2026-09-19.** Ten refs across three repos, in dependency order: jolly-roger `main` -> `with/local-signer` -> `with/hosted-account`, plus `website` and `with/embedded-chain`; then template-commit-reveal `main` (from the stem) -> `with/pixi-js` and `with/nft-identity` -> `with/all` (identity axis first); then reveal-or-die. Every node: check 0/0 and its unit suites green, each rising by exactly the ten same-host tests (tcr `main` 1555 -> 1565, `with/pixi-js` 1564 -> 1574, `with/nft-identity` 1563 -> 1573, `with/all` 1572 -> 1582, reveal-or-die 1713 -> 1723; jolly-roger `main` 924 -> 934, local-signer and hosted 1193 -> 1203). Client suites unchanged everywhere. Divergence re-run with `ALLOWED=` empty over `web/src web/test web/e2e`: **1 file for `with/pixi-js`, 13 for `with/nft-identity`, 14 for `with/all`**, which is exactly what this document already predicted.

**Two things the cascade turned up, both of the recorded shapes.** In `with/local-signer` a hunk MERGED CLEANLY AND WAS WRONG: `createPaymentRail` kept passing the raw `PUBLIC_NODE_URL`, because the rail was added after main's change so nothing conflicted - a payment rail that reaches for `localhost` from a phone, and only when the user tries to pay. And tcr `main` failed `check` with ONE error naming `setGreeting`, which is the stale-generated-deployments signature this document describes: regenerating fixed it with no source change.

**e2e IS GREEN ON ALL FIVE NODES, run after the cascade** (the first write-up of this entry said it had not been run, which was true for an hour): `main` 52 in 8.5m, `with/pixi-js` 52 in 8.3m, `with/nft-identity` 52 in 8.3m, `with/all` 52 in 8.2m, reveal-or-die 50 in 7.5m. Every count matches the recorded baseline exactly.

**And reveal-or-die reproduced its documented flake, to the test and to the minute.** The first run was 49 passed plus one flaky `board.e2e.ts` at **9.6 minutes**, with load climbing past 6; re-run in isolation two minutes later on the identical tree it was 50 of 50 at **7.5 minutes**. That is the same test, the same file, the same duration and the same load signature this document recorded on 2026-09-18. It is now the second independent observation of one flake, which makes the note's instruction - re-run before concluding either way - worth more than the note's own measurement.

**AND ONE THING LANDED ON `main` RATHER THAN HERE, which is worth recording because the placement was the decision.** A service url can now say `//:8545`, meaning "the host this page came from, port 8545", resolved in the browser: a dev stack names its services absolutely, which is right from the machine and wrong from a phone on the LAN, where `localhost` is the phone. It has nothing to do with embedded chains, so its home is jolly-roger `main` and the branch merged it down. Measured with one build served two ways: at `127.0.0.1:4600` the page asks `127.0.0.1:8545`, at `192.168.1.122:4600` it asks `192.168.1.122:8545`. The notation is an empty authority on purpose - `new URL('http://:8545')` throws, so an unresolved value fails loudly instead of resolving DNS and looking like a service being down - and the scheme-less form follows the page's scheme, which is what stops an https tunnel reaching for an http service.

**A wallet that cannot ask a question needs no UI to ask it in, which is the third thing playing it taught.** Modals were flashing past on every send - "Waiting for Wallet Connection", "Please Accept Connection Request", "Getting your transaction ready" - all true sentences about a situation that does not exist: the world's wallet holds one account, signs without asking, and was generated by the app. The route no longer mounts a connection flow at all, and nothing else changes. The pair of states is the rule worth keeping: **a nested world using the PLAYER's wallet needs its own flow, and one that brings its own must not have it.** The app's own "check your wallet" surfaces are told separately, through a `walletPrompts` member on `EstablishedConnection` feeding `guardDispatch`'s existing `prompts` option - the mechanism a local signer already used, said by the side that knows which wallet it is.

**A fourth bug from playing, and it is the same shape as the leader election: one slot, two writers.** After playing offline, a reload had the main shell auto-connecting, an address in the navbar and a "switch network" modal for a chain that exists only in that tab. Every connection persists "the wallet I last used" and "the account I was", and the world's connection had no prefix, so the app's own connection came back AS the world's generated wallet. The sharp part is that the option existed: `storagePrefix` had been added two commits earlier with this exact reasoning written at the type, quoting the payment rail that already needed it, and the world simply did not pass it. **A seam that is documented and unused is not a seam yet**, and nothing in a type checker or a test suite says so.

**THE THREE DEBTS WERE PAID UPSTREAM AND THE ADAPTERS ARE GONE, 2026-09-19.** `@etherkit/burner-wallet` 0.1.0 takes a provider as its `nodeURL` and an `accountCount`; `@etherplay/connect` 0.14.0 takes `wallets` directly; `@etherplay/wallet-connector` 0.2.0 carries `WalletInfo.autoApproves`. `lib/embedded/wallet.ts` holds no wrappers at all now, and THE SHARED FILE GOT SMALLER rather than larger: `walletConnector` used to be the discriminant between two overloads, which had forced a hand-written branch here, and 0.14.0 made these optional on every overload. That was reported as a CAUTION rather than requested, and taking it deleted more code than the feature added. **The lesson is worth more than the diff: three adapters that looked like design were types that had not caught up with their own implementations, in libraries this project owns, and writing them into a README as debts is what got them fixed.** The declaration is the valuable one - a wallet can now say it answers by itself, and connect acts on it by not announcing a pending request, which removes the transaction modal outright. What remains is the connect STEP, which is a flow rendering a state rather than a request.

**And the adapters in `lib/embedded` were recorded as debts rather than left to look like design.** Three wrappers exist only because a TYPE has not caught up with its own implementation, in three libraries this project owns: `initBurnerWallet` types `nodeURL` as a string while `createCurriedJSONRPC` underneath takes a provider too; the burner derives ten accounts with no way to ask for one; and `createConnection` can only DISCOVER wallets over EIP-6963, so supplying one needs a connector subclass. Each is a one-line upstream change that deletes a wrapper here. The fourth item is not a wrapper and is the interesting one: **a wallet should be able to declare that it never prompts**, next to its name and icon, so that neither the library's request announcements nor an app's copy has to infer it once per consumer.

**Building the route found two more seams that a second world makes visible and nothing else can.** Both are one line with a long reason, and both are the kind that fail silently. A nested world needs its OWN `ConnectionFlow`: `AcrossPages` mounts one in the LAYOUT, bound to the app context, so the world's `ensureConnected()` waits on a wallet picker nobody renders - the symptom is a Send button that does nothing and logs nothing. And the world's connection needs its own `storagePrefix`, or it shares "the wallet I last used" with the app's connection and the app reconnects the player as their offline burner on the next load; that is the payment rail's recorded reason arriving one world further along, and it is the second time this exact hazard has been paid for.

### The connection is a parameter now, and splitting the phase was the decision

**It landed upstream, on jolly-roger `main`, and cascaded to nine nodes**: jolly-roger's `with/local-signer`, `with/hosted-account` and `website`, then this repo's four, then reveal-or-die. `createContext({establishConnection})` defaults to `establishRemoteConnection`, so every existing caller is untouched, and `EstablishedConnection` needed no widening: it already carries `chainInfo`, both clients, `account`, `signer` and - the member that makes this a WORLD rather than an endpoint swap - `deployments`. A second chain has its own contracts at its own addresses, so a factory handing back this app's records for somebody else's chain would be lying about both.

**The request is passed TO the factory rather than replaced by it**, which is the one design point worth keeping. A world chooses the chain; it never chooses how the app authenticates, so `TARGET_STEP` stays the single line that decides whether a signer exists, on every world an app can offer. The alternative - a factory that returns a connection built however it likes - would have let a world quietly be wallet-only, which is an authentication mode, silently, per world.

**Splitting the phase was a judgement and it cost something, so here is the argument.** The second half is not small: an embedded world needs a chain in the tab, the contracts deployed onto it, a key to sign with, a world selection, and chrome that names what it is showing. Doing a third of that alongside a nine-node cascade would have been worse than doing the prerequisite cleanly. What it costs is that the parameter has no PRODUCTION caller yet, which is exactly the objection the worlds doc raised against doing it at all ("a parameter that exists for nobody"). **ANSWERED 2026-09-19**: `with/embedded-chain` is that caller, and its own test builds a real chain, runs a real deploy and constructs a context on both.

**That objection is answered rather than ignored, and the answer is the part worth reusing.** Making the connection a parameter is the easy half; the half that matters is that nothing inside `core.ts` reaches for `establishRemoteConnection` behind the parameter's back, and with one world that half is invisible to every other test, because both paths produce the same context. So the caller is `web/test/lib/context/world-connection.test.ts`, which asserts the factory is called exactly once, that it is handed this app's own authentication config, and that four world-scoped members of the context are the ones it RETURNED, by identity. Verified by mutation: restoring the direct call fails two of its three tests while everything else stays green. A test is a weaker consumer than a world and it is not nothing; the entry above should be read as "a seam with a test on it, awaiting its second implementation", not as "done".

### `embedded-eth-node` is called `webevm` now, and the old name's last release has a bug that matters HERE

HANDOFF decision 7 and the worlds doc both name `embedded-eth-node`, which stopped at **0.4.0**. The package is **`webevm`**, at 0.5.0, same author, same description. That is not merely a rename to note in passing:

- **0.4.0 answered `eth_estimateGas` with gas CONSUMED rather than a usable limit**, which silently reverts an inner `CREATE2`. Found by `@rocketh/playground`, whose `src/core/chain.ts` says so at the line that pins the version. This tree passes real gas LIMITS since ADR-0003 and its deploy uses a deterministic proxy, so an embedded world built on the name in these documents would have hit it.
- **It is execution-only: no `eth_accounts`, no `eth_sendTransaction`, no `eth_sign`, answered with a real `-32601`.** A world therefore needs a key of its own. This repo already has the mechanism and it was built for something else: `@etherkit/burner-wallet` announces over EIP-6963 and the e2e suite plays through it, so "an offline world needs its own in-memory wallet" is configuration here rather than invention.
- **`@rocketh/web` exists and runs real deploy scripts in the browser** against a provider, with an IndexedDB or VFS deployment store. This repo's `contracts/package.json` already exports `./deploy/*` and `./artifacts/*` from `dist`, so the deploy half of an embedded world is plumbing rather than a new build. That was not obvious and it is the main reason to think the second half is a session's work rather than a project.
- **`createConnection` still takes a provider instead of a URL**, so that verified fact survives; only its spelling has moved. The worlds doc says `endpoint: string | UnderlyingEthereumProvider`, and `@etherplay/connect` 0.13 says `ChainInfo<P>` is `{rpcUrls}` OR `{provider: P}`. Check the type, not the doc.

### ~~What the embedded world has to answer before it is built, and it is about the CLOCK~~ THE BLOCK TIME IS A NON-QUESTION, AND THE PARAGRAPH THAT SAID OTHERWISE LASTED AN HOUR

**What this said, written 2026-09-18 and wrong the same day:** that `reveal-window.ts` sizes an openable turn from `averageBlockTime`, that an instant-mining world therefore computes a vacuous bound which "says every turn fits", and that an embedded world must declare a block time rather than inherit the miner's. Every clause of that is a statement about a TIMED world, and an embedded world is not one. **It is kept rather than deleted because it is the fourth instance of this document's own recurring mistake, committed by somebody who had just finished writing up the other three.**

**An embedded world does not run on time, and that is what it is FOR.** It serves single-player and hotseat, where the human decides when a turn ends, so it runs the MANUAL cycle policy. Under manual both phase durations are zero - by construction, since the contract refuses a configuration whose durations disagree with its declared policy - and `chunksOpenableInRevealPhase` returns `undefined` on `revealPhaseDuration <= 0` and **never reads `averageBlockTime` at all**. The file already says so, in capitals, and Phase 3 put it there: "A REVEAL PHASE OF ZERO IS NOT A ZERO-LENGTH WINDOW, IT IS NO CLOCK AT ALL". So the turn is unbounded, the block time is not consulted, and `miningConfig: {type: 'auto'}` survives untouched. **A mining interval would be waste with no buyer**, and adding one "for safety" would be spending the player's CPU to feed a number nothing reads.

**The vacuous/pessimistic reading was backwards too**, which is worth recording because it is the part that was a guess rather than a misreading. `averageBlockTime` is MEASURED, from block timestamps over a 64-block window (`chain-time.ts`), and in an automine world blocks exist only where transactions happened - so the window spans the human's thinking time. A player who deliberates for two minutes yields a block time of minutes, not milliseconds. Had the bound been consulted it would have been far too PESSIMISTIC, refusing turns that would have fitted, rather than vacuous.

**What remains true, narrowly:** an embedded world deployed under `timed` or `hybrid` would consult the block time and would get a number measuring how fast its own player clicks. That is a configuration nobody has asked for, and the answer if anyone does is to declare `averageBlockTimeMs` in chain properties (the hook already exists, see `context/config.ts`) rather than to make the miner produce blocks nobody wants.

### The real hazard the block-time question turned up, and it is not Phase 4's

Checking the above found something that IS wrong and is invisible today. `onchain/state.ts` sizes the state reader's block range as `floor(4 * cycleDuration / averageBlockTime)`, where `cycleDuration` is the sum of the two phase durations read off `linkedData`. **Under the manual policy that sum is zero, so the span is zero and `fromBlock === toBlock`: a one-block window, on every poll.**

**The reference game cannot see it**, and that is the whole reason it is worth writing down. `placement/state.ts` reads the board straight out of contract storage and ignores `fromBlock` entirely; only `toBlock` is load-bearing, as the pin that stops two batched calls stitching a board that never existed. The comment at that seam names the consumer that would care: "`fromBlock`/`toBlock` are part of the seam because a game that builds its state from LOGS needs them (conquest does)".

So a manual deployment already hands a log-reading game a one-block history, every gate is green, and the first repo to notice is conquest during its port - or any hotseat deployment of it. Note the near-miss: `cycle.ts` warns in prose that "a manual deployment read as timed would divide by a zero cycle", so zero-cycle arithmetic was on somebody's mind; this site MULTIPLIES by the zero instead of dividing, so it produces a plausible `0` rather than an `Infinity` and fails silently.

**Not fixed here, and not Phase 4's to fix.** It belongs with Phase 6 (which is where manual and hotseat land) or with the conquest port, whichever arrives first, and the fix is a decision rather than a line: under a policy with no clock there is no "two cycles' worth of blocks", so a log-reading game needs a span expressed in something other than cycle duration.

**One refinement, because the first version of this was framed as a catch-up problem and it is not.** `ZonesReader` is a RE-DERIVE contract, not a delta one: it takes `{zones, fromBlock, toBlock, expectedCycleNumber}` and returns the whole state for those zones. So a log-reading implementation has to build the board out of the range it is handed, and a one-block range is total loss on EVERY poll rather than a gap a later poll closes. It is also not specific to the embedded world or to automine: a manual-policy deployment on an ordinary one-second chain has exactly the same zero.

### The upstream shape is settled, 2026-09-18, and one of my arguments was already refuted by this document

Decided with the owner before the build, because each of these turns a build into a different build.

**`with/embedded-chain`, off jolly-roger `main`, a sibling of `with/local-signer`.** Named for the capability rather than the library: this document said `with/webevm` in two places and the library has already been renamed once under us (`embedded-eth-node` to `webevm`), so a library name in a branch name is a rename waiting to happen. Both mentions are corrected above.

**It does NOT stem from `with/local-signer`, and I argued that it should and was wrong.** The argument was that webevm is execution-only and answers `eth_accounts` with `-32601`, so something must hold a key; the refutation is that `initBurnerWallet` is on `main`. Worth recording because **this document already said so** - Decision 1's tree has carried "(service-layers PRD: stem main, no signer needed)" on that row from the beginning. An argument that contradicts the plan should be checked against the plan before it is made.

**And the local signer buys an embedded world nothing, which is the interesting half.** Its value is that it is RECOVERABLE, derived from a wallet signature so the same account re-derives the same key anywhere (D9). In an embedded world the chain and the key die together: a browser that loses its storage has not lost access to a world, it has lost the world. So there is nothing to recover to, and the whole D9/D10 family is inapplicable here rather than merely unused - those exist because the chain OUTLIVES the browser, and in the tab it does not. A burner is the right shape, not a compromise. The thing that will later want the local signer is the one the worlds doc names and it is not the world's signer at all: a long-lived ONLINE identity alongside the offline world, so what the player owns online can influence what the offline world offers. That is the first real consumer of the integration node.

**`integration` is the node template-commit-reveal re-points to, and the name is deliberate.** Membership is `[with/local-signer, with/embedded-chain]` and `with/hosted-account` is OUT: it needs a hosted wallet service, and including it would tax every game in this tree with a `@etherplay/dev-wallet-host` devDependency, a `wallet-host` script, 101 lines of e2e runner, 28 of playwright config and a 293-line e2e suite that each game then deletes. It can join the day a game wants it, and adding a stem to an integration node is cheap where removing one is not.

Three names were rejected and the reasoning generalises. `with/all` is FALSE the moment a branch is excluded, and it already means something exact one level down (this repo's own `with/all` really is all of its axes), so one name would have had two meanings in one tree. `with/presets` is plural for a branch holding one composition. `with/default` collides with `main`, which IS the default: the tool's own vocabulary is "the parent's primary", and `stemBranch` exists only to override it. And every `with/*` candidate breaks the one rule that prefix carries here, since jolly-roger reserves `with/*` for CAPABILITIES and uses bare names for everything else (`website`, `tooling`, `offshoot`, `work`). **The lesson worth keeping: the config already enumerates membership machine-readably, so a name that SUMMARISES membership can drift from it and a name that states the branch's ROLE cannot.** `integration` is the tool's own word for this kind of node.

**~~`variant/offline` can be deleted, and only after its one unique file moves.~~ DONE, 2026-09-20: the doc moved 2026-09-19 and the branch is now DELETED, local and remote, so `variant/*` no longer exists anywhere in jolly-roger and the `with/*`-for-capabilities rule holds without an exception.** Checked before deleting rather than trusted: `git log main..variant/offline` was exactly one commit, its only content was that file, and all six of its section headings are present in `README.embedded-chain.md`. The recovery sha, should it ever be wanted, is `6d4f458`. The original entry follows, because the ORDER it prescribes is the reusable part.** It is ONE commit ahead of `main` and its only unique content was `docs/worlds-and-identities.md`, the design document for this phase; ADR-0002, the synchronous SSR-inert context and the tab-id fix are all already on `main`. There is no tevm implementation on it, so nothing else is lost, and it is the last survivor of the old `variant/*` naming. The doc is now the second half of `README.embedded-chain.md` on `with/embedded-chain`, where it is the branch's rationale, and every claim in it carries a dated note saying what measurement has since changed. Deleting the branch means deleting `origin/variant/offline`, which is a push, so it is left for the owner to ask for rather than done.

**A new ROUTE rather than a converted demo**, because games support both modes and a swap would make them alternatives. Which forces the load-bearing constraint: **the mechanism lives in `lib/` and the route is only its demo.** This repo deleted `web/src/routes/demo/` in `d34ad44b` and HANDOFF records the resulting recurring `CONFLICT (modify/delete)`, so a new route upstream arrives here and is deleted here too - and anything world-building inside the route is thrown away with it.

**Two words, and they are CONTEXT.md's own rule rather than drift.** `embedded-chain` is the MECHANISM and belongs to the framework; `offline` is the EXPERIENCE the player is choosing and belongs to the game, exactly as `turn` does. CONTEXT.md says name the mechanism and reserve the experience for games, so this wants one line in the glossary rather than a decision.

**What the re-point costs, and it is not only this repo.** jolly-roger gains two verification nodes rather than one (`with/embedded-chain` and `integration`), which is the tax D11 named when this repo took on four. Its own divergence ritual has to be WRITTEN: `tooling` defaults to `FEATURES="with/local-signer with/hosted-account"`, and with two more branches it needs per-branch `ALLOWED` lists and the empty runs, exactly as this repo's three branch READMEs have. And the re-point itself has a worked example in this document already, under "What the re-point actually cost, against what was predicted", from when reveal-or-die's `stemBranch` moved.

### And two persistences, which is the sharper half of the mempool question

Asked while settling the above: if a hotseat world put every player's turn in the mempool, what keeps them across a reload? **The mempool half is reassuring and largely vacuous** - automine has no mempool at all, and a lost send is the SAFE direction, since the submission record is written before the send and D10 reconciles it against the chain. Batching turns to land together also buys no secrecy, because the chain only ever shows a hash (D4), so it would cost durability for simultaneity theatre. It is a second argument for automine: an interval CREATES a mempool, and in the tab there is no other node holding it.

**The half that is not reassuring is that an embedded world persists TWICE and independently**: the chain in IndexedDB via `dumpState`/`loadState`, the submission in localStorage. Only one of the two keys can tell one chain from another - `account/AccountData.ts` embeds the genesis hash, `placement/storage.ts` keys by `chainID_gameAddress_player` and does not - and an embedded chain's id is a fixed OPTION rather than a discovery, so every fresh embedded chain collides with the last one's records under a byte-identical key, while rewinding is a documented feature of the thing rather than an accident.

~~**The order this forces is the point: put the genesis hash in the template's submission key BEFORE the embedded world exists.**~~ **BOTH HALVES OF THAT WERE WRONG, corrected within the hour by asking the owner and by checking a definition.**

**The migration half is void: no repo in this tree has users**, reveal-or-die included, so every key may change freely and there is no forced ordering. The reasoning that produced the caution is the error worth keeping: 13 committed deployment records were read as evidence of players. A committed record says something was DEPLOYED, not that anybody is PLAYING, and AGENTS.md's rule is conditioned on "once your game has users", which only the owner can answer. **Ask, rather than inferring a user from an artifact.**

**And the genesis hash is the wrong discriminator for the case that prompted it.** Genesis is the block BEFORE any transaction, so a chain-per-saved-game model whose saves are seeded by the same script with the same chainId and balances gives every save a byte-identical genesis and therefore an identical hash. It separates CONFIGURATIONS, not INSTANCES. It is right for a remote chain, where genesis is not yours to choose, and useless for what an embedded world does.

**The discriminator both keys already have is `chainId`, and an embedded world's chainId is an OPTION.** So: mint a distinct one per embedded world and change no key at all. `${chainID}_${gameAddress}_${player}` then separates worlds, `accountData` separates them too, and there is no schema, no index and no migration. It is also the correct shape rather than the cheap one, three times over: two different chains should not share a chainId, which is what EIP-155 is; it domain-separates the secret for free, since `secret.ts` derives from `Commit:${chainId}:${contract}:${identity}:${cycleNumber}`, which is D7's argument arriving again from a new direction; and the only thing needing storage is the id itself, minted once at world creation.

**ONE CHAIN, not a chain per save**, unless per-save rewind becomes a product requirement. A new game on a persistent chain is a new deployment at a new address, so `gameAddress` already discriminates saves and sequential deploys cannot collide; `@rocketh/web`'s IndexedDB deployment store already persists the records the app reads the game address out of, so "store the contract so we can retrieve it" is built rather than to be built; and many games as many deployments on one long-lived chain is exactly what a remote chain is, which keeps the embedded path identical to the production one instead of adding a create/dump/load/delete lifecycle that exists only offline. What one chain cannot do is the whole decision: rewind and deletion are per-CHAIN, so saves cannot be rewound or deleted independently and the dump grows monotonically. Note that rewinding appears in this document only as a REASON (why offline play keeps the code path and none of the guarantee) and never as a feature anyone asked for.

Full write-up, including the two things to check before minting chainIds, in `work/notes/findings/an-embedded-world-has-two-persistences-and-only-one-is-keyed-to-the-chain.md`.

### The six questions the build was told to PROBE, answered by measurement, 2026-09-19

Each was a decision the plan deliberately refused to take on paper. Every answer below is a reading rather than a preference, and three of them contradict what the paper said.

**1. The deferred provider: RE-PROBED, still true, AND IT DOES NOT BUY WHAT IT WAS FOR.** The worlds doc's escape - a synchronous context around a provider that queues until the node exists - survives the move from `endpoint` to `provider` in `@etherplay/connect` 0.13: the chain info's provider is handed to `createAlwaysOnProvider` as an endpoint, and `remote-procedure-call` only ever calls `endpoint.request({method, params})`, lazily, per call. So a deferred provider works. **What blocks is not the provider, it is the DEPLOYMENT RECORDS.** `DeploymentsStore.get()` is synchronous by contract, and `createCoreContext` reads a contract ADDRESS out of it while constructing, to scope the operations ledger (`operationScopeAddress`). Before the in-tab deploy has run there is no address to answer with, and inventing one keys a player's history to a contract that does not exist. So the world is BUILT asynchronously and its context is constructed synchronously afterwards, which needs no deferral at all and leaves ADR-0002 untouched: the app-level context is still synchronous and SSR-inert because it is the remote world, and only a browser-only page waits. **The generalisable half: a seam's asynchrony was assumed to live where the IO is, and it lived in the one member that must answer synchronously.**

**2. Run the real deploy scripts, or bake a dump: RUN THEM, and the reason the plan gave for preferring them is not the reason it turned out to be.** It runs: this template's contracts (a token, a routed proxy with four routes behind a deterministic CREATE2 implementation, and a sale) deploy onto webevm in **89-101ms**, with the `dist` output unchanged, in node. Three things had to be learned and none is documented anywhere: `autoMine` must be FALSE (rocketh's autoMine calls `evm_mine`, which webevm answers with a real `-32601`, and automine has already mined by the time the send returns); named accounts cannot be INDEXES (`{deployer: {default: 0}}` means the provider's account 0, and an execution-only node has none, so they arrive as private keys through the `privateKey` signer protocol the config already registers); and `@rocketh/web@0.19.23` declares a peer of `rocketh@^0.21.0` against the `0.19.19` the contracts use, which WARNS at install and works at runtime - the deploy produces correct records and correct `linkedData`. Bundle size, the one real argument for a dump, is untested here because the route is not built.

**3. The world's lifetime: APP-SCOPED, and the measurement is the least interesting part of the answer.** Boot is 4-12ms and deploy 89-101ms, so either lifetime is affordable and the cost decides nothing. What decides it is that a world is STATE and not a view: route-scoped means a fresh chain on every navigation, so visiting another page throws the player's game away. It is created once, lazily, and outlives any route that shows it.

**4. The waited-for set and who calls `advance`: THE CLIENT HAS TO, TWICE PER CYCLE, AND NOTHING IN `web/src` CALLS IT TODAY.** Measured end to end against a manual deployment in the tab's chain: entry (`addToReserve`) makes the single player a waited-for member; the reveal phase does not open until someone calls `advanceCycle`, and a reveal sent before it is refused with `InCommitmentPhase(2)`; the next cycle does not start until `advanceCycle` is called again. A full round is therefore commit, advance, reveal, advance - and `grep -rn advanceCycle web/src` finds the ABI and no caller. So the likeliest reason a full round would not complete is exactly the one the task predicted, it is client code rather than contract configuration, and it is the first thing the second pass owes. Two rounds ran in **280ms total** including boot and deploy.

**5. What the in-tab deploy declares: the manual policy, zero durations, and everything else unchanged.** `cyclePolicy: Manual` with `commitPhaseDuration: 0` and `revealPhaseDuration: 0` (the contract refuses a configuration whose durations disagree with its policy, so this is one decision and not three). `actionsPerReveal`, `commitGas`, `revealGas` and `expectedActionsPerTurn` are the branch's own figures unchanged, because they are properties of the CONTRACTS and of the EVM, and the measurement below says the EVM agrees. The mechanism takes them as per-environment deploy data rather than knowing any of them: `composeWorldConfig` merges a world's `data` per KEY, so a game declaring `Game` does not erase the entries for everything else the deploy reads.

**6. Provisioning is a HOOK, and it is the shape that keeps four branches out of the divergence tables.** `createEmbeddedWorld({provision})` runs after the deploy and before the world exists, and is handed the rocketh environment and the node - so it can execute contract calls (an ERC20 stake, an identity token) and use the node's own cheats (`evm_setBalance` for gas). The framework supplies the moment and the capability; the game supplies the meaning. A branch adds a file rather than editing a shared one.

### The gas risk: webevm and hardhat agree TO THE UNIT, on all six readings

The declared figures (`commitGas` 150,000, `revealGas` 600,000 on `main`) were all measured against hardhat, and since ADR-0003 they are passed as real gas LIMITS - a limit that is too low does not degrade, it reverts and takes the stake. webevm is `@ethereumjs/vm`, so this needed measuring rather than assuming. Same scenario as the GasMeasure harness, TIMED policy and localhost data so the numbers are comparable:

| reading | hardhat, re-measured 2026-09-19 | webevm 0.5.0 |
|---|---|---|
| first commit, cold slots | 116,898 | **116,898** |
| later commit, warm slots | 82,698 | **82,698** |
| full fresh chunk, first reveal | 535,537 | **535,537** |
| the same chunk, non-final | 534,756 | **534,756** |
| full fresh chunk, four zones, final | 535,561 | **535,561** |

So the declared limits keep **22.1%** headroom on a commit and **10.7%** on a reveal in the tab, exactly as on hardhat, and **the declaration stays per-deployment rather than becoming per-world.** The number travels with the contracts it was measured against, as ADR-0003 says, and the EVM underneath it is not a second variable.

**One claim of mine lasted an hour and is corrected here rather than quietly fixed.** The first write-up of this table said webevm came out 24 gas below hardhat on the first full chunk (535,537 against 535,561), and offered a scenario difference as the explanation. It was not a difference at all: 535,561 is the FINAL chunk of a chained turn, which is a different transaction from the first reveal of an unchained one, and I was comparing a reading against the wrong line of a comment. Re-running the hardhat harness (`~/dev/worktrees/.tcr-tools/GasMeasure.test.ts`, copied in, read, deleted) gives all six readings identical to webevm. **The shape is this document's own recurring one**: a number was explained before it was measured, and the explanation was plausible enough to survive being written down.

**Measuring it turned up the thing that actually matters about an embedded clock**, which is in `work/notes/findings/an-automined-chain-has-no-clock-between-transactions.md`: reads run at the LAST MINED BLOCK's timestamp, and under automine a block exists only where a transaction happened, so a timed game in the tab cannot even ESTIMATE a reveal after its commit phase closes. The plan already concluded `Manual` for reasons about what a world is for; this is a mechanical second reason, and it is the one that makes a timed embedded world impossible rather than merely odd.

### The split, and what it leaves

Taken deliberately, on the line the task named: the mechanism plus a unit-tested world, no route and no chrome. What remains, in the order it should be done, with what each one now knows:

1. **The client has to call `advanceCycle`** (probe 4). Nothing does. Without it a manual game cannot complete a round in any world, embedded or not, so this is framework work that the embedded world merely exposes first. It does not block jolly-roger's demo, which has no cycles, which is why the route could land without it.
2. **~~The burner has to reach the in-tab node.~~ DONE, through a documented cast.** `initBurnerWallet({nodeURL})` types `nodeURL` as a `string`, and an embedded world has no URL. **Measured: the implementation already works with a provider object** - it builds its RPC with `createCurriedJSONRPC`, which takes either, and a burner constructed against a webevm node answers `eth_requestAccounts`, `eth_chainId` (the minted 9007199254740123, round-tripped correctly) and `eth_getBalance`. So it is a one-line type widening in `@etherkit/burner-wallet`, a package this project owns, and NOT a second wallet implementation. `lib/embedded/wallet.ts` carries the cast until that lands, with a browser test on it - because if the package ever makes the type true, nothing fails to compile: the wallet simply stops reaching the chain, at runtime, in a tab.
3. **~~The route~~ DONE**, and `setAppContext` was confirmed to be svelte's `setContext` underneath by the route working: the page runs against the chain in the tab while the navbar above it does not.
4. **~~The chrome~~ DONE 2026-09-25, and "upstream work" was right about WHERE and wrong about WHAT.** The mechanism is upstream, in jolly-roger, because only `+layout.svelte` can choose what the shell is given - but it is not a change to `lib/core` at all, and the five consumers reading the GLOBAL deployments store were never the obstacle they look like here: a surface that declines the app's chrome does not need them fixed, because it does not render them. `AppShell` already took a `navbar` and a bar list, so "decline the app's chrome" was expressible as "supply your own", with no `lib/core` API touched. What remains true of this item is the layering fact underneath it, and it is stronger than stated: the chrome is outside every route subtree, so it cannot SEE a world provided inside one, whatever it reads its deployments from.
5. **The reference game's own offline option**, which is template-commit-reveal's and is a different thing from this demo: it needs the manual policy declared by an in-tab deploy (probe 5), the `advanceCycle` caller (1), and a provisioning hook that gives the offline player whatever THIS game puts at stake - a bonded ERC20 in the reference game, custody of an NFT in reveal-or-die, and the framework requires only that something is lost by not revealing. (That last clause used to say "bonds an ERC20 stake" flatly, and the same sentence written into two inherited files during the re-point turned out to be false in reveal-or-die; see below.)
6. **~~`integration`, the re-point, and the cascade~~ DONE 2026-09-20**, and the section below is what it cost. Everything in it is committed and NOTHING IS PUSHED.

### The re-point is done, and the conflict count was the wrong thing to predict

`integration` exists in jolly-roger (`stem: [with/local-signer, with/embedded-chain]`), both parents are merged into it, it is in `fanout.config.json` - **and so is `with/embedded-chain`, which was not in that file at all**, so jolly-roger gained two config entries rather than one and only one of them was new. template-commit-reveal's `stemBranch` is `integration`, its `branch.main.merge` moved with it, and the cascade ran to all five nodes.

**ONE conflict in the whole cascade, and five clean merges that were wrong.** That inversion is the finding. This document's own worked example ("What the re-point actually cost") measured 40 conflicts when reveal-or-die moved to `with/all`, and its lesson was that none of the forty was the problem. Here the lesson arrives without the forty: `integration` into tcr `main` conflicted in `context/core.ts` alone, trivially additive, and the damage was entirely in hunks that merged silently.

| what merged cleanly | why it was wrong here | what caught it |
| --- | --- | --- |
| `web/src/lib/offline.ts` | the STEM APP's world, deploying a greetings registry | nothing - read by hand |
| `web/src/routes/offline-demo/` | an inherited demo route, which this repo deletes | nothing - read by hand |
| `"jolly-roger-contracts": "workspace:*"` in `web/package.json` | names a package absent from this workspace; **breaks `pnpm install`** | nothing - read by hand |
| a "Play Offline" `<Button>` on the home page | links to the route being deleted | nothing - read by hand |
| `test/lib/embedded/deployments.test.ts` | INDEXES the records by `GreetingsRegistry`, which type-checks only in the app that has one | **`check`** |

Four of the five were invisible to every gate, and the one gate that fired did so for a subtle reason worth keeping: `createEmbeddedDeployments` casts its runtime record back to the build-time literal type, so a test of the MECHANISM is coupled to the app's contract names through an inferred type. It says `Game` downstream now, which is a divergence in a shared file; the fix that ends it is upstream and is to stop naming a real contract in that test at all.

**A sixth was caught only by reading the merged file in the DESCENDANT**, and it is this document's own recurring shape. Two notes written during the merge said the offline world needs "a provisioning hook that bonds the ERC20 stake" - the reference game's answer stated as the framework's - and one of them is `routes/+page.svelte`, which is byte-identical in every repo that inherits it. The sentence was therefore already sitting in reveal-or-die, which gates on custody of an NFT and has no ERC20. Corrected on `main` and cascaded again. **The general form: a file that is byte-identical everywhere is exactly the file in which naming one game's answer is guaranteed to be false somewhere**, and the check that finds it is reading it where it landed, not where it was written.

**What `world.test.ts` cost, which is the deliberate loss in this cascade.** `web/test/lib/embedded/world.test.ts` is deleted in template-commit-reveal rather than ported: it boots a real chain, runs `001_deploy_greetings_registry` and asserts a real context's members are the world's by identity, and contracts are not inherited here. So the four mechanism suites came down (22 server tests and 2 client, against the stem's 26 and 2, the difference being exactly its four) and the whole-world test did not. **The consequence is worth stating plainly: `createContext`'s connection parameter has a proven second caller in jolly-roger and NONE in this repo**, so the claim this document makes about that seam is a claim about the stem. Porting it is cheap in shape (two imports, three deploy scripts, a contract name) and not in substance, because the deploy needs DATA and the data is the manual cycle policy, which is item 5. `web/src/lib/embedded/README.md` is where that is recorded, next to the code, in every repo below.

**A second structural blocker for `--verify` in a worktree, which extends the existing finding rather than repeating it.** `verify-cannot-pass-in-a-fresh-worktree-here.md` names one cause, the gitignored `web/src/lib/deployments.ts`. There is now a second in jolly-roger: `lib/offline.ts` and `world.test.ts` import `jolly-roger-contracts/rocketh/*` and `/deploy/*`, which resolve into `contracts/dist`, and `dist` is built by `pnpm --filter ./contracts typescript` - a script the root `prepare` does not run, since contracts' own `prepare` is `set-defaults .vscode && pnpm compile`. A fresh worktree therefore fails `check` with four module-resolution errors that say nothing about deployments. Measured on `integration`: 35 errors before regenerating deployments, 4 after, 0 after the `tsc` build. The cheap fix is one word in contracts' `prepare`; not taken here because it is a change on jolly-roger `main` that cascades to every node.

**The counts, measured before and after on every node.** Each of the five template nodes gained exactly the same `+22` server tests in 3 files and `+2` client in 1, which is the embedded mechanism's four suites, and that uniformity is what says the cascade carried the change and added nothing of its own.

| node | check | units (server) | client | e2e |
|---|---|---|---|---|
| jolly-roger `main` | 0/0 | 934 -> **938** / 79 | 39 / 7 | not run |
| jolly-roger `with/local-signer` | 0/0 | 1203 / 96 | 53 / 8 | not run |
| jolly-roger `with/hosted-account` | 0/0 | 1203 / 96 | 53 / 8 | not run |
| jolly-roger `website` | 0/0 | 934 -> **938** / 79 | 39 / 7 | not run |
| jolly-roger `with/embedded-chain` | 0/0 | 960 -> **964** / 83 | 41 / 8 | **58 in 2.7m** (first baseline) |
| **jolly-roger `integration`** | **0/0** | **1229 / 100** | **55 / 9** | **63 in 6.7m** (first baseline) |
| tcr `main` | 0/0 | 1565 -> **1587** / 131 -> **134** | 71 -> **73** / 11 -> **12** | 52 in 8.1m |
| tcr `with/pixi-js` | 0/0 | 1574 -> **1596** / 132 -> **135** | 71 -> **73** / 11 -> **12** | 52 in 8.3m |
| tcr `with/nft-identity` | 0/0 | 1573 -> **1595** / 132 -> **135** | 71 -> **73** / 11 -> **12** | 52 in 8.3m |
| tcr `with/all` | 0/0 | 1582 -> **1604** / 133 -> **136** | 71 -> **73** / 11 -> **12** | 52 in 8.3m |
| reveal-or-die | 0/0 | 1723 -> **1745** / 141 -> **144** | 65 -> **67** / 10 -> **11** | 50 in 6.8m |

**And after the offline world, 2026-09-22.** Every template node gained the same `+28` server tests in 3 files - seventeen for the advance framework, five for its game half, six for the world test that came back - and one e2e, which is the whole round in a browser. The uniformity is again what says the cascade carried the change and added nothing of its own; the identity node's `+28` is the same COUNT over two different files, because its world test asserts custody where the others assert a reserve. reveal-or-die is deliberately not in this pass: see the section below on why that cascade is a port.

| node | check | units (server) | client | e2e |
|---|---|---|---|---|
| tcr `main` | 0/0 | 1587 -> **1615** / 134 -> **137** | 73 / 12 | 52 -> **53** in 8.4m (load 0.5) |
| tcr `with/pixi-js` | 0/0 | 1596 -> **1624** / 135 -> **138** | 73 / 12 | 52 -> **53** in 8.6m (load 0.9) |
| tcr `with/nft-identity` | 0/0 | 1595 -> **1623** / 135 -> **138** | 73 / 12 | 52 -> **53** in 8.2m (load 2.1) |
| tcr `with/all` | 0/0 | 1604 -> **1632** / 136 -> **139** | 73 / 12 | 52 -> **53** in 8.3m (load 0.5) |

Contracts: 47 passing on `main`, 49 on the identity nodes, unchanged. Divergence with `ALLOWED=` empty over `web/src web/test web/e2e` with `EXT="ts svelte"`: **16** against `main` (was 14), **15** against `with/pixi-js` (was 13), **1** against `with/nft-identity` (unchanged). The two new ones are `lib/offline.ts` and `test/lib/embedded/world.test.ts`, both on the identity axis and both for the axis's own subject - what is at stake - and the branch READMEs record them with that reason.

`integration` is exactly the union of its parents: 1203 + (960 - 934) = 1229 server and 53 + (41 - 39) = 55 client, with no term unaccounted for. Every pre-change number this document carried was re-measured where a node was touched and was exactly what it said, which is now seven sessions running.

**And reveal-or-die reproduced its flake for the THIRD time, with the same signature to the test, the minute and the load.** First run 49 passed plus one flaky `board.e2e.ts` at **9.6 minutes** with load climbing past 7; re-run in isolation on the identical tree, **50 of 50 at 6.8 minutes**. That is the third independent observation of one flake, which retires the question of whether it is a defect: the variable is load, the failure is a wait rather than a wrong answer, and the note's instruction to re-run is worth more than any single run of it.

**Divergence: the template's three sets are unchanged by the re-point** - 14 against `main`, 13 against `with/pixi-js`, 1 against `with/nft-identity`, with `ALLOWED=` empty and `EXT="ts svelte"` over `web/src web/test web/e2e`, naming exactly the predicted files and no others. The embedded mechanism is byte-identical on all four, which it should be, since it is inherited and not switched. `routes/play/+page.svelte` is one blob across all four, and `routes/+page.svelte` is one blob across all four AND reveal-or-die.

### jolly-roger's divergence ritual exists now, and writing it found two false claims

Written on `tooling` as `divergence-ritual.md` rather than as five branch READMEs, and the placement is a decision: an orphan branch cannot cascade, the list lives beside the script it configures, and the alternative puts maintainer material about the template tree into every game repo - which is the cost `branch-readmes-cascade-into-descendants.md` already records for this repo's three. `README.integration.md` and `README.embedded-chain.md` keep what is genuinely the BRANCH's (what it is, its membership rule, its per-file budget with reasons) and point at `tooling` for the runs, so the counts live in one place. Both gained the banner that note asked for, since they are cascading into six repos for the first time.

All fourteen blocks were run and pass. **The script's `FEATURES` default was two branches out of five**, and the failure mode of a missing branch is not an error: it prints `skip <name> (no such branch here)` and the run reports green.

**Two claims measured false, both of them prose beside a checker.**

**`mode.ts` is NOT what makes `with/hosted-account` hosted**, and both `tooling/README.md` and the script's own `ALLOWED` comment used exactly that as the worked example for why the two-sided check matters. `TARGET_STEP` is `SignedIn` on `with/local-signer` AND on `with/hosted-account`, so reverting the file between them changes nothing; with `ALLOWED=` empty those two branches differ in **0** files at both narrow widths. What makes that branch hosted is `web/.env`, which says so in its own comment, and **no `WATCH` path covers it and it is not a `.ts` file, so the guard believed to protect that branch cannot reach it.** The check's second side is still right and still worth having; it is simply not guarding the branch the example named, and believing it does is worse than knowing it does not.

**And `with/local-signer` had a second divergent shared file under `core/` that no run had ever watched**: `core/ui/faucet/faucet-actions.ts`, outside both default paths. This is `with/embedded-chain`'s own instruction - watch wider than the default - landing on a branch nobody had pointed it at, which is the argument for the instruction rather than a fact about that branch.

**IT WAS FIXED RATHER THAN LISTED, and the first write-up of this entry proposed the wrong fix.** That version said the file should be SPLIT, the general half going up to `main` and the "fund the account, never the signer" policy staying, and recorded the split as too expensive to take. Both halves of that were wrong on inspection:

- **All the executable code was general**, not half of it. A wallet answers `eth_getBalance` from a cache until it sees a new block, so a balance read straight after a faucet claim reports the balance from before it; handing back the transaction is the remedy and has nothing to do with a signer.
- **The policy was a COMMENT, not code.** `main` said the default target is "the wallet/owner in wallet mode" and the branch said "the AUTHENTICATED ACCOUNT", and the code on both read `accountExecutor`, which already answers that per branch. There was no policy to leave behind - only two comments each true on one branch, replaced by one true on all.
- **`dispensedByClaim` is not exported any more**, which is what made the move free rather than a new liability. Nothing imported it on either branch, so promoting it as an export would have put a second entry point into a `lib/core` every downstream inherits and nobody calls - "a parameter that exists for nobody", which this document argues against elsewhere. A returned value a caller ignores costs nothing.

So the file and its test are byte-identical across every branch again, the four `target` tests live on `main` with the code, and **the `ALLOWED` entry is gone rather than shrunk**: `with/local-signer` and `with/hosted-account` go 2 -> 1 over `core/` and 37 -> 35 wide, `integration` goes 6 -> 5. jolly-roger `main` and `website` go 934 -> 938 server tests and `with/embedded-chain` 960 -> 964, all of it the same four tests arriving; every other node is unchanged, because it already had them. e2e re-run where behaviour actually changed (`with/embedded-chain`, 58 in 2.7m) and on the load-bearing node (`integration`, 63 in 6.7m); the template nodes were not re-run, because with comments stripped the only difference their copy sees is a removed `export` keyword.

**The general lesson, and it is about the ALLOWED list rather than about faucets: check whether a split is REAL before writing it down as a budget.** An entry on that list is permanent by default and is read later as a decision somebody made; this one would have outlived its reason on the day it was written, and the thing that killed it was reading the two versions side by side for ten minutes instead of trusting the shape of the diff.

**Two counts in `README.embedded-chain.md` were also wrong and are corrected**: it summarised its budget as five shared files while its own table has listed seven since `types.ts` joined, and its expected `core/` total said 100 against a measured 101. Neither broke anything, which is the point - the script counts and the prose only describes.

### What this leaves, and it is one item shorter than it looks

~~Items 1, 4 and 5 remain.~~ **ITEMS 1 AND 5 ARE DONE, 2026-09-22, and item 4 (the chrome) is the only one left.** The section below is what they cost. The original text is kept because its prediction about item 1 was exactly right and its prediction about the combination in the paragraph below it was exactly right twice over.

Items 1, 4 and 5 remain. **Item 1 is the one to take next and it is the smallest**: nothing in `web/src` calls `advanceCycle`, a manual cycle cannot complete a round without it in any world, and it is framework work that the embedded world merely exposed first.

**One thing this node does NOT reconcile, recorded because a descendant meets it first.** A world takes the app's `targetStep` rather than choosing one, deliberately. On `integration` that means an embedded world runs at `TARGET_STEP = 'SignedIn'`, deriving a local signer over the world's own burner - a combination neither parent can have, since `with/embedded-chain` alone targets `WalletConnected`, and one that `/offline-demo`'s measurements were NOT taken under. The suites are green on `integration` and no browser has been pointed at that combination. `check` plus `test:unit` prove the text compiles and the units hold; this document has said all along that they prove nothing about a browser, and here is a specific thing they do not prove.

### The reference game plays a round in the tab, 2026-09-22, and the combination nobody had run produced both of this pass's bugs

**Acceptance clause one holds for the REFERENCE GAME now**, on all four template nodes, in a browser, gated by an e2e test. ~~Clause two (the chrome) does not and is what remains of Phase 4.~~ **Clause two holds from 2026-09-25**, and it holds in a refined form: the framework offers the CHOICE of a chrome per surface and this repo's `/offline` takes it. See "Phase 4 is done" below, and ADR-0004's amendment.

**Item 1, `advanceCycle`, was the smallest and it was framework.** `web/src/lib/game/core/advance.ts` decides WHEN to push and `web/src/lib/placement/advance.ts` supplies the two calls. `advancePermitted` mirrors the contract's guards, which is admissible here for a reason worth stating rather than assuming: it exists only to stop the client broadcasting a transaction it already knows will revert, so being wrong costs one reverted transaction and never a stake. Three properties are the design rather than the implementation: it is INERT under the timed policy (the contract refuses, so it polls nothing and sends nothing, and an ordinary deployment's RPC traffic is unchanged); an early advance under `hybrid` is opt-in, because spending the player's gas to buy a few seconds is a decision and not a correctness fix; and a failed advance backs off exponentially while the situation is UNCHANGED and resets the moment the chain says something new. `createCycleTrackers` also returns `refresh` now, a no-op under `timed`, so the caller that just MOVED the cycle does not wait out a poll interval to find out.

**Item 5, the world, is `web/src/lib/offline.ts`, and probes 5 and 6 came out exactly as the paper said.** `cyclePolicy: Manual` with both durations zero, and everything else SPREAD from the deploy's own `default` rather than restated - the gas figures are measured against these contracts and webevm agrees with hardhat to the unit, so a second copy here would be a measurement waiting to drift. The provisioning hook gives the player gas and this game's stake, bought through the same `StakeSale` rail an online purchase uses rather than by minting and bonding by hand, so the offline world exercises the contract path the online one depends on.

**THE HOOK PAID FOR ITSELF IN ONE CASCADE, which is the strongest evidence probe 6 was going to get.** `with/nft-identity` gates on custody of an avatar and has a fourth deploy script; its offline world mints an avatar through `GameAvatarSale` and checks `getAvatarsOf`/`getAvatarOwner` instead of `getReserve`. That difference cost TWO FILES of that branch's own (`lib/offline.ts` and its world test, taking the identity axis's list from 13 to 15) and **zero lines of `$lib/embedded`**, which is byte-identical on all four branches. Written per branch inside the mechanism, it would have been four divergent copies of the framework instead.

**Both bugs this pass found were in the combination the paragraph above predicted**, and neither is visible to `check`, to `test:unit`, or to a dev run:

- **The local signer broadcast to the APP's node.** `createCoreContext` built its transport from `PUBLIC_NODE_URL`, so a commit made in the world was posted to the remote chain. In a bare `vite dev` there is no url, so the fallback to the connection's provider was already being taken and the world worked - the development configuration took the right branch for the wrong reason. `EstablishedConnection.nodeURL` is the fix and it is `lib/core`, so it belongs upstream. The general form is worth reusing: **a parameter makes a fact per-world, and every other consumer of that fact is a bug until it is moved.** `deployments` was moved when the parameter landed; the node url was not asked about.
- **`ensureConnected()` hangs at `WalletConnected` when the app signs in.** The step after it is a SIGNATURE, which in the app is a button on a connection flow, and a nested world mounts none. The world asks for it itself, which is honest only because the wallet is one it generated seconds ago and auto-approves.

And a third, which is about worlds in general rather than about this one: **a restored world is provisioned again.** Persistence and provisioning are both right and they contradict each other - the reserve went 10, 20, 30 across reloads until the hook started asking the chain first. A stake that can be refilled by pressing F5 is not a stake. The framework could have offered "this world was restored" and that is the wrong question: what a game needs to know is whether its player already has what it was about to give them, and only the game knows what that is. Full write-ups are in `work/notes/findings/a-worlds-signer-broadcast-to-the-apps-node.md` and `a-restored-world-provisions-again.md`.

**What a full round in the tab actually costs, measured in headless chromium against the production build at load ~0.4** (the dev-server figures are 2-3x these and are not the ones to quote):

| | measured |
|---|---|
| page load to a booted, deployed, connected and signed-in world | **363-394 ms** |
| the same after a reload, restoring the chain and skipping the deploy | **172-242 ms** |
| authorising the browser's key and funding it (one transaction) | **387-393 ms** |
| a WHOLE ROUND: commit, advance, reveal, advance | **137-166 ms** |
| of which the four transactions | ~15, 19, 12, 21 ms |

So the four-transaction round is about a seventh of a second and the player's own click is the slow part. jolly-roger's demo measured 264ms to a booted world against a page with no game in it; this one deploys a token, a routed proxy with four routes and a sale, and signs in over its own wallet.

**The offline route's client chunk is 3.3 MB, 720 KB gzipped**, which is the bundle-size question the plan left open under probe 2 ("untested here because the route is not built"). It is route-scoped - a `/offline` node chunk, not in the shell - so it is paid by the player who asks for a chain in their tab and by nobody else. That is the honest number for `webevm` plus `@rocketh/web` plus the contract artifacts; a baked state dump would trade it for a generated artifact that goes stale in silence, which is still the wrong trade.

### The offline world has other players now, 2026-09-22, and a three-player round costs what a one-player round cost

**This is the change that makes the offline world a commit-reveal game rather than a demonstration of one, and the reason it was needed is arithmetic rather than atmosphere.** A cycle with ONE waited-for member hides nothing: unanimity is satisfied by the only person present, so committing buys nothing, and two of the three conditions `advanceCycle` exists to enforce (`StillWaitingToCommit`, `StillWaitingToReveal`) cannot be reached at all. The world now enrols THREE and plays two of them.

**THREE and not two**, because two is a duel: "everyone" and "the other one" are the same statement, and a board where two players contest one cell is a special case of the rule rather than an instance of it. At three, the accumulation in `_place` has something to accumulate.

**And the world has to PLAY them, or it must not enrol them.** Under the manual policy nothing moves until every waited-for member has committed, so two members who never act do not make a quiet game, they make a frozen one, for the human as well.

**Four decisions, each of which was taken before the code and survived it.** They hold nothing in memory (both the secret and the turn are derived from (chain, game, identity, cycle), so a reload reconstructs them exactly, which is D9's argument about a player's own secret arriving one level down). They commit an EMPTY turn when they cannot afford a bond, because topping them up is the F5-refillable-stake hazard one player over and refusing to commit freezes the cycle for everybody. They settle a commitment left from a past cycle rather than carrying it. And they are NOT Phase 6's NPCs: no intelligence, no difficulty, no interface.

**THE SHAPE IS WHAT KEEPS THE DIVERGENCE FLAT, and it held exactly.** `web/src/lib/offline-players.ts` takes a player as `{privateKey, identity}` where the identity is already spelled the way the CONTRACT spells it, so the one thing that differs between branches stays in `lib/offline.ts`, which differs there already. **`offline-players.ts` and its test are ONE GIT OBJECT across all four branches**, and the divergence counts are unchanged at 16 / 15 / 1. The one line per branch is `offlineIdentityOf`, which is async for a reason upstream does not have: on the identity branch the token is MINTED BY PROVISIONING, so the only place the answer exists is the chain.

**Two things the design did not anticipate, both found by running it, and the second was a live bug in the draft.**

- **Under the manual policy, `acknowledgeMissedReveal` is unreachable, and a commitment nothing can open is therefore PERMANENT.** The advance that would carry a commitment into a past cycle is the advance that commitment blocks, and the contract refuses to settle a commitment from the current cycle. So the third decision above is insurance rather than a live path - it stays, because the file does not assume the policy and a timed deployment walks past an unopened commitment without asking anybody. What it means is that the derivation is a WIRE in exactly `AGENTS.md`'s sense, and the repair has to happen in the commit phase: a played player compares the HEAD on chain with the head it would build, not the cycle number, and re-commits when they disagree. Replacing is counted once, so the repair cannot push the tally past the membership.
- **A reveal must not RE-DERIVE what it committed.** The affordability check reads the reserve, so a reveal that re-ran it could build a chain whose head is not the one on chain. It enumerates the two turns this file could have built and lets the HASH judge, which is the rule the app's own recovery already follows.

Full write-up: `work/notes/findings/a-derived-turn-is-a-wire-and-a-manual-cycle-cannot-settle-one-it-cannot-open.md`.

**MEASURED IN A BROWSER AGAINST THE PRODUCTION BUILD, and the one-player column is a re-measurement with the SAME script rather than the figures above** - which is the only way the comparison means anything, since those were taken by a script nobody kept.

| | one player, re-measured | three players |
|---|---|---|
| page load to a booted, deployed, connected and signed-in world | 350-371 ms | **386-411 ms** |
| the same after a reload | 158-167 ms | **161-173 ms** |
| a WHOLE ROUND | 108-233 ms | **113-268 ms** |

Load 0.6, headless chromium, five runs. On `with/nft-identity` the same script measures a round at **113-246 ms** and a boot at 829-883 ms (four deploy scripts and three avatar mints).

**THE `authorise` ROW IS DELIBERATELY NOT IN THAT TABLE, and the reason is a small lesson about this document's numbers.** The table above says 387-393 ms for authorising and funding the browser's key; the script used here measures **642-662 ms for the same span on the same build with ONE player**, so the two are not measuring the same thing - most likely this one also waits for the dialog to close. It is not a regression: the three-player build measures 634-661 ms, which is the same figure. **The lesson is that a measurement whose SCRIPT was not kept cannot be re-measured, only re-taken**, which is why the one-player column above was re-taken rather than quoted, and why the driver for it is described in `HANDOFF.md` rather than left to be reinvented.

**So a round of EIGHT transactions costs what a round of four cost, and that is entirely down to not waiting for a poll.** The plan's own question was whether the advance client and the played players would wait for each other - the advance polls once a second, the players on their own interval, and two polls in series is most of a round. Measured all three ways:

| | a steady round |
|---|---|
| both pokes (shipped) | **121-253 ms** |
| the players NOT poked when the human's submission lands | 826-838 ms |
| neither poke | 820-1340 ms |

So the answer is yes, the players should be poked, and it is worth about seven tenths of a second per round. The poke is `pokeWhenTheHumanActs`, which is the same courtesy `context/game.ts` already does for `cycleAdvance.check()` at the same two moments, plus the mirror of it (`onActed`, which asks the advance client to look the instant a played player has acted). **The players' own poll went to ONE SECOND**, the same interval as the advance client because it is the same job: it is a backstop, and 250 ms measured no faster (115-277 ms against 114-233 ms) for four times the reads. A poke arriving mid-pass is QUEUED rather than dropped, which is the half that makes it reliable - a pass takes as long as the transactions in it, so mid-pass is the likely case.

**The offline e2e is a far stronger gate for free**, and its timeouts are unchanged, which is the thing to check rather than widen: the reveal phase cannot open until all three have committed and cycle 3 cannot start until all three have revealed, so the two assertions it already had now say that the played players ACTED. One assertion is added, that they reached the BOARD, because a player committing and revealing an empty turn would satisfy every count and leave the human looking at one cell.

**And it turned up a contract defect on the identity branch, which is not fixed here.** `_place` counts a claimant when the player's stake on the cell was zero, so where a placement is FREE it is still zero afterwards and every placement counts again: nine claimants for nine placements there against seven here. The comment two lines above it says the zero-cost case was in mind for the zone index. Nothing reads the number in a way that breaks, so it is recorded rather than fixed, and the prose that explained the right behaviour with the wrong reason is corrected in `README.nft-identity.md`. See `work/notes/findings/a-free-placement-is-counted-as-a-new-claim-every-time.md`.

**The counts, before and after, on every node.** The same `+8` server tests everywhere - seven for the played players and one for the world test asserting all three members - which is again what says the cascade carried the change and added nothing of its own.

| node | check | units (server) | client | contracts | e2e |
|---|---|---|---|---|---|
| tcr `main` | 0/0 | 1615 -> **1623** / 137 -> **138** | 73 / 12 | 47 | **53 in 8.5m** (load 0.6) |
| tcr `with/pixi-js` | 0/0 | 1624 -> **1632** / 138 -> **139** | 73 / 12 | 47 | **53 in 8.3m** (load 1.2) |
| tcr `with/nft-identity` | 0/0 | 1623 -> **1631** / 138 -> **139** | 73 / 12 | 49 | **53 in 8.2m** (load 1.5) |
| tcr `with/all` | 0/0 | 1632 -> **1640** / 139 -> **140** | 73 / 12 | 49 | **53 in 8.3m** (load 0.4) |

Divergence with `ALLOWED=` empty over `web/src web/test web/e2e` with `EXT="ts svelte"`: **16** against `main`, **15** against `with/pixi-js`, **1** against `with/nft-identity`, all three unchanged, naming exactly the files they named before and no others.

**What this does NOT do, and it is still the whole of what Phase 4 has left.** The chrome. The navbar, the account and the RPC banner live in `+layout.svelte`, outside every route subtree, so they still describe the remote world while three players take turns below them. The offline route says so on screen. **DONE 2026-09-25; see the two paragraphs below, and note that the route no longer says any such thing because there is no longer anything to apologise for.**

**AND THE CLAUSE HAS BEEN RE-SCOPED, 2026-09-24, by ADR-0004 (this branch).** It is no longer "teach `lib/core`'s chrome which world it is in", which was assumed to be jolly-roger's work inherited by everybody. An offline world gets its OWN chrome. The reason is that reuse is not merely incomplete there, it is misleading: an offline world generates its own wallet, so showing that address where the app shows the player's own tells a player who played online first that their account changed; and "connected" and a credits figure are answers to questions with one possible value offline, which is the dialog-with-one-answer defect this phase has already removed twice. The purpose is the same (say where you are, say what is at stake, give the way out) and the answers are different. ~~Most of the work therefore moves out of jolly-roger and into this repo, which is also what removes the cascade that made this clause expensive.~~

**PHASE 4 IS DONE, 2026-09-25, AND THE CLAUSE WAS REFINED ONCE MORE ON THE WAY.** ADR-0004 now carries a dated amendment, and the refinement is that the framework must not take the "an offline world gets its own chrome" position ON A GAME'S BEHALF: it offers the CHOICE, and each surface decides. So there are two halves. The MECHANISM is jolly-roger's (ADR-0009 there): a surface may declare its own chrome on its page data, `chromeFor` decides, and a surface that declares nothing gets exactly what it had, which is every route in every repo in this tree bar one. The POSITION is this repo's, about this repo's `/offline`, and it is unchanged. **The test that settles which case a surface is in is not "embedded versus full screen" but whether the chrome's CLAIMS REMAIN TRUE of the surface the player is looking at**: jolly-roger's `/offline-demo` keeps the app's chrome and says so in a comment, because the page is still that app's and the account above it is really the player's; this repo's `/offline` declares its own, because a world owns the page.

**AND THE STRUCK SENTENCE ABOVE WAS HALF WRONG, which is worth more than the correction.** What moved out of jolly-roger is the CONTENT - what an offline chrome SAYS - and that is two components and a declaration here, inherited by nobody who does not want it. What could not move is the mechanism: `routes/+layout.svelte` and `core/ui/AppShell.svelte` are byte-identical from jolly-roger `main` down, and only the layout can choose what the shell is GIVEN, so building it here would have diverged the most-edited file in this tree. The cascade was therefore not removed but made cheap and, more importantly, made SAFE: the template writes `chromeFor(page.data)`, which contains no answer, so there is no call site at which a descendant can inherit a chrome decision that is false for it. That is the trap this branch's 2026-09-24 finding records, arriving in a different costume and disarmed.

**The layering fact the old framing assumed away**, now recorded because it is the reason "teach the chrome which world it is in" was never going to work: the chrome is rendered by the LAYOUT and both offline worlds create their context INSIDE the route subtree, so a chrome up there cannot see the world at all. A declared navbar reads app-scoped MODULES instead - which `$lib/offline` and `$lib/offline-lobby` already were, and had to be for their own reasons. Hoisting a world context into `lib/core` was the rejected alternative.

### The offline world has a LOBBY now, 2026-09-22, and this is Phase 6 arriving before Phase 4 finished

**THE ORDER IS BROKEN DELIBERATELY AND THAT IS THE FIRST THING TO RECORD.** By this document, what is left of Phase 4 is the CHROME, and a lobby is Phase 6 ("closed roster, lobby and forfeit, then hotseat, then NPCs"). The lobby was taken first for three reasons, and none of them is that the chrome got harder. It is CHEAP: a seat model, a store and a route branch. It is entirely THIS REPO'S - no `lib/core`, no contracts, no upstream cascade, so it cannot collide with the chrome work, which is `lib/core` and belongs to jolly-roger. And it is what makes the world just built demonstrable: a player can now sit down at it, choose who is at the table, and play, which is a different thing from a world that boots into a fixed three. The chrome remains the whole of Phase 4's second clause and is unmoved.

**SEATS, NOT A PLAYER COUNT, and that is the design rather than the vocabulary.** A seat has an OCCUPANT, and today an occupant is either you or the world. The whole test of the model is that adding a human occupant later changes nothing in it: `tableOf` lays the seats out, provisioning WALKS the table asking each occupant for an address, and the lobby chooses only how many there are. Hotseat is deliberately not in this slice - it is several ACCOUNTS against one world in a context built for exactly one, and it reopens the account-picker question `lib/embedded/wallet.ts` closed on purpose - and what this owes it is the model and nothing else. `CONTEXT.md` takes three words for it (lobby, seat, occupant), under a heading of their own, because D4's membership axis is where the framework will meet them.

**THE LOBBY RUNS BEFORE THE WORLD BOOTS, AND IT HAD TO.** Membership is baked in by PROVISIONING - what enrols a player is being given this game's stake, and that happens once, while the world is being built - so the count is not a setting a live world can take without staking or withdrawing members mid-cycle, which is changing unanimity's denominator while a cycle is open. Changing it therefore starts a NEW world, on the path that already existed: `openWorld` mints a fresh chain id, so forgetting the remembered one is the entire mechanism, and the old chain and its deployment records are orphaned exactly as an incoherent restore already orphans them. A world that exists is not silently reused at a new count: the browser goes back into it at ITS count, the route says how many seats it has, and the only way to a different table is an explicit press.

**THE FLOOR IS THREE AND IT IS THE RULE THIS DOCUMENT ALREADY ARGUED**: one waited-for member satisfies unanimity by existing, two is a duel. **THE CEILING IS FIVE AND IT IS A MEASUREMENT.** It is deliberately not "however many well-known keys there are" (eighteen), and it is not what the arithmetic predicts either. See the next section: the arithmetic says eight seats should cost a third of a second and the browser says four.

**THE CEILING IS TEN AS OF 2026-09-23, and the sentence above is left standing because what made it five was a BUG.** The staircase in the next section was `webevm` running every execution on one checkpoint stack with no serialisation; 0.6.0 fixes it and the re-measurement is at the end of that section. The arithmetic this document kept predicting turned out to be right all along.

**AND THE AUTHORISE STEP IS GONE, which reverses a decision this repo had written in capitals.** `provisionOfflinePlayer` said it deliberately does NOT authorise the browser's key, and its REASON was true and stays true: the signer is derived from a wallet signature after provisioning has returned, so provisioning cannot know its address. What changed is who acts on it once it exists - the world does, in `connectOfflinePlayer`'s step, which is where that signature is asked for and therefore the first moment there is an address to register, and it does it through the same `registrationRequest` and `submitRegistration` the button's flow calls. The paragraph is rewritten rather than worked around, including why asking was right when the world had ONE member (it was the only thing the player was asked for) and is not now (both sides of "who pays" are the same wallet, on a chain in this tab, holding money the world invented; a question with one answer is a gate, not consent).

**IT COSTS COVERAGE, and the replacement is named rather than assumed.** That press was the only UNCONDITIONAL drive of the top-up modal in the whole e2e suite - choose a payer, confirm, watch the registration land. What replaces it is an assertion that the CHAIN says this browser may play (`delegationStatus` for the (account, signer) pair, read through the world's own handle), plus the absence of the gate. So the contract half of the delegation path is still exercised in a browser on every run; the modal's own half falls back to its unit tests and to `authoriseToPlay` in `game.e2e.ts` and `out-of-gas.e2e.ts`, which meets that button whenever the shared chain has already staked the account - which is most reruns and no fresh chain. That is a real reduction and it is the accepted price.

**AND THE WORLD SAYS IT HAPPENED.** An offline world is the last place a player meets what playing online costs, so the route states that it registered a play key and funded its gas, and that online that is one transaction they sign and pay for. A step taken FOR someone still has to be one they were told about.

**One bug, found by running it, and it is the prerender one this tree keeps meeting.** The first draft rendered the chooser in prerendered HTML, so the control was on screen before any handler was attached: a press landed before hydration and `onMount` then reset the state. A run that chose eight seats got three, silently, and the only evidence was that the measurements at eight matched the measurements at three exactly. Hence an `Opening` step that renders nothing - whether a world is already here is a question only `localStorage` can answer, so the server cannot know which state is right.

### A round does not degrade with seats, it degrades in whole poll intervals, and an advance can succeed without taking effect

> **RESOLVED 2026-09-23, and the whole of this section is now history rather than guidance.** The cause was `webevm`: every execution, transactions and `eth_call` alike, ran on ONE state manager with ONE checkpoint stack and nothing serialised them, so whichever of two overlapping executions reverted last discarded what the other had committed. ONE ordinary read overlapping ONE transaction was enough, with no game contracts and no client, and two overlapping TRANSACTIONS did it too. `webevm` 0.6.0 queues the node's whole public surface (its ADR 0012). Verified here against 0.6.0, and re-measured below. Read the table that follows as the symptom, not as a property of the game.

**This is the answer to the question this document asked, and it is not the answer it expected.** The played players act in one sequential pass, so a table of N is 2(N-1) transactions in series plus two advances, and a transaction in the tab is 15 to 20 ms. The prediction was a slope. Measured in headless chromium against the production build, five runs each, load 1.3 to 2.1:

| seats | a round |
|---|---|
| 3 | 114-237 ms |
| 4 | **1.33 s** first, then 224-230 ms |
| 5 | **1.32 s** first, then 210-273 ms |
| 6 | **3.8-4.4 s**, every round |
| 8 | **3.8-4.4 s**, every round |

It is a staircase in whole POLL INTERVALS. From four seats up, the `advanceCycle` that opens the reveal phase **succeeds, emits `CycleAdvanced(2, false)`, and leaves `getCycle` reporting the commit phase** - a dozen fresh reads over 300 ms all say commit - so the round waits out the advance client's one-second backstop and is pushed again, by a second transaction that emits the same event and this time does take. At six seats the advance that closes the cycle also REVERTS with its condition met (six revealed of six committed), which costs `RETRY_BASE_MS`'s two seconds on top. The same contract driven the same way under node advances once and then refuses with `StillWaitingToReveal`, exactly as it should, so this is the chain in the TAB and not the rules. Full write-up, with the block traces: `work/notes/findings/a-second-advance-succeeds-in-the-tab-and-the-first-one-did-not-take.md`.

**Nothing was changed in the loop, and that is the decision.** The obvious repair - have the advance client verify the phase actually moved and retry at once - would hide a lost state write inside framework code that every repo in this tree inherits. The measurement stands instead, and the ceiling is where the world still plays at the speed it was measured at.

**AND NOT CHANGING THE LOOP IS WHAT MADE THE FIX POSSIBLE, 2026-09-23.** The defect was diagnosed to a twenty-line reproduction needing neither the game's contracts nor its client, filed upstream, and fixed in `webevm` 0.6.0. Had the advance client been taught to verify and retry, the symptom would have gone away here, the reproduction would never have been looked for, and every other write the world makes would still be silently corruptible - including the ones nothing retries. The e2e failure recorded alongside it (`offline.e2e.ts` stalling at `Unloaded`) was the same bug, which is the evidence that the damage was never confined to the advance.

**Re-measured against 0.6.0**, same driver, headless chromium, production build, load ~1.1, five runs of six rounds, counting every steady round rather than quoting a range:

| seats | boot | a steady round | rounds over 500 ms |
|---|---|---|---|
| 3 | 348-350 ms | median 228 ms | 0/25 |
| 5 | 318-364 ms | median 221 ms | 0/25 |
| 8 | 339-352 ms | median 223 ms | 0/25 |
| 10 | 350-377 ms | median 232 ms | **0/56** |
| 11 | 353-836 ms | median 231 ms | 4/56 |
| 12 | 824-841 ms | median 235 ms | 2/25 |
| 16 | 833-845 ms | median 330 ms | 5/25 |
| 19 | 823-846 ms | median 334 ms | 10/25 |

The staircase is gone, the anomalous first round is gone, and the median is flat at about 230 ms from three seats to twelve. **`MOST_SEATS` goes from 5 to 10**, ten being the largest table at which every round measured was steady. What degrades above it is the old SHAPE without the old cause - a pass over that many members occasionally outlasts the poke that would have ended the round, so it waits out a one-second backstop - which is a latency budget rather than a lost write, and should be bought by spending on the poke rather than by raising the constant.

**One methodological correction, because this document's own recurring lesson caught it again.** The failing e2e was written up as a SEPARATE finding with an explicit argument for why it could not be the same bug (this defect loses a WRITE, so the symptom should have been `refused` rather than `Unloaded`). The argument was careful and wrong, and the evidence that would have settled it was one dependency bump away the entire time. When a suspected cause has a candidate fix, test the fix against the other symptom BEFORE writing down why they are different bugs.

**The general lesson is bigger than the lobby.** An offline world exists so the game can be driven end to end without a node, and the claim underneath that is that what a client sees in the tab is what it would see anywhere. Here a transaction reported success, emitted the event that says what it did, and did not do it. **A receipt that is not reverted is not, in this environment, evidence that the state moved.** Every measurement taken in the tab until now was of one member and six transactions a round, which is precisely the regime where this does not fire.

**The counts, before and after, on every node.** `+16` server tests on `main` (six for the seat model, seven for the lobby, one more world test at a non-default count, and the two world tests that were one), and the same everywhere. One unrelated commit rides along: `offline-players.ts` landed unformatted and `format:check` had been red on all four branches since, which nothing reported because the gate is not in `check` or `test:unit`.

| node | check | units (server) | client | contracts | e2e |
|---|---|---|---|---|---|
| tcr `main` | 0/0 | 1623 -> **1639** / 138 -> **140** | 73 / 12 | 47 | **53 in 8.0m** (load 3.3) |
| tcr `with/pixi-js` | 0/0 | 1632 -> **1648** / 139 -> **141** | 73 / 12 | 47 | **53 in 8.2m** (load 1.1) |
| tcr `with/nft-identity` | 0/0 | 1631 -> **1647** / 139 -> **141** | 73 / 12 | 49 | **53 in 8.2m** (load 0.9) |
| tcr `with/all` | 0/0 | 1640 -> **1656** / 140 -> **142** | 73 / 12 | 49 | **53 in 8.3m** (load 1.7) |

Divergence with `ALLOWED=` empty over `web/src web/test web/e2e` with `EXT="ts svelte"`: **16** against `main`, **15** against `with/pixi-js`, **1** against `with/nft-identity` - unchanged, naming exactly the same files. The three new modules are byte-identical on all four branches, as is the route, which is the check that the lobby put no game knowledge in a place that has to be edited per branch.

**Not cascaded to reveal-or-die, deliberately, and that is a decision rather than an omission.** The framework half would merge cleanly and the GAME half cannot: `lib/offline.ts` names this repo's contracts package, its three deploy scripts and `$lib/placement/*`, and reveal-or-die deletes that whole directory and ships its own contracts. `placement/advance.ts` is in the same position. So the cascade there is a PORT - its own world, its own provisioning (an identity token it must own), its own two calls - and doing it as a merge would leave a node that does not type-check. It is the natural first job for whoever takes reveal-or-die next, and it is small: the framework, the seam and the route are all inherited.

**Phase 5: the long cycle.** `with/fuzd` here, proven on a 24-hour deployment of the reference game, including C3 and C4 under an early advance. This is the mode three of the five games need and the one with the least evidence in this lineage: catacombs' fuzd plumbing is fully written and never called.

**Phase 6: the rest of the matrix**, in the order that shares the most: closed roster, lobby and forfeit, then hotseat, then NPCs. **THE LOBBY HALF IS DONE, 2026-09-22, OUT OF ORDER AND ON PURPOSE** - see "The offline world has a LOBBY now" above for why it was taken before Phase 4's chrome and what it deliberately left alone. What it leaves for this phase is the closed roster and the forfeit on the CONTRACT side (a count that can decrement, and who may fire it), hotseat, and NPCs; the seat model is built and a human occupant is meant to cost nothing but a third variant of `Occupant`. **NPCs arrive with a worked precedent now and not a blank page**, and also with a line drawn: the offline world's two played players are deliberately the SMALLEST thing that gives a cycle somebody to wait for, and what Phase 6 adds is intelligence, difficulty and an interface - none of which belongs in `offline-players.ts`. What it should take from there is the two properties that were expensive to learn: hold nothing in memory, and never commit something this build cannot open. Hotseat's prerequisites are smaller than they looked (D4): turn order, nonce serialisation across the accounts one device is sending for, and provisioning at the lobby. Storage needs nothing, which was checked rather than assumed: the round keys by `${chainID}_${gameAddress}_${player}` and the operations ledger appends the account to its scope prefix, so several local players already do not collide.

**Phase 7: the UI swap** (D8), on bomber-world once it is current. Not on the critical path for any mode, but it is the only test of a seam three repos already depend on, and its output is a number rather than an opinion.

**Ongoing: conquest.** Its graft onto this template is the second bigint identity and the second renderer, and its move pipeline is unported either way, so doing it against the framework is cheaper than doing it twice. Its resolution rules are unwritten and `_acquireStarSystem`'s first-to-reveal branch is a defect to fix during the port, not a precedent.

## Tripwires

- **Two games change the same framework file differently: extract the framework to a package.** reveal-or-die changed one framework file in 126 commits, which is package-shaped rather than template-shaped. `@etherplay/delegation` is the precedent for how and why. Not yet; the signal will be unambiguous.
- **A feature branch grows past about a dozen files: it wants a package boundary**, not a branch. This is R1 from the service-layers PRD, restated for the game tree.
- **A backport is written twice instead of moved: stop and delete one.** The input layer is the worked example of what that costs.
- **A dormant game stops compiling in a cascade: that is a finding, not a chore.** It is the cheapest evidence available that a seam does not fit.

## Decisions taken 2026-09-07

**D1. `template-commit-reveal` stays on `with/local-signer`.** There is no `with/all` yet and few `with/*` branches, so the question is not live. Two things to carry into it when it is.

*The layer a game needs tracks its CYCLE LENGTH, not its genre or its identity model.* A fast game's window of interest is a few epochs, which is a bounded block range, so `eth_getLogs` answers it: reveal-or-die and bomber-world read `CommitmentRevealed` directly with a window sized from the epoch (`lib/world/state.ts`, and the `4 * epochDuration / averageBlockTime` heuristic), and that is what drives their animation. A 24-hour game's window is a day of blocks, which it does not answer, so it wants an indexer. Bomber-world is not merely uninterested in a 24-hour cycle, it would be a worse game on one, so this is a stable property of a game rather than a phase it passes through. That cuts across the game tree, which is the argument against pinning the layer choice at the template level at all.

*Removal is a real alternative to a thinner template, and the mechanism already exists.* jolly-roger's `0d6c8f3` landed `.offshoot-omissions` (the paths a repo deliberately does not carry, WITH the reason for each), `scripts/apply-omissions.sh` to re-drop them in one command, and `web/test/offshoot-omissions.test.ts` to fail if one comes back. So "delete a folder plus a small extra" is already supported, and a layer built to R1/R6 shape (a folder, one wiring line, optional view fields) is exactly the shape that can be deleted that way. The honest trade to record: **the additive fan charges the MAINTAINER (one more node, verified forever), removal charges the ADOPTER (a modify/delete conflict every time the template touches a removed path).** The omissions mechanism does not remove that conflict, nothing can; it makes answering it one command instead of an excavation. Which side should pay is a judgement about how many adopters want a given layer, and it can be made per layer rather than once for the tree.

**D2. `with/nft-identity` reuses the reference game rather than writing a second one**, and changes exactly three things: the identity type (an address becomes a token id), acquisition (mint and deposit instead of buying a bond), and what is at stake (custody of the token instead of an ERC20 bond). Those three are what the four token-identity games actually need and they are what `main` cannot demonstrate, so the branch earns its keep while staying inside the N1 to N6 budget. It does NOT add several tokens per account: that is D6, deferred but not precluded.

What the branch deliberately does NOT prove, so nobody assumes it does: an identity that is degraded rather than seized (docking levels), and the third level conquest has, where an account owns an EMPIRE which controls AVATARS. Delegation already covers account-plus-controller; empire-over-avatar is a further level and conquest's port is where it gets proven.

**D3. Bomber-world is not retired.** **DONE 2026-09-26**, bomber-world `main` ac1f24aa: a merge that makes it current reveal-or-die plus its brand, then bombs in the contract, then bombs in the client, each green. What it found is in `work/tasks/done/port-bomber-world-onto-reveal-or-die.md`; the one thing still owed is a REDEPLOY with committed records, without which its verify cannot pass in a fresh worktree. It descends from reveal-or-die and is the cheapest of the ports, so it re-syncs during Phase 1 rather than being written off. **CORRECTED 2026-09-26: it did not.** Phase 1 was marked done without it, so the re-sync is now its own piece of work, `work/tasks/backlog/port-bomber-world-onto-reveal-or-die.md`, and "cheapest" is measured there: 6 commits and 35 files of its own since the shared base, of which 20 no longer exist in reveal-or-die and have to be re-homed rather than merged. Budget one specific cost: its layout predates the convention (`onchain/evm/`, not `contracts/`), so the merge carries a rename as well as a diff.

**D4. Hotseat is real commit-reveal, one ACCOUNT per player, with a revealer account.** Three shapes were considered: skipping the commit phase with a client-side freeze, real commit-reveal per player, and the device batching every player's move into one transaction. The last two leak nothing, and the deciding axis is not leakage but **code-path unity**: batching needs a contract entry point no other mode uses, and it caps the player count on a gas limit, so it makes hotseat a different game from the online one. Skipping commits is worse still, because "same code path" is then only superficial and it is paid for with a freeze that has four independent triggers (the poll interval, the epoch tick, RPC-health recovery, `resumeWhenGasArrives`). Real commit-reveal costs nothing extra in UX, because every other mode already has that UX.

So the flow is: each player commits in turn on the shared device, NPCs commit whenever they like (a commitment cannot leak to a later committer, which makes NPC honesty structural rather than a matter of discipline), and once everyone has committed the reveals go in.

**Each hotseat player is their own account**, not an identity under a shared one, because that is what mirrors an online game and it is what makes the same code path true rather than nearly true. Three things follow, and they are why this version is better rather than merely more faithful. Secrets are domain-separated by construction, since a different key produces a different signature, so the collision that a shared key would cause does not arise. The pending-operations ledger stays per player, whereas a shared account would have merged everyone's transactions into one visible list, which is itself a leak. And it is `worlds-and-identities.md`'s cheap case rather than a new concept: several connections against one context, since a world gets a context and an identity gets a connection.

The cost is real and is accepted: more state churns at each handover (balances, operations, pending), and N accounts need gas. **The gas is the lobby's job**, exactly as in every other lobby-enabled mode, which is the general form of the point: a lobby exists to get everyone provisioned before the game starts, not only to fix the roster.

**Revealing is a role, not a new seam.** Every contract here takes the identity as an argument and does not check the caller, deliberately, so "somebody else sends your reveal" is already the design and fuzd is one implementation of it. The local revealer is another, and it holds its own funded account, which is what pays for the reveals rather than charging them to whichever player happened to be last. Alongside it the device coordinates two small things: whose turn it is, and serialising sends so N rounds do not race on nonces.

**Build it as a SCHEDULER adapter, handed the payload at commit time, not as a reader of anyone's storage.** That is what account-data encryption forces: once the round's secret sits inside an encrypted blob, only its owner can read it back, so anything that reveals on someone's behalf has to be given what it needs when the commitment is made. `commit()` already carries `secret`, `epoch` and `revealDueAt` for exactly that reason, so the local revealer and the fuzd one are the same shape including the handoff, and the encryption change confirms the seam rather than invalidating it.

It also narrows what is left of the hotseat leak, which is the whole residual risk and worth naming: **the thing that must not show player 1's plan to player 2 is the collector's own contents.** One component with no timing triggers, rather than a view that four independent refresh paths could advance.

**`SKIP_COMMIT` is dropped**, having lost its only consumer. See "The contract side is cheaper than it looks" for why nothing else wants it and what the bomber-world port does instead.

**D5. Forfeit means "stop waiting for me", and nothing else. It never settles.**

**Why the fixed set needs it and the open case does not** is mechanical rather than a matter of fairness. Under a clock, a player who stops acting accumulates missed rounds and dies by the game's existing rule; nobody is blocked meanwhile. With no clock, there are no turn advances, so **nothing accumulates and the death rule cannot fire at all**: the absent player's inaction freezes the very mechanism that would have removed them. Ejecting them by having everyone skip three turns on their behalf is the alternative, and it is absurd.

**The definition is what keeps this cheap.** Forfeit removes the member from the set. It settles no stake, returns nothing, and burns nothing. Turns then advance again, the absent player's misses accumulate at the normal rate, and the game's existing rule kills the avatar three rounds later exactly as it would have under a clock, with the avatar still on the board and takeable in the meantime. **The same rule produces the same outcome in both modes**, so forfeit is mode-independent rather than a fixed-set special case, and there is no new economics to design.

**Forfeit is final, and it is final for free.** A fixed set has no JOIN: the roster is closed when the lobby creates the instance, and nothing can add to it afterwards. So there is no re-entry to bar, no bar to store, and no forfeit-and-rejoin griefing to defend against; a forfeited member simply has no route back and can no longer act. That is also the counterweight to having no timer on the admin's power: a wrong ejection cannot be undone within the instance, and what makes that acceptable is social (a closed roster knows who its admin is) rather than mechanical.

The reading to avoid, because it is the one that sounds equivalent and is not: "settle my stake and leave NOW". That is an instant costless exit, which is a way to not-reveal without losing anything, and it voids the invariant the whole template rests on. The three-round delay is not a grace period, it is what makes leaving cost something.

Three things the definition still owes:

- **A third party must be able to fire it, and it is the lobby's admin, bounded.** Self-forfeit is safe but does not cover the case that motivates the feature, a player who VANISHES and therefore presses nothing. The lobby has a creator (it fixes the roster and the config, so its address is already on the instance), and in a closed roster the players know each other, so a social trust assumption is available and is far cheaper than a mechanism. Keep it small with one condition: the admin may forfeit only a member who **has not acted in the current phase**, which is checkable on chain and means a player who has committed cannot be kicked. The power then reduces to declaring the obvious. No timer guards it beyond that: a delay would be a parameter to tune against a threat the roster does not have, since a closed set on a LAN knows who its admin is and what they did.
- **The admin is a fast path, never the only path.** Unanimity of the remaining waited-for members stays as the fallback, or an admin who leaves or turns hostile freezes the instance forever. `address(0)` for the admin is then a meaningful configuration rather than a hole: no admin, unanimity only, which is what a same-device world wants since the device is the only party anyway.
- **Removal applies from the current epoch forward, never retroactively**, or the outcome depends on when the removal landed relative to other reveals, which is the order-independence rule again.
- **`commitWhenIdle` will fight it.** The client auto-commits empty rounds to keep a dying avatar alive, so it has to know about the forfeit, or the framework spends gas preventing the death the player just asked for.

One thing this turned up that is worth knowing on its own. **Skip-turn already exists, is not free, and removes the natural exit.** It is `plan([])` plus a commit, and `commitWhenIdle` does it automatically, forever, while the player holds something that can die. So an idle player with the tab open never dies and quietly spends gas, and "just stop playing" really means "stop running the client". Exposing skip-turn as a button costs nothing and is worth doing; noticing that it makes death-by-silence unreachable is worth doing first. Where a game has a deliberate exit of its own (reveal-or-die's exit tile, in the contract first) that remains the better answer, because walking there is what prices it.

**D6. Several identities per account is not built now, but the architecture must not preclude it.** Two rules, cheap to keep and expensive to retrofit. **Identity is a SELECTION, not a derivation**: even where there is exactly one, it arrives through an active-identity store and nothing reconstructs it from the account (`active-avatar.ts` is already that shape). And **everything keyed by "the player" is keyed by identity, never by account**, which the round's storage already does.

The capability underneath both rules is **several rounds alive in one page**, and that is the same demand hotseat makes: N accounts holding one identity each, and one account holding N identities, are structurally identical from the round's point of view and differ only in whether the keys differ. So hotseat and multi-identity are one piece of framework work, and the nonce serialisation is shared plumbing rather than hotseat's tax.

**D7. `makeSecret` takes the identity, and the derived message is domain-separated by it.** *(See D9 for what it derives FROM, and for why the enumeration this guards against is the same computation as the recovery Phase 1 wants.)* It is called with `{epoch}` today, and the derivation the games use is `Commit:<chainId>:<contract>:<epoch>`, which does not say which identity is committing. That is safe only while one key controls one identity. Where an account holds several (conquest's empires), all of them derive the same secret, and a small action space is enumerable against a known secret and a published hash, so the hiding property is gone from the inside. The message becomes `Commit:<chainId>:<contract>:<identity>:<epoch>`. Land it before anything on the new stack has a live deployment depending on the old message: it changes the derivation, so a round in flight across the upgrade cannot recompute its old secret, though it survives because the secret is stored as well.

**D8. Bomber-world is the UI-swap test, and the test has a number for its answer.** The mechanism for owning the look without owning the behaviour already exists and cascaded here: `$ui` in `svelte.config.js`, `core/ui/button` as the paint shim, `core/ui/modal` as the behaviour shim that eleven components use instead of touching the dialog. See jolly-roger `work:work/notes/ideas/swapping-the-ui-kit-under-core.md` (done) and `work:work/notes/findings/the-navbar-is-the-next-composition-root.md` (spotted, four fixes proposed, none done).

**What has never been tested is the paint.** Its two real consumers, bleeps and mandalas, retheme through about a hundred CSS custom properties and modified zero vendored shadcn files, and the idea note names that as the ceiling: colour resolves to variables, while shape, rhythm, elevation, motion and type are hardcoded Tailwind utilities inside each component (telling detail, `--radius` is themable and both left it at the inherited value). The `$ui` swap itself was verified against a throwaway kit. A 9-slice sprite kit with bitmap fonts (`~/Documents/Etherplay/Assets/Nil/Assets/UI`: box, button, inputbox, scrollbar, counters, four bitmap faces) is the first consumer that **cannot use the mechanism both existing consumers used**, which is what makes it a test of the seam rather than of a theme.

Four things it should stress, stated as predictions so the test can falsify them:

- **The contract's currency is Tailwind classes, and a sprite kit has no use for them.** `class` passes through as the styling channel and `size="icon"` means `h-9 px-4` rather than a different sprite. Expect the contract to need a channel that is not a class string.
- **There are TWO UI paths and only one of them is this seam's business.** World-space UI is painted by pixi and belongs to the game world or sits on top of it (an arrow showing the avatar's path); app-space UI is DOM, Tailwind and CSS (modals, instructions, the HUD). The discriminator is whether it is in world coordinates and moves with the camera, and reveal-or-die already draws the line that way in practice: HUD, d-pad, tutorial, death notice and purchase modal are `.svelte` against the UI kit, while avatars, terrain and walk animation are pixi. Only the second path goes through `$ui`; the first is the render seam and is already parameterised. Worth stating in the template, because a game author who puts a path arrow in the DOM or a modal in pixi has made a mistake that is expensive to unwind later.
- **The CSS path needs its images WARM, not gated.** This was written here as a load gate and that was wrong: sprites behind `url()` load on demand, so the risk is a modal opening onto unpainted boxes, which is a latency problem rather than a startup one. The template already has the mechanism, so this is configuration rather than invention: the service worker precaches `build` plus `files` when `OFFLINE_CACHE` is `all`, and Vite emits CSS-referenced images into `build`, so the chrome sprites are local from the second visit and the first open is instant even offline. What that does not cover is the first visit before the worker installs, where a `link rel=preload as=image` for the handful of chrome sprites closes the gap. Bitmap faces want the same treatment plus `font-display: block`, because a pixel font swapping in after paint is more jarring than a brief blank.
- **Behaviour must survive the repaint.** The acid test is a sprite-painted modal that still passes escape, focus restore, portal layer and stacking, because a hand-rolled game modal loses exactly those first.
- **The navbar is where it will actually hurt.** Every descendant rewrites it, it conflicted in both bleeps and mandalas with no automatic resolution, and the sending-pulse guarantee is promised in `ui/in-flight/sending.ts`, kept in `navbar.svelte` and tested only in a suite that every game deletes. A game with an immersive UI is the most likely repo to drop it silently.

**A hole found while checking that the seam had reached here.** `web/src/lib/core/ui/confirm/ConfirmationModal.svelte` does not exist in jolly-roger: it is this repo's own addition to `core/`, which HANDOFF decision 6 says stays jolly-roger's and mergeable, and it imports `$lib/shadcn/ui/button` directly. It is the only such import left in `core/` in this tree, jolly-roger's `core/` has none, and it is a modal. Nothing catches it, because `$app/*` has `framework-boundary.test.ts` while the UI-kit boundary has prose. Fix both halves: move or upstream the file, and add the boundary test in the shape of the existing ones.

**Where each piece lives**, by Decision 2's test: the mechanism (contract narrowing, `$ui`, the `AppShell` chrome handles, the extracted account-cluster marks) is everyone's and goes upstream; the sprite kit is bomber-world's brand and stays there. The template must not depend on those assets.

**Acceptance is a measurement, because "revamp the UI" is otherwise unbounded**: zero modified files under `web/src/lib/core/` and zero edited vendored shadcn files in bomber-world; the modal behaviour suites green with the sprite kit installed; and a cascade run afterwards with its conflict events counted against the `with/hosted-account` shape (3 events in 24 merges). That number is the real deliverable: what a full UI revamp costs per cascade, measured instead of feared.

**It depends on D3.** Bomber-world cannot be the test until it is current, so the re-sync comes first, and this is the second thing that re-sync buys. **D3 is done (2026-09-26)**, so this is unblocked once bomber-world is pushed. One thing the port found that this phase will meet: the HUD now carries two bomb buttons, and the delayed bomb has no framework intent (`work/notes/observations/controlintent-has-four-intents-and-bomber-world-needs-more.md`).

**D9. The derived secret comes from the SIGNER, and recovering the round is two halves on opposite sides of the seam.** Decided 2026-09-07 while scoping Phase 1, because the first version of that item read as if restoring `makeSecret` were the whole job. It is not, and the part that is missing is the part that costs the stake.

**It derives from the local signer, and that is safe because the signer is itself deterministic.** Sign-in derives it from a signature over an origin-scoped message the wallet produces locally (jolly-roger `core/connection/remote.ts`, and `mode.ts` for why `TARGET_STEP` is the only line that decides whether a signer exists at all), so the same account signing in again derives the same key, on any device. That is what makes signing with the SIGNER as recoverable as signing with the account while costing no prompt, which is the whole reason not to reach for the account: a wallet prompt per commit is the thing the local signer exists to remove.

Name the assumption underneath it, because it is silent when it fails: **this rests on the wallet's signature being deterministic.** secp256k1 with RFC 6979 is, and that is what wallets do, but a wallet that randomises its nonce, or a contract account signing through ERC-1271, derives a different signer on the second device and therefore a different secret. There is no error in that case. The symptom is a reveal that cannot be produced and a stake that is gone, which is the most expensive possible way to find out, so a game shipping on this should check the signer address it derived rather than assume it.

**Recovering the ACTIONS is the GAME's, and it may legitimately be a brute force.** The chain holds a hash, so in general the actions are not recoverable at all; but where a game's action space is small enough to enumerate, holding the secret makes the commitment openable by search. reveal-or-die is exactly that case (three steps over four directions, plus an exit). So the seam splits the way everything else here does: **the framework recomputes the SECRET, because `makeSecret` is deterministic; the game recovers the ACTIONS, because only it knows whether its space can be enumerated and how.** Where it cannot, "recoverable" honestly means "a device that still has the plan", and the framework must say so rather than implying more.

**The sharp corollary, and it is the reason to write this down rather than leave it as an implementation note: recovery-by-enumeration and D7's leak are the SAME computation.** Enumerating a small action space against a known secret and a published hash is exactly what makes the hiding property vanish when two identities share a secret, and it is exactly what lets a player reopen their own commitment after clearing storage. What separates the two is only who holds the secret. That is D7's argument for domain separation arrived at from the other end, and it is a stronger form of it: the moment an account's identities share a secret, one player can run another's recovery, using code the game shipped on purpose.

**Migration is not a constraint.** Nothing on this stack has a live deployment with users, so the derivation may change freely and no design effort goes on carrying an in-flight round across the change. D7 hedged on this ("land it before anything has a live deployment depending on the old message"); the hedge is spent, and the window is now rather than conditional.

**Built 2026-09-07; one thing the build settled that the decision left open.** The message needs a CANONICAL SPELLING for each of its parts, which is not a detail: it is a third silent failure alongside the two D9 already names. The address is lowercased, a bigint identity is decimal, an address identity is lowercased. Anything that changes the TEXT changes the signature, changes the secret, and loses the round, with nothing raised anywhere. `game/core/secret.ts` normalises once, at construction, and says so at the line that does it.

**D10. The round RECONCILES WITH THE CHAIN. It is not a storage-recovery feature, and it is one method on the framework.** Decided 2026-09-07, after the derived secret landed and the acceptance criterion it was supposed to satisfy still failed.

**The name was the problem.** "Surviving cleared local storage" sounds like a 24h-mode nicety. But a cleared browser, a second device, a second browser, a private window, a reinstall and a storage write that silently failed all produce the IDENTICAL state: the chain holds a commitment this browser knows nothing about. A second device is not a mode, so this is not a mode's feature.

**The discovery already happens and is thrown away.** `missed-reveal.ts` already reads `getCommitment(player)` and already compares it to the current epoch, and the live case is one branch that sets `Clear` and returns, because the only question it was ever asked was "am I blocked?". Nothing new has to be fetched. That is the whole reason this is affordable, and it is why the work is not a subsystem.

**The too-late case needs NOTHING, which was checked rather than hoped.** `epochDuration = commitPhaseDuration + revealPhaseDuration`, with no trailing segment, so a commitment in the CURRENT epoch is always still openable: you are either in the commit phase or in the reveal phase. The moment the reveal window shuts, the epoch has advanced, and the existing `missed-reveal` path reports `Blocked` and offers the settlement the player presses for themselves. So "too late" is already built, and the only gap is the LIVE epoch.

Worth keeping the general form even though it costs nothing here: **too-late is a function of WHEN the loss happened relative to the reveal window, never of the mode.** A 24h game wiped ten minutes before its deadline is exactly as stuck as a three-minute one; the mode only shifts the probability, so nobody can configure their way out of it.

**The actions come from one of three places, and the HASH judges all three.** The secret is recoverable now; the plan is not, because the chain holds only a hash.

1. **Local storage still has it** - the ordinary reload, today's path.
2. **The game ENUMERATES it.** Available only where the action space is small, and the cost runs OPPOSITE to the time available, which is what lets one mechanism serve both modes: a fast game has a small space precisely because that is what makes it fast (reveal-or-die is three steps over four directions plus an exit, about 125 candidates), so enumeration finishes inside a short reveal window with no player present. A slow game has a large space and hours to ask.
3. **Ask the PLAYER**, and let the hash decide. They usually remember what they planned; they re-enter it through the planning UI that already exists. This is the general route and it is better than it sounds: it cannot be abused, since you cannot "recover" a plan you did not commit and the hash simply refuses it, so exposing it grants an attacker nothing; it is action-space-independent, so it serves conquest as well as reveal-or-die; and it degrades to exactly today's outcome, except that the player was TOLD.

**ISOLATION IS A REQUIREMENT OF THE DESIGN, not an aspiration.** The naive version touches the round's state machine, every consumer that switches on `RoundState`, the seams, the missed-reveal store, the UI and the composition root. Instead:

- **The framework gains ONE method: `round.adopt(persisted)`**, which is the body of the existing `restore()` taking a `PersistedRound` from somewhere other than storage. **No new `RoundState` member**, because there is nothing new to represent: a reconstructed round is a restored round, and the round must not be able to tell the difference.
- **Everything else is the GAME's and lives in the game's own directory**: the chain read (already there, in `missed-reveal.ts`), the enumeration if it has one, and the re-enter UI if it wants one. The framework grows no chain reader, no modal concept and no enumeration budget.
- A game that wants none of this wires none of it, and pays nothing.

The check is `adapter.buildCommitment({actions, secret})` against the chain's hash, which already exists and needs no helper.

**Do not pre-build the 24h answer here.** For a genuinely long round the real defence is the SCHEDULER: `commit()` already hands `secret`, `epoch` and `revealDueAt` to whatever will reveal, so a fuzd-backed game survives a wiped browser completely because the payload left the device at commit time. Reconciliation is the BACKSTOP for when there is no scheduler, and Phase 5 is where the scheduler lands.

**D11. The RENDERER becomes a branch axis: `main` carries no rendering library at all, and pixi earns a node with the art pipeline on it.** Decided 2026-09-07, while scoping the asset-pipeline row of Decision 2. It changes Decision 1's tree, Decision 3's target and Phase 2's order, which is why it is a decision rather than an item.

```
template-commit-reveal@main          seam + immediate/canvas2d host, no render library
├─ stratagems                        (twgl, supplies its own third host)
├─ with/pixi-js                      pixi + assetpack + one sprite
├─ with/nft-identity                 identity is a token; acquisition proven
└─ with/all                          the single integration branch
   ├─ reveal-or-die ──▶ bomber-world
   ├─ catacombs
   └─ conquest-v1
```

**The deciding number is 79M.** That is `pixi.js` installed, and D1's rule for when a branch is worth its merge tax is install and CI rather than bundle size: *"a capability that is only code costs them nothing that a dynamic import does not already solve."* The canvas is already dynamically imported, so bundle size was solved long ago; the install was not, and it is the largest single cost in the tree. `@assetpack/core` alone is 1.1M and does NOT clear that bar, which is why it is not its own branch.

**assetpack has no meaning away from pixi, so they are one node rather than two.** Both existing copies use `pixiPipes` and emit a pixi spritesheet manifest, which a twgl renderer cannot read without somebody writing a second reader. A `with/assets` branch would also have to chain with `with/nft-identity` for every real consumer, coupling an ART PIPELINE to an IDENTITY branch - orthogonal axes, and exactly the lattice Decision 4 exists to prevent.

**It also fixes an unexercised region that is larger than the two already recorded.** `placement/render/index.ts` selects pixi and carries canvas2d as a commented-out alternative at the bottom, so today:

| | lines | consumer today | consumer after |
|---|---|---|---|
| `canvas2d/` + `draw.ts` + `board-immediate.ts` + `immediate.ts` | 405 | **none** | `main` |
| `stateful.ts` + `reconcile.ts` (pixi-free) | 370 | `main` | `with/pixi-js` |
| `pixi/` + `board-renderer.ts` + `CellObject.ts` | 396 | `main` | `with/pixi-js` |

Read that carefully, because the tempting summary is wrong. It is NOT "both renderers become exercised on main". It is that **every line becomes exercised on some node**, where today 405 of them are exercised on no node at all - four times `keys.ts`/`gamepad.ts` and `commitWhenIdle` put together, and never counted alongside them because nobody had looked.

**`stateful.ts` and `reconcile.ts` STAY on `main` and are exercised one node down. That is correct and must not be "fixed".** They import no pixi and they are the diffing logic every scene-graph host shares, so `main` is where a second one (three.js, or the twgl games) would find them; `reconcile.ts` also still has an open backport against it (`values()`, from reveal-or-die's list). Shared machinery exercised by a feature branch rather than by the base is the normal shape of a fan, not a smell.

**Why this was not obvious, and the correction worth recording:** the asset pipeline was scoped as a Phase 1 backport to `main`, on the reading that a template whose example has no art never proves the pipeline. That reading is right and its conclusion was wrong, because it was made without pricing the install or noticing that the row's real prerequisite is pixi. The first version of the analysis also said `@assetpack/core` "drags a build step" and therefore earned a branch; it does not, because **both existing copies already self-disable** with `existsSync(ASSETS_FOLDER)` and write an empty manifest when there is no art. Two authors designed for the no-art case independently.

**What earns the node is that the pipeline has already been written twice.** `reveal-or-die/web/vite.assetpack.ts` is 139 lines and `conquest-v1/web/vite-assetpack.ts` is 117, independently authored, both reaching the same two workarounds: the `/assets/` prefix rewrite for `pixijs/assetpack#148`, and an empty manifest so a fresh clone type-checks against a gitignored file. That is the tripwire firing across a repo boundary, and Decision 1's own trigger for earning a node ("if a second game wants the same combination") was already met before this was scoped.

**THE MOVE'S SECOND HALF IS BLOCKED, and this is the one place this phase could not obey Decision 2's own rule.** "A backport is a MOVE, not a re-implementation, and the descendant's copy is deleted in the same change" - but the deletion is only safe once the descendant INHERITS the thing being deleted, and neither descendant does or can yet. reveal-or-die stems from `main` until the re-point at the end of Phase 2, and conquest stems from jolly-roger directly and does not join this tree until its own port. Deleting their copies now would not move anything; it would remove a working art build from a finished game.

So the tree holds two copies for the length of Phase 2, deliberately and with the trigger named, which is the distinction Decision 2 actually draws: a re-implementation is indistinguishable from a move *until somebody diffs it*, so the answer is to make the diff SCHEDULED rather than to hope. The exact deletion list and the trigger (the `stemBranch` re-point, in the same commit) are in `work/notes/observations/the-asset-pipeline-move-cannot-complete-until-the-repoint.md`.

**What was landed is a reconciliation and not a third writing**, and the branch's copy records at each line which of the two it took and why: conquest's `fixManifest` (it copes with an `src` that is not an array; reveal-or-die's would throw), reveal-or-die's explicit output folder (conquest derives it from vite's `publicDir` by string-replacing `process.cwd()`, which is the more fragile half), and a self-disable moved into the plugin, which cut the shared `vite.config.ts` edit from four lines to two - and then to NONE, because the underlying problem was fixed at the root of the tree the same day (see below). **Reconciling them introduced one real bug and `check` caught it**: the first version wrote the placeholder manifest only when there was NO art, which would have left a fresh clone WITH art as the one that failed to type-check, since the real manifest is not written until `buildStart` and neither `svelte-check` nor `vitest` ever gets there. Both copies it was reconciled from have that right. It is the obvious way round and it is wrong, so the reason is now a comment at the line - and it is the concrete evidence for why deduplication is a careful job rather than a copy.

Four things it costs, none of them hidden:

- **Four verification nodes instead of one**, each running `verify` forever, on gating that Phase 0 only just installed.
- **`with/all` is a real commitment**, and it is this repo adopting the service-layers PRD's shape (a flat fan plus exactly one integration branch) a level down from jolly-roger. The reason to believe it is that it is measured there, which is also where Decision 3's acceptance numbers come from.
- **Phase 2 changes shape.** reveal-or-die needs pixi AND a token identity, so its `stemBranch` points at `with/all`, not at `with/nft-identity` as Decision 1 currently says. Same for conquest when it joins.
- **`main`'s reference game must be ported to the immediate renderer.** Real work, and the valuable kind: it is the only thing that will ever prove that seam.

Two things it deliberately does NOT do:

- **It does not serve stratagems or catacombs.** Both are twgl.js. `main` is "the seam plus the host that needs no install", not "the renderer everyone uses", and those two supply their own third host exactly as HANDOFF decision 5 always intended. So `with/pixi-js` is not "the games branch"; it is one host of three.
- **It does not reopen whether the renderer is a seam.** It stays a seam (decision 5). What moves to a branch is the LIBRARY and its build, not the choice.

**BUILT 2026-09-09.** `with/pixi-js` exists, `main` carries no rendering library, and the three rows of the table below are now the tree's actual shape rather than a proposal.

**The branch's one recorded hazard is gone, and the fix was four repos up.** The sprite pipeline is a vite plugin, so the branch had to wire it into `web/vite.config.ts` - a file byte-identical to jolly-roger's, developed two repos above that, and restructured wholesale in reveal-or-die. That was logged as a permanent conflict site whose structural fix "belongs in jolly-roger". It belonged further up still, and the evidence was that EVERY level had already paid the same tax to say the same one thing: tailwind's entire change to that file was one plugin, shadcn inherited exactly it, jolly-roger carried the same line, conquest-website-2 added `enhancedImages()` with a comment about ordering, and reveal-or-die had restructured the file to get an art build out of the middle of it. Six repos, four independent authors, all putting their plugin in the SAME slot between `devtoolsJson()` and `sveltekit()`.

So `template-svelte` now spreads `extraPlugins()` from `web/vite.plugins.ts` into that slot, and it cascaded to ten nodes. `vite.config.ts` is byte-identical across five repos in the upper group and across `jolly-roger` (four branches), `bleeps`, `mandalas` and `template-commit-reveal` (both branches) in the lower one. `with/pixi-js` does not touch it at all. **The branch's shared-file count did NOT fall - it is still four - and claiming otherwise would be the wrong measurement**: `vite.plugins.ts` replaced `vite.config.ts` on the list, which is the difference between a conflict site and a switch rather than a saving. Details in `work/notes/observations/the-vite-config-is-the-asset-pipelines-conflict-site.md`, including the two design points that turned out to be load-bearing (a function rather than a const array, because the config is evaluated once per vitest project and plugins hold per-build state; and the spread's POSITION being the contract, which two plugins from two repos independently required).

**And the cascade found something nobody had checked:** `bleeps`, `mandalas` and `ronan-eth` had no `offshoot` config and therefore no `verify` command, so the fanout merged into all three completely ungated. That is Phase 0's own finding recurring in three repos. **Fixed 2026-09-09**: all three plus `conquest-website-2` now carry one, matching their nearest ancestor's shape (`check` + `test:unit` for the two jolly-roger descendants, `check` + `test` for the two blog descendants), and each command was RUN by hand before being written into a config, because a verify command that cannot pass is worse than none - it blocks every future cascade and teaches people to pass `--no-verify`.

Four things the build settled or corrected:

- **The line counts were exact.** 405, 370 and 396, measured against the files as listed. The table's one imprecision is at sub-file granularity, which a file-level table cannot express: `grid.ts` stays wholly on `main` and is exercised there (`gridLines` by the canvas-2d host, `gridTileCells` by the play route), but its third export `gridTileOrigin` is now consumed only on the branch. It stays for exactly the reason `stateful.ts` does, and now says so at the definition: `grid.test.ts` pins that the tile a retained host slides around lands on the lines the immediate host strokes, so deleting it as unused would remove one side of the only thing keeping two hosts drawing the same board.
- **A fourth unexercised artifact turned up, older and deader than the three the plan tracks.** `web/src/lib/manifest.json` has been committed since the repo's first commit (`d34ad44b`), holding an empty bundle list, and **nothing on `main` has ever imported it** - it was the stub for a sprite pipeline that did not come with it. Deleted on `main` (where it is dead) rather than worked around on the branch (where it is real, generated and gitignored). Worth distinguishing from the `keys.ts`/`commitWhenIdle`/`activeIdentity` count the plan keeps: those are code that runs somewhere. This was a data file no code path had ever read, on any node.
- **The affordability of the branch rests on a route file staying byte-identical, and that is now enforced rather than hoped.** `routes/play/+page.svelte` passes `cellSize` and `gridCells`, which only a scene-graph host uses; the canvas-2d host accepts and ignores them. That looks like dead code and is what keeps the page identical on both nodes - removing it would move the swap's cost into a route both nodes keep developing. `web/test/render-host-boundary.test.ts` binds to whichever host the selector names, so it fails from either side, and it does: dropping `gridCells` from the pixi host fails it on the branch.
- **The sprite has a consumer on purpose.** A pipeline whose output nothing draws would build, emit a manifest and prove nothing, which is the unexercised code this decision exists to remove. `CellObject` draws the tile and keeps the vector fill as the fallback, so a clone without `../assets` still builds and plays and both paths are reachable in an ordinary checkout.

**Sequencing: build it in Phase 2, not before, and do not land the asset pipeline on `main` first.** Creating `with/pixi-js` now and `with/nft-identity` later is two branch-creation exercises and a `with/all` that changes shape halfway through; landing assetpack on `main` now means adding a devDependency, a source-art folder and a sprite and then moving all three onto a branch, which is writing it twice in slow motion. Phase 1 continues meanwhile on the items that are renderer-agnostic either way: the epoch countdown and the board handover are DOM and plain stores. **Both are now done, and with them every row of Decision 2's list except the asset pipeline, which is this decision's own.** So Phase 1's backport list is closed and Phase 2 is what is next.

**One claim to verify rather than trust when it is built:** the canvas2d host is REPORTED to work, from having been swapped in at some point. Nothing imports it, no test covers it, and it has drifted through every render change since. Verify it by porting the reference game onto it, which is the work anyway.

**VERIFIED 2026-09-09, and the expectation was wrong in the useful direction: it worked.** Not one line of `Canvas2DCanvas.svelte`, `draw.ts` or `board-immediate.ts` had to change for the reference game to play on it, and the e2e suite ran 51 of 51 with no retries on the immediate renderer, clicking real cells on a real board against a real chain. The drift the warning predicted had not happened, and the reason is visible in the history: the render seam's one breaking change since (`d2568a0b`, `Frame.delta` -> `deltaMs`) landed BEFORE the host was written, and the only later change to the shared frame arithmetic was that same rename.

**So "reported to work" was true, and being right about the code did not make the warning wrong.** The three files had no test and no consumer, and looking for the evidence is what found the actual defects - none of which a swap alone would have revealed:

- **`createImmediateRenderer` leaked its subscription on stop, and all ten tests of its own file passed with the `unsubscribe()` deleted.** One leaked listener per visit to `/play`, holding a closure over a dead surface. The stateful renderer cannot hide the same bug, because its subscription calls add/update/remove and a leak therefore shows; the immediate one's callback only writes to a local, and after a stop `tick` returns early anyway, so a leaked listener changes no behaviour whatsoever. **A pure resource leak is invisible to a behavioural suite by construction.** Sharpest detail: `immediate.ts`'s own doc comment predicted this exact bug and attributed it to somebody else ("one of them would get it wrong by forgetting to unsubscribe"), so the framework absorbed the hazard without absorbing the test for it. The general rule worth keeping: **when a module justifies its existence by taking over a hazard, that hazard is the first thing its suite should assert about it.**
- **Culling is invisible to a pixel test.** Canvas silently discards an out-of-range `fillRect`, so a board that culls and one that does not are byte-identical on screen; removing the culling passed all six of the new pixel tests. It is the only logic in `board-immediate.ts` that is not a drawing call, and what it changes is WORK, so it is pinned by counting calls against a recording context instead. This is why that file has two test files rather than one.

Eleven mutations were run in all, and the four that initially survived are the phase's real yield: two of them exposed flaws in the new tests themselves (a fixture whose two cells shared a key, so the Map deduped them; and a test named "before the state loads" that set an empty LOADED board and never an Unloaded one). **That is five phases running in which mutation found a gap a green suite was hiding.**

**reveal-or-die's enumerating recovery is DONE, 2026-09-08**, which closes the item opened below it and corrects two things this document said.

**The action space is four orders of magnitude bigger than D9 and D10 claim, and the claim is now a measurement.** Both say "about 125 candidates (three steps over four directions, plus an exit)". Every deployment of that game carries `numMoves: 10`, which the rule alone would make a million walks. What saves it is the MAZE rather than the move limit: the degree histogram over a 33x33 window is 104 cells with one way out, 292 with two, 100 with three and 52 with four, so a ten-move turn from a floor cell is **3,000 to 16,000 candidates**, at about **85 microseconds a hash** - a few tenths of a second, up to a little over one. The estimate was not merely stale, it was derived from a move limit the game has never shipped with.

**So enumeration needs a budget, and the budget is the game's** - which is the one part of D10's three prohibitions that this item was always going to test. Those numbers are that map's, and the rule permits an open chamber where they are a million and ninety seconds. The search caps at 60,000 candidates, yields to the browser as it goes, and degrades to the route the reference game uses for everything. Giving up is not a failure: it establishes that this is not the cheap case.

**SHORTEST FIRST is what makes it fast rather than merely possible**, and it falls out of something already in the plan. The EMPTY turn is tried first because `commitWhenIdle` commits one every epoch to keep an idle avatar alive, so it is much the commonest single candidate; short walks follow. A player who took one step is recovered in a handful of hashes, and the thousands are only enumerated when the answer is not there at all.

**AN ENTRY IS NOT SEARCHABLE, and that is a property rather than a gap.** An avatar out of the world enters at any non-obstacle cell on an unbounded map. So the game supports both of D10's routes rather than replacing one with the other, and the HUD says something different for that case, because telling a player to "re-enter the same moves" describes moves they never made.

**The search is an ORACLE, not an authority.** It hands what it finds back through the framework's `offer`, so the single place that checks a candidate against the chain's hash is still the only place that adopts and a bug in the search cannot put a wrong turn into a round. Pinned by mutation.

**D10's "the framework gains exactly ONE method" did not survive the second consumer, and the rest of it did.** The offer-and-check store is identical in both games down to the two silent failures, so it is `game/core/recovery.ts` now. Every one of D10's three prohibitions still holds - no chain reader, no modal, no enumeration budget - which is the test it passes rather than an exception to it. The reference game's own part is now wiring, which is the honest outcome for a game with nothing to enumerate.

**The e2e asserts a NEGATIVE, which is the whole feature**: after the round's record is destroyed and the page reloaded, nothing touches the page - no click, no key, no button - and the round comes back and reveals itself.

## The nonce guard was blind, and two suites were racing behind it

**`web/test/e2e-account-claims.test.ts` read one `walletAccountIndex` per FILE**, because it used `match` rather than `matchAll`. Every claim after the first in a file was invisible to the check that exists to stop two e2e suites sending from one burner account, and the file most likely to hold several is exactly the one where it matters: suites that need their own account are the ones that send transactions.

Two real collisions were behind it, and only one is this session's. **`game.e2e.ts`'s missed-reveal suite has been on account 1, the CONTRACTS suite's, since it was written** - its own comment says "the contracts suite uses index 1" and then takes it. Both suites now have accounts of their own, which needed two more entries in `impersonate-addresses.json`.

**Not claimed as the cause of the parallel flake, and worth being careful about.** Two suites sending from one account race for a nonce, and a lost transaction is the family of symptom the flake note describes, so this is a plausible contributor that is now removed. But that note's own measurement says LOAD, not worker count, and nothing here was measured against it. It is a hypothesis with a mechanism, not a fix.

**The cascade caught a bad test one merge after it was written**, which is the cheapest possible demonstration of why the descendants are in the tree. The fix's own self-check asserted that some suite file claims more than one account - true of the template, whose game suite holds three, and false of reveal-or-die, where the parent's suites are deleted and each file holds one describe. It failed on the first merge down and was fixed upstream so the descendant inherits something true, rather than patched locally.

## Opened by Phase 1's last item, and deliberately not done

Two pieces of work fall out of D10 rather than being left over from it. Both are named here so nobody re-derives them, and neither is Phase 2's.

**~~reveal-or-die's recovery, which is the ENUMERATING one.~~ DONE, 2026-09-08.** See the write-up above: it needed a budget, it corrected D9's estimate by four orders of magnitude, and it does what was predicted of it - the player is asked nothing, because the app works the turn out for itself.

**A cross-repo shared-divergence check.** N6 adopts jolly-roger's `tooling` branch to run `check-shared-divergence.sh` between a base and its feature branches, in ONE repo. Both instances of the failure it is for have now happened ACROSS a repo boundary instead - the input recognisers, and the two refresh helpers found this session - where nothing looks. The trigger for building it has fired twice; what it needs is a mode that diffs a descendant against its stem, which is a smaller thing than the branch machinery it would live beside.

**N6's in-repo half is DONE, 2026-09-09, and its first real run is green.** `tooling` is adopted here as a local orphan branch from `stem/tooling`, verbatim. Against `with/pixi-js`: 16 shared files under the render paths and **367 across all of `web/src` and `web/test`, none drifted**, with `placement/render/index.ts` as the single `ALLOWED` entry - the exact analogue of `mode.ts`/`TARGET_STEP` upstream. The run worth keeping is the one with `ALLOWED` empty, which correctly names `index.ts` as the only drift and so proves the 367 are clean because they are identical rather than because the script matched nothing.

Two things that run taught, neither of which changes the conclusion:

- **The script compared `.ts` and nothing else**, by a hardcoded `grep '\.ts$'`, and said why: apps are expected to restyle their own wallet flows. That is right for a connection layer and does not transfer to a RENDER branch, where the shared files that matter include `routes/play/+page.svelte` and the canvas hosts, and where the branch's whole affordability rests on that page being byte-identical. It had to be checked by hand the first time - 158 shared `.svelte` files, none drifted. **Fixed upstream the same day** (jolly-roger `tooling@80a18e1`): `EXT` is a space-separated list defaulting to `ts`, so jolly-roger's behaviour is unchanged and this repo's ritual watches `ts svelte`, covering 530 shared files instead of 367. Done on jolly-roger's branch rather than on the copy adopted here, because a local edit to an adopted tool is the same divergence-by-copy the tool exists to catch, one level up - and it was pulled back with the documented one-line rebuild, which tested that instruction too. Checked for teeth: a deliberate drift in that shared route is named with `ts svelte` and invisible without it.
- **It cannot see a DELETION**, which is the shape that actually bit this phase. It compares files two branches SHARE, so a file deleted on one side and still imported on the other is invisible to it - which is exactly what makes `main` unmergeable into reveal-or-die right now. Same lesson as its own README states ("conflicts get attention, clean auto-merges do not"), in a variant the script does not cover.

On cost, for whoever builds the cross-repo mode: the widest run compared 367 files in well under a second, so the diffing is not the expensive part - the ref plumbing is.

## The vocabulary is decided, AND THE CODE HAS NOW MOVED (2026-09-17)

**ADR-0001 (this repo's `work` branch, and the first ADR this repo owns) settles what the words are**, and `CONTEXT.md` at the root carries them to every game that scaffolds from here. The interval is a **cycle**, its halves are the commit and reveal phases, what a player submits is **actions**, and one player's pass through a cycle is a **submission**. `round` and `turn` are reserved for games and the framework uses neither.

**The rule it produced is worth more than the words: name the MECHANISM, not the EXPERIENCE.** The mechanism is the framework's and is identical in every game; the experience is the game's and is not. This template already refuses to name the identity, the stake, the renderer and the actions, and its vocabulary now refuses in the same places. The concrete case that decided it: a duel of five rounds, each round several commit-reveal exchanges, is an ordinary game to build here, and a framework that had taken `round` would have put the collision in that author's own file.

Two things this document said that the ADR corrects. `epoch`'s worst problem is not the beacon-chain collision, it is that the programmer sense of the word is a TIMESTAMP while the code uses it as an index, in expressions that hold both (`epoch = floor(timePassed / epochDuration) + 2`). And "the epoch maths appears character for character in all five contracts" was read here as evidence that the word is natural; it is not, because the five share one author, so it is one habit propagating rather than five people agreeing.

**No code moved with the decision, deliberately**, and the staging was three tasks: the tool (`rename-a-term-across-a-repo`, on jolly-roger's `tooling` branch, because six repos each rename once, months apart), this repo's four steps (`the-vocabulary-rename`, wire names first because they are the only part that ages while nothing is deployed), and the games (`vocabulary-in-the-game-repos`, which decides that a game still awaiting a port renames INSIDE the port rather than in a pass of its own).

**THE FOUR STEPS ARE DONE, 2026-09-17, on five nodes** (`main`, the three branches, and reveal-or-die), plus a fifth commit that settled what the reference game calls things to its PLAYERS. `the-vocabulary-rename` is in `work/tasks/done/`. The wire says `cycleNumber`, the shared interval is a `cycle`, one player's pass is a `submission`, and the player-facing copy says `turn` for the pass and `cycle` for the interval, which is the first time `CONTEXT.md`'s reservation has been exercised. No suite count moved at any node, and `grep -ri epoch web/src contracts/src` is down to two deliberate survivors, each named in `AGENTS.md`.

**The tool was NOT built, and the plan allowed that.** Steps 1 and 2 were the pilot that was supposed to decide whether to build it; they decided against, and all four steps were done by hand. What that bought instead is five repos of evidence about what such a tool would have to do, written into `rename-a-term-across-a-repo` rather than lost. The short version, because it changes what is worth building: **every single thing that went wrong was caught by a human reading a diff or a reviewer reading a call site, never by a gate.** That argues for the `report` and `verify` halves and against ever letting `apply` decide anything.

**Three claims in the staging turned out to be wrong, and each is corrected where it was made.** `roundTone` was listed as the shared interval and is the per-player sense, which two documents got wrong and only a human reading the call site caught. The persisted record was to get a MIGRATING read, and there was nothing to migrate: nothing is deployed, and a game built from this template cannot hold a record written by a previous build of the template. And the acceptance's idempotence check ("re-run the mapping and confirm it is a no-op") is unsatisfiable, because a sweep with judgement-based exceptions never reaches a fixpoint.

**`vocabulary-in-the-game-repos` is now unblocked** and deliberately not started: its own gate is `grep -ri epoch web/src contracts/src` on this template being clean, which it is.

**Until each game is ported the tree holds both words**, and that is expected rather than drift: `CONTEXT.md` cascades and contracts do not, so a descendant full of `epoch` means that game has not been ported. `AGENTS.md` says so, because otherwise the first reader concludes the glossary is stale.

## What is deferred, and by whose decision

Nothing in the design above is waiting on an answer. What is outstanding is deferred on purpose, and each item names the event that reopens it.

- ~~**Whether this template ever stems from jolly-roger's `with/all`**~~ **DECIDED 2026-09-18: IT DOES, and the branch is called `integration` rather than `with/all`.** The trigger named here was "a second game wants the same service layer"; what actually fired was different and worth recording, because it is a shape this list should expect again. The embedded chain is a capability this template needs and hosted sign-in is one it does not, so the template needs a COMBINATION of two of jolly-roger's branches - and `stemBranch` is a single string that cannot be combined with `stem`, by design and with a hard error, so a descendant cannot integrate two parent branches itself. **The integration node is forced by the tool, not chosen for convenience.** Note this remains a different question from D11's integration branch, which is THIS repo's own over its own two axes; the two are one level apart and neither implies the other.
- **Several identities per account** (D6). Reopens with conquest's port, which is the only consumer; the two architectural rules are kept meanwhile so it stays cheap.
- **Stratagems and catacombs beyond compiling** (Decision 1). Reopens if a cascade breaks their build, which is the point of having them in the tree.
- **What a game's deliberate exit costs**, where the game has one (D5). reveal-or-die's exit tile answers it for reveal-or-die; conquest's and catacombs' are theirs to design.
