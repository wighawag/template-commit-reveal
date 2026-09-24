---
title: The chrome's subject is a CHOICE, and an embedded world is a legitimate reason to keep it on the account
type: observation
status: spotted
spotted: 2026-09-23
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, acceptance clause two), work/tasks/done/the-embedded-chain-world.md, web/src/routes/+layout.svelte, web/src/lib/core/connection (EstablishedConnection.nodeURL)
---

# Phase 4's second acceptance clause presumes one world, and that presumption is the thing to fix

**Raised in conversation 2026-09-23, before any code.** Recorded because it changes what an OPEN acceptance clause means, and the current wording would send the next person to build the wrong thing confidently.

## What the plan currently says, and why it is too narrow

Phase 4's acceptance is two clauses. Clause one is met. Clause two reads:

> the chrome names the world it is describing rather than the one it assumed

and `the-embedded-chain-world.md` records the failure as the navbar, the account and the RPC banner living in `+layout.svelte`, outside every route subtree, describing the remote world while the offline game plays below.

**That wording presumes there is one world to name.** The counter-case is real and was raised by the maintainer: a game may deliberately want the chrome to stay about the user's ACTUAL account, with the game (offline or otherwise) EMBEDDED inside it as an activity. The user can see their real balance, act on their real account, and leave. Under that reading, today's behaviour is not a defect at all: it is the embedded case, arrived at by accident and without the ability to choose.

So the job is not "make the chrome follow the game". It is **make the subject selectable, and make every surfaced item say which world it belongs to.**

## Why it is not one switch: the affordances are not symmetric

Walking what the chrome surfaces against an embedded world, each one answers differently, and several do not answer at all:

| affordance | against an embedded world |
|---|---|
| block explorer link | **does not exist.** The chain lives in one tab and has no URL. Not "points elsewhere", ABSENT |
| RPC health banner | **meaningless.** The node is in-process and can never be unreachable; the condition it reports cannot arise |
| faucet / top up | **inverts.** The embedded world mints freely; the real chain cannot |
| account | **a different thing.** The real world has the user's wallet; the embedded world has a burner it announced itself |
| transactions, notifications | **both real and both wanted.** This is the one that genuinely needs to show two worlds at once |

So a boolean ("whose chrome") is the wrong shape. It is per-affordance CAPABILITY, and a world that cannot support one should cause it to be omitted rather than rendered dead.

**There is already a precedent for the mechanism in this tree, one level down.** `EstablishedConnection` had to grow `nodeURL` because a world has to carry its own facts rather than let the app assume them (see the finding `a-worlds-signer-broadcast-to-the-apps-node`, where assuming cost a whole session). Chrome capabilities are the same shape: the world declares, the chrome renders what is declared.

## Two worlds at once, and the rule that should govern it

The maintainer's question was whether notifications, the transaction list and the explorer should show both sides separately. Yes, and with one constraint that should be decided now rather than discovered:

**Do not merge counts.** A single badge reading "3" that turns out to be three events from a world whose money was invented teaches the user to ignore the badge. That habit is paid for when the fourth event is real. Group by world, real account first, provenance on every row.

**THE SAFETY ARGUMENT, which should be the load-bearing one.** The two worlds are not symmetric in consequence: one holds the player's real money, the other holds money the world invented. This repo already carries the contract-side version of this rule ("the framework may spend gas on the player's behalf to protect their stake, and must never spend the stake itself without being asked"). The chrome-side version is that **an item's world must never be ambiguous**, because the failure modes are a user spending real money to fix a problem that was never real, and a user dismissing a real failure because it looked like the practice one. That makes provenance mandatory rather than decorative, and it argues the real account's items must never be visually subordinate to the embedded world's.

**And a chrome that fully follows the game traps the player.** Inside an embedded world with a game-owned chrome there is no balance, no account and no exit. For the EMBEDDED case specifically, the account-owning chrome may be the safer default rather than merely an available option.

## The cheap check that should come first

The data layer may already be right. The round keys by `${chainID}_${gameAddress}_${player}` and the operations ledger prefixes its scope with the account, so several worlds already do not collide in storage (this was checked when hotseat's prerequisites were assessed, D4). If the stores are already per-world and only the PRESENTATION assumes one, this is much smaller than it looks. If they are not, that is the actual work, and it is worth knowing before anyone scopes it.

## Why this waits for reveal-or-die

The chrome has exactly one game to be designed against, which is the same trap the seams are in and which this plan already names as its biggest risk. A second game says whether the game-owned or the account-owned case dominates. Designing the selector first is designing against a sample of one, and the sample is the game the template was written for.

## What should change when this is settled

Phase 4's acceptance clause two needs rewording. It is deliberately NOT reworded here, because nothing has been decided and the plan should not absorb a conversation as though it had. The shape it probably wants is: *the chrome's subject is chosen rather than assumed, every surfaced item says which world it belongs to, and an affordance a world cannot support is absent rather than dead.*
