---
title: Two guards here read SOURCE TEXT, so a comment about the guard is indistinguishable from the thing it guards
type: observation
status: spotted 2026-09-22, both cost a build
spotted: 2026-09-22
relates-to: web/test/e2e-account-claims.test.ts, web/test/svelte-conventions-boundary.test.ts, web/e2e/tests/offline.e2e.ts
---

# A textual check cannot tell an example from a use

`web/test/e2e-account-claims.test.ts` decides which e2e files need a burner account of their own by searching each file's SOURCE for the fixtures that connect a shared wallet. That is a good design for what it does: it reads the suite rather than a list, so a new file claiming a taken index fails there instead of twenty minutes into a parallel run.

The new offline e2e suite claims no account, because it sends every one of its transactions on a chain that exists only inside its own page. Its doc comment said so, and named the three fixtures the check looks for in order to explain which check it was talking about. **The suite then failed the claims check, for a collision it was in the middle of explaining it could not have.** The remedy is one sentence of prose - describe the fixtures, do not spell them - plus a line saying why the file is worded that way, or the next person will helpfully "improve" it.

**It is the second instance of the same shape in this repo**, and the first is already catalogued in `AGENTS.md`: `svelte-conventions-boundary.test.ts` matches rune names as WORDS, so a callback parameter called `$state` in a `.ts` file reads as a rune and fails the build. The existing code works around it by naming the parameter `$custody`, with a comment saying why.

**The general form, which is worth knowing before writing the third one: a check that reads source text has no notion of mention versus use.** That is usually the right trade - it needs no type information, it cannot be defeated by indirection, and it costs ten lines - but it means the FILES THAT DISCUSS THE RULE are exactly the files most likely to break it. The two cheap mitigations are to name the rule without naming its symbols, and to say at the site that the wording is load-bearing.

Neither check should be made cleverer for this. A parser that could tell a comment from code would be a much larger thing to maintain in exchange for a failure mode that announces itself immediately, in the right file, with the right message.
