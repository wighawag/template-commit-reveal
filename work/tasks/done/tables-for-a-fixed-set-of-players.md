---
title: Tables, games for a fixed set of players created by anyone, each a clone at an address of its own
slug: tables-for-a-fixed-set-of-players
spec: games-on-this-foundation
blockedBy: [with-indexer-the-framework-hosts-a-games-processor]
---

# A game for a fixed set of players: created by anyone, joined by link, started by its creator

Decided in stratagems (its plan `work/plans/join-template-commit-reveal.md` on its `join-template-commit-reveal` branch, PL1 to PL8 of step L, decided with the maintainer on 2026-10-31, PL4 revised the same day to early advance), built as its step L1. It is the closed roster and the forfeit this spec's Phase 6 left for the contract side (D4's membership axis, D5's forfeit), and a lobby online beside the offline world's.

## What was missing

- **The base had no roster.** Who a cycle waits for was a count, and funding a reserve joined it at any time. There was no creator, no seats, no start and no forfeit by a third party.
- **A game was a deployment.** Every client piece is keyed by the game contract's address (the submission, the delegation, fuzd's slot, the indexer's database), so a game at an address of its own needed nothing new of them, but nothing could make one cheaply: a full deployment of the reference game is millions of gas.
- **`$lib/indexer`'s stamp refused the hybrid policy** (`TimedWithEarlyAdvance`), which is the one a fixed set wants: the reveal phase opens the moment everyone has committed, the next cycle the moment everyone has revealed, and the clock moves a table on when somebody vanishes.

## Done, 2026-11-01, on local preview branches `pl1/*`, NOT pushed

**`main`** (from `origin/main` 4d56cbe5):

- `597dc0f0` the base: a closed roster, OPT-IN by initialisation (`_openRoster(creator, seats)`), so storage that never had one (the persistent world) has open entry exactly as before. A seat is taken by funding a reserve (`_takeSeat`, which a custody game calls where it takes custody) while the game has not started and a seat is free; the creator (or a delegate of theirs) starts it once two are seated, which closes the roster and re-anchors the clock at the press (`CycleAdvanced(n, true, creator)`), so the first cycle runs its full length; a commitment before the start is refused (`NotInGame`, nobody is waited for yet); the creator may forfeit a member who has not committed in the current commit phase (D5: stop waiting, settle nothing). `CommitRevealRoster.test.ts` on a stub game (12 cases).
- `4245e685` `CommitRevealGameFactory` (EIP-1167 clones of a lobby implementation, `createGame(seats)` initialising the clone in the same transaction, `GameCreated`), the reference game's lobby route (since `cbaef472` the base's) and `030_deploy_lobby.ts` (the lobby implementation, `TimedWithEarlyAdvance`, 45 s to commit and 15 s to reveal, and the factory); `Lobby.test.ts` plays a three-seat table from creation to a forfeit, one cycle advanced early and one by the clock, and holds a table's commit and worst reveal under the declared gas.
- `fc74b389` `StakeSale.purchaseAt(game, ...)`: a stake at a table, which the sale's immutable `GAME` could not name.
- `899dd2f1` the skeleton's `cycle.auto`: a game says when its browser pushes the cycle; the reference game says `eagerly`, inert under the world's Timed policy.
- `88dee31b`, `0eefde64` the client: `$lib/game/lobby/table.ts` (the factory's tables, creating one from the account, a table's roster and the creator's two transactions), the lobby route (`/lobby/`), `TablePanel.svelte` over the board, a table's context composed on its address (`?game=<address>`, a `params` key so every link keeps it; `createContext` connects with the world's records made the table's by the game's `TableLobby`), the seat model's third occupant `remote-human`, keyed by the game's identity rather than the account so a game that plays as a token seats and forfeits too. A game with no `lobby` export has no tables and its menu offers none.
- `43e5f54d`, `e61b4fc8`, `62456a42` `table.e2e.ts`: two browsers, a table created from the lobby, joined by its link, started, a cycle advanced early (both committed and revealed), one advanced by the clock (the guest closed their browser), and the vanished member forfeited. The shared `stake` fixture now waits for whichever stake control the board renders instead of asking which is visible first, which raced a page that had only just loaded. `connectPageAs` connects a second browser. The creator claims account nine (`with/fuzd` claims seven and eight, and the burner offers ten); the guest's account is not a claim, because a new browser context's burner generates a mnemonic of its own.
- `c69c05b9` the reference game's table record is tested with the reference game (`test/lib/placement/table.test.ts`), so a game that deletes `placement` keeps the framework's suite.
- `7def44df` (asked for by the maintainer after the first build) A TABLE'S LOBBY SCREEN until its start, `TableLobby.svelte` over the board: who created it, its seats, its commit and reveal times and whether a phase ends early, who is seated, one line saying what this person waits for or can do (`tableScreenOf`), the game's own take-a-seat control while a seat is free (a snippet: what it sells is the game's), the invite link and the creator's start; after the start the board, with `TablePanel.svelte` (who plays, the creator's forfeit), and to anyone not seated a closed door. AND NO TURN BEFORE THE START: the skeleton's `readyToPlay` holds the board until the table has started, and then only for a member (`tableAllowsPlay`), since the contract refuses every commitment before it and a non-member's after.
- `cbaef472` SHARED, so a game writes less (asked for by the maintainer): the lobby route is the base's, `contracts/src/commit-reveal/CommitRevealLobby.sol`, inheriting nothing but `UsingCommitReveal` (whose storage is namespaced, so it shares a router with any game's routes; a game that overrides `_cycle` cannot use it as it stands), and the reference game's `GameLobby` route is gone; and the skeleton owns a table's store (`game.table`), creating, polling and gating it for every game at a table, so a game's part on the client is its `lobby` export, rendering the two screens, and how a seat is paid for.
- `CONTEXT.md`: **Table**.

**`with/indexer`**: `3d3c5271` the hybrid stamp: a processor folds the last re-anchoring `CycleAdvanced` (`commiting` true) with its block's timestamp (`CycleAnchor`), and the stamp is the anchor's cycle plus the whole cycles elapsed since, by the block's timestamp (the deployment's start before any anchor, as Timed); an early reveal moves no cycle number and is not folded. The reference game's processor and queries fold the anchor.

**`with/nft-identity`**: `6de6ee93` a seat is custody of an avatar (`_takeSeat` where custody is taken, `_leaveSeat` where it ends), `GameAvatarSale.purchaseAt`, the lobby implementation on the avatar routes with a placement cost of zero, and `Lobby.test.ts` played with avatars bought at the table.

**Cascaded** to `with/pixi-js`, `with/fuzd` (the placement context's fuzd fallback and the table's polling stop together), `with/all`, `with/fuzd-pixi-indexer`; reveal-or-die (`.offshoot-omissions` gains the reference game's three table files: its lobby deploy, its contracts suite and its e2e; its `rocketh/config.ts` keeps no `Lobby` data, two renames git detected from `placement/` into `world/` undone, its offline world skips a remote human's seat), bomber-world, and stratagems `main` (the reference game's lobby deploy omitted).

## Measured

| node (preview branch, head) | verify (check; unit server + client) | contracts | e2e |
|---|---|---|---|
| `main` (`pl1/main` cbaef472) | 0/0; 1945 + 78 (was 1930) | 78 passing | **55/55** (5.4 min) |
| `with/pixi-js` (20fca85e) | 0/0; 1958 + 78 | | |
| `with/nft-identity` (b450c36c) | 0/0; 1953 + 78 | 80 passing | `table.e2e.ts` 1/1 (1.7 min), seats taken with avatars |
| `with/fuzd` (d2c2ee15) | 0/0; 1986 + 78 | | |
| `with/indexer` (2eb622d0) | 0/0; 1973 + 78 (was 1956) | | |
| `with/all` (a632d255) | 0/0; 1966 + 78 | 80 passing | |
| `with/fuzd-pixi-indexer` (69c5028f) | 0/0; 2027 + 78 (was 2010) | 78 passing | **62/62** (9.5 min, fuzd started and stopped by the harness), `table.e2e.ts` among them |
| reveal-or-die `main` (`pl1/main` 0254a02e) | 0/0; 2099 + 72 | | |
| bomber-world `main` (`pl1/main` 4b881bd3) | 0/0; 2147 + 72 | | |
| stratagems `main` (`pl1/main` 504a1acd) | 0 errors, its 2 known warnings; 1703 + 72 (was 1687) | | |

`check-dangling-imports` is clean everywhere but for the generated `$lib/manifest.json`; `check-omissions` covers every path in reveal-or-die and stratagems. e2e on `E2E_RPC_PORT=8547`, the app on 4173, gateways 4273 and 4274, each checked free, nothing left after.

**Found on the way**: the e2e's per-file account claims (`e2e-account-claims.test.ts`) guard a race that the burner no longer has. Since the app signs in, a suite plays as one of the burner's own generated accounts, and every browser context generates its own mnemonic, so two files at the same index are two different accounts. The guard is harmless, and it caps the suite at ten files that send.

## What it deliberately does not do

- Per-table durations, invite secrets, spectators, rematches and NPC seats online (PL8); `clones-with-immutable-args` (PL2).
