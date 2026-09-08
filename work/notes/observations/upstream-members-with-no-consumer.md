---
title: Game.activeIdentity is the third thing shipped upstream with no consumer on main
type: observation
status: spotted
spotted: 2026-09-08
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 1, "the count stands at two, deliberately")
---

# The count the plan tracks is now arguably three

The PRD deliberately tracks how many things this template ships upstream that
nothing on `main` exercises, because the pattern is a smell about where the
level boundary really sits. Its own words, under Phase 1:

> the template's own game does NOT set `commitWhenIdle` [...] it is the second
> such module after `keys.ts`/`gamepad.ts`, and a third would be a pattern
> worth questioning rather than repeating. [...] The count stands at two,
> deliberately.

N3 (`d4fe4475`) added `Game.activeIdentity`. **No UI on `main` reads that
member.** reveal-or-die has three readers (`world/ui/GameHud.svelte`,
`world/ui/hud.ts`, `debug/diagnostics.ts`), because there an account can own
several avatars and the HUD offers a picker; the template has exactly one
identity per account and nothing to pick, so there is nothing for a component
to say about it.

## Why this is NOT simply a third, and why it is written down anyway

It is materially weaker than the other two, and the difference is worth stating
so nobody counts it as equivalent:

- `keys.ts`/`gamepad.ts` and `commitWhenIdle` are **modules and behaviour** that
  no code path on `main` runs. Only their tests touch them.
- `activeIdentity` is a **store that is threaded through ten sites** in
  `context/game.ts` and drives the round, the reserve, the storage key, the
  missed-reveal read and recovery. Every one of those is exercised on `main`,
  by the unit suite and by the e2e round. What has no consumer is the
  **member on the `Game` surface**, i.e. the act of exposing it to components.

So the honest reading is "two modules plus one exposed member", not three of a
kind. The reason to record it rather than let it pass: the plan asked to be
told when a third appeared, and something that is 90% exercised is exactly the
kind of case that gets waved through and then quoted later as precedent.

## What would settle it

Either is cheap and neither is N3's:

- **A consumer appears and the question dissolves.** `with/nft-identity` gives
  the reference game a token identity, which is the point at which a picker (or
  at minimum a HUD line naming which token is playing) becomes meaningful on a
  branch. If it lands there, the member was simply early rather than unused.
- **Or it should not be on `Game` at all.** The store could stay internal to
  `context/game.ts`, since every consumer of it there is internal, and be added
  to the `Game` surface by the branch that first needs to render it. That would
  cost the branch one line in a shared file, which is a real N1 cost and the
  reason it was exposed now rather than later.

Deliberately not decided here: it is a judgement about the branch's budget, and
the branch does not exist yet.
