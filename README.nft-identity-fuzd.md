# `with/nft-identity-fuzd`

`with/nft-identity` and `with/fuzd`, merged: the node for a game whose player is a token AND whose reveal is sent by fuzd, the reveal scheduler. Voxlings stems from it. It exists because offshoot-fanout follows exactly one stem branch, so a game needing both axes needs a node that has both, rather than a one-off merge that later fuzd changes would never reach.

```
template-commit-reveal@main
├─ with/pixi-js
├─ with/nft-identity
├─ with/fuzd
├─ with/indexer
├─ with/all                [with/pixi-js, with/nft-identity]          reveal-or-die, bomber-world
├─ with/fuzd-pixi-indexer  [with/fuzd, with/pixi-js, with/indexer]    stratagems
└─ with/nft-identity-fuzd  [with/nft-identity, with/fuzd]             ← here; Voxlings stems from it
```

**Token identity comes from `with/nft-identity`, the reveal scheduler from `with/fuzd`.** The two axes are disjoint at file granularity, and fuzd is generic over the identity (`createFuzdScheduler<TIdentity>`, `scheduledTurn<TIdentity, TAction>`): the reveal it schedules is the adapter's own transaction, which already names the avatar id, and `reveal` is permissionless once the chain of hashes matches, so fuzd's remote account can send it for a token as well as for an account. The signing key fuzd derives its remote account from is the browser key, the one that commits, not the account that owns the avatar.

## Conflicts

**The merge had no textual conflict.** `web/src/lib/placement/context.ts`, the one file both parents edit, merged cleanly: `with/nft-identity` changes how the provider looks up who plays, `with/fuzd` adds the scheduler beside it.

**Two semantic conflicts, both in the fuzd e2e suites, and they are this node's only lines of its own.** Both were found by running the fuzd suite here, not by the merge:

- **What a reveal adds to the board.** `web/e2e/tests/fuzd.e2e.ts` asserted that every cell of a fuzd-revealed turn gained `placementCost` of stake. On `with/nft-identity` a placement costs nothing (custody of the avatar is the stake) and `stakeOnCell` in `web/e2e/fixtures/game.ts` counts CLAIMS instead, so the inherited line asserted `+ 0` against a count that moved by one. It now asserts one new claimant per cell, exactly as `with/nft-identity`'s `game.e2e.ts` does for the browser's own reveal. See `README.nft-identity.md`, "The e2e, where the board is different".
- **When the identity exists.** `fuzd.e2e.ts` and `web/e2e/tests/fuzd-fallback.e2e.ts` read `appFacts` (who plays) BEFORE `commitAScheduledTurn`. An account is known from the start; an avatar exists only once `stake()` has minted it, so the identity read was `undefined` and `turnOnChain` threw. Both now read it after the commit. This one is identity-agnostic (it holds on `with/fuzd` too), so it is a candidate to move up into `with/fuzd`, after which it leaves this list.

Everything else follows a parent unchanged:

| file | taken from | why |
| --- | --- | --- |
| `web/src/lib/placement/context.ts` | both, merged | identity lookup from one, scheduler from the other |
| `web/e2e/fixtures/fuzd-game.ts` | `with/fuzd` | it polls `reserve !== '0'`, which `with/nft-identity`'s `reserve.ts` reports as `1` once an avatar is in custody |
| `.offshoot-omissions` | `with/fuzd` | the faucet suite stays omitted for its account budget |
| `pnpm-lock.yaml`, `web/package.json`, `package.json` | `with/fuzd` | `with/nft-identity` adds no dependency; `lan.pnpmDepsHash` recomputed and equal to `with/fuzd`'s |

## Cascade ritual

`main` into `with/nft-identity` and `with/fuzd` first, then both into this node, in either order. A conflict here should be the lockfile (take either side, run `pnpm install`, recompute `lan.pnpmDepsHash`) or the fuzd e2e lines above. Then:

```sh
pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit
pnpm contracts:test && node scripts/check-dangling-imports.mjs
nix build git+file://$PWD#lan
```

The fuzd suite, which is what proves a commit is scheduled in clear on the local chain and revealed with the page closed, is not in `verify`. Run it by hand on a port slot of its own:

```sh
cd web && CI=1 E2E_FUZD_ONLY=1 E2E_RPC_PORT=8745 E2E_PORT=4573 \
  E2E_GATEWAY_PLAIN_PORT=4673 E2E_GATEWAY_SW_PORT=4674 \
  pnpm test:e2e --project fuzd --project fuzd-fallback
```
