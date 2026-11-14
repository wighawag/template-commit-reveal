---
title: A table option may offer choices, asked with a select
slug: a-table-option-may-offer-choices
spec: games-on-this-foundation
blockedBy: [a-table-opens-at-its-creation-block]
---

# A table option may offer choices, asked with a select

Built from stratagems' port plan, step R1b (`main`, `work/plans/join-template-commit-reveal.md`, section "Step R", decision R1b-14, taken with the maintainer on 2026-11-13).

**The need**: reveal-or-die's tables are created in one of two modes (avatar mode, ETH mode), chosen through the game's `gameOptions`. The framework's `TableOptionField` was numeric only (`min`, `max`, `default`, rendered as an `<input type="number">` in `web/src/routes/lobby/+page.svelte`), so a mode would have been a "0 to 1" number. Rejected: that number field (the creator reads digits, not what they mean).

**The decision**: an optional `choices` on `TableOptionField` (`{value, label}[]`), rendered as a select; `clampOptionValue` keeps a field with choices to one of them and reads a select's string, its default otherwise. The reference game sends no options and is unchanged.

## Done, 2026-11-14, on local preview branches `pr1b/*`, NOT pushed

**`main`** (from `origin/main` dc4b08bc):

- `e223ea40` the test first (failing): `table.test.ts`, a field with choices keeps its value to one of them (a value inside the bounds that is not a choice is the default) and reads a select's string; the encoding takes the chosen choice.
- `f11ecaf8` `TableOptionField.choices` and `TableOptionChoice` in `$lib/game/lobby/table`, `clampOptionValue` honouring them, and the lobby page asking with a `<select>` (same `data-testid`, `table-option-<id>`) for a field that has them.

**Nodes**: every `with/*` node merged clean (`offshoot-fanout: merge main into with/<node>`, `with/all` and `with/fuzd-pixi-indexer` from their stems).

**Descendants**: reveal-or-die's tables use it for their mode (its `world/table.ts`); bomber-world takes it by cascade; stratagems by its between-steps merge.

## Measured

- Unit: `main` **2056 + 84** (from 2054 + 84); `with/pixi-js` 2069, `with/nft-identity` 2066, `with/fuzd` 2098, `with/indexer` 2084, `with/all` 2079, `with/fuzd-pixi-indexer` 2139 (each + 84); check 0 errors and 0 warnings on every node.
