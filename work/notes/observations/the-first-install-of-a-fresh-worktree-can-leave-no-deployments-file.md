---
title: The first pnpm install of a fresh worktree can leave no deployments file, and the second always did
type: observation
spotted: 2026-10-27
relates-to: scripts/ensure-deployments.mjs, the root and contracts `prepare` scripts, work/notes/findings/verify-cannot-pass-in-a-fresh-worktree-here.md
---

# A fresh worktree's first install is not always enough

Seen twice in one session (stratagems' step T1), on worktrees made with `git worktree add` from `origin/<branch>`, the pnpm store warm:

- `main` at e1378e3b: `pnpm install` reported success, but `web/src/lib/deployments.ts` did not exist, so `check` found 31 errors and `test:unit` failed 24 files. `node scripts/ensure-deployments.mjs` then generated it at once; a later `pnpm install` with the file moved aside generated it too.
- `with/nft-identity` at d64c8da3: the first `pnpm install` ended in `ELIFECYCLE Command failed with exit code 1`; the second succeeded, and the verify passed.

In the logged install, the root's `prepare` (`ensure-deployments.mjs`, which deploys the repo's scripts on a throwaway chain) runs CONCURRENTLY with contracts' `prepare` (`pnpm compile && tsc`), and on a second run contracts has nothing to compile. The likely shape is that the first install's root `prepare` reads contracts' artifacts or `dist` while contracts is still building them. Not confirmed: the first install's output was not kept.

Worth knowing because offshoot-fanout's verify is exactly `pnpm install && check && test:unit` in a fresh worktree, and the finding linked above says that has passed since 2026-09-26.
