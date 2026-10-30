---
title: An earlier turn's record is cleared only once the chain has answered, so a context left meanwhile cannot leave it Idle
slug: a-restored-turn-keeps-its-record-until-the-chain-answers
spec: games-on-this-foundation
blockedBy: []
---

# A restored turn revealed by somebody else could read `Idle` for good

Found by stratagems' step 8 (`origin/step-8`, `work/notes/observations/a-restored-turn-revealed-by-somebody-else-can-read-idle.md`, and the plan's log entry "2026-10-30, step 8: items 6 and 7 done ... (NOT landed)"): its `e2e/tests/stratagems-fuzd.e2e.ts` failed in 1 of 5 full runs, fuzd having revealed the turn and the new page opened after the cycle turned showing the submission `Idle` for 90 s instead of `Revealed` (missed-reveal `Clear`, `committedTurns` kept: nothing lost but the report). The code is item 4's (`the-submission-in-the-account-data.md`), in `web/src/lib/game/core/submission.ts`, byte-identical in every descendant.

**The mechanism.** `restore()` found the earlier cycle's committed record and called `closeEarlierTurn`, which CLEARED the stored record at once, set `Idle`, asked the chain (`commitmentStatus`), awaited `onSettled`, and wrote `Revealed` or `Missed` only if `generation` had not moved and the state was still `Idle`. `leaveContext()` moves `generation` whenever the storage's readiness goes false (the account data reloading) or the identity changes, a flicker included (`undefined`, then the same player). The `restore()` after it found the record gone, so nothing asked again, and the in-flight answer was dropped.

## Done, 2026-10-30, on local preview branches, NOT pushed (awaiting the maintainer's approval)

On `main` (preview branch `fix/restored-turn-report` from `origin/main` 36fdf6a6, worktree `~/dev/worktrees/template-commit-reveal/fix/restored-turn-report`), test-first, one commit:

1. `f8623416` `closeEarlierTurn` clears the stored record only once the chain has answered, in the context that asked. The generation guard is unchanged: an answer arriving after `leaveContext` is dropped as before, and the record it left is what the next `restore()` finds and asks about again. Once answered, the record is cleared whatever the state now shows (it must not be left behind), unless the plan slot now holds a LATER cycle's turn (the player planned or committed the next one meanwhile), which stays. `settled` and `onSettled` run only when the answer is written (state still `Idle`), so the turn is reported once. One question per turn per context (`closing`): with the record kept, a `reveal()` during the question would otherwise find it and ask, and report, a second time. A storage or adapter that cannot be asked keeps the old reading (cleared at once, `Missed`).

**Tests** (`web/test/lib/game/core/submission.test.ts`, a new `describe`, 11 cases over a per-identity storage with a readiness, `settled` recorded, the chain's answers held by the test): the account data's readiness false then true, and the identity `undefined` then the same player, each while the question is in flight, the chain answering `revealed` (`Revealed`, `onSettled` once, `settled` once, record cleared) and `open` (`Missed`, record cleared), each with the answers given in the order asked and the latest first (8 cases); a REAL identity change (ALICE to BOB) drops the answer, BOB's plan untouched and ALICE's record kept, and ALICE's return asks again and reports `Revealed` (1); a `reveal()` during the question asks nothing more (1); a later cycle's turn stored during the question survives the answer (1). **Red first**: on `origin/main` the 8 orderings fail with `{step: 'Idle'}` and the identity-change case with ALICE's record already gone (9 red, 2 green, the 2 being guards for the fix). **Green after the fix**, and each of the two guards was mutation-checked (dropping the one-question guard, or clearing unconditionally, turns its test red).

## Why this candidate and not the other

The observation offered two: clear the record only once the chain has answered, or let the answer land when the identity and cycle it was asked for are still current rather than when `generation` is unchanged. The first was chosen, because of what the file already says and tests:

- **`generation` is the file's one rule for anything that awaits** (`commit`, `reveal`, `reportRevealed`, `onProgress`, and `closeEarlierTurn` itself, the last four added by item 4's review so that "an identity change inside one ready account cannot let the previous identity's finishing reveal clear the next one's storage or overwrite its state"). The second candidate makes `closeEarlierTurn` the one exception and needs its own definition of "the same context", which identity and cycle do not give: a readiness that went false and came back is a reload of the account data (or a recovery from a load error) whose storage is not proven to be the one the question was asked for.
- **`leaveContext` forgets "in MEMORY, clearing nothing stored", and "NOTHING IS CLEARED WHILE LOADING"**: the stored record is the durable truth and the generation the in-memory one. Clearing the record before its outcome was known was the one place the file cleared ahead of the truth, and that is what made a dropped answer unrecoverable. Keeping it also covers a case the second candidate does not: a page closed while the chain is asked now asks again on the next load, where before the report was lost the same way.
- Every existing test holds unchanged (none asserted the record was gone while the chain was asked).

## Measured

check `0 errors and 0 warnings` unless stated; unit = server + client; e2e `E2E_RPC_PORT=8555 E2E_PORT=4183`, nothing left on a port or running after any run.

| node (preview branch, head) | before (item 4 and `with-fuzd.md`) | after |
|---|---|---|
| `main` (`fix/restored-turn-report` f8623416) | 1883 + 78, e2e 54/54 | 1894 + 78, e2e **54/54** (4.6 min) |
| `with/pixi-js` (`rtr/with/pixi-js` 7c183ffe) | 1892 + 78 | 1903 + 78 |
| `with/nft-identity` (`rtr/with/nft-identity` f43262f7) | 1891 + 78 | 1902 + 78 |
| `with/fuzd` (`rtr/with/fuzd` 072d8307) | 1924 + 78, e2e 61/61 | 1935 + 78, e2e **61/61** (9.3 min, the `fuzd` and `fuzd-fallback` stages included) |
| `with/all` (`rtr/with/all` ad0e541b) | 1900 + 78 | 1911 + 78 (client project run on its own, see below) |
| reveal-or-die `main` (`rtr/main` 03a13fce) | 2039 + 72 | 2050 + 72 (client project run on its own) |
| bomber-world `main` (`rtr/main` d30f55da) | 2087 + 72 | 2098 + 72 |
| stratagems `main` (`rtr/main` eb1bd580) | 0 errors 2 warnings | 0 errors 2 warnings (the same two `$state`/`state` warnings, legacy app), 1623 + 72 |

Every node's server project passed all its tests on every run. The pre-existing `window is not defined` unhandled error from `@etherplay/wallet-connector-ethereum`'s timer, attributed to `test/lib/context/tab-navigation.test.ts` (observation `an-unhandled-error-in-the-unit-run-of-with-nft-identity.md`), failed the run (and so skipped the client project) on: `main` 2 of 3 runs (5 errors in the first, whose full log was not kept, and 2), `with/pixi-js` 1 of 2 (18 errors), `with/nft-identity` 1 of 2 (15), `with/fuzd` 1 of 2 (2), `with/all` 3 of 3 (4, 2, 4), reveal-or-die 3 of 3 (4, 4, 2); bomber-world and stratagems 0 of 1. Each log was read for the signature before any rerun; where every run hit it, the client project was run alone (`vitest run --project client`, 78 and 72 passed).

**The cascade**: `offshoot-fanout fanout --dry-run` from this repo (local branches fast-forwarded to their origins first) reached exactly `with/pixi-js`, `with/nft-identity`, `with/fuzd`, `with/all` (over the first two), reveal-or-die `main` (from `with/all`), bomber-world `main` (from reveal-or-die), and stratagems `main` (from `with/fuzd`). Merged by hand on `rtr/*` preview branches (worktrees `~/dev/worktrees/<repo>/rtr/<branch>`) with the tool's messages, each from its parent's preview branch: every merge clean, each a diff of exactly `submission.ts` and its test against its origin, no game file touched. `scripts/apply-omissions.sh` (nothing to drop) and `node scripts/check-dangling-imports.mjs` clean in every node.

## Not done here

- Nothing pushed: the maintainer approves each push.
- stratagems' integration branch and `step-8` are not touched: its between-steps merge, step 8's e2e measured again and its landing are the stratagems session's. The game e2e suites of reveal-or-die, bomber-world and stratagems were not run (the change is in `game/core` only, covered by the template's and `with/fuzd`'s e2e and the unit tests).
- The race is not reproduced in an e2e here: the template's closed-page fuzd test passed before and after; the deterministic reproduction is the unit tests.
