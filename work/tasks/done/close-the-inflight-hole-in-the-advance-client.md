---
title: Two `check()` calls can both reach `push()`, because the guard is read before an await and never re-tested
slug: close-the-inflight-hole-in-the-advance-client
spec: games-on-this-foundation
blockedBy: []
---

# The advance client's `inFlight` guard has a hole, and it has now been deferred twice

## Start here, from a cold context

```sh
cat AGENTS.md
git show work:work/notes/findings/a-second-advance-succeeds-in-the-tab-and-the-first-one-did-not-take.md
sed -n '/async function check/,/^\t}/p' web/src/lib/game/core/advance.ts
```

**Why this task exists at all: it had no home.** It was named twice inside the webevm finding above, as the thing that was deliberately NOT the cause and deliberately NOT fixed alongside it, so the diagnosis would stay readable. That finding is now CLOSED. An open work item recorded only inside a closed note is one nobody will find, which is the whole reason it is written out here.

## The hole

`createCycleAdvance` in `web/src/lib/game/core/advance.ts`:

```ts
async function check(): Promise<void> {
  if (inFlight) return;                    // read HERE
  ...
  attendance = await readAttendance();     // ...and the world moves on
  ...
  await push(info.currentCycleNumber, verdict.opens);   // sets inFlight = true
}
```

`inFlight` is tested once, at the top, and `push()` does not re-test it. Between the test and the push there is at least one `await` (the attendance read, plus whatever the RPC costs). A second `check()` entering that window passes the guard, because the first has not reached `push()` yet, and both go on to send an `advanceCycle`.

Two callers make this reachable rather than theoretical. `start()` polls `check()` on a one-second interval, and `context/game.ts` calls it directly at the two moments the human's own submission may have completed unanimity. Those are independent, so they can interleave.

## What it costs, honestly

**CORRECTED 2026-09-26. This section used to say "one reverted transaction, most of the time", and that is true only where the contract is the judge.** It was written when the advance client assumed every game's contract re-checked the advance conditions, which is the reference game's property and not the tree's. Since `createCycleAdvance` takes `contractIsTheJudge`, the claim splits in two, and the half it omitted is the one with a stake behind it.

**Where the contract IS the judge (the template's reference game): one reverted transaction.** The second advance arrives after the first has moved the phase, `_advanceCycle` refuses it, and the gas is small. It is still worth closing there for two reasons that are not about gas: it makes `Failed` appear for a reason that is purely this client's own doing, which pollutes the one signal a human uses to tell a real problem from a benign race, and it feeds `situationOf`'s backoff a failure that carries no information.

**Where it is NOT (reveal-or-die, `THIS_CONTRACT_JUDGES_AN_ADVANCE = false`): the cycle moves TWICE.** `_moveToNextPhase` checks the cycle policy and nothing else, so both advances are accepted: the first opens the reveal phase, the second closes the cycle, on players who have not revealed. `lastEpoch` falls behind, `numMisses` counts it, and at `numMissesAllowed` the avatar is dead. In the one game where this client is the ONLY guard, the duplicate is not a wasted transaction, it is exactly the harm the declaration was introduced to prevent. The test that pins it fails on the old code with the fake chain at cycle 3, commit phase.

**And the window is wider than it was when this was written.** On the `false` path `check()` awaits a cycle refresh, an attendance read and a second refresh before pushing, and the hand press (`advance()`, previously an unconditional send) awaits a refresh and a read of its own, sharing the one flag. So there are two entry points into the window, not one.

**It is NOT the lost-write bug**, and the next person should not go looking for that here. That was webevm executing two things on one checkpoint stack, it is fixed in 0.6.0, and the two advances in that finding were 890 ms apart with a dozen reads between them, which no `inFlight` race can produce.

## The shape of the fix

Re-test inside `push()`, or claim the flag before the first `await` rather than after the last one. Claiming early is probably right and is a one-line change, but it has a consequence to check rather than assume: a `check()` that claims the flag and then returns early (a failed read, a refused verdict, a backoff that has not elapsed) must RELEASE it, or the client stops advancing for good and a manual world freezes with no error anywhere. That failure is far worse than the duplicate this closes, so whichever shape is taken needs the release path tested, not just the happy one.

## Acceptance criteria

- Two `check()` calls that interleave across the attendance read result in exactly ONE `advanceCycle` being sent.
- Every early return in `check()` leaves the client able to advance on a later call. Test the failed-read path, the not-permitted path and the backoff path specifically: a guard that is claimed and not released is a frozen world under the manual policy.
- A unit test for each, against fake seams, in `web/test/lib/game/core/`, following the existing tests in that directory.
- Both checked for TEETH by reverting the fix and confirming they fail. This repo's convention, and the finding above is a standing reminder of why: a regression test for a race nobody has watched fail is not a regression test.
- `pnpm check`, `pnpm test:unit` and `pnpm test:e2e` green on `main`, then cascaded to `with/pixi-js` and `with/nft-identity`, then `with/all` from both.

## What this must NOT turn into

**Do not make the advance client verify that the phase moved and retry.** It is rejected in the finding above and the reasoning survives the fix that closed it: it would hide a lost state write inside framework code that every repo in this tree inherits. That reasoning earned its keep once already, since not doing it is what kept the webevm defect visible long enough to be diagnosed and fixed upstream.

`advance.ts` is framework. Anything added here lands in every descendant.

## Done, 2026-09-26

Heads: template `main` 04825694, `with/pixi-js` da397976, `with/nft-identity` a26e425a, `with/all` af686cc5 then 7d11b575, reveal-or-die cc43fb2b. Every cascade merged cleanly; `advance.ts` and `advance.test.ts` are byte-identical to `main` in all five, and still byte-identical between the template and reveal-or-die. reveal-or-die's `world/advance.ts` did not need touching, and its `contractIsTheJudge: THIS_CONTRACT_JUDGES_AN_ADVANCE` wiring survived the merge.

**The shape taken.** The claim is taken before the first read and released in ONE `finally` around the whole pass, never at an individual return, so no early return (and no throw) can keep it. A `check()` arriving mid-pass is QUEUED and re-runs the whole pass, reads included, so it re-reads rather than re-pushes. A hand press arriving mid-pass is DROPPED: queued behind a check that already pushed, it would be an unconditional second send where the contract judges. The post-push refresh now runs inside the claim, so a queued check judges the phase it returns. Both callers in each repo are fire-and-forget, so a queued `check()` resolving before its pass runs changes nothing for them.

**`createSerialisedLoop` was considered and not reused.** Same queueing idea, and its measured argument for queueing is cited in the comment. But the hand press must share the exclusion under a different rule (drop, not queue), which that loop cannot express without changing a second framework file, and the saving is ten lines of flag in a safety-critical one.

**Acceptance, beyond what was asked.** The brief listed the failed-read, not-permitted and backoff returns. Also covered: the stale-reading refusal on the sole-guard path, both early returns of the hand press (failed read, `Refused`), and a pass that throws. And check-vs-press interleaving in both orders, because the press has awaits of its own on the `false` path.

**TEETH, and one claim in the acceptance above was imprecise.** "Reverting the fix" fails the five interleaving tests and ONLY them; it cannot fail the release tests, because the old code claims nothing to leave unreleased. The mutation that bites those is the naive fix (claim early, release only in `push`): all seven release tests fail, plus the queue test and three older tests that cross an early return. A third mutation, correct claim and release but DROPPING a mid-pass check, fails only the queue test. And `offline.e2e.ts` against the naive fix fails exactly as predicted: "Revealed" never appears, because the reveal phase never opens.

**The harm, shown rather than argued.** On the old code the sole-guard interleaving test ends with the fake chain at cycle 3, commit phase: the cycle closed on players who had not revealed.

**Counts, before -> after.** Every server delta is +13, the new tests; nothing else moved.

| node | check | server units | client | contracts | e2e |
|---|---|---|---|---|---|
| `main` | 0/0 | 1667 -> 1680 in 145 | 76 in 13 | 47 | 53/53 |
| `with/pixi-js` | 0/0 | 1676 -> 1689 in 146 | 76 in 13 | 47 | 53/53 |
| `with/nft-identity` | 0/0 | 1675 -> 1688 in 146 | 76 in 13 | 49 | 53/53 |
| `with/all` | 0/0 | 1684 -> 1697 in 147 | 76 in 13 | 49 | 53/53 |
| reveal-or-die | 0/0 | 1830 -> 1843 in 155 | 70 in 12 | 17 | 51/51 |

e2e was measured after only (before-counts for the four template nodes are the recorded 53). `offline.e2e.ts` plays a whole cycle in all five. reveal-or-die's offline round was timed before and after, three runs each, to catch a dropped poke (it would cost a whole poll second): 3.2-3.3 s before, 3.1-3.6 s after, 11.2 s and 11.4 s total. Noise.

**Not done, deliberately.** No verify-and-retry in the client. No unanimity guard in reveal-or-die's contract; that is its own task and this is what makes the client's copy trustworthy meanwhile.
