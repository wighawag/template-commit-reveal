---
title: nix/game.nix pnpmDepsHash is stale on with/fuzd and with/fuzd-pixi-indexer after the drand-client packageExtensions fix
type: observation
status: spotted
spotted: 2026-11-05
relates-to: nix/game.nix (pnpmDepsHash), pnpm-workspace.yaml (packageExtensions), pnpm-lock.yaml
---

# The lockfile moved and the hash was deliberately not recomputed

The fix landed on `with/fuzd` (851cf39f) and was cascaded into `with/fuzd-pixi-indexer` (ac321507). It adds a `packageExtensions` entry to `pnpm-workspace.yaml` that gives `drand-client@1` an explicit `@noble/hashes: ^1.4.0` dependency, and it changes `pnpm-lock.yaml` on both branches. Neither branch's `nix/game.nix` `pnpmDepsHash` was recomputed (on `with/fuzd-pixi-indexer` it read `sha256-O3NGJaU/T7kxb9T4ScjgeCThHILdq+7rI4B4Quesdwo=` at the time of writing). The maintainer chose to skip that for now. Recompute on `with/fuzd` first, then cascade: `nix/game.nix` is per-branch, so expect a conflict on the hash line in `with/fuzd-pixi-indexer` and resolve it by recomputing there too.

## Why it matters

`nix build git+file://$PWD#lan` should fail with a hash mismatch until it is recomputed. The worse case is the one `nix/game.nix` already warns about: on a machine that has built a lockfile with the old hash, Nix may trust the store path it has already seen and build quietly with stale dependencies. So do not take a passing LAN build here as evidence that the hash is right.

## How to close it

Set the hash to the fake value, run `nix build git+file://$PWD#lan.pnpmDeps`, copy the real hash from the error into `pnpmDepsHash`, and restore the comment that names the fake hash (commit e5f75a1f is a reminder that the comment has been overwritten this way before). After that this note can be deleted.

## Background: why the lockfile changed

`fuzd` loads `tlock-js`, which loads `drand-client@1.2.5`. That package imports `@noble/hashes/sha256` without declaring `@noble/hashes`, so it used whatever version pnpm hoisted into `node_modules/.pnpm/node_modules`. The `with/indexer` merge (8d4d7633, etherfold's dependencies) brought in `micro-eth-signer@0.19.0`, which needs `@noble/hashes@2.2.0`. Once 2.2.0 was the hoisted copy, `pnpm dev`'s fuzd step crashed with `ERR_PACKAGE_PATH_NOT_EXPORTED` for `./sha256`. The missing dependency arrives with fuzd, so any branch built on `with/fuzd` that ends up hoisting a 2.x `@noble/hashes` would break the same way. That is why the fix's home is `with/fuzd` and not the branch where it broke.
