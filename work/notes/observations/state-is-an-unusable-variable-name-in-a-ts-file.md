---
title: `$state` is an unusable parameter name in a .ts file here, and the checker cannot tell
type: observation
status: spotted
spotted: 2026-09-10
relates-to: web/test/svelte-conventions-boundary.test.ts
---

# A false positive with a one-word fix, recorded because it looks like a real failure

`svelte-conventions-boundary.test.ts` fails a `.ts` file that uses Svelte
runes, which is the right rule: logic lives in `.ts`, reactivity crosses the
boundary as stores, and a rune outside a component is a mistake the build
should refuse.

It matches rune NAMES as words. This repo's own convention is to name a
derived-store callback parameter after the store with a `$` prefix
(`($deployments) => ...`, `($round) => ...`), so the moment somebody writes

```ts
derived(state, ($state) => $state.identity)
```

the file is reported as using runes in a `.ts` file. It is not; `$state` is a
parameter. Renaming it to anything else fixes it.

**Cost so far: two minutes.** It is recorded because of what the failure LOOKS
like - a boundary test naming your file and quoting `AGENTS.md` at you - which
invites reading the rule rather than the line, and because the collision is
between two conventions the repo holds simultaneously (name the callback after
the store; do not use runes here).

Two ways to remove it, neither obviously worth doing:

- **Ignore a rune name that is immediately a parameter** (preceded by `(` or
  `,`). Cheap, and it narrows a check whose value is that it is blunt.
- **Say so in the failure message.** One clause: "if this is a callback
  parameter named after a store, rename it". Costs nothing and fixes the two
  minutes rather than the rule.

The second is the better trade. Not done here because the test is inherited
from `template-svelte` and a local edit to an inherited check is the
divergence-by-copy this tree keeps paying for; it belongs upstream, where the
same convention produced the same collision and will again.
