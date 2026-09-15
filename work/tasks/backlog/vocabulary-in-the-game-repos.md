---
title: The games adopt the vocabulary inside their ports, not as a pass of their own
slug: vocabulary-in-the-game-repos
spec: games-on-this-foundation
blockedBy: [the-vocabulary-rename]
---

# Five games, five mappings, and only one of them is a standalone job

`CONTEXT.md` cascades to every game the moment it merges, so each of them will
hold a glossary saying `cycle` over a codebase saying `epoch`. That is recorded
as expected rather than as drift (`AGENTS.md` says a descendant full of `epoch`
means the game has not been ported yet), and this task is how it ends.

## The decision this task exists to make, and it is a scheduling one

**Do not schedule a standalone rename for a game that still has to be ported.**
A port already rewrites that game's contracts onto the seams and its client onto
the framework; doing the vocabulary in the same change costs close to nothing,
and doing it separately means two passes through the same files and two merges
that conflict with each other. The rename is a line item in the port, not a
project.

| repo | when | notes |
| --- | --- | --- |
| `reveal-or-die` | **its own job, and it goes first** | already ported and current, so there is no port to fold it into. Full suites and a real e2e make it the best first customer for the tool after the template |
| `bomber-world` | inside D3's re-sync | contracts live in `onchain/evm/`, not `contracts/`, so the tool's paths must come from config. **Not cloned on the machine this was written on**; check before planning |
| `conquest-v1` | inside its port | second bigint identity, own `empireID` vocabulary, resolution rules unwritten. The port is already the place its `_acquireStarSystem` defect gets fixed |
| `catacombs` | inside its port | has no epoch clock on the web side at all, so half the client sites do not exist to rename |
| `stratagems` | inside its port | **renames TWICE**: its contract and its 700-line TypeScript reimplementation of that contract in `common/`, which is a second implementation of the same logic and will not be caught by a contracts-only sweep |

## What each game decides for itself, and must not be talked out of

**A game may keep `round` and `turn` for its own concepts, and that is the point
of reserving them.** The framework says `cycle`; a game whose players experience
one cycle as a turn should say turn in its UI copy, its HUD and its own modules.
The mapping file is per repo, and a game declining an entry is the vocabulary
working rather than an inconsistency to stamp out.

What is NOT negotiable is the other direction: a game must not use `cycle` for
something that is not the framework's interval.

## Out of scope

**Reviving a dormant game.** catacombs and stratagems are deferred on grounds of
effort and this does not change that. Their rows exist so that whoever does the
port knows the vocabulary is part of it.

**Any framework change.** If a game's rename wants one, that is a finding and it
goes upstream on its own.

## Acceptance

Per repo, at the time it is done:

- its suites green at exactly the counts recorded for it before the rename, not
  one test fewer;
- `rename-term.sh verify` clean against that repo's own mapping and allowlist;
- its `CONTEXT.md` extended with the words that game settled for itself, which is
  the artefact that says a deliberate `turn` is deliberate;
- e2e where the repo has one, because a rename that breaks a locator or a
  `data-testid` is invisible to `check` and to the units. That is not
  hypothetical here: a fixture matching on the game's own words has already cost
  this tree a 25-minute browser run to find.

## The one thing worth measuring while doing it

**Count the sites in each game's own code versus the inherited framework's.** The
plan tracks how much of each game is really the game, and this sweep produces
that number for free: a game whose `epoch` sites are nearly all inherited is one
the level boundary has held for, and a game with hundreds of its own has a
vocabulary the framework has not reached. Either answer is worth having, and
nobody will pay for it separately.
