---
title: Unanimity compared a count of committers against a count of members, and they were different sets
type: finding
status: fixed 2026-09-15
spotted: 2026-09-15
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 3, C1, C2)
---

# Anyone at all could commit, so anyone at all could close the phase

Found by a cold subagent review of Phase 3 after it had landed, green, on five
nodes, with sixteen mutations run against it. It is the sharpest demonstration
this project has of the rule it keeps restating: **the producing context
rubber-stamps.** I had reviewed this work myself, twice.

## The hole

`_advanceRound` closes the commit phase when `attendance.committed >=
attendance.waitedFor`. `waitedFor` counts members. `committed` counted
COMMITMENTS, and `_makeCommitment` never asked whether the committer was a
member - a bond of zero against a reserve of zero passes every other check in
that function.

So on a hybrid game with `k` members: commit a zero bond from `k` throwaway
addresses at the top of the commit phase, call `advanceRound`, and the reveal
phase opens before a single real player has acted. Reveal empty placements
(`cost 0 <= bond 0`), advance again, and the next commit phase starts at that
block. Repeat. **The game is permanently unplayable for gas.**

On a manual game it is worse and quieter: the sybil commitments are simply never
revealed, `revealed < committed` can never clear, and with no clock the cycle is
frozen for good. Every committed bond is then locked forever, because
`acknowledgeMissedReveal` requires an epoch that can no longer move.

## The second route to the same desync, which is not an attack

`locked` in `_withdrawFromReserve` is the commitment's BOND, and a turn that
places nothing bonds zero. So a member could commit an empty turn, withdraw
their whole reserve, and cease to be waited for while the epoch went on counting
their commitment. The denominator shrinks, the numerator does not, and a SUBSET
then satisfies unanimity and closes the phase on somebody who has not acted.

**An idle player's automatic commit is exactly an empty turn.** This was ordinary
play, not a crafted sequence.

## The fix, and the fix that would have been worse

Only a member may commit (`NotInGame`), and no member may stop being waited for
with a turn still open (`CommitmentStillOpen`). Together those make the two
counts range over the same set by construction rather than by agreement.

The reviewer also named the tempting wrong fix, which is worth keeping: making a
LEAVER's commitment stop counting. That closes the arithmetic and opens a hole
underneath it, because the epoch could then advance past an unrevealed
commitment - which costs that player the stake, the one thing the round exists to
prevent.

## Why nothing caught it, which is the part that generalises

- **Every committer in both suites was `enterGame`'d**, so `committed <=
  waitedFor` held by construction and the comparison was never tested against a
  set it could disagree with. A suite that only ever exercises the honest path
  cannot see a denominator hole.
- **Sixteen mutations found nothing here**, because a mutation perturbs code that
  EXISTS. The defect was a missing check, and there is no line to mutate. That is
  the standing limit of the technique, and it is worth writing down next to all
  the phases where mutation did find something: **mutation tests the code you
  wrote, review tests the code you did not.**
- **It is unreachable on a timed deployment**, which is every deployment this
  tree has. The two policies it breaks are the two this phase exists to add, so
  the hole would have shipped as a feature and been found by whoever first used
  one.

## The client half, same review, same shape

`round.ts` gated auto-commit and the fallback auto-reveal on `$info.type ===
'timed'`. Phase 3 added `'hybrid'` to that union, TypeScript narrowed the
comparison perfectly happily, and both behaviours silently switched off on the
new policy - including the reveal that exists so a closed browser does not
forfeit. The same file already asked `!== 'manual'` twenty lines earlier.

**Adding a member to a union is not a type-safe operation**, and an exhaustive
`switch` would have caught it where an equality test could not. Worth preferring
the switch at every site that branches on a policy or a state.
