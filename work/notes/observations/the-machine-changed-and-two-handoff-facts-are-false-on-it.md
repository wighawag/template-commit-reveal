---
title: The machine changed: pnpm IS on PATH, and bomber-world is not on disk at all
type: observation
status: spotted
spotted: 2026-09-15
relates-to: HANDOFF.md (environment gotchas), AGENTS.md, work/specs/proposed/games-on-this-foundation.md (D3, D8)
---

# Two environment facts this project keeps repeating are false on the machine it is now on

Phase 3 was done on a different host from every phase before it, and the handoff
says e2e was "last run on the PREVIOUS machine". Two of the standing environment
instructions do not hold here, and one of them makes a whole decision
unexecutable.

## `pnpm` is on PATH, and volta is not installed

`AGENTS.md` and `HANDOFF.md` both say, emphatically and for good reason:

> **`pnpm` is not on PATH** (use `~/.volta/bin/pnpm`)

On this host `~/.volta` does not exist, and the first command of the session
failed with `timeout: failed to run command '/home/wighawag/.volta/bin/pnpm'`.
What is here is NixOS: `/run/current-system/sw/bin/pnpm`, version 10.28.1, with
node v24.19.0 - the same node the handoff records, so the toolchain is otherwise
what the plan describes.

Rather than rewrite the instruction to name this host, the useful form is the one
that is true on both: **run `pnpm --version`; if it fails, look for
`~/.volta/bin/pnpm`.** A hard-coded absolute path in a handoff is a fact about a
machine masquerading as a fact about a project, and this is the second time the
project has paid for one (the first was the `format:check` instruction that went
stale).

One thing it surfaced that is worth watching on any host: pnpm 10.28 prints
`The "pnpm" field in package.json is no longer read by pnpm. The following keys
were ignored: "pnpm.onlyBuiltDependencies", "pnpm.overrides"` on every single
invocation. **`pnpm.overrides` being ignored is not cosmetic** - it is how a
workspace pins a transitive dependency - and every repo in this tree has that
field. Nothing in Phase 3 depended on an override resolving, and `check`,
`test:unit`, `contracts:test` and the e2e suite are all green, so it is recorded
rather than chased. It belongs upstream at `template-svelte`, where the field
lives in the root `package.json` that every repo inherits.

## bomber-world is not on this machine

It is not in `~/dev/github/wighawag/` and a bounded `find` over the whole
filesystem does not turn it up. Two consequences:

- **Phase 3 read the prototype where it also lives.** The manual-epoch
  prototype was already ported into this repo and into reveal-or-die, and
  reveal-or-die's copy carries both TODOs verbatim ("add posibility to skip
  epoch even if turn are timed", "add logic to present moving to next epoch if
  not all player who already in the game has done so"). So nothing was lost:
  the two TODOs the plan calls "exactly the missing work" were read from a
  clone that is on disk.
- **D3 and D8 are currently unexecutable.** D3 re-syncs bomber-world (~1161
  commits behind) and D8 makes it the UI-swap test, with an acceptance
  criterion measured in that repo. Neither can start until it is cloned, and
  D8 additionally needs the sprite kit under `~/Documents/Etherplay/Assets/`,
  which is also worth checking for before the phase is planned rather than
  when it starts.

Neither is a change of decision. What is worth carrying is that **the plan
records repo state as though the tree were one machine**, and the tree is now at
least two: a table that says "1161 commits behind" is describing a clone that may
not be in front of you.
