---
title: reveal-or-die's kit re-exports `browser` and nothing upstream of it does
type: observation
status: spotted
spotted: 2026-09-09
corrected: 2026-09-09
relates-to: web/src/lib/kit/README.md, work/specs/proposed/games-on-this-foundation.md (Decision 2)
---

# A one-line divergence in the framework-boundary adapter, whose home is four repos up

`web/src/lib/kit/environment.ts` is the adapter that owns `$app/*` for this
tree: nothing outside `$lib/kit` may import it, and `web/test/framework-boundary.test.ts`
fails the build if anything does.

- **everything from `template-svelte` down to `template-commit-reveal`**:
  `export {version} from '$app/environment';`
- **reveal-or-die**: `export {version, browser} from '$app/environment';`, with
  a doc comment explaining that it is for module-scope code that cannot use
  `onMount`.

Noticed while moving reveal-or-die's asset loader onto `with/pixi-js`: it says
`import {browser} from '$lib/kit/environment'`, which does not resolve here.

## THIS NOTE'S FIRST VERSION SAID TO LAND IT ON `main`. THAT WAS WRONG.

Worth keeping the error visible, because it is the exact trap this tree has a
standing rule about, and writing the note did not stop me walking into it.

**The file is byte-identical, by md5, across four repos**: `template-svelte`,
`template-svelte-tailwind`, `jolly-roger` and `template-commit-reveal`. So
landing `browser` on this repo's `main` would diverge a file that is the stem's,
buying a conflict in every future merge-down, to say something every one of
those repos would want. That is the same mistake as reformatting a file
identical to the stem's, which `HANDOFF.md` already records the general form of:
**a change wanted by a file that is identical to the stem's is upstream's to
make.**

**The home is `template-svelte`**, the root of the tree, which is where the kit
rule itself is defined and enforced. Only the leaf has the fix; the four repos
between the root and the leaf all have the gap.

## And one claim in the first version was asserted rather than checked

It said `browser` is right where `typeof window` "gets it wrong", because
prerendering runs in a Node process "that does have a `window` shim". **Not
verified, and probably false**: SvelteKit does not define `window` during SSR,
so `typeof window === 'undefined'` is correct there too. Removed rather than
softened.

The real arguments are smaller and they are these:

- `browser` is statically replaced at build time, so the browser-only branch is
  dead-code-eliminated. `typeof window !== 'undefined'` is not reliably.
- It is the kit rule's own point: ONE place names the framework, and the same
  question is currently spelled out by hand in three modules here
  (`epoch.ts`, `chain-time.ts`, `gamepad.ts`).
- The leaf of the tree already reached this conclusion independently, which is
  Decision 2's test for whether something belongs upstream.

## So what should happen, and when

**Land it at `template-svelte` and let it cascade**, with the three
`typeof window` call sites in this repo converted as it arrives - otherwise it
is a fourth thing shipped upstream with no consumer, which is a count this plan
deliberately tracks.

**Trigger: the next change that is already going down that chain.** One line of
re-export does not justify a four-repo cascade of its own, and the honest
statement of its value is "modest": nothing is broken today, the three call
sites are correct, and the benefit is dead-code elimination plus one fewer way
to spell a question. It should ride along, not drive.

`with/pixi-js` therefore uses `typeof window` in `game/render/pixi/assets.ts`,
matching what every other `$lib/game/**` module in this repo already does, with
a comment pointing here.
