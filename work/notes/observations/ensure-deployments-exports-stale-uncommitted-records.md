---
title: ensure-deployments prefers gitignored local records over a fresh deploy, and a stale local deployments.ts fails check with errors that name the code
type: observation
status: spotted
spotted: 2026-11-05
relates-to: scripts/ensure-deployments.mjs, web/src/lib/deployments.ts, contracts/deployments/localhost
---

# Two ways a developer's own leftovers make `pnpm check` lie

Both were seen while verifying a cascade on 2026-11-05 (the signer-rpc and faucet fixes, landed in reveal-or-die as 20e24f97 and bomber-world as 7f5bfde3).

## 1. A stale `web/src/lib/deployments.ts` is never replaced

reveal-or-die's was dated 2026-09-03 and bomber-world's 2026-03-11, both from before the `epoch` to `cycle` rename. `pnpm --filter ./web check` then fails with errors like `Property 'cycleNumber' is missing in type '{ hash; epoch }'` and `"getCycleNumber" is not assignable`, which point at correct code and read like a botched rename. This repo's `with/fuzd-pixi-indexer` showed the same 17 errors earlier that day, until a dev run regenerated the file. `ensure-deployments.mjs` exits immediately when the file exists, by design (a `pnpm start` session owns it), so nothing ever replaces a stale one.

## 2. "Committed records" includes gitignored ones

The script's header says it exports "from the deployment records COMMITTED to this repo", but it lists what is on disk (`readdirSync(deploymentsDir)`), and `contracts/deployments/localhost` is gitignored (`contracts/.gitignore`). In reveal-or-die, with `deployments.ts` moved aside, it exported from a stale local `localhost` and reproduced the same errors. A throwaway deploy only ran once `contracts/deployments/localhost` was moved aside too, and then check passed with 0 errors.

## Why it matters

A verify run on a developer's machine fails for a reason the cascade did not cause, and the errors name the code rather than the generated file. AGENTS.md already says to regenerate `deployments.ts` before touching anything shared, but that only helps a reader who recognises these errors as stale generated types.

## Possible directions (not decided)

- When deciding which records to export, the script could check `git ls-files` (truly committed) rather than the directory listing, or at least say which records it used and how old they are.
- `check` (or the script, when the file exists) could warn when `deployments.ts` is older than the newest contract source or ABI.

The workaround used: move `web/src/lib/deployments.ts` and `contracts/deployments/localhost` aside, run `node scripts/ensure-deployments.mjs`, check, then put both back.
