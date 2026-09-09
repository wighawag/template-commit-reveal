---
title: reveal-or-die re-exports `browser` and upstream should NOT copy it
type: observation
status: resolved - do not backport
spotted: 2026-09-09
corrected: 2026-09-09 (twice)
relates-to: web/src/lib/kit/README.md, work/specs/proposed/games-on-this-foundation.md (Decision 2)
---

# The descendant is right for its level, and upstream is right for theirs

`web/src/lib/kit/environment.ts` is the adapter that owns `$app/*`: nothing
outside `$lib/kit` may import it, and `framework-boundary.test.ts` fails the
build if that stops being true.

- **`template-svelte` down to `template-commit-reveal`** (byte-identical by md5,
  all four): `export {version} from '$app/environment';`
- **reveal-or-die**: `export {version, browser} from '$app/environment';`

Noticed while moving reveal-or-die's asset loader onto `with/pixi-js`, where the
`browser` import did not resolve.

## THIS NOTE WAS WRONG TWICE, AND THE SECOND ERROR IS THE INTERESTING ONE

**First version: "land it on `main`."** Wrong, because the file is
byte-identical across four repos, so that would diverge a stem file to say
something all four want. The general rule this tree already has: a change wanted
by a file identical to the stem's is upstream's to make.

**Second version: "land it at `template-svelte` and cascade."** Also wrong, and
not for a bookkeeping reason. **There is nothing upstream that should use it.**

Decision 2's test is "would another project have to write this?", and the answer
looked like yes. It is no, because every `typeof window` site upstream is
deliberately framework-free, for a reason specific to where it sits:

| site | why `browser` would be WRONG there |
|---|---|
| `core/utils/web/url.ts`, `path.ts` | `core/` may not import the kit **at all**. The seam is that `core/` declares what it needs as a TYPE and is handed it as a value (`PathResolver`, `ServiceWorkerEnvironment`). A plain `typeof window` is not a framework import, which is exactly why it is used there |
| `core/service-worker/index.ts` | it is **the worker, not the app**. `typeof window` distinguishes worker from page, which is a different question from SSR-versus-client, and `$app/environment` has no business there |
| `game/core/epoch.ts`, `chain-time.ts`, `render/gamepad.ts` | `$lib/game/**` imports NOTHING from `$lib/kit` today - checked, not assumed. It is the commit-reveal framework, and it is the code this plan's own tripwire says becomes a package when two games change it differently. Framework-free is the property that makes that cheap |

`gamepad.ts` also wants the `window` OBJECT rather than the boolean, so a
boolean does not replace it at all.

## So the divergence is CORRECT, and should be left alone

reveal-or-die uses `browser` in `$lib/world/render/assets.ts` and
`$lib/ui/loading/SplashScreen.svelte` - **its own application code**, which is
precisely the level at which naming the framework through the kit is what the
kit is FOR. An app may do that. A template's `core/` and a portable game
framework may not.

So this is not "the leaf fixed something the trunk missed". It is a leaf using
an adapter correctly, at a level the trunk has no code at.

## The argument that nearly won, and why it loses

"The kit is an adapter, a re-export costs one line, and downstream wants it."
True as far as it goes, and it loses to the kit README's own words about the
seam:

> Adding a new framework dependency means adding a binding here and a parameter
> there, which is **deliberately slightly annoying: the friction is the point,
> because it makes the coupling a decision rather than an import.**

Pre-placing framework surface upstream removes exactly that friction, and the
first thing it would invite is `core/`-adjacent code importing it - the coupling
the rule exists to make deliberate. A one-line re-export with no consumer at its
own level is not free; it is an invitation.

## What `with/pixi-js` does, and why it is not a workaround

`game/render/pixi/assets.ts` uses `typeof window`, matching every other
`$lib/game/**` module. That is the house style for that directory because that
directory is framework-free, not because the nicer thing was unavailable.

**Nothing to do. Do not reopen without a consumer at the level being changed.**
