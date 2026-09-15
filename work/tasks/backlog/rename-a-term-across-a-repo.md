---
title: A tool for renaming a term across a repo, built for the five games that will each use it once
slug: rename-a-term-across-a-repo
spec: games-on-this-foundation
blockedBy: []
---

# `rename-term.sh`, on jolly-roger's `tooling` branch

ADR-0001 settles the vocabulary and stages the code behind it. The staging spans
this repo's four branches now and five game repos later, each of which renames
ONCE, at its own port, months apart, by somebody who was not here. That is five
or six uses of the same awkward operation, which is what earns a tool rather
than a session of careful `sed`.

**It goes on jolly-roger's `tooling` branch**, beside `check-shared-divergence.sh`,
and is adopted the same way: a local orphan branch, run with
`bash <(git show tooling:rename-term.sh)`, no install, no build step. A local
edit to the adopted copy is the divergence-by-copy the tree keeps paying for;
changes go upstream and come back with the documented one-line rebuild.

## The thing to understand before building it

**The risk is the decision per SITE, not the edit.** A mechanical replace is
five minutes and it is wrong in exactly the places this exercise is about: one
word goes to two different targets by SENSE. `RoundPhase` is the shared
interval and becomes `CyclePhase`; `RoundStore` is one player's pass through it
and becomes `SubmissionStore`. No tool can tell those apart, and a tool that
pretends to will silently merge two concepts that were just separated.

So the tool's job is to make the classification cheap and the verification
certain, and to leave the sense to a human with a list in front of them. That is
`check-shared-divergence.sh`'s philosophy exactly: it does not fix drift, it
names it, and the value is in the ritual.

**Grouping by FILE is the sense-splitting mechanism most of the time**, because
this codebase already separates senses by module. Report grouped by file and a
reader classifies twenty files instead of 1,715 sites.

## Scope

Three verbs, in the shape of the script it sits beside (env-configured, colour
output, a README section, exit non-zero on failure):

- **`report`** - every occurrence of a term, grouped by file, counted, and split
  by class: identifier, comment, string literal, and WIRE (a Solidity event,
  error, function or `linkedData` key, which is the class that changes an ABI
  and must be staged separately). This is what you read before deciding
  anything.
- **`apply`** - takes a MAPPING FILE of `from -> to` and rewrites, dry-run by
  default. Case-aware from one entry, so `epoch -> cycle` also does `Epoch ->
  Cycle`, `EPOCH -> CYCLE`, `currentEpoch -> currentCycle`. Word-boundaried,
  always.
- **`verify`** - no occurrence of a renamed term survives outside an allowlist,
  and no duplicate definitions were introduced (the `uniq -d` check `HANDOFF.md`
  already prescribes after every merge, which is the same hazard).

**The mapping is a file in the repo being renamed, not a list inside the
script.** It is the reviewable artefact and it differs per game: reveal-or-die's
will mention avatars, conquest's empires, and a game may legitimately decline an
entry. One tool, five mappings.

**Paths come from the environment, as `WATCH` does today.** bomber-world keeps
its contracts in `onchain/evm/`, not `contracts/`, and stratagems adds `common/`,
`indexer/` and Cloudflare workers. A tool that assumes this repo's layout serves
one of the six users.

**It covers `.sol`, `.ts`, `.svelte` and `.md`.** Comments and docs are most of
the value in this tree, and they are where a TypeScript-aware codemod would help
least: an AST tool solves the easy half and cannot touch Solidity or prose.

## Out of scope

**Anything semantic.** No AST, no scope analysis, no import rewriting beyond the
text. If that turns out to be needed, it is a second tool and a second decision.

**Deciding the mapping.** That is ADR-0001's job and the per-repo task's job.

## Acceptance

- `report` on `template-commit-reveal@main` for `epoch` reproduces the figure
  this plan already records - **1,715 occurrences in 73 files** - and splits it
  by class, with the wire names (three event topics, `InvalidEpoch`,
  `epochPolicy`) named individually.
- `apply` with an EMPTY mapping changes nothing. That is the run that proves the
  tool is doing the work rather than matching nothing, and it is the same ritual
  every checker in this tree has.
- The `foreground` case: a mapping of `round -> cycle` applied to a file
  containing `foreground`, `background`, `rounding` and `drandRound` leaves all
  four alone. **258 substring matches in this tree** make this the mistake the
  tool exists to prevent.
- `verify` FAILS on a tree with one straggler left, and says which file.
- It runs against a layout that is not this one. reveal-or-die is the available
  proof (its contracts are its own and its client is ported); bomber-world's
  `onchain/evm/` cannot be tested until that repo is cloned on the machine doing
  the work.

## Checked by running the case, not by reading the patch

This script family has already produced two guards that passed for the wrong
reason, both recorded: `${EXT:-ts}` turned a set-but-empty value back into the
default so the "run it with the list empty" ritual quietly kept an allowance,
and the first teeth check measured nothing because the script compares REFS
while the mutation sat uncommitted in the working tree.

So: every acceptance line above is a command to run, and the empty-mapping and
`foreground` cases are the two that matter. A rename tool that cannot fail is
worse than no rename tool, because it will be trusted on a repo nobody re-reads.
