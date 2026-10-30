---
title: Nothing shows a committed turn whose record could not be stored (`notStored`)
type: observation
status: spotted
spotted: 2026-10-30
relates-to: web/src/lib/game/core/submission.ts (`SubmissionState` `Committed.notStored`), web/src/lib/placement/ui/hud.ts, work/tasks/done/the-committed-record-is-durable-before-committed.md
---

# `notStored` is reported on the state, and no HUD reads it

The durability fix (`the-committed-record-is-durable-before-committed.md`, `main` ee68c542) writes the committed record durably before reporting `Committed`. When that write FAILS after the commitment is on chain, the commit is not undone: the state is `Committed` with `notStored: {message, error}` beside it, and this page still reveals the turn.

No HUD in the tree reads `notStored` yet: not the reference game's (`placement/ui/hud.ts`), not `with/fuzd`'s status line, not reveal-or-die's, bomber-world's or stratagems'. So a player whose committed record could not be stored is told the same as one whose record was stored, including, under `with/fuzd`, that the turn "will be revealed for you, even if you close this page".

## Why it matters, and why it is less urgent

What is at risk is a RELOAD: it finds only the pre-commit record. In the same cycle the chain's hash takes it back up, so the turn is not lost. In a later cycle the uncommitted record is cleared (see `a-commit-left-in-flight-can-lose-the-whole-bond-in-a-later-cycle.md`), and the missed-reveal settlement may lose its chunks. In the account data the record is still in memory, and a later save may persist it. So the honest message is roughly "your turn is committed, but this device could not save it: keep this page open until it is revealed".

It needs a storage write to fail (quota, a storage error) after a write moments earlier succeeded, which is rare. That is why it is less important than the in-flight gap, but the cost when it happens is the same.

## The shape of a fix

The reference game's HUD (`hud.ts`, logic in `.ts` per AGENTS.md) maps `Committed` with `notStored` to a warning line, and `with/fuzd`'s status line does not promise the page may be closed while it is set. The games decide their own words.
