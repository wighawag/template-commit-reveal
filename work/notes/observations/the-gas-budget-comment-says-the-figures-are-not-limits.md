---
title: rocketh/config.ts still says the gas figures are not passed as limits, and they are
type: observation
status: fixed on main 2026-10-30 (36fdf6a6)
spotted: 2026-10-30
relates-to: contracts/rocketh/config.ts (the comment above COMMIT_GAS), game/core/commit-reveal/adapter.ts, contracts/test/js/GasBudget.test.ts
---

The comment above `COMMIT_GAS` says "THEY ARE STILL NOT PASSED AS GAS LIMITS". The adapter passes `gas.commit` and `gas.reveal` as the gas limit of every commit and reveal ("THE LIMIT, DECLARED BY THE DEPLOYMENT"), and `GasBudget.test.ts` says so ("the client passes them as the gas LIMIT"). The comment predates that change. It mattered on 2026-10-30: read as written, a budget below a paid commit's cost would only be a smaller stipend, when it was a reverted commit (see the finding `the-commit-budget-was-measured-without-a-payee.md`). Left as is in that fix to keep it to the measurement; correct it on `main` next time the file is touched.
