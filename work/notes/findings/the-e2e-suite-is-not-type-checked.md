---
title: `web/e2e/**` is type-checked by nothing, including the cascade gate
type: finding
status: open
spotted: 2026-09-11
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 0, the verify gate), web/tsconfig.json
---

# `pnpm check` does not look at the e2e suite, and `verify` is `check` plus the units

Found while backporting reveal-or-die's `contracts-page.ts` fixture: the move
broke an import in `e2e/tests/escape-hatch.e2e.ts` (it imported `writeForm` and
`executeButton` from `stalling-wallet.ts`, which no longer exported them) and
**both gates stayed green.**

## Measured, not inferred

An import of a name that does not exist, added to the top of an ordinary e2e
test:

```ts
import {thisDoesNotExist} from '../fixtures/contracts-page';
void thisDoesNotExist;
```

| command | result |
|---|---|
| `pnpm --filter ./web check` | **0 errors, 0 warnings** |
| `pnpm --filter ./web run test:unit` | **1477 passed in 124 files, plus 71 in 11** |

Those two commands ARE the configured verify, in this repo and in every other
repo of the tree:

```
pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit
```

So **`offshoot-fanout --verify` will cascade a broken e2e suite into every
descendant and report green on each one.**

## Why

`web/tsconfig.json` extends the generated `.svelte-kit/tsconfig.json`, whose
`include` is:

```
ambient.d.ts, env.d.ts, non-ambient.d.ts, ./types/**/$types.d.ts,
../vite.config.{js,ts}, ../src/**/*.{js,ts,svelte},
../test/**/*.{js,ts,svelte}, ../tests/**/*.{js,ts,svelte}
```

`../e2e/**` is not there, and `web/tsconfig.json` adds no `include` of its own -
deliberately, because of the warning in its own comment: TypeScript does NOT
merge `include` with the extended config, so overriding it means copying the
whole generated list and keeping it in step with SvelteKit forever.

This is SvelteKit's default being right about SvelteKit and wrong about this
tree. Upstream the e2e suite is small; here it is the only gate that proves
anything about a browser, and the plan says so explicitly ("`verify` proves the
text still compiles and the units still pass, and proves nothing about behaviour
in a browser"). What that sentence does not say, and what is now measured, is
that the e2e suite's own text is not among the text that compiles.

## Why it matters more than it looks

Every expensive e2e failure this project has recorded is in the same family: a
fixture that was quietly wrong and looked fine.

- `stake()` pressing a button by its LABEL, timing out for thirty seconds in
  three suites naming a button nobody had removed.
- the stalling-wallet fixture filling an ADDRESS into a `uint256`, so viem threw
  before anything reached the wallet and three suites waited out a prompt that
  was never coming.
- `contracts.e2e.ts` filling one of two arguments, so the write was never sent
  and the assertion "no operation is pending" was trivially true. **It passed
  for a year without executing a write.**

None of those is a type error, so this check would not have caught them, and it
should not be sold as if it would. What it does catch is the class that is
strictly cheaper to catch: the one the compiler already knows about, in the one
directory nobody points the compiler at. The backport that found this is a good
example - a rename in a fixture, three importers, and the only thing that would
have told me was running a 20-minute browser suite.

## The fix, and why it was not taken here

Three shapes, in increasing order of how much they change:

1. **A second `tsc --noEmit` over an `e2e/tsconfig.json`**, added to `check` or
   beside it in `verify`. Cheapest, and it needs no fight with the generated
   include; the e2e suite is plain TypeScript with no Svelte in it, so
   `svelte-check` is not required.
2. **Add `../e2e/**` to `web/tsconfig.json`'s `include`**, copying the generated
   list. Works, and it inherits the maintenance burden the file's own comment
   warns about.
3. **Ask SvelteKit for it**, if `kit.typescript.config` can extend the generated
   include. Worth ten minutes of checking before doing (1).

**Not done here because `web/tsconfig.json` is a shared file near the root of
the tree.** It is template-svelte's, inherited byte-identical through
template-svelte-tailwind, -shadcn, jolly-roger and this repo, so changing it here
is the divergence-by-copy this tree keeps paying for - the same argument that
sent the `EXT` fix to jolly-roger's `tooling` branch and the plugin seam to
`template-svelte`. It belongs at the root, where every repo that has an e2e suite
gets it.

Check first whether every repo in that chain HAS an `e2e/` directory: if some do
not, option (1) as a per-repo script is a better fit than a shared tsconfig that
names a directory half the tree lacks.
