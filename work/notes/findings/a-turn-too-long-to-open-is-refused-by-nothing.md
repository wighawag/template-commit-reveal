---
title: A turn too long to open in the reveal window was refused by nothing, and it cost avatars in the measuring harness
type: finding
status: CLOSED for the client half, 2026-09-18
spotted: 2026-09-18
relates-to: web/src/lib/game/core/reveal-window.ts, web/src/lib/placement/planning.ts, with/nft-identity, docs/adr/0002
---

# Twelve actions was the ceiling, and going over it forfeited the stake

## What was measured

At the shipped local config - 10s reveal phase, four actions per reveal, a node
mining on a 1s interval - a client revealing a chained turn one chunk at a time
landed **three chunks and no more** before the window shut. Twelve actions was
the most a player could open. A sixteen-action turn committed happily, revealed
three of its four chunks, and then could not finish.

**That is not a slow turn, it is a missed reveal.** The commitment stays open
with part of it applied, `acknowledgeMissedReveal` settles it, and whatever the
game put at stake is gone.

## It was found by a measuring harness losing seven avatars

On `with/nft-identity` the stake is custody of the avatar, so the harness's own
failed trials forfeited it: after each sequential trial of four chunks or more,
the next `makeCommitment` reverted `InvalidPlayer` because the player was no
longer a member, and the harness had to buy a new avatar to continue. Seven
across two runs, every one of them a turn that could not be opened in time.

ADR-0002 predicted exactly this and it is worth reading the prediction again
now that it has a price attached: "an INDIVISIBLE stake makes the forfeit
all-or-nothing however far the chain got... a half-revealed turn loses the whole
avatar exactly as no turn revealed would."

## Why nothing caught it

**Nothing on chain can catch it**, and that is structural rather than an
omission: at commit time the contract is holding a hash. It cannot know how many
actions are behind it, which is the point of committing.

**Nothing on the identity branches bounds a plan either.** `placementCost` is
`0n` there, so `cost` is always zero, so the HUD's `$cost > reserveAmount`
warning can never fire. A player could click fifty cells.

**And no suite exercises the size.** The e2e plans `actionsPerReveal + 1`, which
is two chunks, so it measured the fit only at the size it tests. The note in
`a-chained-reveal-could-be-one-burst-of-transactions.md` said "two chunks land
inside a ten-second reveal phase in the e2e suite, on every node" - true, and
read as a general statement about the client when it was a statement about the
test.

## What was done

Two things, and the first is most of the win.

**The receipt poll is sized from the reveal phase.** The app built its
`publicClient` with no `pollingInterval`, so it ran on viem's 4,000ms default,
and the cost of one sequential chunk is `max(block time, poll interval)`. The
client was the binding term, not the chain. Sized from the phase, the ceiling
goes from three chunks to nine, measured. `game/core/reveal-window.ts` is the
framework half; a long cycle (the 23h/1h split two games here run) keeps viem's
default exactly as before.

**Planning refuses a placement that would make the turn unopenable**, and the
HUD says what the limit is and that going over it forfeits the stake. Removing a
cell is never refused, because that is the way out of the state.

## What it is NOT, and the wording matters

It is not a turn cap. A cap is a GAME RULE about what a player may do in one
cycle, it only binds where identity is scarce, and the framework still takes no
position on it - that is the decision the chunked-reveal task landed and this
must not be read as reversing it. What this computes is a physical limit of the
window: how many transactions fit in the time available, which is true of every
game on this template whatever its rules, and which a player meets as an
inability rather than as a refusal. The HUD's sentence is checked by a test for
exactly this: it must not read as a rule.

## The trap inside the fix, which nearly shipped

**A reveal phase of zero is not a zero-length window, it is no clock at all.**
Under the MANUAL cycle policy the phases have no durations, because the cycle
moves when every waited-for member has acted. Reading that zero as a deadline
bounds the plan to a single chunk - the tightest possible limit, imposed on the
one policy that needs no limit, since a manual reveal is racing nothing. It
answers "unbounded" instead. Same for the moment before the chain clock has
measured a block time: bounding on a guessed block time would refuse real clicks
on the strength of nothing.

Both are the same mistake as the sentence at the top of this note: a fact true
of one configuration, stated as a property of all of them.

## What is still open

**The game-rule half of the original task.** A per-identity cap enforced in the
contracts on the identity branches, where identity is scarce and the instrument
is available. This finding closes the client half only, and the client half can
be evaded by anyone running their own client - it is a guard rail, not a rule.

**Raising `actionsPerReveal` is the other lever, and it is now priced.** Measured
worst-case reveal gas, all fresh cells in distinct zones:

| actionsPerReveal | `main` | `with/nft-identity` |
| --- | --- | --- |
| 4 | 521,844 | 355,584 |
| 8 | 984,509 | 659,065 |
| 16 | 1,909,914 | 1,266,102 |
| 32 | 3,760,725 | 2,480,177 |
| 64 | 7,462,357 | 4,908,337 |

Linear, with no surprises: about 115,700 gas per action on `main` and 75,900 on
the identity branches, over a fixed overhead of roughly 58,000. So a chunk of 16
costs 1.27M on the identity branches and multiplies the openable turn by four
for nothing but a deployment parameter.

It was NOT taken, deliberately: it raises the worst case of one transaction,
which is what `revealGas` bounds and what a credit is priced from, so the whole
gas budget moves with it. That trade is now cheap to make on one branch without
touching another, because ADR-0003 moved those figures into the deploy config -
but it is a decision with a number attached rather than a free win, and `main`
wants four regardless so that chunking is exercised at all.
