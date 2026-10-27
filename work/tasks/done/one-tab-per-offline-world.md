---
title: One tab per offline world; a second tab is refused, with a way to take the world over
slug: one-tab-per-offline-world
spec: games-on-this-foundation
blockedBy: []
---

# Two tabs could open the same offline world, and the two copies of its chain diverged

Drafted in stratagems as P11 of its step O, specified there as step T1 (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`, the section "Step T1" has every decision with the alternative rejected), and decided with the maintainer on 2026-10-27.

## What was wrong

A world is persisted in the browser: webevm's dump (`offline-world-chain:<id>`), the deployment records (`offline-world-deployments:<id>`) and the chain id in `localStorage`. A second tab on `/offline/` restored the same id, dump and records, booted a second node, and from then on each tab mined its own blocks and saved its own dump over the other's. Nothing in the template stopped it, in any game; a game that indexes its world in the tab (stratagems) got a third writer on top.

## Done, 2026-10-27, on local preview branches, NOT pushed

**The mechanism is jolly-roger's** (`with/embedded-chain`, task `one-tab-per-world` on its `work` branch): `$lib/embedded/claim.ts`, a Web Lock named by the app's world and a take-over asked over a `BroadcastChannel`, and `$lib/ui/embedded-chain/WorldInAnotherTab.svelte`, the refusal. It arrived here by the ordinary merge from `integration` (`a8ba9532`: `offline.ts` resolved to ours, `routes/offline-demo` dropped by `apply-omissions.sh`).

**The wiring is this repo's and is byte-identical in every game** (`87269517`, `67a066ae`, `de924635`):

- `$lib/offline-lobby.ts` claims `offline-world` when the lobby OPENS, before the framework's lobby looks, and a refused tab never reaches `startGame`. Taken at the opening rather than around `startGame` (the draft's wording), because a second tab that reached the chooser would write its seat count over the record the holder's next restore reads. The literal name rather than one built from `CHAIN_ID_STORAGE_KEY`, since bomber-world versions that key (`:v2`) and the lock must not follow it. Letting go waits for the boot this tab started (`startGame` keeps its promise). `offlineWorldClaim` and `takeTheWorldOver` are exported beside `offlineLobby`, whose `enter` now returns a promise.
- `routes/offline/+page.svelte` renders `WorldInAnotherTab` ABOVE the world, so handing the world over unmounts it (its context and seats stop) before it is disposed.
- No game's `offline.ts` changes.
- `test/lib/offline-lobby.test.ts`, three cases: a refused lobby neither starts a world nor offers a table nor touches the seat record; taking over boots the restored world; a holder asked to let go awaits its boot, disposes, waits on one request, then reloads. They read the world's key off the (mocked) module, so bomber-world runs them unchanged.
- `e2e/tests/offline-one-tab.e2e.ts`: two pages of one context, the second refused, take-over, the first refused and the second on the same chain id. Written against the byte-identical lobby, bar, navbar and refusal only.
- `src/lib/embedded/README.md` says where the two halves live.

**Measured** (check 0 errors and 0 warnings everywhere): `main` 1770 -> 1784 + 78 units, e2e 53 -> 54 of 54; `with/pixi-js` 1793, `with/nft-identity` 1792, `with/all` 1801 (+ 78 each); reveal-or-die 1943 + 72 and bomber-world 1991 + 72 after the cascade, with no hand edit to either `offline.ts`; stratagems' integration branch 1680 -> 1694 + 72, e2e 49 -> 50 of 50.

**Found by the cascade**: the first version of the lobby cases spelled `offline-world:chain-id`, merged cleanly into bomber-world's adapted copy of the test, and failed there, because bomber-world remembers its world under `:v2`. Fixed here (`de924635`) by reading the key, not by editing the descendant.
