---
title: reveal-or-die's kit re-exports `browser` and the template's does not
type: observation
status: spotted
spotted: 2026-09-09
relates-to: web/src/lib/kit/README.md, work/specs/proposed/games-on-this-foundation.md (Decision 2)
---

# A one-line divergence in the framework-boundary adapter, pointing upstream

`web/src/lib/kit/environment.ts` is the adapter that owns `$app/*` for this
tree: nothing outside `$lib/kit` may import it, and `web/test/framework-boundary.test.ts`
fails the build if anything does.

- **template-commit-reveal**: `export {version} from '$app/environment';`
- **reveal-or-die**: `export {version, browser} from '$app/environment';`, with
  a doc comment explaining that it is for module-scope code that cannot use
  `onMount`.

Noticed while moving reveal-or-die's asset loader onto `with/pixi-js`: it says
`import {browser} from '$lib/kit/environment'`, which does not resolve here.

## Why the branch did not just add it

Two reasons, and the second is the one that matters.

- It would be a **shared-file edit on a branch**, bought for one import, in a
  file that is the whole point of a boundary test. N1 says the budget grows only
  with a reason, and "one import found it convenient" is not one.
- **This repo already has a house answer**, used by every other module under
  `$lib/game/**` that needs it: `typeof window !== 'undefined'`, in `epoch.ts`,
  `chain-time.ts` and `gamepad.ts`. So the branch is consistent with the repo it
  is a branch of, rather than importing a descendant's convention along with the
  descendant's file.

## Why it is still worth doing, on `main`

Decision 2's test is "would another game on this foundation have to write this?"
and the answer is plainly yes: any module that starts work at module scope needs
to know whether it is in a browser, and three of this repo's own already do.

The three `typeof window` sites are not wrong, but they are the same check
spelled out three times in a repo that has an adapter whose entire job is to be
the one place the framework is named. `browser` re-exported from the kit is
one line, is what the descendant already concluded, and is a strictly better
answer than the string comparison because it is what SvelteKit actually knows
(it is `false` during prerender in a Node process that does have a `window`
shim, which `typeof window` gets wrong).

**It belongs on `main`**, so every node gets it, and it should land with the
three call sites converted - otherwise it is a fourth thing shipped upstream
with no consumer, which is a count this plan is deliberately tracking.

Deliberately not done here: it is off the renderer axis, it touches a file
governed by a boundary test, and doing it on a branch would be the wrong level.
