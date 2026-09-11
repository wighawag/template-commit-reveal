---
title: The contracts e2e assumes which contract sorts first, and reveal-or-die already fixed it
type: observation
status: DONE 2026-09-11
spotted: 2026-09-10
relates-to: work/specs/proposed/games-on-this-foundation.md (Decision 2, the backport list)
---

# Four inherited tests broke because a branch added a contract called `AvatarSale`

> **MOVED UP 2026-09-11**, once the re-point unblocked it, and it was NOT the
> free move it looks like.
>
> `e2e/fixtures/contracts-page.ts` is on `main` now; the four tests ask for a
> contract; reveal-or-die's copy is deleted and it inherits the file with **one
> executable line different** (`WRITE_FUNCTION`, which names each app's own
> write), measured rather than hoped. The second half arrived free too:
> `WRITE_FUNCTION`, `writeForm` and `executeButton` lived in
> `stalling-wallet.ts` upstream, and `e2e-account-claims.test.ts` reads an import
> of that file as claiming one of its accounts - so wanting a form locator made a
> suite look like it was racing another for a nonce.
>
> **WHAT THE MOVE COST, AND IT IS THE REASON TO KEEP READING THIS NOTE.** The
> diff of the two copies was one line, so the move looked provably safe. It was
> not: `selectContract` reads the trigger to decide whether it needs to pick, and
> until `$deployments` loads the trigger reads "Select a contract" and the
> dropdown has NO items. It clicked, and waited out 30 seconds for an item that
> did not exist yet. **Four tests failed all three attempts and two more came out
> flaky, on the first full run after the move.**
>
> reveal-or-die never lost that race because its own opening test asserts the
> placeholder is gone BEFORE calling the fixture - the wait was in the caller, by
> luck. Upstream's tests go straight in. The wait is in the fixture now.
>
> The general form, which is the thing worth carrying: **a move whose diff is one
> line is not therefore a safe move.** What differed was not the file, it was what
> the two repos' callers happened to have done before calling it, and no diff of
> the moved artifact could show that. It took a 25-minute browser run, and `check`
> plus 1,477 unit tests were green throughout.

`web/src/routes/contracts/+page.svelte` opens on the first entry of
`Object.keys($deployments.contracts)`, which is alphabetical. On `main` that is
`Game` (before `GameToken` and `StakeSale`), and four tests in
`contracts.e2e.ts` rely on it without ever naming a contract:

- `should display the Game contract by default`
- `should display view functions in Read tab` (asserts `getEpoch`)
- `should display write functions in Write tab` (asserts `addToReserve`)
- `should execute write function after connecting`

`with/nft-identity` added a sale contract, and calling it `AvatarSale` put it
first. All four failed, and none of the failures named the cause: the page was
showing a different contract's functions perfectly correctly.

## reveal-or-die already has the fix, and it was never backported

`reveal-or-die/web/e2e/fixtures/contracts-page.ts` exports `selectContract`,
`WRITE_CONTRACT`, `writeForm` and `executeButton`, and its `contracts.e2e.ts`
calls `selectContract(page)` before every assertion. Its comment records the
same failure ("the test asserted the Game was shown by default and failed on a
page that ..."), so a descendant met this, fixed it, and upstream never learned.

That is Decision 2's test - *would another game on this foundation have to write
this?* - answered yes by an existing second copy. The whole fixture module is a
backport candidate, and it is a MOVE: the descendant's copy is deleted in the
same change.

**It cannot be done yet**, for the same reason the asset pipeline's second half
cannot: reveal-or-die does not inherit from `main` until its `stemBranch` is
re-pointed at `with/all`. So this joins the list in
`the-asset-pipeline-move-cannot-complete-until-the-repoint.md`, with the same
trigger.

## What the branch did instead, and why it is a workaround

It renamed its sale to `GameAvatarSale`, which sorts after `Game` and matches
`GameAvatars` and `GameToken`. That is a real improvement in naming and it is
NOT a fix: the next branch or descendant that adds a contract sorting before
`Game` will fail the same four tests the same way, and will again see a page
that looks perfectly healthy.

Recorded rather than fixed because the fix is a backport whose second half is
blocked, and doing the first half now would put two copies in the tree with no
scheduled diff - the exact failure Decision 2 exists to prevent.
