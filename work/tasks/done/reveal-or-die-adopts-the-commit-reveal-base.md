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

## Landed, 2026-11-05 (reveal-or-die main 4aaa00bd, bomber-world main c2d706d9)

Built with the maintainer's decisions of 2026-11-04 (reveal-or-die `work`, `tables-for-reveal-or-die.md`), which narrow the plan above in two places:

- **No chunks yet.** One chunk per turn: the hash is the base's one encoding with `furtherActions` zero, `actionsPerReveal` holds the longest turn that can resolve (11 in reveal-or-die, 13 in bomber-world: moves, two bombs, an exit) and the constructor refuses less, and the routes take no `furtherActions`, because the move and bomb budgets are counted per call and a chained turn would get them per link. Chunking needs those counters kept per turn first.
- **The forfeit counts a miss and kills nothing.** `_forfeit` takes nothing beyond the miss, which `lastCycleNumber` already counts; killing on a missed reveal is that one function, later.

What the port needed that the plan did not say:

- **A dead avatar has to be released.** Death is computed when asked and the base's attendance is an O(1) tally, so a dead member is counted until somebody sends the game's permissionless `releaseDeadAvatar` (checks it is in the world and dead, calls `_stopWaitingFor`, keeps the seat). The client's attendance reader releases the dead the board shows; a dead offline seat releases itself. The base is unchanged.
- **Custody is membership under every policy**, since the base refuses a commit from a non-member; reveal-or-die used to enrol only under the manual policy.
- **Withdraw refuses an open commitment**, or the tally would keep a commit counted for a member who left and a subset could reach unanimity.
- **The game's resolution event is renamed** (`ActionsResolved`): the base emits its own `CommitmentRevealed` on every reveal.
- **bomber-world's bombs needed one new condition**: a missed reveal's settlement never resolves actions, or settling cycle E-1 would write `_bombs[E]`/`_explosions[E]` while E's reveals read them. Written in `BombLogic`; the instant-bomb mutation still fails the two-orders test on the base.

Acceptance: reveal-or-die contracts 55 passing (49 + 6), bomber-world 57 (51 + 6), both settlement routes and the dead-avatar route tested, the two-orders test kept; check 0/0, unit 2174 + 75 and 2264 + 75, e2e 53 + 2 skipped and 55 + 2 skipped. Pushed with the maintainer's approval.
