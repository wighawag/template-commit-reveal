---
title: A turn may be bigger than a transaction, and a cap only binds where identity is scarce
slug: a-turn-bigger-than-a-transaction
spec: games-on-this-foundation
blockedBy: []
---

# Two bounds, not one, and they answer different questions

> **BUILT, 2026-09-17.** `32a3033c` on `main`, cascaded to `with/nft-identity`
> (`b5af7040`, then `5bb21864` for the budget), `with/pixi-js` (`5e9d51fd`) and
> `with/all` (`c2885cea` + `c7fe9d89`), and merged into reveal-or-die at
> `d3e8961`, which inherits the FRAMEWORK half only - its contracts are its own
> and still take one array, which the AGENTS.md paragraph added in `0e8bf5f6`
> now says how to read.
>
> **The chunk is built, the turn cap is not, and the cap was never this task's.**
> `MAX_NUM_PLACEMENTS_PER_HASH` is gone and `Config.actionsPerReveal` replaces
> it: a deployment parameter, named in the framework's word, read by the client
> off `linkedData`. `reveal` takes `bytes24 furtherActions`, a non-final chunk
> must be exactly full, and - added beyond the ported design - NO chunk may
> exceed the configured number, because a final chunk of any length would give
> back the calculable worst case for the last transaction of every turn.
>
> **THREE THINGS THIS TASK GOT WRONG ABOUT THIS REPO, and the first is the one
> with the stake in it.**
>
> 1. **`acknowledgeMissedReveal` does NOT walk the chain here, and must not.**
>    The task called this the centre of the work and it is the one instruction
>    that was refused. The hazard named is real - a partially revealed
>    commitment that cannot be closed blocks that player forever - and the
>    remedy is wrong for this framework. Stratagems walks the chain because its
>    penalty is computed FROM the revealed moves; here the penalty is the bond,
>    the bond falls by each chunk's cost as it lands, and what is outstanding is
>    already on chain. So one call with nothing but the identity settles a turn
>    however far it got, and requiring the secret would have made settling
>    depend on the very thing that failed. Pinned by "settles a half-revealed
>    turn in ONE call, and frees the next cycle", and the mutation that was run
>    instead of the task's: leave a half-revealed commitment open and that test
>    fails. **A game whose forfeit is per action rather than per bond has to
>    revisit it**, which is said at the function.
> 2. **The hazard the task was pointing at exists here in a DIFFERENT place, and
>    it is the tally.** `_recordReveal` must fire only on the chunk that closes
>    the chain. Count a partial reveal and unanimity can close the cycle while a
>    player still owes chunks, which strands them: half a turn applied and the
>    rest lost, by somebody else's advance. That is the analogue of the
>    unsettleable commitment, and it is what "will not let the cycle close on a
>    half-revealed turn" pins.
> 3. **`_checkHash` takes ONE encoding, not two.** The ported design drops the
>    trailing field on the final chunk. Both are sound against forgery; the
>    single form removes a second encoding selected by a branch on the very
>    value that distinguishes the last chunk, which is a second chance to get
>    wrong the one thing that costs a player money. Nothing is deployed, so the
>    compatibility argument for two forms buys nothing here.
>
> **ONE ACCEPTANCE BULLET IS DELIBERATELY NOT MET.** `COMMIT_GAS` and
> `REVEAL_GAS` are re-measured as true maxima of one transaction (150,000 and
> 600,000 against measurements of 116,898 and 535,561 at four per reveal) and
> `creditsGasMultiplier` is their sum, so one credit is one commit plus one
> reveal STEP. They are NOT passed as gas limits. A limit that is too low is not
> a slow turn, it is a missed reveal; these numbers are measured against THIS
> game's contracts; contracts are not inherited in this tree, so a descendant
> runs code they were never measured against while inheriting the file
> unchanged. `with/nft-identity` proved that within the cascade: the same two
> transactions measure 99,102 and 374,085 there. Sizing a reservation that way
> is safe and imposing a ceiling that way is not, so the flip belongs to the
> credits task, with a per-deployment number and a test that fails when a
> contract change outgrows it.
>
> **The chunk size is four, and the argument differs per branch even though the
> number does not.** On `main` four is chosen to be EXERCISED: a turn there is
> bounded economically at ten placements, so sixteen or thirty-two would mean no
> turn anybody can make ever chains. On the identity branches a placement costs
> nothing, so this parameter is the ONLY bound a reveal has - and a consequence
> the task did not raise falls out of that: a turn there is unbounded, so the
> number of reveals it takes is unbounded, and a long enough turn cannot fit in
> any reveal window. Nothing enforces that yet. It is recorded in
> `contracts/rocketh/config.ts` on those branches and it is the next thing
> somebody should want.
>
> Counts: contracts 36 -> 45 on `main` and `with/pixi-js`, 38 -> 47 on
> `with/nft-identity` and `with/all`, 13 unchanged in reveal-or-die (its
> contracts did not change). Web units 1496 -> 1512 on `main`, 1505 -> 1521,
> 1504 -> 1520, 1513 -> 1529, and 1693 -> 1695 in reveal-or-die; client 71
> everywhere, 65 in reveal-or-die. e2e 51 -> 52 on every template node and 50
> unchanged in reveal-or-die, every run green.

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
