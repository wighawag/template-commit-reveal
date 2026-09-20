---
title: A file that is byte-identical in every repo is where naming one game's answer is guaranteed to be false
type: finding
status: spotted, and fixed where it fired
spotted: 2026-09-20
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, the re-point), AGENTS.md (the stake rule), CONTEXT.md (Stake)
---

# The sentence was true where it was written and false where it landed

Written during the `integration` re-point, in two files that came down the cascade unchanged:

> a provisioning hook that bonds the ERC20 stake

`web/src/routes/+page.svelte` and `web/src/lib/embedded/README.md`. Both are correct about the reference game, which does bond an ERC20 and forfeits it through `acknowledgeMissedReveal`. Both then arrived in reveal-or-die, which gates on custody of an NFT and has no ERC20 anywhere - and `routes/+page.svelte` is **one git blob across tcr's four branches and reveal-or-die**, so the false sentence was not a copy that had drifted, it was the same bytes being read in a repo where they are wrong.

## Why this is worth a note rather than a fix and a shrug

`AGENTS.md` and `CONTEXT.md` both already state the rule the sentence broke: the framework requires only that SOMETHING is lost by not revealing, and what that something is belongs to the game. The plan states it too, twice, including the correction that a missed reveal does not always mean a forfeited bond. **So the rule was written down, in three places, by the same person, and the sentence was written anyway** - which means "state the rule" is not the mitigation.

What the shape actually is: **the risk that a sentence is game-specific scales with how widely the file is shared, and the files shared most widely are the ones that feel most like scene-setting** - a home page, a directory README, a comment above an import. Nobody applies the level-boundary test to a comment. The test is cheap and it is Decision 2's own: would another game on this foundation have to write this? If the answer is no, do not put it in a file every game inherits, even as prose.

## How it was caught, which is the reusable part

Not by a gate, and not by re-reading what was written. By **grepping the merged file in the descendant** after the cascade reached it:

```sh
grep -n 'ERC20' web/src/routes/+page.svelte web/src/lib/embedded/README.md
```

That is the same move that catches the other clean-merge failures this tree keeps paying for, and it generalises past this instance: after a cascade, read the files that are identical everywhere IN THE REPO FURTHEST DOWN, because that is where a statement about the template is most likely to have stopped being true. The divergence checker cannot help - the file is identical, which is exactly the state it is checking for.

## Fixed by saying the shape rather than the value

The correction is not to delete the detail. It is to name the framework's requirement and then give the values as examples, which is what makes the sentence true everywhere:

> a provisioning hook that gives the offline player whatever THIS game puts at stake - a bonded ERC20 in the reference game, custody of an NFT in reveal-or-die, a docked level elsewhere; the framework requires only that something is lost by not revealing

The `+page.svelte` comment goes further and says WHY it declines to name one, so the next editor knows the omission is deliberate rather than vague. That is the cheap general defence: in a file that is inherited unchanged, a sentence that names one game's answer should say that it is one game's answer, in the same breath.
