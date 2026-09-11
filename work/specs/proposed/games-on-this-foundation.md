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
| `bomber-world` | `reveal-or-die@main` | **1067 commits behind.** Different layout (`onchain/evm`, not `contracts`). |
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

And after `with/all` and the re-point, which are Phase 2's last two nodes and close the phase:

| suite | template-commit-reveal | reveal-or-die |
|---|---|---|
| `contracts:test` | 19 on `main` and `with/pixi-js`, **21 on `with/nft-identity` and on `with/all`** | 14, unchanged |
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
├─ with/indexer, with/webevm                    (service-layers PRD: stem main, no signer needed)
└─ with/local-signer
   ├─ with/hosted-account, with/messaging, with/sync
   ├─ with/notifications        stem: [with/indexer, with/local-signer]
   ├─ with/all                  the single integration branch
   │
   └─ template-commit-reveal@main              framework + address-keyed reference game
      │                                        (stratagems' identity shape)
      ├─ stratagems                            dormant, compile-only member (twgl)
      ├─ with/pixi-js                          pixi + assetpack + one sprite (D11)
      ├─ with/nft-identity                     identity is a token; acquisition proven
      └─ with/all                              the single integration branch (D11)
         ├─ reveal-or-die  ──▶ bomber-world    dormant, compile-only member
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
| **World** | remote persistent / remote LAN / embedded in the tab | client wiring: a world is a CONTEXT, an identity is a CONNECTION | designed, not built. `jolly-roger:docs/worlds-and-identities.md` (on the archived `variant/offline` branch) names the one unlocking change: `createContext` takes its connection as a parameter. `with/webevm` is Wave 1 of the service-layers PRD |
| **Membership** | open entry / closed roster | **contract**, plus a lobby | nothing anywhere. The lobby is not only roster formation: it is where everyone is PROVISIONED (account funded, identity acquired) before the game starts, which is what makes a closed roster possible at all |
| **Epoch advance** | fixed timer / timer with early advance / unanimity only | **contract** (`_epoch()`), and the client's epoch store | prototyped in bomber-world: `ManualEpoch` state, `_moveToNextEpoch`, `_moveToNextPhase`. Its two TODOs are exactly the missing work |
| **Reveal agency** | this browser / scheduler / fallback / third party | seam, done | `autoReveal` is a three-way and `commit()` already carries secret, epoch and `revealDueAt`. No fuzd adapter in this lineage yet (`with/fuzd`, Wave 4) |
| **Identity** | address / token / token plus controlling entity | type parameter, done. **Acquisition has no seam** | Decision 1 above |
| **State source** | poller / indexer / local simulation | seam, one implementation | indexer adapter unwritten; `with/indexer` is Wave 1 |
| **Opponents** | humans / NPC keys / hotseat | client: several ACCOUNTS against one world | the worlds doc's cheap case: a world gets a context, an identity gets a connection |

### The contract side is cheaper than it looks

`_epoch()` in bomber-world is already `virtual` and already dispatches between a stored `ManualEpoch` and the timed formula. So the shape is proven: **epoch policy is one overridable internal plus a small piece of stored state**, not a fork of the game contract. What is missing is the hybrid (timed with early advance), and the membership count it needs.

One thing in that prototype does not survive. `SKIP_COMMIT` (skip the commit phase entirely, derived from both phase durations being zero) is **dropped rather than formalised**. It was hotseat's mechanism and hotseat has a better one (D4), which leaves it with no consumer: catacombs commits against randomness rather than against opponents so it needs commitments even solo, and the other four games are PvP. Keeping it would mean a second resolution path through the round, forever, for nobody. Development and testing do not justify it either, since a test that skips the commit exercises a path nothing ships. The bomber-world port therefore keeps manual epochs, drops the commit-skipping, and stops deriving one from the other; conflating them is what made it look like a mode.

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

**Phase 1: raise the floor.** The backport list in Decision 2, one change per item, each with the descendant's copy deleted in the same change. One fix belongs here rather than in a mode: **reveal-or-die supplies no `makeSecret`, so its secret is 32 random bytes living only in local storage.** Bomber-world, which is the pre-port code, still derives it from a signature (`Commit:${chainId}:${contract}:${epoch}`, `lib/private/localState.ts`), so the port dropped a capability and `HANDOFF.md` still records reveal-or-die as having it. In a game whose stake is the avatar's life after three missed rounds, clearing site data mid-round costs the avatar. Restore it through the seam. **D9 settles what it derives from and what recovery actually means; read it before starting, because the twelve lines that restore the secret are not the piece of work.** Acceptance: reveal-or-die's diff against this template shrinks to its game and its brand, the count of inherited files it modifies stays at or below today's ten, and a round survives clearing local storage between commit and reveal - which, per D9, means the game supplies the action half of the recovery as well as the framework supplying the secret half.

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

**Phase 3: the epoch becomes a policy.** Formalise bomber-world's `_epoch()` prototype: timed, manual, timed-with-early-advance, plus the waited-for count, and drop `SKIP_COMMIT` rather than carrying it. Advancing is its own permissionless conditional call (C5). On the client, `EpochInfo` gains the hybrid, whose value is READ from chain with the clock as a local predictor rather than computed. Do this before any mode is built on it: the pure-arithmetic epoch appears character for character in five contracts and every client, and retrofitting after three ports is the expensive version. Acceptance: the reference game runs under all three policies, and the order-independence replay test passes under each.

**Phase 4: worlds.** `createContext` takes its connection as a parameter in jolly-roger (small, already designed), then an embedded world in the reference game. Acceptance: the reference game plays a full round against a chain in the tab, and the chrome names the world it is describing rather than the one it assumed.

**Phase 5: the long cycle.** `with/fuzd` here, proven on a 24-hour deployment of the reference game, including C3 and C4 under an early advance. This is the mode three of the five games need and the one with the least evidence in this lineage: catacombs' fuzd plumbing is fully written and never called.

**Phase 6: the rest of the matrix**, in the order that shares the most: closed roster, lobby and forfeit, then hotseat, then NPCs. Hotseat's prerequisites are smaller than they looked (D4): turn order, nonce serialisation across the accounts one device is sending for, and provisioning at the lobby. Storage needs nothing, which was checked rather than assumed: the round keys by `${chainID}_${gameAddress}_${player}` and the operations ledger appends the account to its scope prefix, so several local players already do not collide.

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

**D3. Bomber-world is not retired.** It descends from reveal-or-die and is the cheapest of the ports, so it re-syncs during Phase 1 rather than being written off. Budget one specific cost: its layout predates the convention (`onchain/evm/`, not `contracts/`), so the merge carries a rename as well as a diff.

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

**It depends on D3.** Bomber-world cannot be the test until it is current, so the re-sync comes first, and this is the second thing that re-sync buys.

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

## What is deferred, and by whose decision

Nothing in the design above is waiting on an answer. What is outstanding is deferred on purpose, and each item names the event that reopens it.

- **Whether this template ever stems from jolly-roger's `with/all`** (D1). Reopens when a second game wants the same service layer, which is also the trigger for earning a combination branch at all. Note this is a different question from D11's `with/all`, which is THIS repo's own integration branch over its own two axes; the two are one level apart and neither implies the other.
- **Several identities per account** (D6). Reopens with conquest's port, which is the only consumer; the two architectural rules are kept meanwhile so it stays cheap.
- **Stratagems and catacombs beyond compiling** (Decision 1). Reopens if a cascade breaks their build, which is the point of having them in the tree.
- **What a game's deliberate exit costs**, where the game has one (D5). reveal-or-die's exit tile answers it for reveal-or-die; conquest's and catacombs' are theirs to design.
