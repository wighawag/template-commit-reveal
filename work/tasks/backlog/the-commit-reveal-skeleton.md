---
title: Every commit-reveal composition repeats the same skeleton, so it becomes one framework function the game hands its parts to
slug: the-commit-reveal-skeleton
spec: games-on-this-foundation
blockedBy: []
---

# The composition every game writes is two-thirds the same, and the third game is about to write it again

## Start here, from a cold context

```sh
cat CONTEXT.md
git show work:work/specs/proposed/games-on-this-foundation.md | grep -n -i "composition\|stratagems" | head -20
git show main:web/src/lib/placement/context.ts | wc -l                   # 926 on 2026-10-24
git -C ../reveal-or-die show main:web/src/lib/world/context.ts | wc -l   # 1238
git ls-tree --name-only main web/src/lib/game/core/                     # 14 modules, none of them a composition
git -C ../stratagems show join-template-commit-reveal:work/plans/join-template-commit-reveal.md | grep -n "10a-client" | head
```

The last line is the consumer that asked for this: stratagems' port plan, which names this task as its step 10a-client and records the measurements below.

## What is repeated, measured

Comments stripped, on 2026-10-24 (template `main` 3fe2b29d, reveal-or-die `main` 4e9004b2, bomber-world `main` 95e9bcd4):

| composition | lines | code lines | `createGameContext` body |
| --- | --- | --- | --- |
| `placement/context.ts` (this repo) | 926 | 440 | 260 |
| `world/context.ts` (reveal-or-die) | 1238 | 535 | 319 |
| `world/context.ts` (bomber-world) | 1264 | 550 | |

307 of this repo's 440 code lines are unchanged in reveal-or-die, and 181 of the 260 body lines. bomber-world differs from reveal-or-die by 1 line removed and 16 added. U2 (2026-10-23) named this as its part 5 and left it out on purpose: "That is what makes [a new game] supply the game's parts rather than write a 900-line composition". stratagems is the game about to write a fourth copy, so this is the moment it is cheapest.

## The governing distinction

**The skeleton is what decides WHEN; the game is what says WHAT.** The framework already owns every mechanism the composition wires (`game/core/{chain-time,cycle,cycle-phase,advance,submission,secret,recovery,handover,refresh}.ts`). What it does not own is the WIRING between them, which is the same in every game: chain time feeds the cycle trackers; the trackers feed the phase derivations, the advance client and the submission; the submission, the secret and recovery share one derivation; the held board feeds the view state; and `start()` re-checks the missed reveal on identity change, on a submission ending in `Missed` and on cycle turnover, pokes the advance on `Committed` and `Revealed`, resumes on gas and refreshes when a pending acquisition settles.

What the game supplies, as parameters: its config (cycle durations, chunk size); its cycle reader, attendance reader and advancer; its BOARD STORE, built by the game (a poller here and in reveal-or-die, an etherfold indexer in stratagems, so the skeleton must not build the poller itself); its commit-reveal adapter and `buildCommitment`; its stake and acquisition; its missed-reveal reader and settler; its planning; its hold rule and its merge; its renderer; what a click means; any setup gate beyond signed-in and authorised.

**The contract surface is still not inherited**, and this task must not pretend otherwise: every reader is handed in, exactly as today (see `work/notes/observations/the-epoch-policy-cannot-reach-a-game-until-its-contracts-do.md`). A skeleton that read a contract function itself would cascade a call to a selector a descendant may not have.

## The steps

1. Re-derive the table above. If the shared part has moved, say so before extracting.
2. Extract the skeleton into one module under `game/core/` (proposed: `commit-reveal-game.ts`, `createCommitRevealGame`; the name is this repo's to choose against `CONTEXT.md`, and `round` and `turn` are not available). Generic over identity and action, like `createSubmission`; it names no game and imports nothing outside `game/` and `context/`'s types.
3. The reference game is the first user: `placement/context.ts` becomes the reference game's parts plus one call. Then `with/pixi-js`, `with/nft-identity`, `with/all`.
4. reveal-or-die is the second user, by cascade: `world/context.ts` becomes its parts (avatar, position, enumeration recovery, controls, reveal outcome) plus one call. The framework code it grew locally (`onEachNewCycle`, a `currentCycleNumber` store) goes up with the skeleton if both games want it, and stays if only one does. bomber-world takes it from reveal-or-die when its own agent is done (ask its maintainer).
5. stratagems takes it by cascade and does not use it yet; it must stay green.
6. Extend U2's stub test: the stub game composed WITH the skeleton, its board store not a poller, `check` 0 in `web/src`.

## Acceptance

- this repo's verify passes on every node, with no fewer tests than the baseline taken first (2026-10-24: `main` check 0, unit 1699 + 78) plus the skeleton's own, and the e2e suite passes on `main`: the composition is runtime behaviour, which neither `check` nor the unit tests run;
- reveal-or-die's verify (2026-10-24: 1861 + 72) and its e2e suite pass;
- the unchanged body lines between the two compositions, 181 on 2026-10-24, fall below 20, and each body is its game's parts plus one call;
- the extended stub test checks to 0;
- stratagems' node verify passes after the cascade (2026-10-24: check 0 errors and 2 warnings, unit 1401 + 72);
- every push approved by the maintainer.

## Out of scope

- **A contract base.** Decided separately (stratagems' plan, step 10a-contract), and independent of this: the skeleton takes readers, so it works on any game's contract.
- **Changing what any mechanism does.** If the extraction finds the two compositions disagreeing about a WHEN (not a WHAT), that is a finding to bring to the maintainer, not a choice to make silently; the `handover.ts` precedent is how such a split was settled before.
