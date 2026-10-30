---
title: fuzd 0.12 accepts a schedule into a slot it has already broadcast, never sends it, and reports it broadcast
type: observation
status: handed to fuzd (work/tasks/backlog/reject-a-schedule-into-a-spent-slot.md), the maintainer deciding to reject
spotted: 2026-10-30
relates-to: fuzd (@fuzd/server 0.12.1, @fuzd/scheduler 0.11.1), with/fuzd's slot `cycle_<n>`
---

Measured against the published `fuzd` 0.12 CLI on a local anvil: a second `scheduleExecution` into slot `cycle_1` after its first batch had been broadcast and finalised answered `success: true`, the queued record was overwritten with the new transaction and marked `broadcasted: true, finalized: true`, and the execution route still answered the FIRST batch's hash; the new transaction was never sent (the remote account's balance did not move). While the first is still queued, a second schedule replaces it as expected (only the second batch was broadcast).

`with/fuzd` is not exposed: one slot per signing key and cycle, and a cycle's turn is scheduled once, in its commit phase, before anything can broadcast. A client that reused a slot after its broadcast would be told it scheduled something that will never happen. Worth a fuzd task (refuse, or report "slot already used" as `broadcastExecution` does with `slotAlreadyUsed`), under fuzd's own `work/`.
