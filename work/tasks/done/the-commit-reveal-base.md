---
title: The commit-reveal mechanism becomes a base games keep, a library over namespaced storage with a convenience contract beside it, and the bond may exceed the turn's cost
slug: the-commit-reveal-base
spec: games-on-this-foundation
blockedBy: []
---

# The commit-reveal contracts are a mechanism with a reference game inside it, and no game can build on them yet

> **DONE, 2026-10-25**, on every node: `main` 85814a55 (cb8594a4 the base, 1047db94 the reference game on it, a4a8b3f4 the stub game and the base's 8 tests, cab311cf the client bonds whole chunks and settles with its chunks, 0b37887a `AGENTS.md`, 85814a55 the base's suite standing alone), `with/pixi-js` 50d94b14, `with/nft-identity` a367702a (overrides re-pointed at the base; a settlement shown the chunks still seizes the avatar), `with/all` b94eddec, reveal-or-die df647852, bomber-world 9a145889, stratagems 5c817de4 (the base omitted until its step 10b).
>
> Measured: contracts `main` 47 to 56, `with/pixi-js` 47 to 56, `with/nft-identity` 49 to 58, `with/all` 49 to 58, reveal-or-die 21 to 29, bomber-world 23 to 31, stratagems 69; web verify green everywhere (`main` 1725 to 1732 + 78, the other template nodes +7 likewise, the games unchanged); e2e 53 on `main`. Gas: reveal 533,508 of 600,000 (fell 2,017: the reveal event no longer carries the placements), commit 117,714 of 150,000; no declared figure raised. ADR-0005 has the reasoning; the full account is in stratagems' port plan, step 10a-contract.

Drafted from stratagems' port plan (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, step 10a-contract), where the decisions below were taken with the maintainer on 2026-10-24 and 2026-10-25. That file is the record of the measurements; this is the brief.

## Start here, from a cold context

```sh
cat CONTEXT.md
git show main:contracts/src/game/internal/UsingGameInternal.sol | wc -l      # 827 on 2026-10-25, 357 code lines
git show work:docs/adr/0002-the-bond-settles-a-half-revealed-turn-so-the-forfeit-takes-no-chunk.md
git show work:work/notes/findings/the-bond-is-public-so-bonding-the-exact-cost-leaks-the-turn.md
git show with/nft-identity:contracts/src/game/avatar/UsingAvatarIdentity.sol | head -220   # the custody game: _playerOf and _forfeit overridden
```

Then `contracts/node_modules/@etherplay/delegation/contracts/{Delegation,UsingDelegation}.sol`: the shape to copy, a library over ERC-7201 storage plus a convenience contract.

## What is wrong today

`UsingGameInternal` mixes the mechanism (the reserve, the bonded commitment, cancellation, the hash chain of chunks, the cycle policies, advance, attendance and the tally, delegation through `_playerOf`, the forfeit) with the reference game (`_place`, `Placement[]` in `reveal`, cells, zones, `PLACEMENT_COST`). About 76 of the ~725 code lines under `contracts/src/game/` name the reference game; the rest is mechanism every game on this template rewrites. "Contracts are not inherited" was right while the mechanism could not be separated from a game. It now can, and stratagems is the second user waiting for it.

And the bond leaks the turn: the reference client bonds the exact cost, so `bond / placementCost` is the number of actions the commitment hides. Closing that needs a settlement that can tell the surplus from the stake, which is ADR-0002's case 2.

## Decided (the maintainer, 2026-10-24 and 2026-10-25)

- **A base that games KEEP**, under `contracts/src/commit-reveal/`, not in a package (postponed; written so that moving it is a change of import). Composition preferred, not a strict rule.
- **Its shape: a Solidity `library` over ERC-7201 namespaced storage, and a convenience abstract contract** that holds the configuration as immutables and calls the library with the virtual seams (`_playerOf`, `_forfeit`, `_cycle`).
- **Actions stay typed (option T).** The game keeps typed routes, computes the one encoding `bytes24(keccak256(abi.encode(secret, actions, furtherActions)))`, and hands the base the digest and the number of actions. The base checks the chunk against the head, advances the chain, and charges what the game's resolution reports against the bond. A game cannot apply a chunk the base has not checked and charged.
- **The bond may exceed the turn's cost (option b).** A missed reveal settled WITH the chunks may be settled by anyone, walks the chain, forfeits the game's penalty for what was committed and returns the surplus. One settled WITHOUT them may be settled only by the player or their delegate, and loses the whole remaining bond. **Nobody but the player ever receives any of it.**
- **A custody stake loses on both routes**: `with/nft-identity` bonds zero, and its `_forfeit` seizes the avatar whichever route settles.
- **Liveness: nothing new.** A member whose past commitment nobody settles is waited for like one who does not commit. The manual policy's unopenable commitment is the zero-timer forfeit already recorded in `games-on-this-foundation.md`, its own future item.
- **The reference game over-bonds to whole chunks**, so the surplus settlement has a real user here, and the bond-leak finding closes.
- reveal-or-die's adoption is a backlog task, not this one.

## The steps

1. Baselines on every node first: contracts suites (2026-10-25: `main` 47, `with/nft-identity` 49), the gas budget line, the web verify, `main`'s e2e; reveal-or-die's and bomber-world's; stratagems' contracts suite and node verify.
2. An ADR superseding ADR-0002 in part: the two routes, who may call each, the penalty, that nothing goes to anyone but the player, liveness.
3. The base: the library and the convenience contract.
4. The reference game on it: `contracts/src/game/` keeps only its game and its typed routes. Its client bonds whole chunks, and its missed-reveal settler sends the chunks when it has them (the offline world's played players included).
5. A stub second game in the contract tests, with another action type and a per-action cost, pinning: the surplus returned on reveal; a with-chunks settlement over more than one chunk by a stranger, taking the exact penalty and returning the surplus; a without-chunks settlement refused to a stranger and taking the whole bond for the player or their delegate; the settler's balance unchanged on both routes. On `with/nft-identity`, a with-chunks settlement still seizes the avatar.
6. Re-measure the gas budget (2026-10-25: reveal 535,525 of 600,000, 10.8% headroom against a 10% tripwire); raise the declared figures with their measurement if needed, per ADR-0003.
7. Reword "contracts are not inherited" in `AGENTS.md`, `HANDOFF.md` and ADR-0003's premise.
8. Cascade: `with/pixi-js`, `with/nft-identity`, `with/all`; reveal-or-die and bomber-world (clean adds, compiled unused); stratagems (omitted until its step 10b).
9. A backlog task: reveal-or-die adopts the base.

## Acceptance

- every node's contracts suite passes with no fewer tests than its baseline, plus the base's and the stub game's, and `GasBudget.test.ts` passes;
- the web verify passes on every node, and `main`'s e2e passes;
- reveal-or-die's and bomber-world's verify and contracts suites keep their counts;
- stratagems' node verify passes, its contracts suite still 69, `check-omissions` covers the new folder, `check-dangling-imports` clean;
- the ADR and the backlog task are on this branch, and the bond-leak finding is closed;
- the maintainer has approved every push.
