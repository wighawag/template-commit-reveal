---
title: mandalas' configured verify cannot pass from a clean clone, and it is the fallback deployments shape rather than the code
type: finding
status: spotted 2026-09-18, not fixed (mandalas' own repo)
spotted: 2026-09-18
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 0's gate, Phase 2's fix for bleeps/mandalas/ronan-eth), work/notes/findings/verify-cannot-pass-in-a-fresh-worktree-here.md, work/notes/findings/a-stale-generated-deployments-file-can-fail-check-as-one-plausible-error.md
---

# The third instance in one session, and this one is a repo's whole gate

**Measured 2026-09-18** while cascading the connection-as-a-parameter change from jolly-roger into its descendants. Before merging anything, `pnpm i && pnpm --filter ./web check` in a clean, origin-matching `mandalas`:

```
svelte-check found 6 errors and 0 warnings in 4 files
  deployments-store.ts:161  Property 'genesisHash' does not exist on type
      'WidenChain<{ readonly id: 5; readonly name: "Goerli"; ... }>'
  account/AccountData.ts:234, :314   same
  stores/randomTokens.ts:58          same
  context/core.ts:360                same, on AugmentedChainInfo
```

**That is mandalas' entire configured verify**, added in Phase 2:

```
pnpm install && pnpm --filter ./web check && pnpm --filter ./web run test:unit
```

so the gate the fanout runs on that repo cannot currently return success, for a reason that has nothing to do with whatever is being cascaded.

**The cause is the install-time fallback's chain SHAPE, not the code.** `ensure-deployments.mjs` generated `deployments.ts` from the committed **Goerli** records, and that export's chain object has no `genesisHash`. Four of the six call sites are jolly-roger's own shared files, which is why jolly-roger checks clean on the same code: its `deployments.ts` came from a real local deploy, and a real `rocketh-export` emits the field.

**Proved rather than argued:** a local deploy and export (`REPO=$PWD bash regen-deployments.sh 8621`, the template's script, unmodified, two repos away) took it to **0 errors and 0 warnings** with not one line of source changed. Units were 78 files / 929 plus 7 / 39 before the merge and 79 / 932 plus 7 / 39 after, which is the +1 file / +3 tests the change adds everywhere.

**Why this is worse than the two neighbouring findings rather than another example of them.** Those are about a person's working copy: regenerate the file and move on. This one is about a GATE. Phase 2 added `verify` to bleeps, mandalas and ronan-eth precisely because they were being merged into ungated, and recorded the care taken: *"each command was RUN by hand before being written into a config, because a verify command that cannot pass is worse than none - it blocks every future cascade and teaches people to pass `--no-verify`."* The command did pass when it was written; `genesisHash` arrived from upstream afterwards. So the gate rotted from a distance, in a repo nobody was editing, and the mechanism by which it rotted is the one the phase was congratulating itself on having closed.

**The general form, which is the part worth keeping:** a verify command that depends on a GENERATED, gitignored artifact is only as durable as the generator's output shape, and that shape is decided by a package version rather than by anything in the repo. Checking the command passes on the day you add it does not establish that it can pass tomorrow.

**Not fixed here.** Three candidate fixes and they are not equivalent, which is why this is a note and not a patch: teach `ensure-deployments` to emit `genesisHash` (fixes every descendant at once, and belongs wherever that script is homed); make the shared readers tolerate its absence (wrong if the operations ledger's key genuinely needs it, see the neighbouring finding on persistence keys); or commit a record whose export carries it (narrow, and re-rots on the next field). The first looks right and is not this phase's to take.

**One thing to check before trusting any of it:** bleeps is a sibling with the same stem and the same verify, and it checks **clean** (0 errors, 96 files / 1072 plus 7 / 39 before, 97 / 1075 after). So the failure is not "jolly-roger descendants are broken", it is something about what mandalas has committed to deploy from. Whoever fixes it should find out why the two differ before generalising from either.
