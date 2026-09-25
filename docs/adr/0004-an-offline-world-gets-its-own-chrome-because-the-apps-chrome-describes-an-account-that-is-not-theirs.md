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

~~Nothing is built.~~ **BUILT 2026-09-25.** See the amendment below, which refines this decision rather than reversing it, and which corrects one claim it made about where the work would land. The sentence on screen saying the navbar still describes the remote chain is deleted rather than reworded: there is no remote chain being described up there any more.

# AMENDMENT, 2026-09-25: the framework offers the CHOICE, and each surface decides

This decision is written as a rule about offline worlds - "an offline world gets its own chrome" - and that is one step too far for the framework to go. **The framework must not take that position on a game's behalf.** It offers the choice, and each surface decides. Whether the app's chrome is still telling the truth is a fact about a particular page in a particular game, and a template that answered it for every descendant would be answering it for repos it has never seen.

So the decision now has two halves that used to be one. **The MECHANISM is that a surface may declare its own chrome, with the app's as the default** (jolly-roger's ADR-0009, and `$lib/ui/chrome` there). **THE POSITION is this repo's, about this repo's `/offline`**, and it is unchanged: that surface declares its own, for exactly the reasons above.

Nothing in the original is withdrawn. What it says about the app's chrome being misleading rather than merely incomplete, about the account being the answer that costs the player something, and about a meaningless control being ABSENT rather than disabled, all stands and is what the built thing does.

## The test that decides, which this ADR did not state and needed to

This document reasons from "an offline world", which is the case in front of it rather than the rule. Stated as a rule it is this, and it belongs here because it is the sentence an adopter needs:

**The test is not "embedded versus full screen". It is whether the chrome's CLAIMS REMAIN TRUE of the surface the player is looking at.**

- A player connected with their own account, with a world embedded as ONE THING on the page, is looking at a page where the chrome's claims are all still true: it describes the app around the embedded thing, and that app is really there. Keep it. Replacing it there DELETES three true answers from a page that has them, which is the direction of mistake nobody thinks about.
- A world that OWNS the page makes the same claims false, which is the failure this ADR was written about.

So it is about the page's OWNERSHIP, not its size. jolly-roger's `/offline-demo` is the worked example of the first case - it keeps the app's chrome and its comment now says which case it is in - and this repo's `/offline` is the worked example of the second.

## The claim this ADR got wrong, and it is worth having on record

This document says the re-scoping "moves most of the work OUT of jolly-roger and into this repo, where the offline world already lives - which also removes the cascade that made the clause expensive."

**Half right, and the wrong half was the cascade.** What moved out of jolly-roger is the CONTENT: what an offline chrome says, which is `$lib/offline-chrome` and two components here, and none of it is inherited by anybody who does not want it. What could not move is the MECHANISM. `routes/+layout.svelte` and `core/ui/AppShell.svelte` are byte-identical between jolly-roger and this repo, and **only the layout can choose what the shell is given**, so a surface-declared chrome cannot be built anywhere but the layout - and building it here would have diverged the most-edited file in this tree, which is the cost this tree keeps paying and has a standing rule against. So the cascade was not removed, it was made cheap: one generic call in the layout, which contains no answer, plus a resolver in a file the template rarely touches.

The good news that came with it is that the cascade is now the SAFE direction. Because the template writes only `chromeFor(page.data)` and never an answer, there is no call site where a descendant can inherit a chrome decision that is false for it - which is the trap `work/notes/findings/a-required-declaration-cascades-with-the-templates-answer-in-it.md` records, arriving in a different costume and disarmed this time.

## The layering fact, which this ADR assumed away

This document treats the chrome's problem as WHICH CHAIN it names. Underneath that is something stronger: the chrome is rendered by the LAYOUT, and both offline worlds create their context INSIDE the route subtree, deliberately shadowing the app's for that subtree only. **So a chrome rendered from the layout cannot see the world it would describe at all**, and "teach it which world it is in" was not merely the wrong shape, it had nowhere to read the answer from.

There were two ways out and the small one was taken: a declared navbar reads APP-SCOPED MODULES - `$lib/offline` and `$lib/offline-lobby`, which are app-scoped already and had to be, because a world is state a router must not throw away and a lobby must not forget a choice mid-decision. The rejected alternative was hoisting a world context into `lib/core`, which would put "there may be a second world" into a framework every descendant inherits in order to reach data that is already reachable. That rejection is argued in jolly-roger's ADR-0009.

## What the built thing shows, against what this ADR asked for

Asked for: which world this is, how many seats are at the table, that this browser holds a key that plays for the player, and the way out. All four are there, and "the way out" turned out to be TWO exits rather than one: leaving the table (which throws this world away) and going back to the app (which does not). Both are needed, and only the first was named here.

Most of it is not new text, which this ADR predicted correctly: the strip above the board already said nearly all of it, and the work was deciding that the strip IS the chrome. The one thing that had to move rather than be reused is the seat count and the way out, which are now in the navbar because that is where a player looks for an exit.

## What this amendment still does not decide

The unanswered question at the bottom of this ADR - whether the two chromes share components - is answered by accident and only for this case: they share nothing, because the offline chrome came out at two small components and reusing the app's navbar would have meant parameterising the thing this decision exists to stop parameterising. That is evidence, not a rule. A chrome with more in it may well want the shell and the typography, and the rule that survives either answer is still the absence rule above.
