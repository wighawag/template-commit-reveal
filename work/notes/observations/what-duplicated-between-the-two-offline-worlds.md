---
title: What duplicated between the two offline worlds, measured, and which of the four candidates survived contact
type: observation
status: spotted
spotted: 2026-09-24
relates-to: work/tasks/backlog/an-offline-world-for-reveal-or-die.md (The payoff), work/specs/proposed/games-on-this-foundation.md (Phase 4, Phase 6), work/notes/findings/reveal-or-dies-manual-cycle-had-no-commit-phase-and-nothing-could-reach-it.md
---

# The second offline world exists, so here is the list the extraction needs

**This is the deliverable the task named**: "A note on `work` listing what duplicated between the two offline worlds. That list IS the deliverable for the framework question, and without it this task has to be re-derived by reading both."

Written after reveal-or-die's world was built and green (check 0/0, unit 1804 in 151 files plus 67 in 11, contracts 17, e2e 51 of 51, unpushed). **Nothing is extracted here, deliberately.** The rule this tree runs on is that two implementations earn a framework half and one does not, and the way a framework gets fitted to its first game is by extracting from it. Both implementations now exist; the extraction is its own change, with both in front of it.

## Measured, with comments stripped

| file | verdict |
|---|---|
| `offline-seats.ts` | **BYTE-IDENTICAL.** Its own claim held. |
| `offline-lobby.ts` | **BYTE-IDENTICAL.** Predicted game-agnostic, and it is. |
| `offline-authorise.ts` | **BYTE-IDENTICAL.** Not predicted, and the more interesting of the two. |
| `offline.ts` | 327 code lines upstream, 322 here, **263 in common** |
| `offline-players.ts` | 311 code lines upstream, 359 here, **230 in common** |

"In common" is a line-set intersection, so it flatters slightly (closing braces, `}` and `});` recur). It is still the right order of magnitude, and the shape it points at matches what reading them says.

## The four candidates, and how each one came out

The task named four things to CONFIRM by writing rather than assume. Three survived, one did not, and the one that did not is the most useful result.

### 1. The pass loop, including `tick()`'s serialise-and-queue - **CONFIRMED, and it is the biggest single piece**

`tick()`, `start()`, `pass()`, `send()` and the `running`/`wanted`/`acted` triple are effectively identical. The queueing argument (a poke arriving mid-pass is the LIKELY case, so dropping it falls back to the poll and costs the second of latency the poke exists to remove) is a statement about any client driving a manual cycle and has nothing to do with either game.

`act()` is the same SHAPE and not the same code: read the commitment, settle a stale one, commit or reveal. What differs inside it is the third bullet below.

### 2. `secretFor` - **CONFIRMED, character for character apart from the identity's type**

A hash over (chain, game, identity, cycle) with a domain string. Both files carry the same paragraph explaining that what this buys is RECONSTRUCTION rather than secrecy, and the same subtler reason for the domain separation: two players deriving one secret are two commitments either could open, which is a way for a played player to settle another's turn by accident.

### 3. `pokeWhenTheHumanActs` - **CONFIRMED, byte-identical**

It is eight lines and it subscribes to a `Readable<{step: string}>`. It does not know what a game is.

### 4. The seat model and the lobby - **CONFIRMED BY MEASUREMENT RATHER THAN BY TRUST**, which is what was asked

Both byte-identical. `offline-seats.ts` says of itself that it should stay that way on every branch, and it now has a second game's worth of evidence.

### And the one nobody listed: `offline-authorise.ts` - **BYTE-IDENTICAL, and it should not have been**

This is the surprise. It registers the browser's key as a delegate, through `registrationRequest` and `submitRegistration`, and it came across unchanged - into a game with a different contract, a different identity type and a different stake. The reason is that `@etherplay/delegation` made authority ACCOUNT-WIDE rather than per-identity, so nothing in that path ever names an avatar or a reserve. **It is the strongest single piece of evidence in this note that the account/signer split was got right**, because it is the one file that had no reason to survive a port and did.

## What did NOT duplicate, which is the more important half

### `turnFor` is not the same KIND of function, and that is a seam question rather than a code question

Upstream it is pure over (game, identity, cycle). Here it additionally takes the avatar's `{inGame, position}` and the maze, because an action is `{Enter, Move, Exit}` and a legal move depends on both. So a framework `turnFor` would have to be a game-supplied function and not a shared one - which is the expected answer.

**The interesting part is what that does to the REVEAL, and it is not obvious.** Upstream the candidate-turn machinery exists because a played player commits an empty turn when it cannot afford the bond, so what is on chain depends on what its reserve held at commit time. That reason does not exist here (nothing is bonded), and yet the same machinery is needed for a different one: the derivation reads chain state, so a reveal that re-derived it and guessed wrong would strand the commitment and freeze the world.

So **"enumerate what this file could have committed and let the HASH judge" is the general rule, and the two games reach it from unrelated premises.** That is a framework-shaped conclusion arrived at twice, which is exactly the evidence this exercise was for.

### The chunking loop is upstream-only, and correctly so

reveal-or-die's contracts have no `furtherActions`, so its reveal is one transaction and `chunkDueNext`/`buildPlacementChain` have no counterpart. Per `AGENTS.md` that is a schedule rather than drift. **A shared pass loop must therefore not assume a chain of chunks**, which is an argument for the reveal step being the game's and the loop around it being the framework's.

### Attendance is not the same problem

Upstream reads `getAttendance`. reveal-or-die's contract keeps no membership set and cannot enumerate one, so `world/advance.ts` takes `waitedFor` as an argument, keyed by chain id, declared by the world after provisioning. See the finding of 2026-09-24 for why that also changes what the client's mirrored guard IS - there it is a prediction, here it is the only guard there is.

## The live question the second implementation existed to answer

**Can a played player go through the game's existing `CommitRevealAdapter`?**

**No, and the reason is cleaner than "it did not fit".** Both offline worlds bypass the adapter and build viem clients of their own, and it is not an accident of porting: the adapter's `ready()` resolves `connection` and `signerExecutor` off the app `Context`, which is one player's connection and one player's key. A played player is a DIFFERENT key acting for a DIFFERENT identity, and there is exactly one context per world.

So the adapter is not wrong, it is scoped to the app's own player, and that scoping is load-bearing everywhere else: it is what makes `send()` the single place that classifies a node error, and what lets the out-of-gas remedy exist at all.

**What the two worlds agree the shared thing would be** is narrower than the adapter and has a name in both files already: "send this request as this key, wait for inclusion, throw on revert". Upstream calls it `send`; here `world/commit-reveal.ts` exports exactly that as `sendWorldTransaction`, for the same reason and with the same wait-for-inclusion argument ("`writeContract` resolves on BROADCAST"). **That has now been written three times** (the app's adapter, and a played-player copy in each world), which is one more than the rule requires.

## What an extraction would actually look like, sketched and not built

A `createPlayedPlayers({...})` in `$lib/game/core` taking:

- `players: readonly {privateKey, identity}[]`
- `readCycle()`, `readCommitment(identity)` - already one line each in both
- `turnsFor(identity, cycleNumber): Promise<Actions[][]>` - **the candidate list, not the turn**, which is the thing this note argues both games converged on
- `headOf(actions, secret)` and `revealSteps(actions, secret)` - one call here, a chunk loop upstream
- `settle(identity)` - `acknowledgeMissedReveal` in both, meaning different things

and keeping the pass loop, `tick()`, `secretFor` and `pokeWhenTheHumanActs` whole.

**The thing to be careful about, and it is why this is a sketch:** the two `settle` calls are not the same operation. Upstream it SPENDS the world's stake and is justified on the grounds that the stake is the world's own. Here it spends nothing, because the loss already happened when the reveal did not, and `numMissesAllowed` is what counts it. A framework helper that documented one of those would be wrong for the other, and this is the framework's most dangerous rule ("may spend gas on the player's behalf, never the stake"). Whatever is extracted should take `settle` as a game-supplied call and say nothing about what it costs.

## One thing this note is NOT evidence for

**Two implementations is the minimum, not a quorum, and these two are more closely related than the next pair will be.** reveal-or-die's world was written by porting the template's file rather than independently, so the 230 lines in common include agreement that is inherited rather than converged. The genuinely independent data points here are the three places where the two DISAGREED and had to be reasoned out separately: the derivation's inputs, the reason for the candidate list, and what settling costs. Weight those higher than the line count.
