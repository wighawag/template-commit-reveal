---
title: The contracts-page fixture lets the open list settle before clicking an option, so the click is not dropped
slug: select-contract-settles-before-clicking
spec: games-on-this-foundation
blockedBy: []
---

# A click on the contracts page's select was dropped about once in three full runs

Found by stratagems' step 8 (the plan's log entry "2026-10-30, step 8: the durability fix merged; the scheduled-reveal suite passes every run, a contracts-page select flakes on this branch"). Two of seven full e2e runs on stratagems' `step-8` failed a framework suite (`pending-operation.e2e.ts`, `escape-hatch.e2e.ts`) inside `web/e2e/fixtures/contracts-page.ts`'s `selectContract`: the click on the "Stratagems" option was not taken, the listbox still open and "Gems" still selected 30 s later. stratagems' page opens on `Gems` (it sorts first), so its suites pick a contract, as reveal-or-die's do (its page opens on `Avatars`); this template's opens on `Game` and `selectContract` returns before clicking, which is why the template's own suite never showed it.

**The cause, measured** (stratagems, `step-8` and its base `merge-main-8`, the harness's own builds, a probe recording every pointer event, every frame's geometry of the list and the select's state):

1. The list opens with an animation (`zoom-in-95`, `fade-in`). A click started at once finds the option "not stable" twice, and **Playwright's third attempt scrolls the option to the top of the list** (its retries cycle the scroll alignment, the third is `block: 'start'`), here by 127 px, then moves, presses and releases within about a millisecond. `DEBUG=pw:api` shows the two "element is not stable" retries; the probe shows the viewport at `scrollTop` 127 at the press, in 4 of 6 unthrottled clicks.
2. That scroll is programmatic, so its `scroll` event is dispatched in the NEXT frame. bits-ui's `SelectScrollUpButtonState` answers it by setting `canScrollUp`, the scroll-up button (`select-scroll-up-button.svelte`, 24 px) mounts at the top of the list, and every item moves 24 px down: the option from y 311 to 335, the pointer still at 327, now on the button.
3. bits-ui selects on the release of an ITEM (`SelectItemState.onpointerup`). It already handles a release on ANOTHER item after the list moved ("released on another item without the pointer moving"), but a release on the scroll button reaches no item handler, so the press is forgotten and the list stays open on the old value. The failing runs' screenshots show exactly that state: the up button at 306, "Stratagems" highlighted at 335, the trigger still "Gems".

So the click is dropped whenever a frame falls between Playwright's press and its release after that scroll. **Reproduced every time** by sending the move and the press in the same task as the scroll (pipelined on one CDP session), two frames, then the release: 16 of 16 on `step-8` and 16 of 16 on its base, at CPU throttling 1 and 4. Throttling alone did not reproduce it (0 of 100 clicks at rates 1, 2, 4 and 6), because the race needs a frame inside a one-millisecond window, not a slow page: the base passed 4 of 4 full runs and `step-8` (10% more JavaScript on `/contracts`, since it composes `$lib/fuzd`) failed 2 of 7, which a heavier page makes likelier and does not cause.

**Could a player hit it?** Only with a scroll in the same frame as a press: a wheel or touch scroll mounts the button in the frame after the first tick, long before a human's press. So it is a test artifact of Playwright's forced scroll, plus a narrow bits-ui gap (finding `a-release-on-the-select-scroll-button-drops-the-press.md`), not a defect a player meets.

## Done, 2026-10-30, on local preview branches, NOT pushed (awaiting the maintainer's approval)

On `main` (preview branch `fix/select-contract-settles` from `origin/main` ee68c542, worktree `~/dev/worktrees/template-commit-reveal/fix/select-contract-settles`), one commit, `e4d964ea`: `selectContract` waits, in the page, until the option's box is the same for three frames and no animation runs in the list; brings the option into view itself (`scrollIntoView({block: 'nearest'})`, a no-op when it is visible); waits for the list to come to rest again (the scroll event, the scroll button, bits-ui's realignment); and only then clicks. The click then needs neither a retry nor a scroll. Rather than (b) re-clicking an ignored option (it would hide whatever drops a click), (c) the page taking the contract from the URL (a product change for a test's sake, and the widget would go untested), or a patch of bits-ui (a third-party gap a player does not meet; recorded as a finding).

**Measured with the change** (stratagems `step-8` with the fixture applied, the same probe): 160 clicks through the real `selectContract` (rates 1 and 4, viewport heights 720 and 420), all taken, every one on its first attempt (`DEBUG=pw:api`: 60 of 60 option clicks with no retry), the list at `scrollTop` 0 at every press.

| node (preview branch, head) | verify after (check; unit server + client) | e2e |
|---|---|---|
| `main` (`fix/select-contract-settles` e4d964ea) | 0 errors 0 warnings; 1903 + 78 | **54/54** (4.9 min) |
| `with/pixi-js` (`sel/with/pixi-js` 07a4c5ef) | 0/0; 1912 + 78 | |
| `with/nft-identity` (`sel/with/nft-identity` 936af967) | 0/0; 1911 + 78 | |
| `with/fuzd` (`sel/with/fuzd` d4ef7f42) | 0/0; 1944 + 78 | **61/61** (8.0 min, the fuzd stages included) |
| `with/all` (`sel/with/all` e5089f2d) | 0/0; 1920 + 78 | |
| reveal-or-die `main` (`sel/main` 97fb53e7) | 0/0; 2059 + 72 | `contracts`, `pending-operation`, `escape-hatch`: **23/23** (it clicks `Game` from `Avatars`, so it runs the new path) |
| bomber-world `main` (`sel/main` 6d056960) | 0/0; 2107 + 72 | |
| stratagems `main` (`sel/main` 09f8cd63) | 0 errors 2 warnings (its legacy two); 1632 + 72 | its integration branch's: see its plan |

Unit counts are unchanged from the durability task's, as they should be (an e2e fixture). The pre-existing `window is not defined` unhandled error (observation `an-unhandled-error-in-the-unit-run-of-with-nft-identity.md`) failed the unit run, and so skipped the client project, on `main` and `with/pixi-js` (both runs); the client project was then run alone (78 passed). In `with/nft-identity` and `with/fuzd` the first `pnpm install` of a fresh worktree failed in `contracts prepare` (Hardhat's build-info rename, the race the durability task saw), so `deployments.ts` was missing and check failed on it; a second install generated it and everything above is from the second run. e2e on `E2E_RPC_PORT=8555 E2E_PORT=4183` with `E2E_GATEWAY_PLAIN_PORT=4573 E2E_GATEWAY_SW_PORT=4574` (another project's e2e held 4273 and 4274), nothing left on a port and no fuzd process after any run.

**The cascade**, merged by hand on `sel/*` preview branches (worktrees `~/dev/worktrees/<repo>/sel/<branch>`) with the tool's messages, each from its parent's preview branch, from origin heads equal to the local ones (`with/all` over `with/pixi-js` then `with/nft-identity`; reveal-or-die from `with/all`; bomber-world from reveal-or-die; stratagems from `with/fuzd`): every merge clean except stratagems', a modify/delete on the fixture its `main` omits, resolved by `scripts/apply-omissions.sh` (a merge with no tree change; `check-omissions` against d4ef7f42 covers all 152 paths). Each a diff of exactly `web/e2e/fixtures/contracts-page.ts` against its origin; `check-dangling-imports` clean in every node.

## Not done here

- Nothing pushed: the maintainer approves each push.
- stratagems' integration branch takes the fixture in its between-steps merge (its plan's entry of the same date); its step 8 measures the full e2e again.
- bits-ui is not patched or reported upstream (the finding says what a report would say).
