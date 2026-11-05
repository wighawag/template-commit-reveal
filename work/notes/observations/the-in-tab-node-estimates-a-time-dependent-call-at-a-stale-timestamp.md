---
title: The in-tab node estimates gas at the last mined block's timestamp, so a call whose cost depends on elapsed time can run out of gas
type: observation
status: spotted
spotted: 2026-11-05
relates-to: web/src/lib/embedded/node.ts (the note on eth_estimateGas), stratagems contracts/deploy/011_deploy_gems_generator.ts
---

# A time-dependent call, estimated in the tab, runs out of gas when it is mined later

Found by stratagems' step L3 (its plan on its integration branch). `web/src/lib/embedded/node.ts` already says that `eth_call` and `eth_estimateGas` run against the LAST MINED block, with its timestamp, and that under automine the clock stands still between transactions. The consequence it names is a timed game that cannot estimate a reveal; there is a second one, measured.

stratagems' offline world re-runs its deploy scripts on every boot, and one of them sends `RewardsGenerator.update()`, whose cost depends on the time since the last update (33,315 gas when time has passed, cheaper when the block's timestamp equals the last update's). When the last mined block was one that updated the generator (a reveal, a stake), the estimate takes the cheap path (31,348 gas, from the reverted transaction's own limit), the transaction is mined in a later block with a later timestamp, and it runs out of gas (31,312 used). rocketh then refuses the receipt and the page says "The offline world did not start." It had never happened only because an unguarded setup call mined a block just before it; guarding that call (for the LAN package) removed the block and exposed it.

stratagems' answer is local: that one call carries its own gas limit (100,000, twice the most measured). The template's reference game has no such call that I know of, so nothing is broken here today. What a fix at this level could be, not decided: the node estimating on a pending block whose timestamp is the one the next block will get (what hardhat and anvil do), which would make every estimate in the tab honest about time. Evidence: stratagems' `stratagems-offline-ai.e2e.ts` (a reload in the reveal phase) failed 3 of 3 against a build with the guards and passed against one without, and passes with the gas limit.
