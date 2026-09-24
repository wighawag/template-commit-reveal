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

**One reverted transaction, most of the time.** The second advance arrives after the first has moved the phase, so the contract refuses it: that is `_advanceCycle` doing its job, and the client's own comment already says a refused advance is usually benign. The gas is the world's or the player's signer's, and it is small.

It is worth closing anyway for two reasons that are not about the gas. It makes the `Failed` state appear for a reason that is purely this client's own doing, which pollutes the one signal a human would use to tell a real problem from a benign race. And it feeds `situationOf`'s backoff a failure that carries no information, so the exponential backoff starts counting against a situation that never actually refused anything.

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
