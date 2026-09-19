---
title: An embedded chain is a world, the reference game plays a round against one in the tab, and the chrome says which world it is describing
slug: the-embedded-chain-world
spec: games-on-this-foundation
blockedBy: []
---

# Phase 4's second half, with the upstream shape already decided

## Start here, from a cold context

```sh
cat CONTEXT.md
cat AGENTS.md
git show work:HANDOFF.md
git show work:work/specs/proposed/games-on-this-foundation.md    # Phase 4 in full, including the 2026-09-18 sections
git show work:work/notes/findings/an-embedded-world-has-two-persistences-and-only-one-is-keyed-to-the-chain.md
git show work:work/notes/findings/a-manual-cycle-gives-a-log-reading-game-a-one-block-window.md
git -C ../jolly-roger show variant/offline:docs/worlds-and-identities.md   # the design doc, UNTIL IT MOVES (see below)
```

## What is already done

`createContext` takes its connection as a parameter: `createContext({establishConnection})`, defaulting to `establishRemoteConnection`, typed `ConnectionFactory` in `web/src/lib/context/core.ts`, with `EstablishedConnection` as the list a world supplies, `deployments` included. Landed upstream and cascaded to nine nodes 2026-09-18. `web/test/lib/context/world-connection.test.ts` pins that core does not reach for the remote one behind the parameter's back, and **that test is the parameter's only caller.** This task's world is the caller it is waiting for, and the honest measure of the task is that the test stops being alone.

## Acceptance, which is the plan's

The reference game plays a full round against a chain in the tab, AND the chrome names the world it is describing rather than the one it assumed. Both. Expect the second to be the harder half, because the chrome lives in `+layout.svelte`, outside every route subtree.

## Settled with the owner, 2026-09-18, so do not reopen

- **`with/embedded-chain`**, off jolly-roger `main`, sibling to `with/local-signer`. Named for the capability, not the library: the plan said `with/webevm` and the library has already been renamed once under us.
- **It needs no local signer.** `initBurnerWallet` is on `main`, and Decision 1's tree has said "stem main, no signer needed" on that row all along. Deeper reason: the signer's value is recoverability, and in an embedded world the chain and the key die together, so there is nothing to recover to. A burner is the right shape.
- **`integration`**, a bare name, is the integration node, `stem: [with/local-signer, with/embedded-chain]`, and template-commit-reveal re-points its `stemBranch` to it. Forced by the tool rather than chosen: `stemBranch` must be a single string and cannot be combined with `stem`, so a descendant cannot integrate two parent branches itself.
- **`with/hosted-account` is OUT of `integration`**, because it needs a hosted service and would tax every game with a `dev-wallet-host` devDependency and a 293-line e2e suite it deletes. It can join when a game wants it. Put the membership RULE in that branch's README in one line; the name deliberately does not carry it.
- **A new route, not a converted demo**, and therefore **the mechanism lives in `lib/` with the route as only its demo.** This repo deletes inherited demo routes (`d34ad44b`, and HANDOFF's recurring `modify/delete`), so anything world-building inside the route is thrown away here.
- **`embedded-chain` is the mechanism's word, `offline` is the player's.** That is CONTEXT.md's own mechanism-versus-experience rule, so it wants a glossary line rather than a debate.
- **`variant/offline` is deleted LAST, after its one unique file moves.** One commit ahead of `main`; only `docs/worlds-and-identities.md` is unique to it. Move it (jolly-roger `work:docs/`, or the new branch's README) and update every pointer, including the one at the top of this file.
- **Mining is `{type: 'auto'}` with NO interval**; one chain, not a chain per save; a distinct **chainId minted per world** so no persisted key changes. Reasoning for all three is in the plan's Phase 4 section. Persisted keys are free to change anywhere in this tree: nothing has users, owner-confirmed.

## Decide by PROBING, and report the probe

1. **Deferred provider, keeping `createContext` synchronous.** `createNode` is async; ADR-0002 and `web/test/lib/context/ssr-context.test.ts` require a synchronous, SSR-inert, timer-free context, and `+layout.svelte` prerenders through it. The worlds doc's escape is a provider whose requests queue until the node exists. RE-PROBE it: that fact predates `@etherplay/connect` 0.13, where the field moved from `endpoint` to `provider`. Decide this first; making the context async ripples into every caller.
2. **Run the real deploy scripts or bake a state dump.** `@rocketh/web` runs rocketh scripts in a browser and this repo's `contracts/package.json` already exports `./deploy/*` and `./artifacts/*` from `dist`; probe that those are browser-importable. Prefer running them: a baked dump is a generated gitignored artifact that must be rebuilt after every contract change, which is the hazard that fired three times in one session, and it goes stale silently.
3. **The world's lifetime: route-scoped or app-scoped**, which depends on what boot plus deploy actually costs.
4. **The waited-for set, and who calls `advance`,** under manual with one player. Contract configuration, not client code, and the likeliest reason a full round does not complete.
5. **Which values the in-tab deploy declares** for `cyclePolicy`, `actionsPerReveal`, `commitGas`, `revealGas`, `expectedActionsPerTurn`.
6. **Provisioning as a SEAM.** The offline player needs gas, the ERC20 stake, and on `with/nft-identity` and reveal-or-die an identity token they must own. Written per branch it lands in the ALLOWED divergence tables forever and is maintained on four nodes. Make it a game-supplied hook.

## The risk to measure before believing the deploy works

`commitGas` and `revealGas` are passed as real gas LIMITS (ADR-0003) and were measured against HARDHAT. webevm is a different EVM (`@ethereumjs/vm`, with `revm-wasm` present). A declared limit that is too low REVERTS rather than degrading. Measure a commit and a full fresh chunk on webevm with `~/dev/worktrees/.tcr-tools/GasMeasure.test.ts` (copy in, read stdout, delete), and if they differ say by how much and whether the declaration becomes per-world.

## Two constraints that fail late and quietly

- **`web/src/routes/play/+page.svelte` must stay byte-identical across all four branches.** It is on no ALLOWED list, the divergence check covers `.svelte`, and the pixi branch's affordability rests on it. An offline entry point must not be added to it per branch.
- **`web/e2e/**` is type-checked by nothing**, and `verify` is `check` plus `test:unit` with no e2e. A new suite needing its own burner account must be added to `web/e2e/impersonate-addresses.json` and respect `web/test/e2e-account-claims.test.ts`.

## Not yours, but you will be first to hit it

You are the first to run the manual cycle policy in anger, and `onchain/state.ts` sizes its block range as `floor(4 * cycleDuration / averageBlockTime)`, which is ZERO under manual. The reference game reads the board from storage and ignores `fromBlock`, so it cannot see it; it lands on a log-reading game, which is conquest. See the finding. Do not fix it here. If it DOES bite the reference game, the finding is wrong and it changes in the same commit as whatever proved it.

## Also part of this task, because an integration branch with no check is what the check exists to catch

jolly-roger gains two verification nodes (`with/embedded-chain`, `integration`) and its divergence ritual has to be written: `tooling` defaults to `FEATURES="with/local-signer with/hosted-account"`, and with two more branches it needs per-branch `ALLOWED` lists plus the empty runs, in the shape of this repo's three branch READMEs. The re-point has a worked example in the plan, under "What the re-point actually cost, against what was predicted".

## A good split line if this is too big for one pass

The mechanism plus a unit-tested world with no route, leaving the page and the chrome for a second pass. webevm's core runs under node (rocketh-playground tests its deploy pipeline headlessly), so the world is unit-testable in vitest without a browser, which suits this tree's mutation-tested unit culture. The previous session split this phase and wrote up what the split cost; read that before repeating the pattern.
