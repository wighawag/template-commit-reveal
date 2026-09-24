---
title: reveal-or-die gets an offline world of its own, and writing the second one is what earns the framework half
slug: an-offline-world-for-reveal-or-die
spec: games-on-this-foundation
blockedBy: []
---

# The second offline world, which is the one that says what the first one got wrong

## Start here, from a cold context

```sh
cat AGENTS.md CONTEXT.md
git show work:work/notes/observations/what-the-reveal-or-die-cascade-actually-contains.md
git show work:work/notes/observations/reveal-or-die-is-already-on-the-seams-and-the-handoff-is-stale.md
git show work:work/notes/findings/main-cannot-be-cascaded-into-reveal-or-die-until-the-repoint.md
git show work:work/notes/findings/a-derived-turn-is-a-wire-and-a-manual-cycle-cannot-settle-one-it-cannot-open.md
```

Then read the template's own, which is the thing being ported: `web/src/lib/offline.ts`, `offline-players.ts`, `offline-seats.ts`, `offline-lobby.ts` on `template-commit-reveal@with/all`.

**The decision is made: reveal-or-die wants an offline world.** This task exists because that turns a cascade into a port, and because the cascade is not safe to run as a merge until it is planned.

## Do it in two steps, and keep the repo green between them

The dry run (see the cascade note above) measured 4 conflicts and 15 clean adds, of which five files arrive carrying nine dangling `$lib/placement` imports into a repo that deleted that directory. So the merge cannot simply be taken.

**Step 1: cascade the framework, leave the template's game out.** Land `game/core/advance.ts` and its test, `context/InWorld.svelte`, `offline-seats.ts` and its test (free-standing: it imports only `viem`, and its `$lib/offline` mentions are prose), and the `context/core.ts` / `core/connection/{remote,types}.ts` / `game/core/cycle.ts` modifications. KEEP OUT `offline.ts`, `offline-players.ts`, `offline-lobby.ts`, `offline-authorise.ts`, `routes/offline/`, `e2e/tests/offline.e2e.ts` and `test/lib/placement/advance.test.ts`.

Step 1 also has to WRITE one file, because the framework advance client is useless without its game half: `web/src/lib/world/advance.ts`, reveal-or-die's own attendance read and advance send against its contract. The cascade offers the template's version as an add/add conflict there (git rename-detects `placement/advance.ts` onto `world/`), so it is a rewrite and not a resolution. **This is worth landing on its own merits regardless of the offline world**: nothing in that repo can push a cycle, so a manual deployment cannot complete a round there in ANY world.

> **DONE 2026-09-24, and step 1 turned out to be bigger than this paragraph. The three functions it named do not exist.** There is no `advanceCycle` (it is `moveToNextPhase`), no `getCycle` (it is `getEpoch`, and it DOES answer under both policies, so the comment in that repo saying otherwise was reading a grep rather than the contract), and no `getAttendance` **at all** - that game keeps no membership set and cannot enumerate one, so who the cycle waits for is now an argument the world declares.
>
> And underneath all three: **its manual policy had no commit phase.** `SKIP_COMMIT` was derived from the same two zero durations as the policy, with `TODO allow to specify it separately` beside it, so asking for a cycle pushed by hand silently asked for a game that skips committing. That is the template's own pre-`cyclePolicy` bug, one generation down and unfixed, and no code in that repo could reach it because every deployment is timed. Fixed there, with tests; see `work/notes/findings/reveal-or-dies-manual-cycle-had-no-commit-phase-and-nothing-could-reach-it.md` for what that implies for step 2, and for the one place the FRAMEWORK should probably change once a second game confirms it.

Green after step 1: `pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit`, plus e2e. Measured: check 0/0, unit 1780 in 148 files plus 67 in 11, contracts 17, e2e 50 of 50.

**Step 2: write this game's offline world** at the same paths as the template's (`lib/offline.ts`, `lib/offline-players.ts`, `lib/offline-lobby.ts`, `lib/offline-authorise.ts`, `routes/offline/+page.svelte`, `e2e/tests/offline.e2e.ts`). Same paths deliberately: the content diverges, so future cascades conflict at those files, which is the same bargain `AGENTS.md` already accepts for `contracts/` and is far better than modify/delete churn across eight paths.

## What differs from the template's, which is the actual work

Four things, and only the first is cosmetic.

**1. Enrolment is custody, not a bond.** The template buys an ERC20 stake through `StakeSale.purchase`, one payable call that mints, stakes for the player and forwards a gas stipend. reveal-or-die enrols by `deposit(avatarID, payee)`, which transfers the avatar NFT into the game. So provisioning must mint an avatar per seat and deposit it. **There is a worked precedent and it is closer than it looks**: `template-commit-reveal@with/nft-identity` already provisions avatars, and reveal-or-die's stem is `with/all`, so the identity half of the arriving `offline.ts` is already right. What differs is which game contract and which config.

**2. A played turn is a WALK, and a legal walk depends on chain state.** The template's `turnFor` is a pure function of (game, identity, cycle) that picks a cell, and it needs nothing from the chain. Here an `Action` is `{ActionType actionType, uint128 data}` with `actionType` in `{Enter, Move, Exit}`, so a played player must `Enter` before it can `Move`, and a legal move depends on the avatar's POSITION and on the maze.

That is the hard part, and it interacts with the property the template's file calls load-bearing: a played turn must be reproducible after a reload, or the commitment can never be opened and the world freezes (no advance can close a cycle holding an unopened commitment, and `acknowledgeMissedReveal` refuses one from the current cycle). Deriving from position is still reproducible, but only if the position is read AS OF the cycle the commitment belongs to, because the reveal moves it. **State that argument explicitly in the file the way the template's does**, and pin it with a test that commits, simulates a reload, and reveals.

**3. Missing a reveal costs the avatar, not a bond.** The game is called reveal-or-die. The template's `offline-players.ts` has a safety valve that settles a stale commitment rather than carrying it, on the grounds that "what it forfeits is the world's own stake, which is the one case where spending a stake unasked is not a rule violation". That reasoning still holds (these are the world's avatars), but the consequence is larger and the code should say so rather than inherit a comment sized for an ERC20 bond.

**4. The chunked commitment does not exist here.** reveal-or-die's contracts have no `furtherActions`, and its adapter sends one reveal. Per `AGENTS.md` that is a schedule rather than drift, and the two halves AGREE today, which is the thing that must stay true. Do not port the template's chunking loop into a client whose contract cannot resolve it.

## The payoff, and the reason to do it here rather than design it upstream

**Two implementations earn the framework half; one does not.** That is this tree's own rule (it is why the asset pipeline got a node: "It has already been written twice, which is what earns the node"), and the template's `offline-players.ts` has already guessed at the split in prose: it says nothing in it knows how the game spells an identity, while it plainly does know the game's ACTIONS, importing `$lib/placement/{cells,config,commit-reveal}`.

So the expected outcome of this task is not just a second offline world. It is a list of what was generic all along. The candidates, to be confirmed by writing rather than assumed:

- the pass loop (read cycle, read commitment, commit or reveal, settle a stale one), including the serialise-and-queue behaviour `tick()` implements
- `secretFor` (a hash over chain, game, identity, cycle), which is `game/core/secret.ts`'s argument one level down
- `pokeWhenTheHumanActs`
- the seat model and the lobby, which are already written to be game-agnostic and should be CHECKED rather than trusted

And the live question the second implementation is there to answer: **can a played player go through the game's existing `CommitRevealAdapter`, or does it need its own path?** The adapter is built around the app's one player and its executor; a played player is a different key acting for a different identity. If the adapter fits, it is stronger than it looked. If it does not, that is the seam bending on contact with a second game, which is exactly what the handoff predicted and what the ports exist to find.

**Do not extract the framework half in this task.** Write the second one, note what duplicated, and let the extraction be its own change with both implementations in front of it. Extracting from one example is how a framework gets fitted to its first game, which is the risk this whole plan is trying to retire.

## Acceptance criteria

- reveal-or-die boots an offline world in the tab, seats three to N players, and plays a full round against its own contracts: commit, advance, reveal, advance.
- A reload mid-cycle reproduces every played player's committed turn exactly, and the cycle closes. Pinned by a test, not by inspection.
- A played player that cannot act legally (no avatar, or nothing legal to do) still does something the cycle can close on, because unanimity waits for it. Say what that is in the file and test it.
- An e2e test in a real browser, in the shape of the template's (`offline.e2e.ts`), asserting the round completed AND that the other players reached the board, since a player committing an empty turn satisfies every count while doing nothing.
- `check` clean, `test:unit` and `test:e2e` green, and the counts recorded before and after in the plan.
- A note on `work` listing what duplicated between the two offline worlds. That list IS the deliverable for the framework question, and without it this task has to be re-derived by reading both.

## Two hazards, both already paid for once

**Run the post-merge dangling-path check before trusting step 1.** *(Built 2026-09-24 as `scripts/dangling-imports.mjs` in reveal-or-die, repo-local because `offshoot-fanout` is a nix-store binary here with no source to edit. Run against the merged tree it reported all nine of the imports below in about a second, before any of it had been reasoned about.)* Two consecutive cascades into this repo have been broken by a hunk that merged CLEANLY: a deletion leaving a dangling import the first time, clean ADDs naming a deleted directory the second. `--verify` catches both, one step later than the mistake. Grep the merged tree for imports of paths that do not exist before running anything expensive.

**Do not `git stash` inside a conflicted merge**, which has silently lost a second parent in this tree before.
