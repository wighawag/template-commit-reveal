---
title: check-dangling-imports said it needs no install, and in a worktree that has never had one it throws
type: observation
spotted: 2026-10-27
relates-to: scripts/check-dangling-imports.mjs, scripts/apply-omissions.sh, AGENTS.md ("Before you commit a cascade")
---

# The check that "needs no install" needed one

`AGENTS.md` says `node scripts/check-dangling-imports.mjs` "takes about a second, needs no install and no `svelte-kit sync`". In stratagems' `main`, in a worktree freshly added for a cascade (step T1 of its port, 2026-10-27), `scripts/apply-omissions.sh` dropped the omitted paths, then the dangling-import check threw a Node module-resolution error whose `requireStack` named `web/package.json`, and the script refused to let the merge be committed. After `pnpm install` (inside the conflicted merge, which is safe; stashing is not) the same check passed in about a second. reveal-or-die's fresh worktree showed the same once, before its install.

So "no install" holds for a checkout that has had one, which is every main checkout and no fresh cascade worktree. Either the check resolves without `node_modules`, or the sentence says "after `pnpm install`". Not fixed here: the script is shared machinery whose home is this repo and its sibling, and the session that saw it was cascading something else.
