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
| 2 | the SHARED-INTERVAL surface: `_round()`, `getRound`, `advanceRound`, `RoundAdvanced`, `RoundReading`, `predictRound`, `createRoundReader`, `readRound`, **and `round-phase.ts` entire** (`RoundPhase` and `roundPhaseOf`) | **66 occurrences in 10 files**, plus `round-phase.ts` and its consumers | step 1 |
| 3 | the `epoch` sweep: identifiers, comments and docs, contract and client, **including the cascade into reveal-or-die's own sites** | **1,720 occurrences in 73 files** per node, plus **189 in 26** in reveal-or-die | the tool |
| 4 | `RoundStore` -> `SubmissionStore` and the rest of the per-player sense, **including `roundLabel`/`roundTone` and the persisted record** | **148 occurrences in 22 files** here | step 3 |

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

## The persisted record: rename it outright, and keep the RULE rather than a migration

**THIS SECTION USED TO PRESCRIBE A MIGRATING READ. It was wrong, and it was
wrong about a fact rather than about a judgement**, so it is corrected here
rather than argued with. It said that renaming `__placement_round__` or its
`epoch` field would orphan a commitment in flight and cost a player their stake,
and that step 4 should therefore accept the old shape, write the new, and drop
the tolerance a release later.

**There is no record to migrate, and there never was.** Measured rather than
assumed, 2026-09-16:

- `git ls-files contracts/deployments` in this repo is **empty**. Nothing is
  deployed, so nothing can be in flight, and the only records on disk are the
  throwaway `localhost` chain a developer's last deploy left behind.
- reveal-or-die's one committed deployment, `rise-testnet`, was last touched
  2026-08-26 and its ABI still exposes `commit`, `cancelCommit` and `deposit`,
  which its source no longer has. Today's build does not talk to it. The key is
  `chainID_gameAddress_avatarID`, so a redeploy gives a different address and
  therefore a different key regardless of what the field is called.
- **The "a template ships to games that will have users" argument does not
  survive contact either**, which is the part that looked strongest. A game
  built from this template starts at its own first deploy; it can never hold a
  record written by a previous build OF THE TEMPLATE, because there was no
  previous build of that game. A migrating read here is tolerance for a shape no
  instance has ever written, in a code path no test can exercise honestly.

So **step 4 renames the key and the field outright**, and deletes the exception
step 3 left behind in `web/src/lib/placement/storage.ts` and in reveal-or-die's
`web/src/lib/world/storage.ts`. After it, the acceptance grep permits two files
and neither is a compatibility surface: the UNIX epoch in jolly-roger's
`core/transaction/in-flight.ts`, and the bomber-world citation in
`UsingGameInternal.sol`.

**What survives is the LESSON, and it is worth more than the tolerance was.**
The observation underneath the wrong prescription is true and general:

> Renaming a persisted KEY or FIELD is a silent stake-loser. `load()` discards
> any record it cannot read, so a player with a commitment in flight loses the
> secret that opens it; and **every suite stays green**, because the tests are
> renamed alongside the code and nothing reads a record written by an older
> build.

That is a rule for a game that HAS users, so it belongs next to the code and in
`AGENTS.md` beside the two commit-reveal rules, not as dead compatibility code in
a template nobody has deployed. Step 4 puts it there.

**The general form, for the next time this comes up:** "nothing is deployed yet"
is a claim that can be CHECKED, in one command, per repo. Check it before
building compatibility for it. This document asserted the opposite for local
storage on the strength of a phrase ("a developer's browser too") and cost step 3
two comment blocks and a third entry in its acceptance grep.

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
  and `cyclePhaseOf`; only the per-player sense waits for step 4.

- **`roundTone` is STEP 4's, and this document said the opposite until step 2
  landed.** It said `roundTone` in the HUD was the same shared sense and went
  with `RoundPhase`. That is false about this tree, and the builder who refused
  it was right. `roundTone` is assigned at `placement/ui/hud.ts:485` beside
  `roundLabel` at `:484`, both from ONE call to `describeRound($round)`;
  `describeRound` takes `RoundState` from `game/core/round.ts`, which is the
  per-player round, and every string it produces is one player's own submission
  ("Committed. Reveal is owed this epoch."). `tone`'s type is literally
  `HudModel['roundTone']`, so the two are one thing with two projections. The
  HUD already draws the shared interval separately, as `phaseLabel` from
  `phaseLabelOf(phase: CyclePhase)`.

  **The tell was in this document's own list: it named `roundTone` and not
  `roundLabel`.** There is no reading of this tree in which one half of a pair
  produced by a single call is the shared interval and the other half is not.
  Renaming it in step 2 would have left `cycleTone` beside a future
  `submissionLabel`, from one line of code, which is the one-word-two-senses
  failure this staging exists to prevent. Both go to step 4, as
  `submissionTone` and `submissionLabel`.

  The likely origin of the error is that `roundTone` sits a few lines from
  `RoundPhase` in the same file. Every other item this document named for step 2
  checked out exactly, and step 2 additionally found three the document did NOT
  name (`holdBoardUntilRoundEnds`, `holdResolvingRound`,
  `settleBoardWhenRoundStarts`), all of which are keyed on the clock's epoch
  rather than on any player's state, which is the test to apply.
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
  `rounding` need no entry under the identifier-part rule, and `roundTone` is
  neither an exception nor a step-2 rename: it is step 4's, for the reason under
  "What is already true". If the tool was declined after steps 1 and 2,
  this clause is satisfied by the two `grep` audits below instead.
- `grep -ri epoch web/src contracts/src` returns THREE files on `main` after
  step 3 and TWO after step 4, and no others. Not `-w`: the word lives inside
  identifiers 793 times, and a word-boundaried audit would report success over
  `epochDuration`. This clause asked for nothing, and nothing was the wrong
  target; the survivors are deliberate and each was found by doing the work:

  - `web/src/lib/core/transaction/in-flight.ts` says `ms since epoch` and means
    the UNIX epoch, which ADR-0001 cites as the reason to drop the word rather
    than an instance of it. It is also jolly-roger's file and byte-identical to
    the stem, so editing it to satisfy a grep diverges a shared file and buys a
    conflict in every future merge. Step 3's sweep rewrote it to "ms since
    cycle", which is false about a `Date.now()`, and it was reverted.
  - `contracts/src/game/internal/UsingGameInternal.sol` cites bomber-world's
    `_epoch()`. That is a DESCENDANT'S symbol name, and by this tree's own rule a
    game repo is expected to still say `epoch` until it is ported, so an accurate
    citation must spell it. The sweep renamed it into a function that exists in
    no repo.
  - `web/src/lib/placement/storage.ts`, **after step 3 only**. Step 4 removes it;
    see the persisted-record section above for why there was nothing to migrate.
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
