---
title: The context's delegation pair is the connection's, so an embedded world registers and reads the browser's key at its own game
slug: the-delegation-pair-is-the-connections
spec: games-on-this-foundation
blockedBy: []
---

# An offline world in a build the e2e harness did not make refused every human move

Found by stratagems' step D specification (its plan, "2026-10-30, step D specified", and its observation `an-offline-commit-is-rejected-in-a-build-the-e2e-harness-did-not-make.md`). A build made by hand (`PUBLIC_WALLET_HOST= pnpm build localhost`, the generated `web/src/lib/deployments.ts` from a throwaway deploy) booted its offline world, said the browser's key was authorised, and the human's first commit reverted at the world's game with `NotDelegate(player, browser key)` (`@etherplay/delegation`'s `requireAccountFor`). The browser key's registration had gone to the BUILD-TIME deployment's game address, one nonce off the world's.

**The cause**: `web/src/lib/context/core.ts` named the delegation pair once, `delegationTarget`, from the app's build-time `deploymentsStore`, and used it for the connect-time permission AND for `createDelegationState` (the chain read, and through `delegation.registry` every writer, `authoriseTheBrowsersKey` included). For the remote world the two coincide; for an embedded world, whose contracts sit wherever its own deploy put them, the read and the registration were at a contract the world's moves are never sent to, and the read, scoped to the same wrong address, agreed with the registration. jolly-roger `integration` never had it (its `createDelegationState` takes `delegationRegistryAddress(deployments.get())`); this repo's merge of the typed delegation registration (85c9be41) unified the three on the build-time store. The e2e never saw it: the harness's build-time deployment is the same deploy sequence as the world's, so the addresses coincide. A published build's are a live chain's, so its offline world would have refused every player.

## Done, 2026-10-30, on local preview branches, NOT pushed (awaiting the maintainer's approval)

On `main` (preview branch `fix/delegation-from-connection` from `origin/main` e4d964ea), test-first, one commit, `f12ab50b`: `buildExecution` no longer takes `delegationTarget`; `createDelegationState` gets `registry: delegationRegistryAddress(deployments.get())` and `chainId: deployments.get().chain.id`, the connection's. The build-time pair stays for the permission declared before the connection exists, and its comment now says it is only that. Test: `web/test/lib/context/world-connection.test.ts`, "reads and writes delegation at the world's contract, on the world's chain" (a factory returning the remote connection with deployments whose registry is elsewhere and whose chain id is another): red on `origin/main` (the build's address), green after.

| node (preview branch, head) | verify (check; unit server + client) | e2e |
|---|---|---|
| `main` (`fix/delegation-from-connection` f12ab50b) | 0/0; 1904 + 78 | **54/54** (4.2 min) |
| `with/pixi-js` (`dlg/with/pixi-js` 9d47aa8b) | 0/0; 1913 + 78 | |
| `with/nft-identity` (`dlg/with/nft-identity` 852f3e54) | 0/0; 1912 + 78 | |
| `with/fuzd` (`dlg/with/fuzd` 3c24c5fc) | 0/0; 1945 + 78 | **61/61** (8.5 min) |
| `with/all` (`dlg/with/all` 5fd3b3f0) | 0/0; 1921 + 78 | |
| reveal-or-die `main` (`dlg/main` ba1093c9) | 0/0; 2060 + 72 | |
| bomber-world `main` (`dlg/main` 9dc099d6) | 0/0; 2108 + 72 | |
| stratagems `main` (`dlg/main`) | 0 errors 2 warnings (its legacy two); 1633 + 72 | its integration branch: 54/54, and its offline suite **3/3 against a hand build whose deployment differs from the world's** (0/1 before) |

Every merge clean and a diff of the two files alone; `check-dangling-imports` clean in every node. e2e on `E2E_RPC_PORT=8555 E2E_PORT=4183`, gateways on 4573 and 4574.

## Not done here

- Nothing pushed: the maintainer approves each push.
- reveal-or-die's and bomber-world's offline suites were not run against a hand build (the same file, the same fix; stratagems' run is the measurement).
- Three components still read the build-time store for the native currency's SYMBOL only (`TopUpModal.svelte`, `InsufficientFundsModal.svelte`, `core/ui/faucet`): cosmetic in a world, left.
