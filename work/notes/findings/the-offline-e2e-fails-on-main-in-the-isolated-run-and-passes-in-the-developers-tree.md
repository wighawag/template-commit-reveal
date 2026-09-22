---
title: The offline e2e fails on a pristine `main` in the isolated run, and passes against the developer's own build
type: finding
status: CLOSED 2026-09-23, and the interesting part is that this note's own reasoning was wrong. It was the webevm concurrency defect, fixed by 0.6.0. Kept as a record of the wrong call, not as an open item.
spotted: 2026-09-22
relates-to: web/e2e/tests/offline.e2e.ts, scripts/run-e2e-tests.sh, work/notes/findings/a-second-advance-succeeds-in-the-tab-and-the-first-one-did-not-take.md
---

# `pnpm test:e2e` failed one test on a tree that was supposed to be green

**Found incidentally**, while diagnosing the lost `advanceCycle` write. On `main` at `e74eec3c`, with nothing in the working tree, `pnpm test:e2e` was 52 passed / 1 failed:

```
[chromium] › e2e/tests/offline.e2e.ts:60:2 › Playing offline › boots a world in the tab and plays a whole cycle in it

Error: expect(received).toBe(expected)
Expected: "allowed"
Received: "Unloaded"
```

Four runs, four failures: twice in the full parallel suite, once narrowed, and once more after `git checkout --` had restored the tree to exactly `HEAD`. Neither the working tree nor parallel load. The same test passed in 835 ms against the developer worktree's own build, which made the isolated run's environment (`PUBLIC_NODE_URL`, `PUBLIC_CHAIN_INFO_NODE_URL`, a freshly exported deployment) look like the whole search space.

## THE CALL THIS NOTE MADE, AND WHY IT WAS WRONG

It was filed separately from the concurrency defect, deliberately and with a reason:

> It probably is not [the same cause]: that defect discards a state WRITE under read/write overlap, and its symptom would be `refused` (a registration that did not stick), not `Unloaded` (a read that never started). Assuming they are the same is how a diagnosis gets written for the wrong bug.

**It was the same bug.** Bumping `webevm` 0.5.0 to 0.6.0 and changing nothing else makes this test pass 4 of 4 in the same isolated run, in 777 to 833 ms. The environment difference was a red herring: the developer worktree's build simply happened to win the race more often.

Two things are worth taking from this, because the reasoning was careful and still landed wrong.

**A symptom's SHAPE is a weak signal about its cause when the mechanism can discard, tear or forge any write in the system.** The argument turned on `Unloaded` meaning "a read that never started" rather than "a write that did not stick", which is a sound reading of the store and a useless one here: with arbitrary writes vanishing, every store downstream is reading a state that may never have existed, and which particular way a store gives up is close to arbitrary.

**When a suspected cause has a candidate fix, test the fix against the other symptom BEFORE writing down why they are different bugs.** The evidence cost one dependency bump and about three minutes. The note that separated them cost more than that to write.

**What was right was the instinct not to merge them without evidence.** Folding an undiagnosed failure into a diagnosis on a hunch is the worse error, and it is the one this note was avoiding. The fix is not to guess more boldly; it is to notice that "these are different" is also a claim, and to buy the cheap evidence for it.
