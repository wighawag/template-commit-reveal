---
title: reveal-or-die's and bomber-world's recover-submission e2e deletes localStorage keys the submission no longer lives under
type: observation
spotted: 2026-10-29
relates-to: reveal-or-die and bomber-world web/e2e/tests/recover-submission.e2e.ts; web/e2e/fixtures/game.ts (forgetSubmissionAndReload)
---

# The game e2e that proves recovery cannot lose the submission any more

Since step 8 item 4 the submission lives in the account data (`submissions` and `committedTurns` in the `__private__*` record), and each game's `world/storage.ts` writes there. Both games' `recover-submission.e2e.ts` still destroy the turn by deleting `__world_submission_*` keys and assert there was at least one. Measured on reveal-or-die's `s8/main` (8556759f amended to 272537a2): the spec fails at "there was a stored submission to destroy" (0 keys). bomber-world carries the same spec. The node verify (check and unit) does not run e2e, so the cascade's verify stayed green.

The fix is what the template's `game.e2e.ts` does: empty both fields of every `__private__` record from a one-shot init script before the reload (`forgetSubmissionAndReload` in the template's `e2e/fixtures/game.ts`, which these games omit with the rest of the reference game's e2e), since emptying them in the running page lets the account data's next save write them back. It is a hand edit to a game's e2e, so it was asked for rather than made.
