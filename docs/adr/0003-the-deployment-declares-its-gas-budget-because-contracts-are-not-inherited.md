---
status: accepted
date: 2026-09-18
---

# The deployment declares its gas budget, because contracts are not inherited

`COMMIT_GAS` and `REVEAL_GAS` were constants in
`web/src/lib/placement/config.ts`. They are now declared by the deploy
(`contracts/rocketh/config.ts`), recorded into the Game's `linkedData`, and read
off the deployment by the client, exactly as `actionsPerReveal` and
`placementCost` already were.

**The rule that produced it: a number measured against contracts belongs with
the contracts, and in this tree that is a different unit of inheritance from the
client.** Every repo here inherits `web/src/lib` by merge. No repo inherits
`contracts/src`: every game writes its own, which is stated in `AGENTS.md` and
is the reason a descendant may still be un-chunked. So a gas figure living in a
client file is a measurement that travels away from the thing it measured.

That is not a hypothesis. `with/nft-identity` measures **99,102** for a first
commit and **374,085** for a full fresh chunk, against `main`'s **116,898** and
**535,561**, because a placement costs nothing there - custody of the avatar is
the stake - so a reveal writes no per-cell stake, no cell total and nothing to
the reserve. The file holding the figures did not differ at all between those
branches, so the wrong numbers arrived by a clean merge and stayed. The branch
had already been forced to write a paragraph in that file explaining that it was
knowingly carrying `main`'s numbers and why that was the safe direction. That
paragraph is the smell this decision removes.

## They became limits, 2026-09-18, and what that needed

**Written as "still not passed as gas LIMITS", and no longer true.** The flip
happened in the same session, once the two things blocking it existed: an
explicit `expectedActionsPerTurn` so that anything counted in turns has a number
to be sized from, and a minimum-headroom assertion in `GasBudget.test.ts` so the
margin over the measured worst case is a tested property rather than an accident
of when it was last looked at. No declared figure had to change - they already
carried 12% to 28%, against a tripwire deliberately set looser at 10%.

**One objection to the flip was mine and was wrong.** I held it back on the
grounds that the figures are measured on the local chain while a real deployment
uses the `default` deploy data, so a locally-measured ceiling could be too low
elsewhere. Gas USAGE is a property of the contract code and the EVM revision,
not of the chain, and `hardhat.config.ts` pins `evmVersion` on every profile -
so the same contracts cost the same gas wherever they run. What genuinely varies
per chain is the PRICE, and that is `expectedWorstGasPrice` in the chain
properties, which is already declared per chain and is exactly what turns a gas
figure into money. The correction came from the user, and it is the reason this
decision's per-deployment framing is about WHICH CONTRACTS rather than which
chain.

The remaining exception is worth keeping in view rather than acting on: a chain
that folds L1 data costs into execution gas, or one below the pinned EVM
revision, would not satisfy that argument. Neither is in this tree today.

**They are not in the Solidity `Config` struct.** `linkedData` on the deployment
record is not the constructor's argument, and it may say more than the
constructor took. The contract never reads a gas figure, so a member in `Config`
would spend deploy gas and a storage slot on a number only the front end
budgets with. The channel already exists for exactly this: what the client must
agree with the deploy about.

## Considered options

**Leave them in the client and keep re-measuring per branch.** Rejected, and it
is worth saying why it looked reasonable: over-reserving is the safe direction
for a stipend, so `main`'s larger figures are not dangerous on a branch whose
transactions are cheaper. What makes it wrong is not the arithmetic but the
shape. The file cannot differ without the difference being maintained forever on
every branch, by hand, against contracts none of them share - and the one number
that could NOT be over-stated safely (`creditsGasMultiplier`, which prices what a
step is charged rather than reserving for it) had already been given its own
per-branch home for exactly that reason. Two numbers derived from one
measurement, kept in two files with different inheritance, is the arrangement
that produced a credit priced 58% too high on a branch once.

**Derive them at runtime from `eth_estimateGas`.** Rejected. An estimate is of
ONE call with ONE set of arguments, and the figure needed is a worst case over
every shape a chunk can take: four fresh cells in four different zones costs far
more than four warm ones, and the client would be estimating whichever the
player happened to plan. It also cannot be estimated at all for any chunk after
the first, which was measured: chunk `i + 1` is checked against a head chunk `i`
has not written yet, so the estimate is of a reverting call.

**Put them in the Solidity `Config`.** Rejected above. Worth recording that the
argument FOR it is real - a figure in constructor storage is verifiable on chain
against the code it was measured against - and it loses to the fact that nothing
on chain consumes it.

## Consequences

**A game that writes its own contracts cannot inherit a wrong figure, because
there is nothing left in the client to inherit.** It must declare its own, and a
deployment that declares none is refused at startup rather than budgeted for
with a guess - the same treatment `actionsPerReveal` already gets, for the same
reason.

**`creditsGasMultiplier` is derived from the same two constants** rather than
typed out a second time, so the client's reservation and the credit price move
together and cannot drift per branch again.

**`contracts/test/js/GasBudget.test.ts` is what stops the declared figures
rotting.** It measures the worst commit and the worst reveal these contracts can
produce and fails if the deployment claims less, in the suite that ships with the
contracts - so each game gets its own automatically. Checked by mutation:
declaring 500,000 against a measured 535,525 fails it, and the message names the
file to edit. It also fails loosely in the other direction, because a budget more
than 3x the measurement means nobody has re-measured in a long time.

**reveal-or-die did not take it, and that is a schedule rather than a gap.** Its
contracts declare no gas budget and its client does not read one, so the test
was dropped in the cascade rather than adapted. It is the same shape as its
missing chunk, and it is now the next thing that repo should want: it is the
descendant whose gas was being inherited from a game it does not run, which is
the whole point of this decision.
