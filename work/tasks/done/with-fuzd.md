---
title: with/fuzd, the reveal sent by fuzd so it happens without the player's tab
slug: with-fuzd
spec: games-on-this-foundation
blockedBy: []
---

# Step 8 item 5: the `with/fuzd` layer

Specified in stratagems' plan (`step-8` branch, `work/plans/join-template-commit-reveal.md`, "Step 8": P1 to P12, the Do list's item 5), on item 4's seam (`the-submission-in-the-account-data.md`), jolly-roger's account data (`work:work/tasks/done/account-data-on-synqable-0.2.md`) and fuzd 0.12 (fuzd `main`, `work/tasks/done/batch-schedule-and-flag-cli.md`). Under jolly-roger's service-layer rules R1 to R4 (`work:work/specs/proposed/service-layers.md`). It is jolly-roger's Wave 4 and this repo's Phase 5 layer; the 24-hour proof of Phase 5 is not this task (P11).

## Done, 2026-10-30, pushed with the maintainer's approval

A new branch `with/fuzd` from `main` 099666f5 (locally `s8/with/fuzd`, worktree `~/dev/worktrees/template-commit-reveal/s8/with/fuzd`), test-first, one commit per item:

1. `31755083` `$lib/fuzd`, the scheduler module, on `@fuzd/client` ^0.12.0. `createFuzdScheduler<TIdentity>(params): FuzdScheduler<TIdentity>` implements `RevealScheduler<TIdentity, FuzdExtensions>`. `prepare` assigns the player's remote account (signed with the browser key) and returns `{payee: remoteAccount, value}`, the value being `computeBalanceRequired` (the batch's `computeTotalMaxCost` at the chain's `expectedWorstGasPrice`, each transaction at the deployment's reveal gas, plus fuzd's reservations for the account's other slots) less the remote account's balance, never negative (`paymentFor`). `submit` schedules the whole reveal as ONE batch, `fixed-time` at `revealDueAt` with the reveal phase as `expiryDelta`, slot `cycle_<n>`, a `paymentReserve` of the batch's cost, in clear on 31337 and timelocked to drand elsewhere, and returns `{fuzd: FuzdSchedule}`. Each half is bounded (5 s, 15 s). `fuzdSettings` decides whether to schedule at all (R2: no `PUBLIC_FUZD_URI`, an embedded chain, or no `expectedWorstGasPrice` means no); `revealModeFor` gives P7's mode. `readFuzdStatus` / `createFuzdStatus` read fuzd's two routes in the reveal phase (`scheduled`, `broadcast` n of m, `confirmed`, `failed`, `unreachable`); `scheduledTurn`, `createScheduledReveal` and `revealOnScheduleFailure` are the composition's helpers. 35 unit tests, the client stubbed, and the timelocked payload decrypted back to the batch with an offline drand (fuzd's own fake, copied).
2. `a6447e7b` The composition (`placement/context.ts` and `web/.env` only, no framework file, R1): the scheduler when configured, `autoReveal: 'fallback'` at 0.5 with it and `'immediately'` without; `PlacementGame.extensions = FuzdExtensions`, so the storage and the submission are typed with it and nothing is cast; `game.revealSchedule`; a failure reported by fuzd makes the browser reveal at once.
3. `e22b17e0` The HUD: `describeRevealSchedule` in `hud.ts` (scheduled, then fuzd's status in the reveal phase, or not scheduled), one logic-less line in `GameHud.svelte` (`data-testid="reveal-schedule"`, `data-step`). Its tests in a new file, so the template's HUD suite is untouched.
4. `4c214a61` `helper-services/fuzd` (a workspace package on the `fuzd` 0.12 CLI, flags only: port 34002, `--chain 31337=<rpc>#finality=1&worstCaseBlockTime=2`, the local test mnemonic, no time-lock decryption, a 1 s process interval; `FUZD_PORT`, `FUZD_CHAIN_RPC`, `FUZD_MNEMONIC` move them), `pnpm fuzd:dev`, its zellij pane, `PUBLIC_FUZD_URI="//:34002"` in `web/.env.localhost`. The e2e harness picks a free port for fuzd (refusing 8545 and 8546), builds the app against it, starts fuzd in a playwright setup project that runs AFTER every other suite and stops it in its teardown, with `run-e2e-tests.sh` killing the recorded process group as a backstop.
5. `644347e3` on `main` (`s8/main`), then `dbd0497b` merging it here: the commit gas budget, see below.
6. `a7c0e92c` The e2e (`e2e/tests/fuzd.e2e.ts`, project `fuzd`, serial, burner account 7, the eighth address added): see "Measured".

Then, from the maintainer's review of the decisions (same day):

7. `36fdf6a6` on `main`, merged here as `f6412072`: the gas budget's comment says the figures are the gas limits (it said they were not).
8. `cb27dcb8` The payment is exactly what the reveal requires: the batch's `computeTotalMaxCost` less the remote account's balance beyond fuzd's reservations for its other slots, never negative and NEVER MORE than the batch (it used to top up an over-reserved account for its other schedules). The slot is `cycle_<n>_<game contract>`: fuzd keys a slot by chain and signing key already, and the signing key is the browser key, which plays one identity, so what could still collide is one key playing two games on one chain in one cycle.
9. `b0f31ade` The e2e in three stages: `chromium` (every suite of `main`, fuzd configured and not running, R2), `fuzd` (the fuzd suite AND the template's game suite again with fuzd live, less the multi-chunk-progress and missed-reveal suites whose claim is the browser's own reveal), `fuzd-fallback` (fuzd frozen, its own file, burner account 8, the ninth address).

And on `offshoot` (local, `d9fa9b14`): `with/fuzd` stems from `main`.

## Found, and fixed on `main` first: the commit gas budget did not cover a paid commit

The first e2e run failed every first scheduled commit with "Transaction failed": `makeCommitment` carrying the scheduler's payment to a remote account that holds nothing (the value transfer, the cold account, creating it) costs **152,154** gas, against the `commitGas` of 150,000 that the adapter passes as the gas LIMIT. Item 4 gave the commit a payee and a value without measuring the budget with them. Fixed on `main` (`644347e3`, with the maintainer's approval to do it there first): `GasBudget.test.ts` measures the paid first commit (red at 150,000), `COMMIT_GAS` is 175,000 (the paid case plus 15%). `main` verified: contracts 57 passing, check 0/0, unit 1883 + 78, e2e 54 of 54 (4.7 min). Not yet cascaded to `with/pixi-js`, `with/nft-identity`, `with/all` or the games: see the finding `the-commit-budget-was-measured-without-a-payee.md`.

## Measured

Before building (fuzd 0.12 on npm, the plan's open questions):

- The `fuzd` CLI 0.12.0 installs and runs under Node 24.19 and pnpm 10.28 (libsql's prebuilt binary, no install script), on `:memory:`, against anvil on a free port; `GET /` answers `fuzd api : 0.12.1`.
- Payment agreement: the client's `computeBalanceRequired` matches the server's `/reserved` route, which counts the `paymentReserve` of the account's OTHER unfinalised schedules (the same slot excluded) and releases a reservation once its schedule is finalised. A schedule without a `paymentReserve` reserves nothing, so the scheduler always sends one.
- fuzd keys a schedule by the SIGNING account (`ScheduleInfo.account`, the browser key), not by the remote account: both status routes take it.
- A batch of 3 is broadcast from the remote account with consecutive nonces, in one block, in order.
- A schedule into a slot still queued REPLACES it (only the second batch was broadcast). A schedule into a slot already broadcast is accepted (`success: true`) and never sent, while the routes report it broadcast and finalised: see the observation `fuzd-accepts-a-schedule-into-a-spent-slot-and-never-sends-it.md`.
- Cancelling: no route of `@fuzd/server` 0.12.1 cancels a schedule (`deleteExecution` exists in the storage interface only). Cancelling stays an idea (P11).

The layer, on `with/fuzd` at `b0f31ade`: check **0 errors and 0 warnings**; unit **1924 + 78** (main's 1883 + 78, plus 41); e2e **61 of 61** in 9.0 min (`E2E_RPC_PORT=8555 E2E_PORT=4183`): main's 54, unchanged, running against a configured and absent fuzd (R2); the setup and teardown; the template's game suite's plain submission and recovered-submission tests again with fuzd LIVE (both pass: fuzd pays and reveals, the browser falls back); and the three fuzd cases:

- the reference game commits one placement, the page is closed before the reveal phase, and a new page after the cycle has turned finds the turn `Revealed` (missed-reveal `Clear`), the cell on the board, and the reveal sent by the player's remote account (as fuzd's remote-account route names it);
- the same with a turn of 5 placements (2 chunks): one batch, consecutive nonces from the remote account, each chunk opening the head the previous one left, matching fuzd's batch indices 0 and 1;
- with fuzd frozen (SIGSTOP) after scheduling, the HUD says unreachable and the open browser reveals at half the reveal phase (at least 5 s in) from its own key.

The timelocked path against the real drand network (P6), by hand: a local anvil chain, the `fuzd` 0.12 CLI with `--time-lock-decryption true`, `@fuzd/client` 0.12.0 on `mainnetClient()` (quicknet) with the scheduler's exact shape (a batch of 2, `fixed-time` 20 s ahead, `inClear: false`, a `paymentReserve`). fuzd held it `time-locked` (no clear executions readable), received the beacon for round 33512680 and broadcast both transactions from the remote account, nonces 0 and 1, in order, 22 s after scheduling, mined at chain time 3 s after `revealDueAt`.

Nothing left running: every chain, fuzd, preview server and e2e worktree stopped by its process group or removed.

## Not done here, and why

- `with/fuzd` is not cascaded into any game: stratagems takes it in its own step (item 6); reveal-or-die and bomber-world stem from `with/all`.
- The commit-gas fix WAS cascaded (the maintainer's approval), see the finding: `with/pixi-js` (clean), `with/nft-identity` (its own budget re-measured: a paid first commit 134,358 against its 125,000, now 155,000; its `GasBudget.test.ts` case adapted to its avatar fixtures), `with/all` (both, taking `with/nft-identity`'s contracts), each check 0/0, unit green (1892, 1891, 1900 + 78; the wallet-connector flake on some runs, see its observation), contracts 59 passing on the nft ones, e2e 54 of 54 each. reveal-or-die, bomber-world and stratagems `main` merged with no tree change (their contracts and gas budgets are their own, and `GasBudget.test.ts` is in their omissions): a game that adopts a scheduler measures its own paid first commit.
- fuzd accepting a schedule into a spent slot: a task on fuzd (`work/tasks/backlog/reject-a-schedule-into-a-spent-slot.md`, branch `task/reject-schedule-into-spent-slot`), the maintainer's decision being to reject it.
- The hosted service and a 24-hour deployment (P11, step D).
- `dev/zellij-remote-chain.kdl` has no fuzd pane: against a remote chain the service is the hosted one, which is step D's.

## Decisions

- **fuzd runs only from the `fuzd` stage on**, after every other suite. `main`'s suites run first with `PUBLIC_FUZD_URI` set and nothing on the port, which is the layer's absence (R2); the template's game suite then runs AGAIN with fuzd live, less the two suites whose claim is the browser's own reveal (with fuzd up, its reveal beats the missed-reveal suite's lapse and the multi-chunk suite's own progress). `E2E_FUZD_ONLY=1 pnpm test:e2e --project fuzd --project fuzd-fallback` runs the fuzd stages alone.
- **Unreachable is not failed.** Only a failure fuzd reports (a reverted, replaced or voided transaction, or a schedule fuzd no longer holds) makes the browser reveal at once; a fuzd that cannot be asked leaves it at its fallback point, because fuzd may be sending the reveal at that moment.
- **Each half of the scheduler is bounded** (prepare 5 s, submit 15 s): a hung fuzd must not hold a commit past its phase. A `submit` that times out after fuzd stored the schedule gives a turn recorded unscheduled that fuzd also reveals: the browser reveals at once and one of the two reverts.
- **The payment is exactly what this reveal requires** (the maintainer, replacing an uncapped top-up): the batch's cost less the free balance, never more than the batch.
- **`PUBLIC_FUZD_URI` is read from `$env/dynamic/public`**: jolly-roger's `fatal.test.ts` mocks `$env/static/public` with a fixed list of names, and an unset variable must be the layer's absence, not a build error.
- **The local fuzd uses the local chain's test mnemonic** and talks to the dev chain on 8545 (the template's own dev layout); its own port is 34002.
- **The slot is `cycle_<n>_<game contract>`**, not P8 c's `cycle_<n>`: see item 8.
- **`FuzdSchedule` carries more than P8 c listed** (`remoteAccount`, `cycleNumber`, `revealDueAt`, `expiryDelta`, `inClear`): what the reader and the HUD need without asking fuzd. It is a reader's key, never a secret.
- **The reference game's storage is built in the composition root** (`createAccountDataSubmissionStorage` with `PLACEMENT_STORAGE`) rather than by changing `placement/storage.ts`, to keep the layer's diff to the composition root and its own files.
