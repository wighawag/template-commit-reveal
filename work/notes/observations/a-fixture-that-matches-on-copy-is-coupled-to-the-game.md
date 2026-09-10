---
title: An e2e fixture that presses a button by its LABEL is coupled to what the game sells
type: observation
status: fixed
spotted: 2026-09-10
relates-to: work/specs/proposed/games-on-this-foundation.md (D2, N1), web/e2e/fixtures/game.ts
---

# The words are the game's; the control is the framework's

`e2e/fixtures/game.ts`'s `stake()` pressed the setup gate by matching
`/stake (for|to play)/i`, and fell back to `/add stake/i`. Both labels say what
THIS game sells. `with/nft-identity` sells an avatar, so both labels changed,
and the fixture timed out for thirty seconds naming a button nobody had
removed - in three separate suites, none of which is about acquiring anything.

Fixed upstream on `main` (2026-09-10): both controls in `GameHud.svelte` carry
`data-testid` (`acquire-stake`, `acquire-more-stake`) and the fixture presses
those. Every branch and descendant inherits it.

## The general form, which is the reason to write this down

A template's descendants change exactly the things a suite is most tempted to
match on: the words. Three kinds of coupling showed up in one e2e run, and they
rank:

| what the test matches | survives a descendant? |
| --- | --- |
| a `data-testid` | yes |
| an ARIA role plus a FRAMEWORK's word ("Stop waiting", "Execute") | usually - those come from `core/`, which a game inherits |
| a role plus the GAME's word ("Stake to play", "Add stake") | no |

The middle row is worth stating because it is not obvious: matching on text is
not the problem, matching on text the descendant OWNS is. `core/`'s wording is
as stable as its behaviour, and a test that says "the button labelled Stop
waiting" is more readable and no more fragile than one with an id.

**A related instance in the same run, fixed the same day and worth counting
here**: the missed-reveal e2e asserts the player was told a stake was lost by
matching `/is forfeit/i`. The branch's stake is an avatar, and it kept the word
"forfeit" DELIBERATELY rather than making the suite match a synonym. That is
the cheaper direction when a word is genuinely shared vocabulary, and it is a
judgement rather than a rule: `is forfeit` is what this app calls a lost stake
everywhere, so a branch reaching for a different word would have been the odd
one out.
