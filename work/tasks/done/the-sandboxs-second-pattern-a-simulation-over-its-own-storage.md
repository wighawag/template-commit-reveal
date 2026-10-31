---
title: The sandbox's second pattern, a storage-heavy game's unchanged resolution over storage of its own
slug: the-sandboxs-second-pattern-a-simulation-over-its-own-storage
spec: games-on-this-foundation
blockedBy: [a-bytecode-sandbox-and-the-reference-games-simulation-route]
---

# A storage-heavy game previews with its unchanged resolution, run over storage the simulation seeds itself

Decided in stratagems (its plan `work/plans/join-template-commit-reveal.md` on its `join-template-commit-reveal` branch, PX3 of step X, "Decided again" on 2026-10-31), after the pure-core shape the sandbox's README taught measured +19.4% gas on stratagems' 32-move chunk (7,183,405 against 6,013,873), with every contract test passing. The user chose to keep the reveal's code as it is and to document both patterns side by side.

## What was missing

- **The README taught one shape**, load, a pure core and apply, and said a function that reads storage cannot run in the sandbox. That is true of storage the call did not write; a simulation contract that seeds its own storage from its arguments and runs the game's unchanged resolution over it runs fine in an `eth_call`, and is the right shape when the resolution is storage-heavy (memory is priced quadratically and never freed in a transaction; storage once touched is a cheap map).
- **`createBytecodeSandbox`'s `call` was typed for `pure` and `view` functions only**, so a simulation contract's functions (which write, and so are `nonpayable`) could not be called without a cast, though the sandbox ran them already.

## Done, 2026-10-31, on local preview branches `px2/*`, NOT pushed

- **`main`**: `web/src/lib/game/simulation/README.md` gains "The second pattern" (seed, run the unchanged resolution, return the touched cells and what left it, recorded through `internal virtual` hooks the simulation overrides; and the proxy trap: never a route behind the game's proxy, whose storage it would overwrite), and its first paragraph names both ways; `sandbox.ts`'s `call` takes `pure`, `view` and `nonpayable` functions (`Runnable`), its header saying why; a unit case runs a toy that seeds and reads its own storage and shows nothing outlives the call (`test/fixtures/simulation/ToySimulation.sol`, compiled on its own so `Toy`'s committed bytes keep their metadata hash; solc 0.8.28, `--optimize --evm-version london`, as `toy.ts` already said).
- **Cascaded**, every merge clean: `with/pixi-js`, `with/nft-identity`, `with/fuzd`, `with/all`, `with/fuzd-pixi`; reveal-or-die `main`, bomber-world `main`, stratagems `main`. `check-dangling-imports` clean in each descendant.

**Measured** (check 0 errors and 0 warnings on every template node, unit + 78 each): `main` 1930 (from 1929), `with/pixi-js` 1943, `with/nft-identity` 1938, `with/fuzd` 1971, `with/all` 1951, `with/fuzd-pixi` 1984; reveal-or-die 2085 + 72, bomber-world 2133 + 72, stratagems `main` 1663 + 72 (its check 0 errors and its known 2 warnings).

The stratagems side (its `StratagemsSimulation`, the hooks, the randomized test holding the simulation to the reveal) is that repository's own, and the README cites it as a descendant's paths.
