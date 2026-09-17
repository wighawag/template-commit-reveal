---
title: A turn may be bigger than a transaction, and a cap only binds where identity is scarce
slug: a-turn-bigger-than-a-transaction
spec: games-on-this-foundation
blockedBy: []
---

# Two bounds, not one, and they answer different questions

## Start here, from a cold context

```sh
cat CONTEXT.md
git show work:work/notes/findings/max-num-placements-per-hash-marks-an-unbuilt-chunked-reveal.md
```

and read the design in the repo that has it:

```sh
sed -n '10,90p' ~/dev/github/wighawag/stratagems/contracts/src/game/routes/StratagemsReveal.sol
grep -n -A14 "function _checkHash" ~/dev/github/wighawag/stratagems/contracts/src/game/internal/UsingStratagemsUtils.sol
```

`MAX_NUM_PLACEMENTS_PER_HASH = 32` sits in `UsingGameStore.sol`, referenced by nothing, left in the template game's first commit. It is not a turn cap; it is the marker of an unbuilt feature. This task is that feature, plus the separate thing it is repeatedly confused with.

## The two bounds

They are independent, they answer different questions, and conflating them is how the constant came to look like a cap.

**1. THE CHUNK: how much of a turn fits in one TRANSACTION.** A transaction has a gas ceiling, so a turn longer than that ceiling has to arrive in pieces. The commitment becomes the head of a HASH CHAIN: `keccak(secret, actions, furtherActions)` where `furtherActions` is the next chunk's hash. Each reveal resolves one chunk and rewrites the head; the commitment stays open until a chunk arrives with `furtherActions == 0`.

**This is a framework concern and a mechanism, so the framework owns it.** Every game on this template has it, because every chain has a gas ceiling.

**2. THE TURN CAP: how many actions a turn may CONTAIN at all.** That is a game RULE about what a player may do in one cycle, and it has nothing to do with transactions. Catacombs wants one (a day's path is a bounded thing). Stratagems does not. It is optional, and where a game wants it, it is the game's.

## THE RULE THAT DECIDES WHETHER A CAP IS EVEN POSSIBLE

**A per-identity cap only binds where identity is SCARCE.** Where an identity costs nothing, a player who wants more than the cap makes another account, so the cap does not limit anything - it only inconveniences the honest and taxes the player who does not think of it. Stratagems is the worked example and it is why a cap makes no sense there: the stake is per piece placed and one account is as good as another.

Three ways to bound a turn, and which of them is available is a property of the GAME rather than a choice:

| what is scarce | bound | example |
| --- | --- | --- |
| the ACTION costs something | economic; no cap needed or wanted | `main` (1 token per placement), stratagems (stake per piece) |
| the IDENTITY is scarce and the action is free | a cap binds, and is the only thing that does | catacombs (a character), `with/nft-identity` (an avatar in custody) |
| neither | nothing binds; a cap is theatre | - |

**That last row is the one to watch for**, because it is a configuration a game can reach by accident rather than a design anyone chooses.

**And it is why `with/nft-identity` is where this bites.** That branch sets `placementCost: 0n`, deliberately and correctly - custody of the avatar is the stake, the reserve is never funded. So the economic bound is gone and the identity IS scarce, which is exactly the row where a cap is the available instrument and there is none. Today nothing bounds a reveal there at all.

## What the framework should hold, and what it must not

**The chunk size is NOT a constant.** It depends on the game (how expensive is one action to resolve) and on the CHAIN (what fits in a transaction there). 32 is stratagems' number on stratagems' chain; it is not a universal. So it is a DEPLOYMENT parameter, and it belongs in `Config` beside `cyclePolicy` and `placementCost`, which is also what makes it reach the client, since the client has to chunk to the same size the contract will accept.

**Name it in the framework's word.** `CONTEXT.md` says what a player submits is **actions** ("ORDERED, because two orderings of the same actions are two different commitments"). So the framework says actions, not placements: the existing name borrows the reference game's word for a framework concept, which is the mistake ADR-0001 is about. Something like `actionsPerReveal` in `Config`.

**The turn cap is the GAME's and may not exist.** If the framework takes a `maxActions` it has taken a position on a question stratagems answers "no" to. Either the game enforces it in its own reveal, or the framework offers it as an optional parameter that defaults to unlimited - and the second needs an argument, because an option no upstream consumer sets is a pattern this plan already flags twice.

## The hard parts, which are not the hash chain

The chain itself is about fifteen lines. What costs is everything around it.

- **`acknowledgeMissedReveal` has to walk the chain too.** Stratagems does exactly this, with the same `furtherMoves` argument and the same full-chunk rule. Miss this and a partially revealed turn becomes unsettleable: the commitment is open, its head points at a chunk nobody will submit, and the next cycle is blocked forever. **This is the part with a player's stake in it.**
- **A non-final chunk must be EXACTLY full.** Stratagems reverts `InvalidFurtherMoves` otherwise, and that rule is load-bearing rather than tidy: without it a player dribbles one action per transaction and spreads a turn across unbounded reveals, which is a denial-of-service on the reveal phase and on everyone else's board reads.
- **The client becomes a multi-transaction flow with progress.** Committing must build the chain (hash the last chunk first and work backwards). Revealing must submit chunks in order, survive a reload halfway, and know which chunk is next - which is the chain head on chain, so it is readable rather than remembered. `SubmissionState` gains something like "revealing, chunk 3 of 7", and the auto-reveal has to drive a sequence rather than a single send.
- **Partial resolution is now observable.** Half a turn lands, the board changes, and the rest arrives in a later transaction. The order-independence rule still holds per action, but "the board after a cycle" now depends on how far each player got, and a player who runs out of gas mid-chain has applied some of their turn and not the rest. Decide deliberately what that means for the stake.
- **It is an ABI change.** `reveal` and `acknowledgeMissedReveal` both take a new argument and `_checkHash` changes shape. Still free - nothing is deployed, `git ls-files contracts/deployments` is empty - and that freedom is the reason to do it now rather than after a game ships.

## What this unblocks, and why it is being written now

The credits design wants `COMMIT_GAS` and `REVEAL_GAS` passed as real gas LIMITS, so that a limit is a guaranteed maximum and a player is never blocked by a miscalculated worst case. That needs a calculable maximum for ONE TRANSACTION, on every branch, whatever a game's stake model. **The chunk is the only one of the three candidate bounds that provides it structurally** rather than as a side effect of the stake:

- a turn cap depends on identity being scarce, which is not true of every game;
- a size-derived gas limit works but gives up "one credit is one turn";
- the chunk bounds the transaction by construction, in every game and on every chain, which is the property the limit needs.

With it, one credit is one commit plus one reveal STEP, and a long turn honestly costs more than a short one.

## Also fix, because it is the same subject and it is wrong today

`COMMIT_GAS = 100_000n` in `web/src/lib/placement/config.ts` is **below a real first commit**, measured at **116,898** (`0x1c8a2`, verified twice independently). Its own comment calls it "deliberately generous"; it is 16.9% short. Harmless while it only sizes the stipend, a brick the moment it becomes a limit - and the same comment says what that costs: "not a slow turn, it is a missed reveal, which loses the bond AND blocks the next cycle until it is acknowledged".

## Out of scope

**Deciding catacombs' or stratagems' numbers.** Each game picks its own chunk size for its own chain, and its own turn cap or none.

**The turn cap's enforcement in the reference game**, unless doing it is what proves the parameter. The reference game bounds turns economically already and does not need one.

## Acceptance

- A turn longer than one chunk commits, reveals across several transactions, and lands in full; the same turn settles in full through `acknowledgeMissedReveal` when it is never revealed.
- A non-final chunk that is not exactly full reverts, with a test.
- The chunk size is read from the deployment rather than hardcoded, and the client chunks to the same number the contract will accept - pinned by a test that changes the parameter and watches both sides follow.
- A reveal interrupted halfway resumes from the chain head read off the contract, not from anything remembered locally.
- `COMMIT_GAS` and `REVEAL_GAS` are re-measured as true maxima of ONE TRANSACTION at the configured chunk size, passed as gas limits, and `creditsGasMultiplier` is their sum, so one credit is one commit plus one reveal step.
- Counts hold on every node, and e2e covers a multi-chunk turn end to end, because a progress flow that never renders passes every other gate.

## Checked by mutation, not just green

Three, and the first is the one with money in it: remove the `furtherActions` handling from `acknowledgeMissedReveal` and confirm a test fails on a partially revealed turn becoming unsettleable. Remove the exactly-full rule and confirm a test fails on a one-action non-final chunk. Set the client's chunk size to one more than the deployment's and confirm something fails before a browser does.
