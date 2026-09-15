---
status: accepted
date: 2026-09-15
---

# `cycle` is the framework's word for its interval; `round` and `turn` belong to games

The commit-reveal interval was called an `epoch`, and the word named its own
INDEX (`uint64 epoch`) rather than the thing, so Phase 3 had to invent a second
name for the interval itself. We call the interval a **cycle**, name its index
`cycleNumber`, and deliberately leave **round** and **turn** unused by the
framework so that a game can take them for whatever its players mean by them.

**The rule that produced it, and the one to apply next time: name the MECHANISM,
not the EXPERIENCE.** The mechanism is the framework's and is the same in every
game; the experience is the game's and is not. This template already refuses to
name the identity, the stake, the renderer and the actions for the same reason.
Its vocabulary should refuse in the same places.

## Considered options

**`epoch`**, the incumbent, in 1,715 places across 73 files per node. Rejected on
three counts, and the well-known one is the least of them. Its English sense is a
long, singular, characterful stretch of history, which a repeating 40-second
interval is not. Its PROGRAMMER sense is the origin of a time scale, hence a
timestamp, and that confusion is already live: `epoch = floor(timePassed /
epochDuration) + 2` puts an index and two durations in one expression, a
`Commitment` holds `epoch` beside real timestamps, and `revealPhaseStartTime`
takes an index and returns a time. Only third does it collide with beacon-chain
epochs, which never appear in this lineage at all.

The argument FOR `epoch` that was offered and then withdrawn: five games use it
character for character, which looked like convergent evidence that it is the
natural word. It is not evidence. The five share one author and one lineage, so
it is one habit propagating.

**`round`**, for the framework's interval. Rejected because it is
SCALE-AMBIGUOUS in the direction games actually need: a duel of five rounds, each
round several commit-reveal exchanges, is an ordinary game to build here, and if
the framework has taken the word that game cannot use it for the thing it means.
The collision would land in the game author's own file, which is the worst place
available. Reserved for games instead.

**`turn`**, for the framework's interval. Rejected twice over. In a SIMULTANEOUS
game the framework's interval is not one player's turn, it contains everyone's at
once, so the word is wrong for the container before anything else. And in the
games this template exists for, a turn is three steps over four directions, so
`turn` also means rotate: `TurnStore` would sit next to code that turns left.
Reserved for games.

**`ActionSet`**, for one player's pass through a cycle. Rejected because SET
asserts unorderedness and the framework is order-sensitive by construction: the
commitment is `keccak256(abi.encode(secret, actions))` over an array, so two
orderings of the same actions are two different commitments. It also names a
container after its own field (`actions` is the payload's name across the whole
seam) and names a value where the code holds a process with a step, a secret and
an auto-reveal. **Submission** was chosen for that concept.

**`Commitment`**, for the same concept. Rejected after checking rather than
before: the client already uses `commitment` for the CHAIN's record
(`getCommitment`, `MissedRevealStore.commitment`), so it would have given one
word two senses in one layer, which is the `RoundStore` versus `RoundPhase`
failure this whole decision exists to remove.

**`CycleSubmission`**, to pre-empt a clash with form submission. Rejected because
the clash does not exist inside `game/core/`, because the qualifier attributes
the submission to the cycle when it belongs to the PLAYER, and because a compound
this heavily referenced gets abbreviated inconsistently by the next reader. A
qualifier is what you reach for when you cannot declare a word's meaning, and
this is the document that declares it.

## Consequences

**The tree holds both words until every descendant's contracts are ported**, and
that is by design rather than drift: contracts are not inherited here (decision 1
in `HANDOFF.md`), so reveal-or-die, bomber-world, conquest, catacombs and
stratagems each carry `epoch` until they are ported one at a time. `CONTEXT.md`
is what makes that legible; somebody who greps and finds `epoch` in a descendant
should conclude the game has not been ported, not that the glossary is stale.

**The wire names age and the client sweep does not.** `epochPolicy` is a
`linkedData` key, `epoch` is an indexed topic on three events, and `InvalidEpoch`
is an error clients match on. Nothing on this stack has a live deployment with
users, so those are free to rename today and expensive later; the 1,715-site
client sweep can follow at any pace behind this glossary.

**Phase 3's own naming is the closest to correct and still not right.**
`advanceRound`, `getRound`, `RoundPhase` and `_round()` used the player's word
for a shared mechanism, which is the mistake this ADR forbids; they become
`advanceCycle`, `getCycle`, `CyclePhase` and `_cycle()`. That the mistake was
made while the good word was occupied by its own index is the clearest evidence
for the decision.

**ADR numbers in this tree now need a repo.** This is `template-commit-reveal`'s
first ADR, and the code already cites `ADR-0002` and `ADR-0004` meaning
**jolly-roger's**, which has 0001 to 0008. Cite as "ADR-0001
(template-commit-reveal `work`)" and read a bare number as jolly-roger's, which
is what every existing citation means.
