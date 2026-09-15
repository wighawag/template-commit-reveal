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

**Step 1 is the only one with a deadline.** `epochPolicy` is a `linkedData` key,
`epoch` is an indexed topic on `CommitmentMade`, `CommitmentRevealed` and
`CommitmentVoid`, and `InvalidEpoch` is a custom error clients match on by name.
Nothing on this stack has a live deployment with users, so those cost a redeploy
today and a migration later. Everything else is source, and source can be swept
at any pace.

| step | what | scale, measured at `bb3fb1bb` | blocked by |
| --- | --- | --- | --- |
| 1 | the WIRE **and every reader of it**: the ABI names, plus the three client sites that name them as STRINGS | ~20 contract sites + 3 client sites | nothing |
| 2 | Phase 3's own surface: `_round()`, `getRound`, `advanceRound`, `RoundAdvanced`, `RoundReading`, `predictRound`, `createRoundReader`, `readRound` | **66 occurrences in 10 files** | step 1 |
| 3 | the `epoch` sweep: identifiers, comments and docs, contract and client | **1,720 occurrences in 73 files**, per node | the tool |
| 4 | `RoundStore` -> `SubmissionStore` and the rest of the per-player sense | **148 occurrences in 22 files** here, **189 in 26** in reveal-or-die | step 3 |

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

## Step 1 is NOT contracts-only, and this is the trap in it

The client names three wire values as **string literals**, so a contracts-only
step 1 leaves them pointing at things that no longer exist:

- `web/src/lib/placement/missed-reveal.ts` calls `functionName: 'getEpoch'`
- `web/src/lib/game/core/epoch.ts` reads `optionalNumber(values, 'epochPolicy')`
  and names it again in the error text it throws

**`check` will not catch any of the three**, because they are strings. The unit
suite will, and only because the context-construction tests build the real
config out of `deployments.ts` - the same six tests in two files that the
verify-option-6 finding measured when `linkedData` was blanked. So step 1 is one
commit containing the contracts, the deploy script, and those three client sites,
and its `deployments.ts` must be regenerated before the suites mean anything.

If a future step of this kind cannot be made to compile in one commit, the answer
is expand-first: add the new name beside the old, migrate the readers, then
remove the old in a third commit. Do not ship a step that is red in isolation and
green only in combination, because the cascade merges them one node at a time.

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

## What else the rename owns, so it is not left half-done

- **`AGENTS.md`'s note that the code still says `epoch`** becomes half-false the
  moment step 3 lands here: the template will say `cycle` while every game still
  says `epoch`. Step 3 rewrites that paragraph to say exactly that, or the next
  reader concludes the glossary is stale, which is the confusion it was written
  to prevent.
- **`CONTEXT.md` needs no change**, because it already states the target
  vocabulary. Check rather than assume: if a step wants to edit the glossary,
  something has drifted from ADR-0001 and that is a finding, not an edit.

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
- `rename-term.sh verify` reports no stragglers, with the allowlist naming
  `foreground`, `background`, `rounding` and `drandRound` and nothing else.
- `grep -ri epoch web/src contracts/src` returns nothing on `main` after step 3.
  Not `-w`: the word lives inside identifiers 793 times, and a word-boundaried
  audit would report success over `epochDuration`.
- `check-shared-divergence.sh` per branch with its own list, plus the empty run,
  matching the sets this plan records: 1 for `with/pixi-js`, 12 for
  `with/nft-identity`, 13 for `with/all`.
- e2e on `with/all` and on reveal-or-die after step 3, because a rename that
  breaks a `data-testid` or a locator is invisible to `check` and to the units.

## Checked by mutation, not just green

A rename has no behaviour to mutate, so the mutation here is the tool's:
**re-run step 3's mapping on the already-renamed tree and confirm it is a
no-op.** A second application that changes anything means a mapping entry is
matching its own output, which is how `cycleNumberNumber` gets committed.

Second: take one file the sweep touched, revert it to the old vocabulary, and
confirm `verify` names it. A verifier nobody has seen fail is not a verifier.
