---
title: The handover waits for the person's data, and the submission says when it can take a plan
slug: the-handover-waits-for-the-persons-data
spec: games-on-this-foundation
blockedBy: [hotseat-in-the-offline-world]
---

# The handover waits for the person's data

Found by stratagems' hotseat e2e (its port plan, step H2, `join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`), built as its step H1b at the maintainer's request on 2026-11-02 ("do both").

**The defect.** After an account switch the new account's data loads; meanwhile the submission reads `Idle` and `plan` drops what it is given (what the storage holds may be a committed turn). The handover went from `Switching` to `Playing` as soon as the connection was signed in as the next person, so a person could be shown a board that ignored their clicks without a word: in stratagems a click selected the cell and planned nothing. H1-8 (in this task's predecessor, `hotseat-in-the-offline-world`) had decided `Switching` lasts through "the new account's data loaded"; as built it did not. An online player switching account in their wallet meets the same window, without any cover.

## Done, 2026-11-02, on local preview branches `ph1b/*`, NOT pushed

**`main`** (from `origin/main` fd7f8cc3):

- `127d19dd` `SubmissionStore.ready`: whether a plan would be taken now, the storage's readiness for whoever plays (true for a storage with none), with unit cases;
- `e3dea2f1` the reference game: `planning.canPlan` and `toggle` respect it, and the HUD's warning says "Loading your account's data: a cell clicked now is not planned." first (`LOADING_ACCOUNT`), with unit cases;
- `7ab8bb9f` `createHotseat` takes the world's `accountData` (required, so a world that does not pass it does not compile) and shows the game only once its lifecycle is `ready` (or `error`, so the game can say so) FOR THE ACCOUNT OF THE PERSON WITH THE DEVICE: right after a switch the lifecycle can still be the previous person's `ready`. The reference game's world passes `context.accountData`. Unit cases: covered while loading, not uncovered by the previous person's `ready`, shown on an error;
- `9c7a6a43` `offline-hotseat.e2e.ts` asserts the person's data is loaded when the game appears after a handover.

**`with/fuzd`**: `abe848f3` the fuzd HUD test's fake submission has `ready` (the merge's one conflict, in `placement/ui/hud.ts`, kept both sides: the reveal schedule and the readiness). The other nodes merged clean; every node's world passes `accountData` by the merge.

**Descendants**: reveal-or-die and bomber-world take the framework (their `offline.ts` their own, no hotseat; the reference game's files omitted); stratagems `main` likewise, and stratagems' integration branch passes `accountData` in its own world and refuses a click in its own planning with "Your account's data is still loading." Each game's own planning (reveal-or-die's, bomber-world's) still drops a click in that window silently; reading `SubmissionStore.ready` is theirs to do, as stratagems did.

## Measured

- Check 0 errors and 0 warnings everywhere (stratagems `main` its known 2 warnings); unit: `main` 1983 + 81 (from 1977 + 81), `with/pixi-js` 1996 + 81, `with/nft-identity` 1991 + 81, `with/fuzd` 2025 + 81, `with/indexer` 2011 + 81, `with/all` 2004 + 81, `with/fuzd-pixi-indexer` 2066 + 81 (each + 6), reveal-or-die 2133 + 75, bomber-world 2181 + 75, stratagems `main` 1738 + 75 (each + 3); dangling imports clean, omissions complete.
- e2e: `main` **56/56** (5.6 min); `with/nft-identity` and `with/fuzd-pixi-indexer` the two offline suites (`offline.e2e.ts`, `offline-hotseat.e2e.ts`); stratagems' integration branch **60/60**.
- Environment: a fresh worktree of `with/nft-identity`, `with/all` and `with/fuzd-pixi-indexer` had no `web/src/lib/deployments.ts` after `pnpm install` (31 to 33 check errors and 6 unit failures, all from it); `node scripts/ensure-deployments.mjs` made it, as AGENTS.md says.
