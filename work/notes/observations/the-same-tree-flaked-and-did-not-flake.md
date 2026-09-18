---
title: The same e2e flake appeared and did not appear on a byte-identical tree, with load the only variable
type: observation
spotted: 2026-09-18
relates-to: reveal-or-die web/e2e/tests/board.e2e.ts, work/specs/proposed/games-on-this-foundation.md (Phase 0's flake note)
---

# A control the flake note never had

## What happened

`reveal-or-die`'s `board.e2e.ts` ("plans an entry, hides it until the reveal,
and lands it on the board") was run three times in one afternoon:

| run | tree | result | wall | load |
| --- | --- | --- | --- | --- |
| 1 | `6b00166` | 49 passed, **1 flaky** (retried green) | 9.5m | 1.15 rising to 6.71 |
| 2 | `6b00166` | **50 passed**, no retries | 7.1m | 2.17 rising to 5.20 |
| 3 | `c92438f` | 49 passed, **1 flaky** (retried green) | 9.5m | rising to 5.99 |

**`c92438f` is a merge whose tree is byte-identical to `6b00166`'s.** It is a
recorded no-op: everything the cascade carried was either this repo's own or
absent from it, so `git diff HEAD~1` is empty. Not "equivalent", not "no
meaningful change" - the same bytes.

## Why that is worth writing down

The plan's Phase 0 note already says the variable is load and that there is no
threshold, only a probability that rises with it. What it did not have was a
CONTROL: every previous data point compared trees that differed by something,
even if only markdown, so "the change did not cause it" was an inference rather
than an observation.

Here the tree is fixed by construction and the outcome differs anyway, twice
against once. Nothing about the code can explain it, because there is no
difference in the code to appeal to.

## The practical consequence, which is the same as before but now earned

A single flaky serial run is not evidence that a change broke something. This
is the strongest available demonstration of that: the run that flaked and the
run that did not were the same program.

It also sharpens the cheap signal the plan recommends. Wall time tracked the
outcome exactly - 9.5m on both flaky runs, 7.1m on the clean one, against a
~7m baseline - so a run that takes a third longer than baseline is already
telling you the machine is busy, before you read which assertion failed.

## What it does NOT license

It is not evidence that this test is fine. A test that fails once in three runs
under ordinary developer load is a test with a real race in it, and the retry is
hiding it rather than fixing it. The failure family is the documented one (a
wait that times out rather than a wrong answer), which is where a resource
problem shows up first. What this observation settles is only WHERE to look:
not in the diff.
