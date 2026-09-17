---
title: A tool for renaming a term across a repo, built for the five games that will each use it once
slug: rename-a-term-across-a-repo
spec: games-on-this-foundation
blockedBy: []
---

# `rename-term.sh`, on jolly-roger's `tooling` branch

## Start here, from a cold context

```sh
cat CONTEXT.md                                    # the glossary, in the working tree
git show work:docs/adr/0001-cycle-is-the-frameworks-word-round-and-turn-belong-to-games.md
git show work:work/tasks/backlog/the-vocabulary-rename.md   # the first consumer
```

The `work` branch is also checked out at `~/dev/worktrees/template-commit-reveal/work`
on the machine this was written on. `check-shared-divergence.sh` on jolly-roger's
`tooling` branch is the model to copy: read it, and read `README.pixi-js.md` in
this repo for how a `tooling` script is adopted and rebuilt.

**This tool knows nothing about cycles.** It renames any term in any repo, which
is why it belongs on jolly-roger's branch rather than this one even though the
vocabulary that motivates it is this template's.

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
  Cycle`, `EPOCH -> CYCLE`, `currentEpoch -> currentCycle`.

**IT MATCHES IDENTIFIER PARTS, NOT WORD BOUNDARIES, and getting this backwards
breaks it in both directions.** Measured on `main` at `bb3fb1bb`:

```sh
# word-boundaried: 927 occurrences in 70 files
grep -roiw --include='*.sol' --include='*.ts' --include='*.svelte' --include='*.md' \
  epoch contracts/src contracts/deploy contracts/rocketh contracts/test \
  web/src web/test web/e2e | wc -l
# as an identifier part: 1720 occurrences in 73 files
grep -roi  --include='*.sol' ... (same paths, no -w) | wc -l
```

A word-boundaried pass would MISS 793 of them, because the word is usually
inside an identifier: `epochInfo` 56, `currentEpoch` 43, `epochDuration` 24,
`EpochPolicy` 23, `EpochInfoStore` 17, `epochPolicy` 14, `EpochConfig` 12. A
naive substring pass instead OVER-REACHES, and the counts for that are just as
real: `foreground` 259, `background` 64, `Math.round` 35, `rounding` 14.

So the rule is neither: split an identifier into camel, Pascal and snake PARTS
and match a whole part. `currentEpoch` has a part `Epoch` and renames;
`foreground` and `rounding` are one part each and do not; `Math.round` and
`drandRound` DO have a matching part and need the allowlist.

**`roundTone` is the case that shows the allowlist is a judgement and not a
filter, and it is a better example than this task first realised, because this
task GOT IT WRONG.** It has a matching part, so the tool will offer it. This
section used to say the right answer was to rename it, on the grounds that it is
the HUD's tone for the shared interval. It is not: it is assigned beside
`roundLabel` from one call to `describeRound`, which takes the PER-PLAYER
`RoundState`, so it belongs to the sense that becomes `submission` and not the
one that becomes `cycle`. Step 2 landed with it deliberately left behind; see
`the-vocabulary-rename.md`.

So the lesson is sharper than the one originally drawn. **Two documents, written
by someone who had read the file, both classified this site wrongly, and the
only thing that caught it was a human reading the call site.** That is precisely
why `report` groups by FILE and stops: a tool confident enough to classify would
have been confidently wrong here, and so was the prose. Report a part match;
never decide it.

An earlier draft of this task also listed a `roundTo` in the allowlist; no such
identifier exists in the tree, and the four hits were `roundTone` matched by a
careless prefix grep.
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

**Every number below carries the command that produced it, and a number without
its command is a trap rather than a baseline.** This is not pedantry: the first
draft of this task said "1,715 in 73 files" from a four-grep sum that omitted
`*.md`, and re-measuring the same tree with one command said 1,720. Re-measure
before starting and expect drift as work lands; a mismatch means the tree moved,
not that the tool is wrong.

- `report` on `template-commit-reveal@main` for `epoch` reproduces **1,720
  occurrences in 73 files** at `bb3fb1bb`, by the identifier-part command above,
  and splits them by class.
- The WIRE class names every ABI-visible site individually. At `bb3fb1bb` that
  is: `getEpoch`, the `epoch` return of `getCellsInZone`/`getCellsInZones` and
  of `advanceRound`, `InRevealPhase`, `InCommitmentPhase`, `CanStillReveal`,
  `InvalidEpoch`, `InvalidEpochConfiguration`, the indexed `epoch` topic on all
  FIVE events that carry one (`CommitmentMade`, `CommitmentCancelled`,
  `CommitmentRevealed`, `CommitmentVoid`, `RoundAdvanced`), the `epoch`
  COMPONENT of the `Commitment` and `Round` structs, the `EpochPolicy` enum, and
  the `epochPolicy` field of `Config` which is also a `linkedData` key.
  **Solidity parameter names and struct component names are part of the ABI**,
  so `uint64 epoch` inside an error, an event or a struct is a wire site and not
  an internal one. A tool that classifies only function and event NAMES will
  under-report this class.
- `apply` with an EMPTY mapping changes nothing. That is the run that proves the
  tool is doing the work rather than matching nothing, and it is the same ritual
  every checker in this tree has.
- The over-reach case: a mapping of `round -> cycle` leaves `foreground` (259),
  `background` (64) and `rounding` (14) untouched by the PART RULE alone, leaves
  `Math.round` (35) untouched via the ALLOWLIST, and renames `RoundPhase`. It
  also OFFERS `roundTone` (4), which a human must then decline, because that
  site is the per-player sense; see the note above. `Math.round` is the one that
  proves the allowlist is real rather than decorative, because a part-matcher
  does match it and `Math.cycle` is the result.
- The under-reach case: a mapping of `epoch -> cycle` renames `epochDuration`,
  `currentEpoch` and `EpochInfoStore`. A tool that only does whole words passes
  every other test here and is useless.
- `verify` FAILS on a tree with one straggler left, and says which file.
- `verify` FAILS on a tree with one straggler left, and says which file.
- It runs against a layout that is not this one. reveal-or-die is the available
  proof (its contracts are its own and its client is ported); bomber-world's
  `onchain/evm/` cannot be tested until that repo is cloned on the machine doing
  the work.

**`drandRound` is forward-looking and is not in the tree today.** It arrives
with fuzd in Phase 5, where a scheduled reveal is encrypted against a drand
round. It is in the allowlist now so that whoever adds fuzd does not have to
rediscover the collision; do not go looking for it and conclude this task is
confused.

## Checked by running the case, not by reading the patch

This script family has already produced two guards that passed for the wrong
reason, both recorded: `${EXT:-ts}` turned a set-but-empty value back into the
default so the "run it with the list empty" ritual quietly kept an allowance,
and the first teeth check measured nothing because the script compares REFS
while the mutation sat uncommitted in the working tree.

So: every acceptance line above is a command to run, and the empty-mapping and
`foreground` cases are the two that matter. A rename tool that cannot fail is
worse than no rename tool, because it will be trusted on a repo nobody re-reads.

## What the first consumer learned, having done all four steps BY HAND

**`the-vocabulary-rename` is finished and this tool was never built**, which was
allowed ("if the tool was declined after steps 1 and 2, this clause is satisfied
by the two `grep` audits instead"). That is not a verdict against building it: it
is five more repos of evidence about what it would have to do, gathered at the
cost of doing the work without it. Everything here is measured rather than
predicted.

**The classification is the whole job, and it is worse than this task assumed.**
The task already says "the risk is the decision per SITE, not the edit". Four
steps say the same thing three levels deeper:

- **Two documents, written by someone who had read the file, classified a site
  wrongly** (`roundTone`, which this task used as its worked example and got
  backwards). Only a human reading the CALL SITE caught it.
- **The plan's own named list was a FLOOR, not a ceiling, in every step.** Step 2
  found three shared-interval names the plan did not list; step 4 found ~25 more
  in prose. A tool that renames only what a mapping names will leave a tree
  holding two words for one thing, and the report is what has to prevent that.
- **PROSE matters as much as identifiers, and splits by sense the same way.** A
  file whose comments say `round` above an identifier saying `cycle` is the same
  defect as two identifiers. Worse, step 4 met one sentence carrying BOTH senses
  and had to split it in half.

**Three failure shapes no part-matcher can see, all met for real:**

1. **An English idiom broken across a line.** "the other way round" with `round`
   at the start of the continuation line. No word-boundary rule sees it; it was
   caught by a reviewer reading prose. reveal-or-die had two more ("no RPC round
   / trip", "WALLET ROUND / TRIP") which survived only because that sweep was
   line-based.
2. **Code inside a comment.** NatSpec's `@return cycle` is a PARAMETER NAME, so a
   lexer that calls the whole comment prose renames it and solc rejects the file.
   That one at least fails loudly.
3. **A regex literal treated as code.** `/you missed the reveal for epoch/i`
   became `.../for cycleNumber/i` against a HUD rendering "for cycle N". Nothing
   type-checks `web/e2e`, so it was green everywhere.

**The allowlist is where this task's own example bit.** `roundTo` was put in a
guard list and matched inside `roundTone`, silently protecting it - which is the
bug this task ALREADY RECORDS at the top, reproduced by someone who had read the
record. So `verify` must assert statically that no allowlist entry matches as a
substring of any pattern or replacement, and that no entry matches another
entry's output. That check needs no tree and takes milliseconds.

**And `apply --twice` cannot be a no-op**, which is the acceptance the consumer
task had to correct. Every deliberate exception comes back on the second run.
The check with teeth is that the second run touches the EXCEPTION LIST and
nothing else, in both directions, which means the exceptions have to be data the
tool holds rather than judgements in a person's head.

**Three things a tool must NOT do, each of which cost this tree real time:**

- **Never touch a file byte-identical to the stem's.** A one-word comment edit in
  `core/transaction/in-flight.ts` diverged a shared file over the UNIX epoch,
  which was not even the word being renamed. `report` should mark stem-identical
  files and `apply` should skip them by default.
- **Never rename a name matched against an ABI the repo does not own.** A
  descendant's client reads its own contracts by name through strings, casts and
  event-topic KEYS; viem treats an unrecognised key as an unfiltered query rather
  than an error.
- **Never rename a serialised name without being told it is free.** The check is
  one command per repo (`git ls-files contracts/deployments`), and the answer
  differs between the template and reveal-or-die.

**The honest summary for whoever picks this up:** four steps by hand cost roughly
a day and produced a correct result, and every single thing that went wrong was
caught by a human reading a diff or a reviewer reading a call site - never by a
gate. That is an argument for building the REPORT and the VERIFY halves, which
make reading cheap and make the exceptions durable, and against ever letting
`apply` decide anything.
