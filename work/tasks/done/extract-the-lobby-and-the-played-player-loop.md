---
title: Two offline worlds agree on about a hundred lines, so extract those and leave the interface the third game will decide
slug: extract-the-lobby-and-the-played-player-loop
spec: games-on-this-foundation
blockedBy: []
---

# The extraction the second offline world earned, and the half of it that has not been earned yet

## DONE, 2026-09-24, all five repos green and NOTHING PUSHED

Four commits on the template (`main`, cascaded to `with/pixi-js`, `with/nft-identity` and `with/all`) and two merges in reveal-or-die:

- `edeaa6b8` the dangling-import check, ported from reveal-or-die and generalised
- `7b7b0188` the lobby into `$lib/game/lobby/{seats,lobby}.ts`, authorise into `$lib/game/acquire/authorise.ts`
- `7bcb0531` the played-seat loop into `$lib/game/core/played.ts`, the secret into `$lib/game/core/secret.ts`
- `596c31e3` the follow-up the descendant's merge earned (below)

Heads: main `596c31e3`, with/pixi-js `808c84cb`, with/nft-identity `78662d2e`, with/all `058d9c74`, reveal-or-die `6987fead` (merges `74a9b209` and `6987fead`, both with two parents).

**THE NAMES WERE THE MAINTAINER'S CALL AND WERE TAKEN**: the three paths as proposed, one module rather than a directory for step 2, and `CONTEXT.md` gains **Played seat** rather than a word for a played PLAYER, which the maintainer rightly called weird - it names the seat, because what makes it necessary is the clock and not the game. The secret's domain string became `PlayedSeat:secret`: the whole input list is a wire, and changing it was free only because `git ls-files contracts/deployments` is empty in every repo in this tree.

**Counts, before -> after.** Template: check 0/0 -> 0/0 everywhere; server units 1639 -> 1654 (`main`), 1647 -> 1663 (pixi), 1646 -> 1662 (nft), 1655 -> 1671 (all), client 73 unchanged; contracts 47/47/49/49 unchanged; e2e 53 on every node. reveal-or-die: check 0/0 -> 0/0, units 1804 in 151 -> 1817 in 153 plus 67 in 11 unchanged, contracts 17 -> 17, e2e 51 of 51 -> 51 of 51. The +15 on `main` is the lobby's tests rewritten against fake deps (nothing mocked any more), six new ones for the loop, and three for the secret.

**The e2e teeth were re-checked after the extraction, in BOTH repos, by silencing the shared loop's pass** (`const acted = false` in place of the call, so neither the poll nor the poke can drive it). The template's offline world fails at the reveal assertion with the board still on `Committed`; reveal-or-die's fails with `Expected: "Revealed"` / `Received: "Committed"`. Both restored and re-verified afterwards.

### What it found that this brief did not predict

- **The check caught something in the merge that delivered it.** reveal-or-die's `web/e2e/tests/offline.e2e.ts` imported `../../src/lib/offline-seats` by relative path, the rename merged cleanly, and nothing else would have said so until `check`. Third time for that shape, first time it was caught at the moment of the mistake.
- **The section that carried the check into the descendant was false on arrival**, because it said "THIS repo's game" and meant `$lib/placement`. Fixed in `596c31e3` by naming both repos, which is the same lesson as the error message this brief already asked to generalise, one level up. See the finding of that name.
- **`createCycleReader` in reveal-or-die asked for the whole `Context['publicClient']`**, and the played seats' own client is a viem client from the other of the two viem copies pnpm installs here (same version, different zod peer), so the types are unrelated. Narrowed to `readContract`, which is all it calls - no cast.
- **`playedSeatSecret` arrived in the framework with no test of its own**, because the only coverage was the descendant's, in its game's test file, from when the function lived there.

### What the interface question still costs

Nothing here answers it. `createPlayedSeats` is still not designed, for the reason this brief gives: the three disagreements are the evidence, and two implementations one of which was ported from the other is not two independent ones. bomber-world is next and is cheap.

---

## The brief, as written


## Start here, from a cold context

```sh
cat AGENTS.md CONTEXT.md
git show work:work/notes/observations/what-duplicated-between-the-two-offline-worlds.md
git show work:work/notes/findings/reveal-or-dies-manual-cycle-had-no-commit-phase-and-nothing-could-reach-it.md
git show work:HANDOFF.md
```

Then read both implementations side by side, which is the whole reason this task exists rather than having been done already:

- `template-commit-reveal@with/all`: `web/src/lib/offline{,-players,-seats,-lobby,-authorise}.ts`
- `reveal-or-die@main`: the same five paths

**This task exists because the rule was satisfied, not because the duplication was noticed.** Two implementations earn a framework half; one does not, and extracting from one is how a framework gets fitted to its first game. Both now exist and are green, so the debt is collectable.

## The governing distinction, which is the whole plan in one line

**Deduplicate what is LITERALLY IDENTICAL. Do not design an interface where the two games disagreed.**

Measured function by function between the two `offline-players.ts` (comments stripped):

| | |
|---|---|
| `walletFor` | identical, 31 lines |
| `send` | identical, 19 lines |
| `tick` (serialise-and-queue) | identical, 17 lines |
| `start` | identical, 6 lines |
| `secretFor` | identical bar the identity's type |
| `pokeWhenTheHumanActs` | identical |
| `pass` | differs in ONE read: `getCycle` against `getEpoch` |

That is roughly a hundred lines of identical text plus the viem client construction. None of it is a design decision; all of it is copy.

The three places they DISAGREED are exactly the three callbacks a `createPlayedPlayers` would have to define, and all three are deferred by this task:

- **`turnsFor`** returns a candidate LIST in both, for unrelated reasons (an unaffordable bond upstream, a derivation that reads chain state downstream). Two premises converging is good evidence the RULE is real and weak evidence about the SIGNATURE.
- **`revealSteps`** is one call in reveal-or-die and a chunk loop upstream. A shared loop must not assume a chain of chunks.
- **`settle`** is the trap. Upstream `acknowledgeMissedReveal` spends the world's stake and is justified on the grounds that the stake is the world's own. In reveal-or-die it spends nothing: the loss already happened when the reveal did not, and `numMissesAllowed` counts it. A helper documenting one is wrong for the other, and this is the framework's most dangerous rule.

**And the honest reason to defer all three: reveal-or-die's world was written by PORTING the template's, not independently.** The agreement in those hundred lines is partly inherited rather than converged. bomber-world is the cheap third data point and it is next in the porting order.

## Step 0: send the dangling-import check upstream first

`reveal-or-die@main` carries `scripts/dangling-imports.mjs`, a CLI, a unit test and a hook into `scripts/apply-omissions.sh`. It is repo-local only because `offshoot-fanout` on that host is a nix-store binary with no source checkout.

**This task is a RENAME CASCADE across four template branches and into a descendant, which is precisely the hazard that check exists for**, and today the guard lives only in the repo the cascade ends in. So land it in the template first, as its own commit, before anything moves.

One thing to fix while porting it: the error message names `$lib/placement` as "the template's game", which is true in the template and would read as nonsense in a descendant. Generalise the wording.

## Step 1: the lobby is framework vocabulary, so move it into the framework

`CONTEXT.md` already defines **Lobby**, **Seat** and **Occupant** under "Before the first cycle". The framework has taken those words; the files implementing them sit in the app namespace, and `offline-seats.ts` has to ASSERT in prose that it is byte-identical on every branch. Move it and that becomes structural.

**`offline-seats.ts` moves clean.** It imports only `viem`.

**`offline-lobby.ts` DOES NOT, and this is the finding that makes step 1 real work rather than a `git mv`.** It imports `CHAIN_ID_STORAGE_KEY` and `startOfflineWorld` from `$lib/offline`, which is the GAME's world builder. It is byte-identical across the two games only because both happened to name their file `$lib/offline.ts` with the same two exports. **A naming coincidence is currently load-bearing.** Extracting it means inverting that dependency: the lobby takes "start a world with this table" and "forget this browser's world" as parameters, and the game wires them. Do that inversion deliberately and say so at the seam, because it is the only structural change in this whole task.

**`offline-authorise.ts` has a sibling waiting for it, which was not expected.** It imports `$lib/ui/delegation/*`, `$lib/onchain/delegation`, `$lib/ui/credits` and `$lib/context/types`, and that looks like a layering violation until you read `game/acquire/acquire.ts`, which imports **exactly the same set** for exactly the same delegation dance. So `$lib/game/**` importing `$lib/ui/**` is established precedent, not a new hole, and this file belongs beside that one.

Proposed homes, and the naming is a DECISION for the maintainer rather than a fait accompli, because `CONTEXT.md` is theirs:

- `web/src/lib/game/lobby/seats.ts`
- `web/src/lib/game/lobby/lobby.ts`
- `web/src/lib/game/acquire/authorise.ts`

Note that `offline` must NOT survive in the new names. `offline.ts` argues that `embedded-chain` is the MECHANISM's word and `offline` is the EXPERIENCE a player chooses, which belongs to the game. A framework file called `offline-seats` contradicts the file's own rule.

## Step 2: the played-player loop, its identical half only

One new framework module (proposed `web/src/lib/game/core/played.ts`, or `game/played/` if it wants a README), exporting three things and nothing that names a game:

- **`createPlayedKeys({provider, chain})`** - `walletFor` and `send` together: a keyring of local keys that sends a request and WAITS FOR INCLUSION, throwing on revert. Keep the argument that is already written twice: `writeContract` resolves on BROADCAST, and nobody is watching these players, so a failure they do not notice is a cycle that never closes.
- **`createSerialisedLoop({pass, pollInterval})`** - `tick` and `start`: one pass at a time, and a second one if something asked while it ran. Keep the measured argument for QUEUEING rather than dropping (a poke arriving mid-pass is the likely case, and a dropped poke falls back to the poll, which is the second of latency the poke exists to remove).
- **`pokeWhenTheHumanActs`** - eight lines that take a `Readable<{step: string}>` and do not know what a game is.

`secretFor` goes to **`game/core/secret.ts`**, which already exists and already makes this argument one level up for the player's own secret. Keep the distinction that file draws: what a derived secret buys these players is RECONSTRUCTION, not secrecy, and the domain separation is load-bearing for a different reason (two players deriving one secret are two commitments either could open).

**`pass` stays in each game**, and the one line that made it differ should become a call to the `createCycleReader` that ALREADY EXISTS in both games and already returns the framework's `CycleReading`. The played players duplicate that read today instead of taking the seam sitting beside them.

`act`, `commit`, `reveal`, `turnFor`, `candidateTurns` and the settle branch all stay in each game. That is the deferral, and it is the point.

## Cascade order, and nothing lands in the descendant first

`main`, then `with/pixi-js` and `with/nft-identity`, then `with/all` from both, then reveal-or-die. Run `git log -1 --format='%h parents: %p'` after every cascade commit.

**Expect reveal-or-die's merge to conflict at `offline.ts` and `offline-players.ts`.** That is the bargain its Step 2 signed up for deliberately and is not a sign anything went wrong. What it must NOT do is resolve those by taking the template's side: the content diverged on purpose.

**Read the merged file in the descendant rather than trusting the diff.** A hunk that merges cleanly because the two sides were never in textual conflict can still be semantically wrong, and this repo has been broken that way twice.

## Acceptance criteria

- All four template nodes green, counts recorded before and after. Starting point: 0/0 check, 1639-1656 server units, 73 client, 47 or 49 contracts, 53 e2e each.
- reveal-or-die green, counts recorded before and after. Starting point: 0/0 check, 1804 server units in 151 files plus 67 in 11, 17 contracts, 51 of 51 e2e.
- **Both offline worlds still play a full round in a real browser.** `offline.e2e.ts` in each repo is the only thing that can say so, and each has been checked for teeth - silencing the played players' pass loop must still fail it at `Committed`. Re-check that after the extraction, because a shared loop is exactly the thing that can be green and inert.
- No file under `$lib/game/**` names a game, a contract or a stake.
- `CONTEXT.md` extended if any word settles differently, in the same commit as the code.

## Three hazards, all already paid for once

- **Do not `git stash` inside a conflicted merge.** It has silently lost a second parent in this tree.
- **A shell short-circuit can leave a stash on the stack.** `cmd && git stash pop` does not pop when `cmd` exits non-zero, which `grep -c` does when it counts zero. Check `git stash list` before believing a tree is clean.
- **Run prettier on the files you WROTE, not on the files you touched.** `UsingGameInternal.sol` and several others in reveal-or-die are unformatted at HEAD, so `--write` on them buys unrelated churn inside an unrelated commit.

## What this task deliberately does NOT do

It does not extract `createPlayedPlayers`. It does not unify `settle`. It does not touch `CommitRevealAdapter`, whose scoping to the app's own player is load-bearing (it is what makes `send()` the single place a node error is classified) and is therefore not a defect to fix. And it does not generalise `turnFor`, which cannot be framework in any game where a legal action depends on the board.
