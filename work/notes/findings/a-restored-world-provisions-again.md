---
title: A world is provisioned on every boot, so a persistent world hands out the stake again on every reload
type: finding
status: fixed 2026-09-22 in template-commit-reveal `main` and `with/nft-identity`; the seam is unchanged and correct
spotted: 2026-09-22
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 4, probe 6), web/src/lib/embedded/world.ts, web/src/lib/offline.ts
---

# Persistence and provisioning are two good decisions that contradict each other

**What happened.** The reference game's offline world gives its player a bonded ERC20 stake, because this game's whole commit-reveal design rests on something being lost by not revealing. Measured in a browser: a reserve of 10 became **20** on the second page load, and 30 on the third.

**Why.** Both halves are deliberate and neither is wrong.

- `createEmbeddedWorld` calls `provision` on every boot. It has to: it is the hook's whole contract that by the time anyone can hold the world, the player has what they need.
- The world PERSISTS by default. The chain goes to IndexedDB and the deployment records to `@rocketh/web`'s store, both keyed by chain id, so a reload restores the chain and SKIPS the deploy rather than building a second game beside the first.

So a reload is a boot with no deploy - and provisioning runs anyway, against a chain that already has everything it was about to hand out.

**Why it matters more than a surplus.** A stake that can be refilled by pressing F5 is not a stake. The player can miss a reveal, forfeit the bond, reload, and be whole again; `acknowledgeMissedReveal` then costs nothing, and the one rule `AGENTS.md` states as non-negotiable for this template ("something must be at stake, or nobody has to reveal") is quietly false in that world.

**The fix, and why it is the GAME's and not the framework's.** `stakeForOfflinePlayer` asks the chain whether the player already holds one and returns if they do - `getReserve` upstream, `getAvatarsOf` and `getAvatarOwner` on `with/nft-identity`, which is the same pair `$lib/game/identity` uses to find who an account plays as.

The framework could instead have told the hook "this world was restored", and that would be the wrong question. What a game needs to know is whether its player already has what it was about to give them, and only the game knows what that is: a bonded reserve, an avatar in custody, a starting position, a hand of cards. The restore flag would answer a question nobody asked and would be wrong the first time a world is restored into a browser whose player has since forfeited.

**The asymmetry that is deliberate: gas is refilled on every boot and the stake is not.** Gas is a number on a chain in a tab and is not what anybody is risking; the stake is the entire point. Both lines sit next to each other in the provisioning hook with that sentence attached, because the next person to read them will wonder why one is conditional.

**How it was found, and what that says about the gate.** By reloading the page twice and reading the number, after everything was green. The world test at the time asserted that provisioning HAPPENED and that the reserve was the sale's amount, which is true on a first boot and says nothing about a second. It now calls the hook three times and asserts the amount has not moved - mutation-checked by removing the guard, which fails exactly that test.
