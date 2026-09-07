---
title: The round reconciles with the chain, so a commitment this browser forgot is still openable
slug: round-reconciles-with-the-chain
spec: games-on-this-foundation
blockedBy: []
---

# The round reconciles with the chain

Today a browser that has lost its local round is told nothing and loses the stake in silence. The chain holds the commitment; the client already fetches it; the client throws the fact away.

**Decided in D10 of the spec.** Read that first: it is what makes this small, and it is where the reasoning lives. This task is the build, not the design.

## What is already true, so nobody re-derives it

- **The derived secret landed** (`e7599b35`). The secret is recomputable, which is the prerequisite for every route below. Without it there is nothing to check a candidate plan against.
- **The chain read already exists**, in the game's `missed-reveal.ts`: it reads `getCommitment(player)`, reads the current epoch, and on a match sets `Clear` and returns. That branch is the silent forfeit. Nothing new has to be fetched.
- **The too-late case is already handled and needs no code.** `epochDuration = commitPhaseDuration + revealPhaseDuration` with no trailing segment, so a commitment in the CURRENT epoch is always still openable; once the reveal window shuts the epoch has advanced and the existing missed-reveal path reports `Blocked` and offers the settlement. Only the LIVE epoch is missing. Do not build a too-late branch.

## Scope

**Framework, and this is the whole of it:**

- `round.adopt(persisted)` — the body of the existing `restore()`, taking a `PersistedRound` from somewhere other than storage. It saves to storage on the way through, so a second reload is free.
- **No new `RoundState` member.** A reconstructed round IS a restored round and the round must not be able to tell the difference. This is the constraint that keeps the change out of every consumer that switches on the state, and a design that needs a new state has gone wrong.

**Game side, in the game's own directory:**

- extend the existing read so the live case is reported rather than reported as `Clear`;
- reconstruct the actions from either an enumeration the game supplies (optional) or the player re-entering them, and verify with `adapter.buildCommitment({actions, secret})` against the chain's hash;
- call `adopt`.

**Out of scope:** any scheduler work. For a genuinely long round the defence is the scheduler, which already receives `secret`, `epoch` and `revealDueAt` at commit time; this is the backstop for when there is none. That is Phase 5.

## Acceptance

- A round committed in one browser is recoverable in a fresh context with empty local storage, in the same epoch, and reveals. This is Phase 1's stated criterion, which the derived secret alone does NOT meet: reveal-or-die's missed-reveal e2e currently still misses, and that is the test that should change behaviour.
- The reveal window is respected: nothing spends gas on a reveal that cannot land.
- Nothing settles a forfeit on the player's behalf. `acknowledgeMissedReveal` stays a deliberate press, per the standing rule that the framework may spend gas to protect a stake and may never spend the stake.
- `RoundState` has the same members it has today.
- A game that wires none of this is unaffected, and pays nothing.

## Checked by mutation, not just green

Two mutations that must fail something: recovering a plan whose hash does NOT match must be refused, and adopting a round from a past epoch must be refused. Both are the kind of thing a green suite has already been observed to hide here twice.
