---
title: reveal-or-die's manual cycle had no commit phase, and the port's step 1 was scoped against three functions that do not exist
type: finding
status: FIXED 2026-09-24 in reveal-or-die (contracts + client), unpushed
spotted: 2026-09-24
relates-to: work/tasks/backlog/an-offline-world-for-reveal-or-die.md (step 1), work/notes/observations/what-the-reveal-or-die-cascade-actually-contains.md, work/notes/findings/an-automined-chain-has-no-clock-between-transactions.md, work/specs/proposed/games-on-this-foundation.md (Phase 4)
---

# The second offline world found its first thing, and it found it before writing a line of the world

**The task scoped step 1 as "write `web/src/lib/world/advance.ts`, reveal-or-die's own `getAttendance` read and `advanceCycle` send against its contract", on the grounds that "`advanceCycle` has no caller in that repo either, so a manual deployment there cannot complete a round in ANY world".**

The conclusion was right and every premise under it was wrong. There is no `advanceCycle` in that repo, there is no `getAttendance`, and there is no caller because there is no function. What was actually true was worse and is the thing worth keeping.

## Three findings, in increasing order of how much they cost

### 1. The names are different, which `AGENTS.md` already predicts

`advanceCycle` is `moveToNextPhase`. `getCycle` is `getEpoch`. Both work, both answer under either policy, and a descendant still saying `epoch` is "a schedule, not a stale glossary" exactly as `AGENTS.md` says. Nothing to see.

**But a comment in that repo had already drawn the wrong conclusion from the same grep**, and it had been sitting in `web/src/lib/context/game.ts` since the last cascade:

> THE TIMED TRACKER, DELIBERATELY, AND NOT THE POLICY DISPATCHER THE TEMPLATE WIRES. [...] there is no `advanceCycle` and no `getCycle` to ask, so the cycle here IS what the clock says and asking would be calling a function that does not exist.

Half right, and the half that was wrong is the half that stopped the work. `getEpoch` is `getCycle` under an older word, and `_epoch()` returns the manual cycle when there is no clock, so the read the dispatcher needs was there all along. **The general form: a claim that a function does not exist is a claim about a NAME, and in this tree a descendant is expected to spell things differently.** Read the contract, not the grep.

### 2. There is no membership set at all, which changes what the client's guard IS

The template's `getAttendance` has no counterpart. reveal-or-die's contract has no waited-for member concept, no tally, and no way to enumerate who is in the world (`getAvatarsInZone` is per zone, and an avatar that has not entered is in none).

So the client has to hold it: `world/advance.ts` takes `waitedFor` as an argument, keyed by chain id, declared by whoever provisioned the world. An ordinary deployment declares nobody, which the framework reads as `NoOneToWaitFor` and refuses to push, which is the same answer the contract would have given.

**That is a seam bending, and the bend is in the safety argument rather than in the types.** `game/core/advance.ts` says, in capitals, that its mirrored guard is admissible because the contract is the judge:

> Being wrong in the strict direction costs one reverted transaction; being wrong in the lax direction costs nothing at all, because the contract refuses. No stake is ever on this prediction.

In reveal-or-die the contract refuses **nothing**: `_moveToNextPhase` checks only the policy, and its own source carries the TODO for the rest ("add logic to present moving to next epoch if not all player who already in the game has done so"). So the mirrored guard is not a prediction there, it is the only guard, and being wrong in the lax direction opens the reveal phase on a player who has not committed. In a game called reveal-or-die the penalty for missed reveals is the avatar.

**The framework's paragraph is therefore a statement about the TEMPLATE'S CONTRACT wearing the clothes of a statement about the framework.** It should say which of its properties it is relying on, so that the next game to adopt it has to check rather than inherit the reassurance. That is a template change and it is NOT made here, because one game is not two.

What bounds it today, and this is a real bound rather than a hope: every deployment of reveal-or-die on a real chain is `timed`, under which the framework never pushes and the contract refuses anyway. The only manual deployment is an offline world, where one tab holds every key at the table. The bound goes the moment a manual deployment has a player the client does not control.

### 3. AND THE MANUAL POLICY HAD NO COMMIT PHASE, which is why none of this could have been discovered by reading

```solidity
// TODO allow to specify it separately
SKIP_COMMIT = COMMIT_PHASE_DURATION == 0 && REVEAL_PHASE_DURATION == 0;
```

One expression standing for two unrelated things, with the TODO beside it. Asking for a cycle pushed by hand silently also asked for a game that skips its commit phase, so a manual deployment answered `commiting: false` forever, `_makeCommitment` reverted `InRevealPhase`, and `_moveToNextPhase` reverted `CommitPhaseIsSkipped`. **A commit-reveal game that cannot commit.**

**This is the template's own bug, one generation down and un-fixed.** `CONTEXT.md` here already describes it in the past tense:

> It used to be inferred, on both sides: a game whose two phase durations were zero was a manual game, and was also a game that skipped its commit phase, because one derivation stood for two unrelated things. That is what made this look like a mode rather than a policy.

The template fixed it by declaring `cyclePolicy`; reveal-or-die still carried the derivation, because contracts are not inherited in this tree. So this is the same schedule as `epoch` and as the chunked commitment, and it is visible the same way - **grep the contracts, not the glossary** - except that this one is not merely unbuilt. It is a configuration that is accepted and then behaves as something else.

**NOTHING IN THAT REPO COULD REACH IT.** Every environment in `rocketh/config.ts` is timed, both live deployments are timed, and so was every test. The manual branch of `_epoch()`, `_moveToNextPhase` and `_moveToNextEpoch` was reachable by no code in the repo and had been wrong for as long as it had existed. 1,745 unit tests, 13 contract tests, 50 e2e and a clean `check` all passed over it.

## What was done, and it is unpushed

In reveal-or-die, on `main`, three commits:

1. **The dangling-import check** (`scripts/dangling-imports.mjs`, a CLI, a unit test, wired into `scripts/apply-omissions.sh` and `AGENTS.md`). Run against the merged tree it reported all nine `$lib/placement` imports in one second, before any human judgement. Repo-local rather than in `offshoot-fanout`, where the earlier finding rightly puts it, because `offshoot-fanout` on this host is a nix-store binary (0.6.0) with no source checkout to edit.

   It reads imports with `ts.preProcessFile` rather than a regex, and that was not the first draft: the boundary tests in that repo carry import statements as DATA, so the regex version reported nine dangling imports of which seven were strings and one was a sentence in a comment. **A checker whose output is mostly noise is a checker that gets skipped, which is the failure it exists to stop.**

2. **The cascade**, as the task scoped it, plus `world/advance.ts` as described above. `test/lib/placement/advance.test.ts` is now in `.offshoot-omissions` **as a class rather than a file**: it is the fourth inherited test naming a `$lib/placement` that repo does not have, and there will be a fifth.

3. **The contract change**: `CyclePolicy {Timed, Manual}` declared, `skipCommit` split out, and the constructor refuses a configuration whose durations disagree with its policy. Backwards compatible with what is deployed, which is a claim that was CHECKED (`git ls-files contracts/deployments` says rise-testnet is live, its linked data predates the parameter, and the client reads such a deployment the old way - which is what it actually ran).

   Four contract tests, the manual branch's first exercise ever, checked for teeth by reintroducing the derived `SKIP_COMMIT`: two of the four fail and the other fifteen pass.

Counts, reveal-or-die, before -> after: check 0/0 -> 0/0; unit 1745 in 144 plus 67 in 11 -> 1780 in 148 plus 67 in 11; contracts 13 -> 17; e2e 49 of 50 -> **50 of 50** (the baseline failure was `signer-out-of-gas` under parallel load, which passes alone and passed in the after run).

## What step 2 now has to take account of

The task's step 2 is unchanged in shape and one assumption inside it has moved.

- **"A played player that cannot act legally still does something the cycle can close on, because unanimity waits for it."** Unanimity is now the CLIENT's, in `world/advance.ts`, measured against a table the world declares. Step 2 has to call `declareWaitedFor(chainId, avatarIDs)` after provisioning, and the acceptance test for this clause is a test of that reader as much as of the played player.
- **The reload test has one more thing to be reproducible from.** A played turn there is a WALK and the task already says the position must be read as of the cycle the commitment belongs to. Note that `lastEpoch` is how the client knows a reveal happened at all, so the same field carries the reveal count and the freshness of the position.
- **`contracts/package.json` needs `tsc` in `prepare`.** The stem's version says why and it is a real dependency, not tidiness: `offline.ts` imports the contracts package's deploy scripts and rocketh config to run them in the browser, and every one of those export paths resolves into `dist`. It was deliberately left at ours in the cascade, because the reason for it does not exist until step 2 does.
- **The e2e clause is unchanged and is the one that matters most.** "Asserting the round completed AND that the other players reached the board, since a player committing an empty turn satisfies every count while doing nothing" - and in this game the empty turn is even cheaper to reach, because a played player with nothing legal to do has an obvious wrong answer available.

## The one thing to take from this beyond the two repos

**A branch nothing exercises is not untested, it is unknown.** The manual policy in reveal-or-die was not a feature waiting for a caller; it was a configuration that would have been accepted and then behaved as a different game, and it sat under four green suites because every deployment took the other branch. The port did not find it by reading the contract either - the derivation looks reasonable, and the TODO beside it reads like a tidiness note rather than a defect. It was found by trying to USE it.

Which is the plan's own argument for the ports, arriving one level lower than expected: the seams are proven by one game, and the second game is where they get tested. This time the second game tested its own contracts instead, and the template's seam bent in the comments rather than in the types.
