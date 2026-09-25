---
title: A framework file may name a repo as EVIDENCE and may not name one as an INSTRUCTION, which is why the cleanup stopped where it did
type: observation
status: acted-on 2026-09-24 in template-commit-reveal (all four nodes) and reveal-or-die, pushed
spotted: 2026-09-24
relates-to: work/tasks/done/extract-the-lobby-and-the-played-player-loop.md, work/notes/findings/an-inherited-paragraph-cannot-say-this-repo.md, work/notes/findings/a-file-identical-everywhere-must-not-name-one-games-answer.md
---

# Five sweeps that were right, three that would have been wrong

The extraction's acceptance rule was that no file under `$lib/game/**` names a game, a contract or a stake. Enforcing it on the OLDER files raised a question the rule does not answer on its own, because `$lib/game/**` is full of sentences naming other repos and most of them are the best thing in the file.

**The line that held, and it is about what the sentence ASKS THE READER TO DO.**

A framework file may name a repo as EVIDENCE for a decision. "All five games compute the cycle identically, `+ 2` comment included" (`core/cycle.ts`), "reveal-or-die and bomber-world identify a player by an ERC721 token id" (`core/seams.ts`), "reveal-or-die, bomber-world and stratagems all DERIVE the secret" (`core/submission.ts`). Those are historical claims about a survey. They are true wherever they are read, they are checkable, and they are the whole justification for the shape of the seam they sit next to. Deleting them leaves an interface with no argument.

A framework file may NOT name a repo, a path or a symbol as the thing to LOOK AT or CALL. "Edit `$lib/placement/render/index.ts`", "`CycleReading` is the contract's `getCycle`, as read", "settled by `acknowledgeMissedReveal`", "`deployments.contracts.StakeSale.address`", "reveal-or-die's store offers `select(avatarID)`". Every one of those is an instruction or a definition, every one is false one level down, and the reader who follows it goes looking for a file that is not there. Those five were rewritten.

**The test to apply: read the sentence in the last repo in the tree.** Evidence still reads as evidence there. An instruction becomes a lie there.

**And the second-order rule, which is what `AGENTS.md` already says about `_epoch()` and `RoundState`:** evidence that spells a descendant's SYMBOL is only correct while that repo spells it that way, so it is worth the risk only when the symbol is the point. Where the evidence survives without the name, drop the name - `identity.ts` now says "a game in this tree whose account can own several identities already offers a `select`", which is the same evidence and cannot go stale.

## What was deliberately not swept

`game/core/advance.ts` names `advanceCycle`, `getAttendance`, `StillWaitingToCommit` and `StillWaitingToReveal` throughout, and by the rule above most of that is instruction rather than evidence. It is untouched because renaming there would paper over something bigger that is already written down: the finding of 2026-09-24 shows that file's safety argument ("being wrong in the lax direction costs nothing at all, because the contract refuses") leaning on a property of THIS template's contract which reveal-or-die's does not have - there the mirrored guard is the only guard. Rewording the names would make the file look repo-neutral while the argument in it stayed wrong for one of the two games. It needs the argument rewritten, with both contracts in front of it, and that is its own task.
