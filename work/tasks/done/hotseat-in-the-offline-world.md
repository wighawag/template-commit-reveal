---
title: Hotseat in the offline world, several people at one device, the reference game its first user
slug: hotseat-in-the-offline-world
spec: games-on-this-foundation
blockedBy: [tables-for-a-fixed-set-of-players, one-tab-per-offline-world]
---

# Hotseat in the offline world

The template's spec decided hotseat (`games-on-this-foundation.md`, D4: real commit-reveal, one ACCOUNT per player, a revealer account, built as a scheduler adapter handed the payload at commit time). Built from stratagems' port plan, step H1 (`join-template-commit-reveal` branch, `work/plans/join-template-commit-reveal.md`), its decisions H1-1 to H1-11 taken with the maintainer on 2026-11-02.

## Done, 2026-11-02, on local preview branches `ph1/*`, NOT pushed

**jolly-roger `with/embedded-chain`** (its task `an-embedded-wallet-with-several-accounts`): `announceEmbeddedWallet({accounts})` and `select(address)`; the world's connection factory is its own function (`embeddedConnectionFactory`); a client test (real Chromium) that the world's connection follows a selection with no picker and no prompt, and that a signature derives that account's own browser key, the same each time.

**`main`** (from `origin/main` 9df6ac5e, after jolly-roger's `integration` merged in):

- `96844e4e` the seam: `RevealScheduleRequest.revealDueAt` is optional (undefined on a manually advanced chain) and the adapter hands a scheduler the reveal whenever one is given;
- `f3c76277` `$lib/game/core/local-revealer.ts`, a scheduler that asks no payment, holds each turn's reveal transactions in memory and sends them from its own funded key once the reveal phase is open; the world hands it to the context (`createContext({scheduler})`, `CoreServices.scheduler`, by the road `table` took) and the skeleton uses it in place of the game's, with `autoReveal: 'fallback'`;
- `e6c8cf2a` the seat (`local-human`, `tableOf(seats, humans)`, `humansAtThisDevice`, `localRevealerKey`), the lobby (how many people here, remembered under `offline-world:humans`, absent read as 1, offered up to `LOCAL_HUMANS_AT_MOST`, which the byte-identical `offline-lobby.ts` reads off `$lib/offline` so a game without it declares nothing), `$lib/game/lobby/hotseat.ts` (whose turn it is from the chain, the handover, `signInAs`, the recovery reveal of a turn the revealer lost in a reload) and `ui/Handover.svelte`, rendered by the route in place of the game; the reference game's world (one wallet account per person, each staked and authorised at boot, the revealer funded and handed to the context); `offline-hotseat.e2e.ts`;
- `0cfc3f21` **a framework race found by the e2e**: the missed-reveal reader published the PREVIOUS identity's live commitment for the new one when an account switch landed during its check, so the new person read as having lost a committed turn; a check now drops an answer about an identity that stopped playing (unit case, pinned to fail without the fix). An online player switching account in their wallet could meet it too;
- `96a572a1` **the second finding of the e2e** (see `work/notes/findings/a-stored-account-auto-connect-lands-after-a-later-switch.md`): after a reload, `@etherplay/connect`'s auto-connect signed the world's connection back in as the previous person after a later switch; the hotseat now shows the game only while the connection is signed in as the person with the device, decided synchronously from the connection, and switches the right account back;
- `47814795`, `dfdb2b67` the e2e skips (and says why) in a game whose world offers no hotseat, and imports nothing a game replaces (reveal-or-die's dangling-import check caught the reference game's fixtures);
- `4569cfad` `CONTEXT.md`: hotseat and handover.

**`with/fuzd`**: `98cb49e1` fuzd refuses a chain with no reveal time in `prepare` and `submit`, asking fuzd nothing (the adapter records the turn unscheduled, as before), with a unit case. **`with/nft-identity`**: `5fc4d538` no hotseat yet (`LOCAL_HUMANS_AT_MOST = 1`): a person plays as an avatar, and the reference game's hotseat e2e stalled after the first cycle there, with the active identity a selection of its own; measured, not fixed (a later task). **`with/indexer`**: the merge's one conflict in `offline.ts` kept both sides (the index's key and the hotseat export). The other nodes merged clean.

**Descendants**: reveal-or-die and bomber-world resolve `offline.ts` to their own and skip a `local-human` seat (no hotseat offered); stratagems `main` takes the framework (its offline world lives on its integration branch, which got the same compile edit; its hotseat is step H2).

## Measured

- Check 0 errors and 0 warnings everywhere (stratagems `main` its known 2 warnings); unit: `main` 1977 + 81 (from 1953 + 78), `with/pixi-js` 1990 + 81, `with/nft-identity` 1985 + 81, `with/fuzd` 2019 + 81, `with/indexer` 2005 + 81, `with/all` 1998 + 81, `with/fuzd-pixi-indexer` 2060 + 81, reveal-or-die 2130 + 75, bomber-world 2178 + 75, stratagems `main` 1735 + 75; dangling imports and omissions clean.
- e2e: `main` **56/56** (the full suite, 5.2 min, with `offline-hotseat.e2e.ts`: two people and one world seat, two cycles, a reload in a commit phase); `with/fuzd-pixi-indexer` and `with/nft-identity` the three offline suites (hotseat skipped on `with/nft-identity`, as intended); stratagems' integration branch 59 passed and 1 skipped.
