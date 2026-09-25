---
title: A required declaration forces an ANSWER and not a true one, because the template's answer cascades into the call site as a clean hunk
type: finding
status: FIXED 2026-09-24 in reveal-or-die, pushed
spotted: 2026-09-24
relates-to: work/notes/findings/reveal-or-dies-manual-cycle-had-no-commit-phase-and-nothing-could-reach-it.md, work/notes/findings/an-inherited-paragraph-cannot-say-this-repo.md, docs/adr/0003-the-deployment-declares-its-gas-budget-because-contracts-are-not-inherited.md
---

# The safety parameter arrived in the descendant already answered, and the answer was wrong

`game/core/advance.ts` justified its mirrored guard by saying the contract refuses anything it gets wrong. That is true of this template's contract and false of reveal-or-die's, whose `_moveToNextPhase` checks the policy and nothing else. The fix was to stop assuming it: `createCycleAdvance` now takes `contractIsTheJudge`, with **no default**, so the type checker makes every adopter answer.

**It worked exactly as intended and it was not enough.** The template's own call site in `context/game.ts` answers `true`, with a comment citing the four guards in its `_advanceCycle`. That file is not identical across the tree - reveal-or-die's is heavily diverged - but the hunk that adds one property to one object literal merged into it CLEANLY. One `git merge` later, reveal-or-die declared that its contract judges advances, in a comment describing a function that repo does not have, with:

- `check` 0 errors (the parameter is present and typed),
- 1821 unit tests passing,
- 51 of 51 e2e passing,
- the dangling-import check green, because nothing is missing.

Every gate in the tree is blind to this. The type checker asks for an answer; only a human can tell whether it is true.

## The general shape, which is worth more than the incident

**A required parameter whose value DIFFERS PER REPO must not have its answer written at a call site the template also writes.** The type system's demand ("you must answer") travels down the tree; so does the template's answer, and the second one silently satisfies the first. This is ADR-0003's lesson arriving in a different costume: a number measured against one repo's contracts must not live in a file inherited by repos with different contracts. There it was gas figures in a client file; here it is a safety property in a context builder.

**So the answer lives in the game's own module, as a named constant, beside its evidence.** reveal-or-die now exports `THIS_CONTRACT_JUDGES_AN_ADVANCE = false` from `world/advance.ts`, next to the two paragraphs that say which line of its contract is missing and what it costs (an avatar), and the call site reads the constant. Three things follow, and all three are why this is the right shape rather than a preference:

1. The call site line now DIFFERS from the template's, so the next cascade that touches it conflicts instead of merging - a human is forced to look at exactly the line that matters.
2. The answer is in the file whoever ports the contract already has open, which is the person who will change it.
3. The constant can be flipped in the same commit as the guard it is about, which is the only way the two can be kept honest.

## What would have caught it, and what would not

- **Not a test.** A test in the descendant asserting `false` is a test written by whoever already knew; the failure mode is not knowing.
- **Not the dangling-import check.** Nothing is missing; the code is complete and wrong.
- **A conflict would have.** Which is the argument above: make the line differ, deliberately, so the merge asks.
- **Reading the merged file in the descendant did**, which is the ritual `AGENTS.md` already prescribes for exactly this reason and which is how this was found within the minute.
