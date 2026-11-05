---
title: the greedy-level offline-players test exceeds vitest's 5s default and fails, so the server project stops before the client project runs
type: observation
status: spotted
spotted: 2026-11-05
relates-to: web/test/lib/offline-players.test.ts:860, web/package.json (test:unit)
---

# A timeout that fails the verify command on with/fuzd and with/fuzd-pixi-indexer

`web/test/lib/offline-players.test.ts` > "the world seats at the greedy level" > "holds at least random's share on a seeded board, and strictly more where random's cell is contested" fails with `Test timed out in 5000ms`. It took 5.8s to 6.1s per run on this host (2026-11-05), so the assertion never gets to run. Seen on `with/fuzd` at 98bc021a (run alone, three times, with and without the drand-client change) and on `with/fuzd-pixi-indexer` at ac321507. Other nodes were not checked.

## Why it matters

- `test:unit` is `vitest run --project server && vitest run --project client`, so this one timeout also stops the client project from running. The offshoot `verify` command (`... && pnpm --filter ./web run test:unit`) therefore reports red on these nodes, and every client test goes unrun, with nothing in the output saying so. Run `npx vitest run --project client` on its own to cover it (15 files and 81 tests passed on with/fuzd-pixi-indexer).
- It is unverified whether this is host speed (a slower machine than the one that wrote the test) or the test getting slower. Either the test needs an explicit timeout, or the seeded board it plays needs to be smaller. Which one depends on what the test is measuring, so it was not changed here.
