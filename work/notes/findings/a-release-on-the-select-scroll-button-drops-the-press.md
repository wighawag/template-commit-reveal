---
title: bits-ui's Select forgets a press when the release lands on its scroll button
type: finding
spotted: 2026-10-30
relates-to: work/tasks/done/select-contract-settles-before-clicking.md
---

# A press on an option, released on the scroll-up button, selects nothing

bits-ui 2.20.2 (`dist/bits/select/select.svelte.js`): `SelectItemState.onpointerdown` records the pressed item, and `onpointerup` on an item selects. If the list moved between the two and the release lands on ANOTHER item, it selects the pressed one ("released on another item without the pointer moving: the list moved under it"). But a release on the scroll-up or scroll-down button reaches no item handler, so the press is forgotten and the list stays open on the old value.

The list moves under a still pointer when the viewport is scrolled programmatically: the `scroll` event comes in the next frame, `SelectScrollUpButtonState.handleScroll` sets `canScrollUp`, and the button (24 px in the shadcn wrapper, `py-1` and a 16 px icon) mounts at the top of the content, pushing every item down by its height. A Playwright click does exactly that on its third attempt (it scrolls with `block: 'start'`), which is how stratagems' e2e found it; measured and reproduced every time there (task `select-contract-settles-before-clicking.md`).

A player is very unlikely to meet it: a wheel or touch scroll mounts the button in the frame after the first tick, before a human's press can follow. The fix would be bits-ui's: treat a release anywhere inside the content (or on a scroll button) after a press on an item, with the pointer still, like the release on another item. Not reported upstream yet.
