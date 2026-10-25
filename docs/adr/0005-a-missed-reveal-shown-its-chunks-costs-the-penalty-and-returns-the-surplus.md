---
status: accepted
date: 2026-10-25
supersedes-in-part: 0002
---

# A missed reveal shown its chunks costs the game's penalty and returns the surplus; one not shown them is the player's alone and costs the whole bond

ADR-0002 settled a missed reveal in ONE call that took no chunk, and said why that was right for a bond equal to the exact cost and wrong for the two cases it named: a penalty computed from the actions, and a bond deliberately larger than the turn. **The commit-reveal base (`contracts/src/commit-reveal/`, 2026-10-25) has to serve both**, because it is kept by every game and stratagems has both, and because the reference game now bonds a whole number of chunks to stop its bond leaking the turn's length (the finding `the-bond-is-public-so-bonding-the-exact-cost-leaks-the-turn.md`, closed by this). So there are now two settlements.

## The two routes

**Shown the chunks, by anyone** (`_openMissedChunk` and `_closeChunk` in `UsingCommitReveal`; the reference game's `acknowledgeMissedReveal(player, placements, secret, furtherActions)`). The chunk is checked against the head exactly as a reveal checks it, one chunk per call, from wherever the head got to. The game reports a PENALTY for the chunk's actions (the reference game: what the placements would have cost; stratagems: one gem per move), which is capped at what the bond still holds and handed to the game's `_forfeit`. The actions are not applied: their cycle is over. With the last chunk the commitment closes and whatever the bond held beyond the penalties is reserve again.

**Not shown them, by the player or their delegate only** (`_forfeitMissedReveal(sender, id)`, which resolves `_playerOf` itself so no route can skip the check; the reference game's `forfeitMissedReveal(player)`). The whole remaining bond goes to `_forfeit`. It needs nothing but the identity, so a player who has lost their plan, or simply wants to play again, always has it.

## Why anyone may take the first and only the player the second

**Nothing in the first can hurt the player more than their silence already has.** The chain checks that the chunks are exactly what was committed, the penalty is the game's for exactly those actions, and the surplus goes back to the player. **Nobody but the player ever receives any of it**: what is forfeited goes to the game's `_forfeit` (burnt, kept in the contract, or a custody seized), never to whoever settles, so a stranger settling gains nothing and has nothing to race the player for. Who can settle this way is whoever holds the chunks: the player's own client, a reveal service holding the reveal transactions, a world playing its own seats.

**The second destroys a surplus the player could have recovered.** Without the chunks the contract cannot tell the stake from a surplus the bond was hiding the turn's length with, so only the player may choose to give that up. A stranger who could take it would be punishing the hiding rather than the silence, and hardest on whoever hid best, which is exactly what ADR-0002's case 2 warned against.

## The penalty is the game's, and a custody stake loses on both routes

The base asks the game for a number and the game's `_forfeit` for what that number means. `with/nft-identity` bonds ZERO (custody of an avatar is the stake), so "only the penalty for what was committed" would cost it nothing and let a player escape a bad reveal by settling with their own chunks after the cycle. Its `_forfeit` seizes the avatar whichever route calls it, and a test there pins that a settlement shown the chunks still seizes. A game whose stake is a life (reveal-or-die) would count a miss or kill in its `_forfeit`, by configuration.

## Liveness: nothing new

A member whose past commitment nobody settles cannot commit (`PreviousCommitmentNotRevealed`), so the cycle waits for them exactly as for a member who does not commit, which exists today. Under a timed policy the clock moves the cycle on and only early advance is lost; ADR-0002's one-call settlement by anyone did not remove a member from the set either. Under the manual policy an unopened commitment already freezes the world before any settlement is reachable (`a-derived-turn-is-a-wire-and-a-manual-cycle-cannot-settle-one-it-cannot-open.md`), because no advance closes a cycle holding one; the way out is the zero-timer forfeit `games-on-this-foundation.md` already records (someone removes a member from the set the cycle waits for, bounded by unanimity of the others or by wall-clock silence; the game's host as an admin is a candidate bound). That is its own item and not this decision.

## What survives from ADR-0002

Its rule, unchanged: **a settlement needs the chunks exactly when it cannot otherwise know what to keep and what to return.** The base offers both because which case a game is in is a property of its stake and its bond, not of the framework. The tally hazard it separated out also stands: the reveal is counted only on the chunk that closes the chain, and a settlement is never counted at all (its cycle is over).

## Considered options

**Keep one call by anyone, forfeiting the remainder.** Rejected: with a bond rounded up to whole chunks it punishes the hiding, and stratagems' per-move penalty cannot be computed without the actions.

**Walk the chain and require it, as alpha1 stratagems did.** Rejected for ADR-0002's reason: a settlement only the chunk holder can perform makes the player's freedom to play again depend on the very thing that failed. The second route is what keeps that freedom.

**Pay the settler a share, to make settling attractive.** Rejected: a settler that could profit would race the player for their own surplus, and settling a manual cycle's stalled member is a liveness question with its own item.

## Consequences

The reference game's client bonds whole chunks (`bondFor` in `web/src/lib/placement/config.ts`, capped at the reserve, never below the cost), keeps the committed turn aside when the submission clears it (`storage.ts`), and settles with the chunks when it can match the head, without them otherwise (`missed-reveal.ts`). The offline world's played seats settle with the chunks they can derive. The contract tests pin both routes on the reference game and on a stub second game in `src/commit-reveal/test/`.
