---
title: The commit-reveal base's client leaves the reference game for a framework module, which the reference game and every game on the base call
slug: the-commit-reveal-client
spec: games-on-this-foundation
blockedBy: []
---

# The client of the commit-reveal base lives inside the reference game, which every game omits

Drafted from stratagems' port plan (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, step 6a), where it was decided with the maintainer on 2026-10-26. That file is the record of the measurements; this is the brief.

## Start here, from a cold context

```sh
cat CONTEXT.md
for f in cycle advance reserve missed-reveal storage errors commit-reveal config; do git show main:web/src/lib/placement/$f.ts | wc -l; done   # 41 110 167 313 184 47 670 335 on 2026-10-26
git show main:contracts/src/game/routes/GameCommit.sol    # the base's surface, as the reference game exposes it
git show main:web/src/lib/game/core/commit-reveal-game.ts | head -120   # the skeleton, generic over GameTypes
```

## What is wrong today

Since the commit-reveal base (`contracts/src/commit-reveal/`) every game keeps the same contract surface: `getCycle`, `getAttendance`, `advanceCycle`, `getReserve`, `withdrawFromReserve`, `getCommitment`, `getCycleNumber`, `makeCommitment(player, hash, bond, payee)`, `reveal(player, actions, secret, furtherActions, payee)`, `acknowledgeMissedReveal(player, actions, secret, furtherActions)` and `forfeitMissedReveal(player)`, with only the action tuple differing. Its client is about 1,530 lines of `web/src/lib/placement/` (the cycle and attendance readers, the advancer, the reserve, the hash chain and the commitment hash, the adapter's commit and chunked reveal, the missed-reveal reader and both settlements, the submission storage and the committed-turn record, `SignerOutOfFundsError`, the bond and gas half of the config). Every game omits `placement/`, so the second game on the base (stratagems, step 6b of its port) can only have that client by copying it, which is the divergence-by-copy this tree keeps paying for.

## Decided (the maintainer, 2026-10-26)

- The base's client moves into one framework module, generic over the game's identity and action type, given the action's ABI components and the game's contract (address and ABI). Its place and name are this repo's to choose.
- The reference game is its first user and keeps its game. Its ABI does not change, so its e2e is the judge.
- The submission storage key and record fields of the reference game are unchanged: they are a wire.
- The stub test of U2 and 10a-client is extended: a stub game with another action type composes the module and the skeleton and `check`s to 0 in `web/src`.
- Cascaded to `with/pixi-js`, `with/nft-identity` (identity a token id), `with/all`, reveal-or-die and bomber-world (clean adds, compiled unused) and stratagems (compiled unused until its step 6b).

## Acceptance

- every node's web verify passes with no fewer tests than its baseline, plus the module's own; `main`'s e2e passes;
- `placement/` is smaller by roughly the base's half;
- the extended stub test checks to 0 in `web/src`;
- reveal-or-die's, bomber-world's and stratagems' verify pass with their counts;
- the maintainer has approved every push.
