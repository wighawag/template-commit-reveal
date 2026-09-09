---
title: The immediate renderer leaked a subscription, and its own ten tests could not see it
type: finding
status: fixed
spotted: 2026-09-09
relates-to: work/specs/proposed/games-on-this-foundation.md (D11), web/src/lib/game/render/immediate.ts
---

# Removing `unsubscribe()` from `createImmediateRenderer` passed all ten tests of its file

Found by mutation while porting the reference game onto the immediate renderer
(D11, Phase 2). `immediate.ts` is one of the four files D11 moves into `main`'s
exercised set, so it was worth checking what its existing coverage was actually
worth.

Deleting these two lines from `onAppStopped`:

```ts
unsubscribe?.();
unsubscribe = undefined;
```

left **10 of 10 tests in `test/lib/game/render/renderers.test.ts` passing**,
including the one named `stops listening to the view state once stopped`.

## Why that test cannot see it

Because of the difference between the two renderer styles, which is the part
worth keeping:

- **`createStatefulRenderer` subscribes for effect.** A store emission calls
  `add` / `update` / `remove` immediately, so a leaked subscription is
  observable the moment the store changes. The same mutation applied to
  `stateful.ts` fails 2 of the same 10 tests.
- **`createImmediateRenderer` subscribes only to REMEMBER.** The callback writes
  to a local `view` and nothing else; drawing happens on `tick`, which returns
  early when there is no surface. So after `onAppStopped` the leaked
  subscription changes no observable behaviour whatsoever. It is a pure
  resource leak, and pure resource leaks are invisible to behavioural tests by
  construction.

The existing test asserts the right thing about DRAWING and cannot assert
anything about listening, because after a stop those two are no longer the same
question.

## What it costs in the app

The game canvas mounts and unmounts on every navigation into and out of
`/play`. Each visit leaves one live subscription to the view state, holding a
closure over a dead surface, for the lifetime of the tab.

## The fix, and the shape of it

A test that counts the store's SUBSCRIBERS through `writable`'s start/stop
notifier, rather than a spy on the renderer:

```ts
const store = writable(initial, () => {
	subscribers++;
	return () => subscribers--;
});
```

It also asserts the renderer can be started again afterwards, because the canvas
really does remount and a one-shot teardown would pass a naive version of this.

## The general form, which is the reason to write it down

**`immediate.ts`'s own doc comment predicted this exact bug and pointed it at
somebody else.** Its words: the framework holds the snapshot so that every game
does not write "five lines that every game would write identically and one of
them would get wrong by forgetting to unsubscribe". The framework then forgot to
unsubscribe, and had no test for it, because it had absorbed the mechanism
without absorbing the reason the mechanism was risky.

So: **when a module justifies its existence by taking over a hazard, that hazard
is the first thing its suite should assert about it.** Cheap to check, and the
check is mechanical - mutate the line the doc comment is bragging about.
