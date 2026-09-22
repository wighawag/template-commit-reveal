---
title: A world that plays its own players makes the derivation a wire, and under the manual policy an unopenable commitment is permanent
type: finding
status: guarded 2026-09-22 in template-commit-reveal (all four branches); the contract half is a property rather than a bug
spotted: 2026-09-22
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, the reference game plays a round in the tab), web/src/lib/offline-players.ts, contracts/src/game/internal/UsingGameInternal.sol
---

# The two players the offline world plays cannot forget, and cannot be forgiven either

**What this is about.** The reference game's offline world now enrols three waited-for members and plays two of them, because a cycle with one member hides nothing: unanimity is satisfied by the only person present, and two of the three conditions `advanceCycle` exists to enforce cannot be reached at all. Those two players hold NOTHING in memory - their secret and their turn are derived from (chain, game, identity, cycle) - which was decided in advance for the obvious reason, that a player which commits and then forgets its secret can never reveal.

**What was NOT anticipated is the second half of the same sentence, and it is sharper.** Under the manual policy, a commitment that cannot be opened is not a lost turn. It is a permanently frozen world.

## Why, in three lines of contract

- `_advanceCycle` in the reveal phase refuses while `attendance.revealed < attendance.committed`. So a cycle holding an unopened commitment cannot close.
- `_acknowledgeMissedReveal` refuses with `CanStillReveal` while `commitment.cycleNumber == cycleNumber`. So the commitment cannot be settled while it is the current cycle's.
- Under `Manual` the cycle moves for no reason except an advance. So the cycle never becomes a past one, and the two refusals are each other's premise.

The consequence is a property worth stating on its own: **under the manual policy, `acknowledgeMissedReveal` is unreachable.** A commitment cannot survive into a later cycle, because the advance that would carry it there is the advance it blocks. That is pinned by a test ("never lets an unopened commitment become a PAST one"), which asserts both refusals in one scenario. It is not true under `Timed`, where the clock walks past an unopened commitment without asking anybody, which is why the settling branch stays in the played players' loop as insurance rather than being deleted as dead code.

## So the DERIVATION is a wire, in exactly AGENTS.md's sense

`AGENTS.md` says that once a game has users, a persisted storage key and every field in the record are a WIRE and not an identifier, because `load()` discards what it cannot read and the player who wrote it loses their stake. A derived turn is the same hazard with the storage removed: there is no record to discard, and a build that changes `turnFor` or `secretFor` simply cannot open what the previous build committed.

It is WORSE than the storage case in one respect and better in another. Worse, because it does not cost one player their stake - it stops the cycle, so it costs the human their game as well, and there is no `acknowledgeMissedReveal` to end it. Better, because it is repairable from inside, and that is what was built:

**A played player compares the HEAD on chain against the head it would build, not the cycle number, and re-commits when they disagree.** Replacing a commitment made in the same cycle is expressly allowed and is counted once (`_makeCommitment` only calls `_recordCommitment` when the stored cycle differs), so the repair cannot push the tally past the membership, which is the way it could have been worse than the thing it repairs. The commit phase is the last moment at which anything can be done, so the invariant it buys is the useful one: **by the time a reveal phase opens, every played commitment is one this build can open.**

## And a reveal must not RE-DERIVE what it committed

The same shape, one step down, and this one was a live bug in the draft rather than a hypothetical. A played player commits an EMPTY turn when it cannot afford the bond, so what is on chain depends on what its reserve held at COMMIT time. A reveal that re-ran the affordability check would build a chain whose head is not the one the contract is holding, and would strand the commitment exactly as above.

The fix is the same rule the app's own recovery follows: **enumerate the turns this file could have built and let the HASH judge.** There are two - the wanted turn and the empty one - and `chunkDueNext` picks whichever matches, which also resumes a multi-chunk turn for free. Pinned by a test that drains a played player's reserve to one wei and then reveals; the mutation that drops the empty candidate fails exactly that test.

## What it cost, measured

Nothing, is the answer, which is the reason to write this down rather than treat it as overhead. In headless chromium against the production build at load 0.6, a whole round - three commits, an advance, three reveals, an advance - is **113-268 ms**, against **108-233 ms** for the same script driving the same world with one player and four transactions. The head comparison is one hash and no extra RPC call; the candidate match is one extra `buildPlacementChain` over one action.

## The general form

**A value a client DERIVES rather than stores is a compatibility surface, and the gate that would catch a change to it does not exist.** Renaming a storage field at least leaves a record that fails to load; changing a derivation leaves a hash on chain that no build will ever match again, and the type checker sees a refactor. Where the protocol can be pushed past the mismatch (a timed cycle) that costs one stake. Where it cannot (a manual cycle), it costs the world.
