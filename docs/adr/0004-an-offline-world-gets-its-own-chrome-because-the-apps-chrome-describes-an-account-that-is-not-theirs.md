---
status: accepted
date: 2026-09-24
---

# An offline world gets its own chrome, because the app's chrome describes an account the player never chose

Phase 4's second acceptance clause has been written down since the embedded world landed as "the chrome names the world it is describing", and the whole of it was treated as a `lib/core` problem: the navbar, the account and the RPC banner live in `+layout.svelte`, outside every route subtree, so they still describe the remote chain while three players take turns below them. The fix was assumed to be teaching that chrome which world it is in - upstream work in jolly-roger, inherited by every repo in this tree.

**That framing is wrong, and the decision is that the offline experience gets a CHROME OF ITS OWN rather than a parameterised version of the app's.**

## Why the reuse is not merely incomplete but misleading

The app's chrome answers questions that belong to an online player, and two of its answers are actively confusing offline:

- **"Connected", as a state worth reporting.** Offline there is one wallet, one account, and it signs without asking. "Connected" is not true-but-boring there, it is MEANINGLESS: there is nothing to connect to and nothing a player could do about it either way. A control that reports a state with one possible value is the same defect as a dialog with one possible answer, which this tree has already removed twice (the lobby's authorise step, the acquisition rail's three transactions).
- **The ACCOUNT, which is the one that actually costs the player something.** An offline world generates its own wallet. Showing that address where the app shows the player's own means a player who played the online version first comes back and sees a DIFFERENT account presented as theirs, with a different balance and a different history, in the same position on screen. The honest reading of that is "my account changed", and nothing on the page contradicts it.
- **Credits**, for the same reason as "connected": the world invented the money, so a credits figure is a number about nothing.

So the offline chrome is not the online chrome pointed at another chain. It is a different set of answers to the same PURPOSE: say where you are, say what is at stake, and give the player the way out.

## What follows

- **Phase 4's second clause is re-scoped.** It is no longer "make `lib/core`'s chrome name its world"; it is "the offline experience ships its own chrome". That moves most of the work OUT of jolly-roger and into this repo, where the offline world already lives - which also removes the cascade that made the clause expensive.
- **What the offline chrome shows is decided by what an offline player can act on**: which world this is (the chain id is already shown), how many seats are at the table, that this browser holds a key that plays for them, and the way out (leave the table). The strip above the offline route already carries most of that, which is evidence this is the right shape rather than a new surface.
- **What it must NOT show**: a connection state, an account presented as the player's own, credits, or anything else whose only truthful value offline is "not applicable".
- **The online chrome is left alone**, and that is the other half of the decision. It is right for the case it was built for, and it stops being a problem for the offline case the moment the offline case stops borrowing it.

## What this does not decide

Whether the two chromes share components. Probably some (a layout shell, typography) and not the pieces that name an account or a connection, but that is a question for whoever builds it, with both in front of them. The rule that survives either answer: **a control that is meaningless in a mode must be absent in that mode, not disabled and not showing a placeholder value.**

## Status of the code

Nothing is built. The offline route says on screen that the navbar above it still describes the remote chain, which was the honest interim answer and remains true until this lands.
