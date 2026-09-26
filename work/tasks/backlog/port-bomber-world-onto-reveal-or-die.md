---
title: bomber-world becomes current reveal-or-die plus bombs, as a member of the tree with a verify command
slug: port-bomber-world-onto-reveal-or-die
spec: games-on-this-foundation
blockedBy: []
---

# Port bomber-world onto reveal-or-die (D3)

## Start here, from a cold context

```sh
cd ~/dev/github/wighawag/template-commit-reveal     # any checkout of the template
cat AGENTS.md CONTEXT.md                            # the commit-reveal rules and the words
git show work:work/specs/proposed/games-on-this-foundation.md | grep -n "D3\|D8\|Phase 7"
git show work:work/notes/observations/reveal-or-die-is-already-on-the-seams-and-the-handoff-is-stale.md
cd ~/dev/github/wighawag/bomber-world && git log --oneline -6
```

**Why now.** D3 says bomber-world "re-syncs during Phase 1". Phase 1 was marked DONE on 2026-09-17 without it, so D3's placement is stale and nothing in the phase list holds this work any more. It is also a prerequisite: Phase 7 (the UI swap, D8) runs ON bomber-world "once it is current", and cannot start until this lands.

**Measured 2026-09-26** unless stated otherwise, against bomber-world `35c1510a` and reveal-or-die `cc43fb2b`, in a throwaway clone under `/tmp` so neither real repo gained a ref.

## What the port actually is

**Two prices have been quoted for this, and they measure different things.** HANDOFF's old "~18 files differ, 64 of 81 identical" predates reveal-or-die's own rebuild and is dead. The 2026-09-25 figure (91 files under `web/src` against 450, 143 paths in one repo only, 28 common paths differing and none identical) is correct, but it compares TWO TREES, and that is the wrong unit for a merge. What a merge replays is bomber-world's own work since the shared base:

- **The merge base is `c3b2544e`** (2026-01-14), 29 commits of shared history. Since then bomber-world has **6 commits**, one of which (`5ce938f0 bomber-world`) is the game; reveal-or-die has 1481.
- **bomber-world's own delta is 35 files, +1082/-402**, excluding deployment records, the lockfile and art. Add 283 files of art (LFS sprites, `web/static`) and two testnet deployment directories.

By kind:

| part | files | notes |
|---|---|---|
| contract | `BombLogic.sol` (new, 264), `UsingGameInternal.sol` (+104), `UsingGameStore.sol` (+14), `UsingGameTypes.sol` (+2 enum values) | a good share of the `+104` is `console.log` left in, plus an `import "hardhat/console.sol"` |
| client | `onchain/{state,types,writes,direct-read,zones-fetcher}.ts`, `operations/index.ts`, `view/index.ts`, `private/localState.ts`, `render/objects/{AvatarObject,BombObject}.ts`, `render/renderer.ts`, tutorial, TopBar, enter flow, `core/connection/embedded.ts`, `core/render/renderer.ts` | **20 of these no longer exist in reveal-or-die**: they were deleted or moved when it was put on the seams. Bombs have to be RE-HOMED into `web/src/lib/world/`, not merged |
| brand | `assets/sprites/**` (LFS), `web/static/*`, `web-config.json`, README, package names (`bomber-world-*`), SplashScreen | keep |
| tooling | `dev/pm2.config.cjs`, `dev/wezterm.lua`, `NOTES.md`, `TODO.md`, `tevm-link.patch` | decide per file; `tevm-link.patch` in particular belongs to a stack reveal-or-die no longer has |

**A trial merge (`git merge rod/main` onto bomber-world, `GIT_LFS_SKIP_SMUDGE=1`) stops at 24 conflicts:** 16 modify/delete (bomber-world edited a file reveal-or-die deleted), 7 content (`UsingGameInternal.sol` with 3 hunks, `onchain/state.ts` 3, `view/index.ts`, `web-config.json`, both `package.json`s, the lockfile), and 1 file location (`BombLogic.sol` added inside the directory reveal-or-die renamed). Git DID detect the `onchain/evm/` -> `contracts/` directory rename, which is what D3 budgeted for; `UsingGameTypes.sol` is not among the renames it followed and arrives as a modify/delete, so the enum change is ported by hand.

## Step 0: make bomber-world a member of the tree, before any merge

It has no `stem` remote and no offshoot config, so there is no verify command and nothing to be green against. Copy reveal-or-die's shape exactly:

- `git remote add stem git@github.com:wighawag/reveal-or-die.git`, fetch with `--prune`.
- An orphan `offshoot` branch holding `fanout.config.json`: `{"stem": "github:wighawag/reveal-or-die", "branches": {"main": {"stemBranch": "main"}}, "verify": "pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit"}` (reveal-or-die's own, with the stem changed).
- **Record bomber-world's current state BEFORE the merge, even if red**: `pnpm --version`, install, check, unit, contracts. It is on a stack reveal-or-die left ~1500 commits ago and may not build at all today; a number is still the only way to say afterwards what the merge changed. Write "does not build, because X" rather than skipping the row.
- **LFS.** bomber-world tracks 284 files in LFS and reveal-or-die's art is in LFS too. In the trial merge, checkout failed on `assets/sprites/cell.png` because the object lives only on reveal-or-die's LFS server. Before the merge run `git lfs fetch stem --all` (or the refs you merge), and before pushing run `git lfs push origin --all`, or bomber-world's origin will hold pointers to objects it does not have and the next clone breaks.

## Step 1: the merge, and its recommended shape

**Recommended: the merge commit makes bomber-world CURRENT REVEAL-OR-DIE PLUS ITS BRAND, and green, with no bombs.** Take reveal-or-die's side for every modify/delete and every game hunk, keep bomber-world's brand, and resolve `package.json` names to `bomber-world-*`. Then bombs come back as separate commits (steps 2 and 3), each green. The reason is readability: re-implementing bombs inside the conflict resolution produces one merge commit that is simultaneously a port, a rewrite and a feature, and nobody can review it or bisect through it. The cost is a `main` with no bombs for a few commits, so **do not push until step 3 is done**.

The alternative, resolving bombs into `world/` inside the merge, is legitimate if the reviewer prefers one landing; say which was chosen and why in the merge message.

Either way:

- **Run `node scripts/check-dangling-imports.mjs` once `package.json` is resolved and installed.** It needs `web/node_modules` and a parseable root `package.json`, so it cannot run while `package.json` still holds conflict markers. The likely hit is `BombObject.ts`, which arrives as a clean ADD into `render/objects/`, a directory reveal-or-die deleted.
- **`.offshoot-omissions` and `AGENTS.md`/`CONTEXT.md` arrive from reveal-or-die** as clean adds. Read them in bomber-world: a paragraph written as "this repo" is true one level up and false here, which has happened twice in this tree already.

## The deployment records merge cleanly and wrongly

**bomber-world's pre-port `rise-testnet` records land at `contracts/deployments/rise-testnet/` with no conflict reported**, carried by the directory rename, where reveal-or-die's own records were. Checked in the trial merge: the tree's `Game.json` there is byte-identical to bomber-world's old `onchain/evm/deployments/rise-testnet/Game.json`. `somnia-testnet` moves across the same way. These are records of contracts the merged source no longer builds, so a client built against them talks to an old ABI.

**The port is therefore a REDEPLOY**, and two things follow that need a decision rather than a default:

- **What happens to the old records**: deleted, or kept somewhere clearly historical. Not left where the build reads them.
- **The storage rule in `AGENTS.md` applies, in its cheap form.** bomber-world's secret lives in `private/localState.ts`, which is replaced by reveal-or-die's `world/storage.ts` with different keys, so any commitment in flight on the old deployment can no longer be revealed from a ported client. Both deployments are testnets, last deployed 2026-01-14. Check whether anyone plays them; if nobody does, say so in the commit and move on.

## Step 2: bombs in the contract

Into `contracts/src/game/internal/`, on top of reveal-or-die's `UsingGameInternal.sol`, not bomber-world's:

- `BombLogic.sol` moves to `contracts/src/game/internal/`, `ActionType` gains `PlaceBomb` and `PlaceBombDelayed`, and the store gains `_bombs` and `_explosions`.
- **The death check merges into reveal-or-die's `_getResolvedAvatar`**, which now reads `NUM_MISSES_ALLOWED` from config where bomber-world hard-codes 3. Keep the config.
- **Strip every `console.log` and the `hardhat/console.sol` import.**
- **`_boxes_exploded`, `_epochAtWhichBoxExplode` and `_boxes_will_explode` are declared and never read or written.** Drop them, or say what they are for.
- **`bomb_count >= 2` does `break`**, which silently drops every action after a third bomb, moves included. That may be the intended rule, but it is a rule, so write it down or change it.

**THE ORDER-INDEPENDENCE ARGUMENT HAS TO BE WRITTEN NEXT TO THE CODE AND PINNED BY A TEST**, per `AGENTS.md`, because bombs are exactly the mechanic that breaks it. Read today, it holds by construction: a reveal in cycle E reads only `_bombs[E]` (in `_isValidMove`) and `_explosions[<= E]` (in `_getResolvedAvatar`), and writes only `_bombs[E+1]` and `_explosions[E+1]` or `[E+2]` (`bombTimeout` is 1 or 2, and the timeline loop starts at `countdown = 1`). Nothing a reveal in E writes is read by another reveal in E, and every write is `|=`. That is an argument, so:

- say it in a comment at `BombLogic` and at the two read sites;
- extend `contracts/test/js/Game.test.ts`'s "reaches the same board whichever order the reveals arrive in" with bombs in both players' actions, asserting explosions, bomb cells and life in both orders;
- **check it for teeth**: a bomb that takes effect in the current cycle (write `_bombs[epoch]`, or `_explosions[epoch + bombTimeout - 1]` with timeout 1) must make that test fail, and only that test.

**`THIS_CONTRACT_JUDGES_AN_ADVANCE` stays `false`**, and it arrives from reveal-or-die by merge, not by decision. Re-read `_moveToNextPhase` in the merged contract and confirm it still checks the policy alone before trusting the constant. That exact line has already arrived once carrying the wrong answer with every suite green.

## Step 3: bombs in the client, in `web/src/lib/world/`

Re-homed, not copied. The places reveal-or-die's world already has: action packing and the persisted record (`storage.ts`, `commit-reveal.ts`), state reading (`state.ts`), planning and input (`planning.ts`, `controls.ts`), rendering (`render/`, where `BombObject` joins `AvatarObject`), the HUD and tutorial (`ui/`). Business logic goes in `.ts` and not in `.svelte`, and there are no `.svelte.ts` files (`AGENTS.md`).

- **Recovery has to know about bombs.** `recover-submission.ts` rebuilds a turn after local storage is cleared (D9's action half); a turn containing a bomb must still come back. `recover-submission.e2e.ts` is the net.
- **Adding action variants to the persisted record is additive**, so old records stay readable. Renaming anything already in it is not (see `AGENTS.md`).
- **A BOMB'S DRAWN POSITION IS TAKEN ON TRUST, and bomber-world's own TODO says so; do not carry it silently.** A bomb may be placed anywhere along the path, and the contract places it at the avatar's position at that point in the action sequence (`resolution.currentX/Y`), ignoring the bomb action's `data`. The client draws other players' bombs at `bigIntIDToXY(action.data)` from `CommitmentRevealed`. For honest players the two always agree: the planner writes the path position into `data`, and a move blocked at reveal stops processing, and the event carries only `actions[0:numActionsResolved]`, so a bomb after a blocked step is never drawn either. What is open is a MODIFIED client: it can send a bomb whose `data` names another cell, the real bomb still lands on its path, and every other player sees it drawn somewhere else and can walk into the real one unwarned. Two fixes, both named in that TODO: the contract rejects a bomb action whose `data` is not the current position (one comparison, and `data` becomes trustworthy), or the client ignores `data` for bombs and takes the position from the preceding move in the same event (or the avatar's start). Decide, and test whichever it is.
- **The client's "cannot step onto a bomb" planning guard** uses `detonationEpoch > currentEpoch`, and the contract uses `_bombs[epoch]`, which only a DELAYED bomb from the previous cycle sets. Check they agree for both bomb kinds before trusting the planner.

## What this task deliberately does NOT do

- **It does not rename `epoch`.** After this port bomber-world's contracts ARE reveal-or-die's plus bombs, and reveal-or-die still says `epoch` (152 hits in `web/src`, 135 in `contracts/src` on 2026-09-23). Renaming here would make bomber-world diverge from its stem across every shared game file, and every later cascade would conflict on it. bomber-world's `epoch` follows reveal-or-die's and arrives by cascade. `vocabulary-in-the-game-repos.md` scheduled the rename "inside D3's re-sync" and is corrected in the same commit as this file.
- It does not start Phase 7 (the UI swap). That runs on the result.
- It does not add the unanimity guard to `_moveToNextPhase`, or fix `_moveToNextEpoch`'s stranding defect. Both are reveal-or-die's and arrive by cascade when fixed there.
- It does not touch `web/src/lib/core` or `web/src/lib/game`. If bombs seem to need either, that is a seam question for the template, not an edit here.

## Acceptance criteria

- bomber-world has a `stem` remote and an `offshoot` config, so it has a verify command, and before/after counts are recorded (before may be "does not build", stated).
- Verify green, contracts green, and e2e green with explicit ports (`cd web && E2E_RPC_PORT=8638 E2E_PORT=4638 pnpm test:e2e`, ports checked free first). **e2e is not in verify, and it has mattered before.**
- `offline.e2e.ts` plays a whole round in bomber-world. It inherits reveal-or-die's offline world, so this is the same test and the same teeth.
- The order-independence replay passes with bombs, and has been watched failing under the mutation above.
- A bomb placed in a real browser is drawn, and the next cycle behaves as the contract says. One e2e, in the offline world, is enough.
- **Divergence from the stem is the game and the brand only**: zero files under `web/src/lib/core` and `web/src/lib/game` differ from reveal-or-die, measured with `git diff --stat stem/main -- web/src/lib/core web/src/lib/game`.
- `node scripts/check-dangling-imports.mjs` clean before every commit; `git log -1 --format='%h parents: %p'` after the merge shows two parents.
- LFS objects present on bomber-world's origin: a fresh clone checks out without a smudge error.

## Hazards, all already paid for once

- **Never `git stash` inside a conflicted merge.** It silently loses a second parent.
- **`git rev-parse -q --verify MERGE_HEAD`**, not `test -f .git/MERGE_HEAD`, if this runs in a worktree.
- **Check `git stash list`** before believing a tree is clean.
- **Prettier on the files you WROTE**, not on files you merely touched.
- **`web/src/lib/deployments.ts` is generated and gitignored.** Regenerate it after any contract change and every branch switch, and never run an unbounded regex over it.
- **Check how `pnpm` is reached** (`pnpm --version`) before assuming.
- **Read the merged file, not the diff.** Three clean hunks in this tree have broken a descendant, and step 1 already has one known case (the deployment records).

## Counts to start from

reveal-or-die `main` `cc43fb2b`, measured 2026-09-26: check 0/0, 1843 server units in 155 files, 70 client in 12, 17 contracts, 51/51 e2e. bomber-world: unmeasured, and step 0 measures it.
