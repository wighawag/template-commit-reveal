---
title: reveal-or-die is already on the seams, so the handoff's next item is stale and the real next step is a 45-commit cascade
type: observation
status: spotted
spotted: 2026-09-23
relates-to: HANDOFF.md ("What is left", item 1), work/tasks/backlog/vocabulary-in-the-game-repos.md, work/notes/findings/main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint.md, work/specs/proposed/games-on-this-foundation.md
---

# The port that was next has already happened, incrementally, and nothing said so

**Found by checking before starting, 2026-09-23.** The intention was to start `HANDOFF.md`'s item 1, "Port reveal-or-die: first real test of the seams against a game that was not written for them". It is done, and the handoff still reads as though it were the next big piece of work.

## What is actually true in `~/dev/github/wighawag/reveal-or-die` (clean, `50079fb1`)

- **It implements the seams.** `web/src/lib/world/commit-reveal.ts` is its `CommitRevealAdapter`, typed against `$lib/game/core/seams`. Its own modules (`controls.ts`, `display-plan.ts`, `planning.ts`, `reveal-outcome.ts`, `storage.ts`) import `SubmissionStore` / `SubmissionState` from `$lib/game/core/submission`, so the framework owns its round.
- **Its `stem` is `template-commit-reveal` and its tip is a merge from `stem/with/all`.** The re-point that `main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint` warned about is done, as that note's own CLOSED block already said.
- **The inherited framework is already renamed.** `web/src/lib/game/core/` holds `cycle.ts`, `cycle-phase.ts` and `submission.ts`, which arrived with the 2026-09-20 merge.

So the port did not happen as a project. It happened as a by-product of Phase 1 and Phase 2: every row of the upstream-moves table deleted reveal-or-die's own copy as it landed (input recognisers, the acquisition rail, the countdown, liveness, board handover, diagnostics, linked-data). The plan records each of those as DONE. Nobody went back and struck the line in the handoff that described the aggregate as still pending.

**The general shape, worth naming because this tree is built on incremental moves:** a plan that lands a big item as a series of small ones has to strike the big one explicitly, because no individual commit ever looks like the thing being finished.

## What reveal-or-die actually needs next

**A cascade of 45 commits.** Last merged 2026-09-20; `stem/with/all` is now `b5e0d311`. Everything from the offline world, the lobby, the seat model and `webevm` 0.6.0 is unmerged there.

That is not a routine merge in this tree, and the evidence is the last one: the re-point merge took **40 conflicts, not the 3 that were predicted**, and the thing that broke the build was not a conflict at all. It was clean ADDs (`contracts/src/game/avatar/` arriving into a game that has its own avatar contracts, four inherited test files naming a `$lib/placement` that game deleted) and one clean hunk that rewrote an e2e test's inputs from addresses to digits against a write that takes an address. `check` and 1,674 unit tests were green for that one; only e2e caught it, and e2e is not in `verify`.

So the rule from that finding applies directly and should be read before starting: **any hunk that merges cleanly because the two sides were never in textual conflict can still be semantically wrong in the descendant.** Read the merged files in reveal-or-die, do not trust the diff.

## A correction to `vocabulary-in-the-game-repos`

That task schedules reveal-or-die's rename **inside the template's cascade**, on this reasoning:

> it inherits `game/core/{round,epoch,round-phase}.ts`, so the merge renames those whether anybody plans it or not, and leaves its own ~189 sites behind. There is no moment in between where that repo compiles, so its rename is part of the cascade commit rather than a job that could wait for this task

**The premise has already been tested and it did not hold.** The inherited rename landed on 2026-09-20 and the repo is sitting clean on top of it with its own sites untouched: 152 `epoch` hits across 11 files in `web/src`, 135 across 9 files in `contracts/src`. The two halves are DECOUPLED, because a game's `epoch` refers to its own contracts' `epoch` and the framework's `cycle` refers to the framework's. That is exactly what `AGENTS.md` predicts ("a descendant full of `epoch` is a schedule, not a stale glossary") and it contradicts the task's scheduling claim.

Two consequences:

- **reveal-or-die's rename is schedulable on its own** and does not have to ride the cascade. It should be its own job, which is also the safer shape given the cascade's own hazard above.
- **The site estimate is low.** ~189 was predicted; it is 287 (152 + 135). Worth re-deriving the other repos' estimates before anyone plans from them.

Not edited into the task here, because this note is evidence and the task is a plan; whoever takes it should make the change with the work.

## The one thing NOT to conclude

The handoff's reasoning for why that item mattered is still correct and is not retired by this note: **the seams are proven by one game and its ports are where they get tested.** What changed is only which port is next. reveal-or-die is now a second game ON the seams, which is a real data point, but it inherited them rather than being fitted to them, so it is weaker evidence than bomber-world or conquest will be. `CommitRevealAdapter` has still only been bent by one game's requirements.
