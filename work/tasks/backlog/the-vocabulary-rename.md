---
title: Move the template onto the glossary's words, wire names first while they are still free
slug: the-vocabulary-rename
spec: games-on-this-foundation
blockedBy: [rename-a-term-across-a-repo]
---

# `epoch` becomes `cycle`, in four staged steps

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

| step | what | scale | blocked by |
| --- | --- | --- | --- |
| 1 | the WIRE: event topics, the error, `epochPolicy`, `getConfig`'s field | ~20 sites, contracts only | nothing |
| 2 | Phase 3's own surface: `_round()`, `getRound`, `advanceRound`, `RoundPhase`, `RoundReading`, `predictRound`, `createRoundReader` | ~35 sites, 8 files | step 1 |
| 3 | the `epoch` sweep: identifiers, comments and docs, contract and client | 1,715 sites, 73 files, per node | the tool |
| 4 | `RoundStore` -> `SubmissionStore`, `RoundState` -> `SubmissionState`, `PersistedRound` -> `PersistedSubmission`, `createRound` -> `createSubmission` | 123 sites in 18 files here, 153 in 22 in reveal-or-die | step 3 |

Steps 1 and 2 are small enough to do by hand and are the honest pilot for the
tool: if the tool cannot reproduce what a careful hand did on step 2, the tool is
not ready for step 3.

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

## Out of scope

**The game repos.** They are not inherited and each renames at its own port; see
`vocabulary-in-the-game-repos.md`.

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
- `grep -w epoch` over `web/src` and `contracts/src` returns nothing on `main`
  after step 3.
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
