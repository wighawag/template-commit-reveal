---
title: `pnpm --filter ./contracts typescript` fails on `with/nft-identity`, and nothing had ever run it
type: observation
status: spotted 2026-09-22, not fixed; `main` is fixed
spotted: 2026-09-22
relates-to: contracts/package.json, contracts/test/js/Game.test.ts, contracts/src/game/interfaces/IGame.sol, contracts/src/game/avatar/AvatarRoutes.sol
---

# A script nobody runs is a script that does not work

`contracts`' `typescript` script is `tsc && tsc -p test/js`. The first half builds `dist`; the second type-checks the test project, which is run through tsx and therefore never type-checked by running it.

Nothing ran it. `prepare` was `set-defaults .vscode && pnpm compile`, `verify` is web's `check` plus its units, and the contracts suite executes without checking types. So on `main` it had been failing on two `TS2347`s (a type argument on an untyped call) for as long as anybody can measure, and the only reason it was noticed is that `dist` became a build INPUT for the web workspace when `lib/offline.ts` started importing the deploy scripts - which made somebody run the script that builds it.

**`main` is fixed** (the fixture's environment has a type now, so the explicit type argument is legal) and `prepare` builds `dist` with a bare `tsc` rather than with `pnpm typescript`, deliberately: an install must not be gated on a suite's types.

**`with/nft-identity` still fails it, with 13 errors**, and they are that branch's own rather than inherited. `withdrawAvatar`, `depositAvatar` and their arguments live in `AvatarRoutes.sol`, which the router serves but `IGame` does not compose, so `env.get<Abi_IGame>('Game')` has no such function and every test call to one is a type error. The tests pass: a router maps the selector at run time and tsx never looks.

Two ways out, and the choice is a real one:

- **Compose the avatar interface into `IGame`**, the way `IDelegation` already is. That is the shape the tree has already argued for once: HANDOFF says `IGame` composes the delegation interface "so the router's selector list cannot drift from the implementation", and this is the same claim about the same router. It grows the exported ABI, which the client would then be able to see, and it is a contracts change on a branch whose contracts are its own.
- **Cast at the call sites.** Cheaper, local, and it makes the ABI type a thing tests route around rather than a thing they check.

Not taken here because it is contracts work on a branch this session was cascading through rather than building on, and because the failure is now visible in one command rather than in none.
