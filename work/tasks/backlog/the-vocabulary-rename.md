---
title: Move the template onto the glossary's words, wire names first while they are still free
slug: the-vocabulary-rename
spec: games-on-this-foundation
blockedBy: []
---

# `epoch` becomes `cycle`, in four staged steps

## Start here, from a cold context

```sh
cat CONTEXT.md                                    # the glossary, in the working tree
git show work:docs/adr/0001-cycle-is-the-frameworks-word-round-and-turn-belong-to-games.md
git show work:work/tasks/backlog/rename-a-term-across-a-repo.md    # the tool this needs
```

Four branches are touched (`main`, `with/pixi-js`, `with/nft-identity`,
`with/all`) and the ritual for cascading and for the divergence runs is in
`README.all.md`. Two environment facts will bite in the first ten minutes:
find `pnpm` before assuming a path (see `AGENTS.md`), and
**`web/src/lib/deployments.ts` is generated and gitignored, so after every
branch switch it must be regenerated or `check` fails naming a contract that
does not exist on that branch**. `HANDOFF.md` has the recipe.

`CONTEXT.md` and ADR-0001 settle the words. No code moved with them, deliberately:
the decision was worth taking on its own, and the sweep is worth staging because
one of its four steps ages badly and three do not.

Read ADR-0001 first. This task is the move, not the argument, and it does not
reopen which word won.

## The staging, and why this order

**Steps 1 AND 2 carry the deadline, and only steps 3 and 4 are pure source.**
The ABI surface is bigger than it looks: `epochPolicy` is a `linkedData` key,
`epoch` is an indexed topic on **five** events (`CommitmentMade`,
`CommitmentCancelled`, `CommitmentRevealed`, `CommitmentVoid`, `RoundAdvanced`),
it is a component of the `Commitment` and `Round` STRUCTS that clients read
through casts, and `InvalidEpoch`, `InRevealPhase`, `InCommitmentPhase` and
`CanStillReveal` are errors matched by name. Step 2 renames ABI names too
(`advanceRound`, `getRound`, `RoundAdvanced`, the `Round` struct), so it is not
the leisurely one either. Nothing on this stack has a live deployment with users,
so all of that costs a redeploy today and a migration later.

**Solidity parameter names and struct component names are part of the ABI.** A
rename that stops at function and event names leaves `uint64 epoch` inside
`Commitment` and `Round`, which the client reads through casts at
`missed-reveal.ts:119` and `placement/epoch.ts:29` - sites where neither `check`
nor the unit suite can see a mismatch.

| step | what | scale, measured at `bb3fb1bb` | blocked by |
| --- | --- | --- | --- |
| 1 | the WIRE **and every reader of it**, source AND tests | ~20 contract sites + 3 client sites + 3 test/e2e sites | nothing |
| 2 | the SHARED-INTERVAL surface: `_round()`, `getRound`, `advanceRound`, `RoundAdvanced`, `RoundReading`, `predictRound`, `createRoundReader`, `readRound`, **and `round-phase.ts` entire** (`RoundPhase`, `roundPhaseOf`, and `roundTone` in the HUD) | **66 occurrences in 10 files**, plus `round-phase.ts` and its consumers | step 1 |
| 3 | the `epoch` sweep: identifiers, comments and docs, contract and client, **including the cascade into reveal-or-die's own sites** | **1,720 occurrences in 73 files** per node, plus **189 in 26** in reveal-or-die | the tool |
| 4 | `RoundStore` -> `SubmissionStore` and the rest of the per-player sense, **including the persisted record** | **148 occurrences in 22 files** here | step 3 |

The commands that produced those figures are in the tool's task, under
Acceptance. Re-measure before starting: a mismatch means the tree moved, not
that the task is wrong.

Steps 1 and 2 are small enough to do by hand and are the honest pilot for the
tool: if the tool cannot reproduce what a careful hand did on step 2, the tool is
not ready for step 3.

**So this task is NOT blocked on the tool, and that is deliberate.** Step 1 is
the only part with a deadline and it needs no tool at all; blocking it behind
building one would put the single time-sensitive piece of work behind the
single optional piece. Steps 3 and 4 need `rename-a-term-across-a-repo`;
steps 1 and 2 are claimable today and are what tells you whether the tool is
worth building at all.

## Step 1 is NOT contracts-only, and NOTHING AUTOMATIC CATCHES IT

Six sites name a wire value as a **string literal**, so a contracts-only step 1
leaves them pointing at things that no longer exist:

| file | what it names |
| --- | --- |
| `web/src/lib/placement/missed-reveal.ts:130` | `functionName: 'getEpoch'` |
| `web/src/lib/game/core/epoch.ts:585,590` | `optionalNumber(values, 'epochPolicy')` and the error text |
| `web/test/lib/placement/missed-reveal.test.ts:77` | a mock keyed on `'getEpoch'` |
| `web/test/lib/game/core/linked-data.test.ts:95-120` | the `epochPolicy` key and `/epochPolicy of 7/` |
| `web/e2e/tests/contracts.e2e.ts:71,102` | the literal text `getEpoch`, on the page |

**AND THE SILENCE IS WORSE THAN A RED SUITE.** An earlier draft of this task
claimed the unit suite would catch a contracts-only rename through the
context-construction tests. It would NOT, and the reason is a fallback written
deliberately: `resolvePolicy` (`web/src/lib/game/core/epoch.ts:584-600`) treats
an ABSENT `epochPolicy` as a deployment older than the parameter and infers the
policy from the durations. Rename the key on the contract side alone and the
client stops finding it, infers `timed`, and is RIGHT - because timed is what the
deployment declares - so every suite passes and the app is reading a key that no
longer exists. It would stay hidden until the first manual or hybrid deployment.

The two mocks do not help either: they mirror the CLIENT's call, so they follow
whatever the client says and cannot disagree with the chain.

So step 1 has no automatic guard, and the guard is this checklist: one commit
containing the contracts, the deploy script and all six sites above;
`deployments.ts` regenerated before any suite is believed; and the `contracts`
e2e run, which is the only thing here that reads a real ABI through a real page.

If a future step cannot be made green in one commit, the answer is expand-first:
add the new name beside the old, migrate the readers, remove the old in a third
commit. Do not ship a step that is red in isolation and green only in
combination, because the cascade merges them one node at a time.

## What is already true, so nobody re-derives it

- **`round` goes to TWO targets and a mechanical replace will merge them.**
  `RoundPhase` is the shared interval (becomes `CyclePhase`); `RoundStore` is one
  player's pass through it (becomes `SubmissionStore`). Step 4 exists as its own
  step for exactly this reason.
- **`epoch` names an INDEX in most of its sites.** `uint64 epoch` becomes
  `uint64 cycleNumber`, not `uint64 cycle`, and saying so is what stops an index
  being read as a timestamp - the confusion ADR-0001 records as the strongest
  case against the old word.
- **`foreground` and `background` contain `round` 258 times** in this tree. Every
  pass is word-boundaried and the reverse audit is noisy without it.
- **Each branch is a separate node.** `main` first, then the cascade, then the
  three divergence runs per `README.all.md` with each parent's own `ALLOWED`
  list. A rename is precisely the shape of change that merges cleanly into a
  descendant and leaves two names for one thing.
- **`timeInCurrentEpochCycle` already exists** and becomes `timeInCurrentCycle`,
  which is the small piece of evidence that the word was always the right one.

## The persisted record is a COMPATIBILITY SURFACE, and step 4 owns it

**This is the one place where "not one line of logic moves" is false, and it
costs a stake.** `web/src/lib/placement/storage.ts` writes the round under
`__placement_round__` (:16) with an `epoch` field (:19, :74, :89), and `load()`
refuses any record whose `epoch` is not a number (:67). So:

- step 3 renaming the FIELD, or step 4 renaming the KEY, makes every record
  written by the previous build unreadable;
- `load()` then discards it, which means a player with a commitment in flight
  loses the secret that opens it, and the stake with it;
- **every suite stays green**, because the tests are renamed alongside the code
  and there is no test that reads an old record.

That is exactly the failure this template exists to prevent, arriving inside a
change advertised as behaviour-free. Decide it deliberately, in step 4, and write
the decision at the line. The default should be a MIGRATING read - accept the
old shape, write the new, and delete the tolerance a release later - because a
template ships to games that will have users even though this repo does not.
"Nothing is deployed yet" is an argument about the ABI and it does not transfer
to a browser's local storage, which is a developer's browser too.

## What else the rename owns, so it is not left half-done

- **`AGENTS.md`'s note that the code still says `epoch`** becomes half-false the
  moment step 3 lands here: the template will say `cycle` while every game still
  says `epoch`. Step 3 rewrites that paragraph to say exactly that, or the next
  reader concludes the glossary is stale, which is the confusion it was written
  to prevent.
- **`CONTEXT.md` needs no change**, because it already states the target
  vocabulary. Check rather than assume: if a step wants to edit the glossary,
  something has drifted from ADR-0001 and that is a finding, not an edit.
- **`round-phase.ts` is step 2's, not step 4's.** `RoundPhase` and
  `roundPhaseOf` are the SHARED interval's phase, so they become `CyclePhase`
  and `cyclePhaseOf`; only the per-player sense waits for step 4. `roundTone` in
  the HUD (`placement/ui/hud.ts`, `GameHud.svelte`) is the same shared sense and
  goes with them - it is not an allowlist entry, it is a rename.
- **`catching-up` is a `CyclePhase` value with no glossary word.** It is the
  client's knowledge being stale rather than a phase of the cycle. Leave it
  named as it is and raise it as a note if it bothers you; do not invent a term
  inside a rename.

## Out of scope

**The game repos.** They are not inherited and each renames at its own port; see
`vocabulary-in-the-game-repos.md`.

**The spec and the notes on the `work` branch.** `games-on-this-foundation.md`
and the findings say `epoch` throughout and they are a RECORD of sessions that
happened, so rewriting them would falsify what was measured when. New prose uses
the new words. Do not let a sweep loose on `work/`.

**Any behaviour change at all.** Not one line of logic moves in this task. If a
step wants to fix something it noticed, that is a different commit, and doing it
inside a 1,700-site diff is how it stops being reviewable.

## Acceptance

- After each step, on every node it reaches: `check` 0 errors, `test:unit` at the
  count this plan records for that node and NOT one test fewer, `contracts:test`
  green, `format:check` green.
- **The counts must not move.** A rename that changes a test count has renamed
  something into something else. This is the whole acceptance: every suite is
  green at exactly the same number.
- If the tool was built, `rename-term.sh verify` reports no stragglers with an
  allowlist of `Math.round` and `drandRound`. `foreground`, `background` and
  `rounding` need no entry under the identifier-part rule, and `roundTone` is a
  rename rather than an exception. If the tool was declined after steps 1 and 2,
  this clause is satisfied by the two `grep` audits below instead.
- `grep -ri epoch web/src contracts/src` returns nothing on `main` after step 3.
  Not `-w`: the word lives inside identifiers 793 times, and a word-boundaried
  audit would report success over `epochDuration`.
- `check-shared-divergence.sh` per branch with its own list, plus the empty run,
  matching the sets this plan records: 1 for `with/pixi-js`, 12 for
  `with/nft-identity`, 13 for `with/all`.
- e2e on `with/all` and on reveal-or-die after step 3, because a rename that
  breaks a `data-testid` or a locator is invisible to `check` and to the units.
  **reveal-or-die's e2e is only meaningful if step 3's cascade also renamed that
  repo's OWN sites**: it inherits `game/core/{round,epoch,round-phase}.ts`, so
  the merge rewrites those and leaves its 189 own occurrences behind. Doing them
  in the same commit as the cascade is step 3's job and not the games task's,
  because there is no moment in between where that repo compiles.

## Checked by mutation, not just green

A rename has no behaviour to mutate, so the mutation here is the tool's:
**re-run step 3's mapping on the already-renamed tree and confirm it is a
no-op.** A second application that changes anything means a mapping entry is
matching its own output, which is how `cycleNumberNumber` gets committed.

Second: take one file the sweep touched, revert it to the old vocabulary, and
confirm `verify` names it. A verifier nobody has seen fail is not a verifier.
