---
title: reveal-or-die rebuilds its contracts on the commit-reveal base, so its forfeit becomes configurable and its turns can be chunked
slug: reveal-or-die-adopts-the-commit-reveal-base
spec: games-on-this-foundation
blockedBy: [the-commit-reveal-base]
---

# reveal-or-die carries its own copy of the mechanism, and the base it could keep has arrived beside it

Proposed by stratagems' port plan (step 10a-contract) and left out of that step on purpose: it is a rewrite of contracts bomber-world inherits, and reveal-or-die's maintainer decides when.

## Start here, from a cold context

```sh
git -C ../reveal-or-die show main:contracts/src/game/internal/UsingGameInternal.sol | wc -l
git -C ../reveal-or-die ls-tree --name-only main contracts/src/commit-reveal/   # the base, arrived by cascade, compiled unused
git show work:docs/adr/0005-a-missed-reveal-shown-its-chunks-costs-the-penalty-and-returns-the-surplus.md
git show main:contracts/src/commit-reveal/UsingCommitReveal.sol | head -60
git show main:contracts/src/commit-reveal/test/CommitRevealStubGame.sol         # the smallest game on the base
```

## What reveal-or-die has today, measured 2026-10-24

Its `UsingGameInternal` differs from the template's by 1,422 lines: avatar custody, no reserve, no chunks (`reveal` takes one array), a manual `_moveToNextPhase`. Its stake is the avatar's life: `_getResolvedAvatar` kills an avatar that has gone more than `numMissesAllowed` cycles (3 in `rocketh/config.ts`) without a REVEAL, and its `_acknowledgeMissedReveal` only clears the slot (its `TODO burn / stake`), so withholding one reveal costs one allowed miss and no more.

## What it would gain

- **A forfeit it can configure.** On the base, a missed reveal's cost is the game's `_forfeit`: count a miss (today's behaviour), or kill outright (the maintainer, 2026-10-24: right for a harsh game, too harsh for the demo), by configuration.
- **Chunks**, so a turn is no longer bounded by one transaction.
- **The cycle policies, attendance and advance** it currently writes for itself, and `_playerOf` through custody as `with/nft-identity` already does on the template (`contracts/src/game/avatar/UsingAvatarIdentity.sol` there is the worked example: custody calls `_startWaitingFor`/`_stopWaitingFor`, `_forfeit` seizes on both settlement routes).

## The steps

1. Measure: contracts suite and verify on reveal-or-die and bomber-world first; diff its mechanism against the base's, function by function.
2. Rebuild `contracts/src/game/` on `UsingCommitReveal`: its avatar actions as the typed action, its resolution between `_openChunk` and `_closeChunk`, custody as the membership pair, its life rule in `_forfeit`.
3. Its client follows: the hash in the one encoding, the chunked reveal through the adapter, the two settlement routes.
4. bomber-world takes it by cascade; its bombs are part of the resolution.

## Acceptance

- reveal-or-die's and bomber-world's contracts suites pass with no fewer tests, plus a missed reveal settled on both routes;
- their verify and e2e pass;
- the order of reveals still never changes the outcome (a test replaying one cycle in two orders);
- the maintainer has approved every push.
