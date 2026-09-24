---
title: The reveal-or-die cascade is 4 conflicts and one design decision, and the damage is in the clean adds again
type: observation
status: spotted
spotted: 2026-09-23
relates-to: work/notes/observations/reveal-or-die-is-already-on-the-seams-and-the-handoff-is-stale.md, work/notes/findings/main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint.md, work/specs/proposed/games-on-this-foundation.md (Phase 4)
---

# What 45 commits of template actually do to reveal-or-die, measured

**Dry run 2026-09-23** in a throwaway detached worktree of reveal-or-die at `50079fb1`, merging `stem/with/all` at `b5e0d311` with `--no-commit --no-ff`. Aborted, worktree removed, repo verified untouched (`50079fb1`, on `main`, clean, one worktree). Nothing was committed anywhere.

## The headline: it is small, and that is the trap

```
unmerged paths: 4
     15 A     (clean adds)
     11 M     (clean modifications)
      3 UU
      1 UA
```

**Four conflicts, not the forty the re-point cost.** They are `contracts/package.json`, `contracts/test/js/utils/index.ts`, `web/src/lib/context/game.ts`, and `web/src/lib/world/advance.ts` (UA: git rename-detected the template's `placement/advance.ts` onto reveal-or-die's `world/` directory, so the file arriving there opens with "The template game's half of pushing the cycle on").

A cascade that reports four routine-looking conflicts invites resolve-and-move-on. That is exactly the situation the earlier finding warned about, and the damage is again in what merged cleanly.

## Nine dangling imports arrive with no conflict marker

reveal-or-die deleted `web/src/lib/placement/` wholesale, by design; its game is `web/src/lib/world/`. Five files arrive as CLEAN ADDS carrying imports of the directory that does not exist:

| file | dangling refs | how it arrives |
|---|---|---|
| `web/src/lib/offline-players.ts` | 3 | clean add |
| `web/test/lib/offline-players.test.ts` | 3 | clean add |
| `web/src/lib/offline.ts` | 1 | clean add |
| `web/test/lib/placement/advance.test.ts` | 1 | clean add, into a test directory for a lib this repo does not have |
| `web/test/lib/embedded/world.test.ts` | 1 | clean add |

Two more, both accounted for and neither a new hazard: `web/src/lib/context/game.ts` goes from 0 to 13 refs but IS one of the four conflicts, so a human sees it; and `web/test/render-host-boundary.test.ts` has 1 ref that PRE-DATES the merge and is green today.

`web/test/lib/placement/advance.test.ts` is the one to look at twice. It is the identical species to the four inherited test files that broke the last cascade, arriving by the identical route, three days after the note describing that route was written.

## The offline world is a CHAIN, and only one link is free

The instinct is "take the framework, drop the game". Measured, the offline world does not split that cleanly:

| file | verdict |
|---|---|
| `game/core/advance.ts` + `test/lib/game/core/advance.test.ts` | **true framework.** Should land. This is the thing reveal-or-die actually needs, since a manual cycle cannot complete a round without a caller |
| `context/InWorld.svelte` | **portable.** No game imports |
| `offline-seats.ts` | **portable, and free-standing.** Imports only `viem`; its `$lib/offline` mentions are prose in doc comments, which is what the file's own "byte-identical on every branch" claim predicted |
| `offline-lobby.ts` | chained: imports `$lib/offline` |
| `offline-authorise.ts` | chained: imports `$lib/offline-lobby` |
| `routes/offline/+page.svelte` | chained: imports `$lib/offline` |
| `e2e/tests/offline.e2e.ts` | chained in SUBSTANCE rather than by import: it drives the template's game's UI (a canvas click, "3 seats at this table") |
| `offline.ts`, `offline-players.ts` | **the template's own game.** `$lib/placement/{cells,config,commit-reveal}` |

So `seats → lobby → offline.ts → placement` is a dependency chain, and only `offline-seats.ts` stands alone. Taking "just the portable half" is not a merge resolution, it is a port: reveal-or-die would need its own `offline.ts` and `offline-players.ts` written against its own actions and identity.

## So the cascade contains a DECISION, not just resolutions

**Does reveal-or-die want an offline world yet?**

- **If yes**, the cascade carries a port of the offline world onto that game, which is real work and should be its own task rather than a merge someone resolves in an afternoon.
- **If not yet**, the offline files must be kept OUT, and that has a cost worth accepting deliberately: every future cascade re-offers them, and once reveal-or-die has recorded the deletion, later template changes to those files arrive as modify/delete conflicts, forever. That is the same permanent-conflict-zone shape `AGENTS.md` already accepts for `contracts/`, and it should be written down where the next person cascading will meet it rather than rediscovered.

Either way, `game/core/advance.ts` should land, because it is framework and the gap it fills is real in every world, not just an embedded one.

## Would anything have caught this?

**Yes, and one step too late, exactly as predicted.** reveal-or-die's configured verify is `pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit`, and `svelte-check` fails on a dangling import in `web/src`. So `offshoot-fanout --verify` catches it.

The gap remains the HAND path: the fanout stops at the conflicts without merging, so verify never runs; a human resolves four routine conflicts and has to remember to run `check` afterwards. With only four, and all four looking ordinary, the temptation to skip it is higher than it was at forty.

**This is now the second consecutive cascade where a clean hunk was the defect.** That is enough of a pattern to act on rather than to keep noting: the post-merge check suggested in the earlier finding (grep the merged tree for imports of paths the merge deleted, generic, belongs in `offshoot-fanout`) would have caught all five of these files in one pass, before any human judgement was involved.
