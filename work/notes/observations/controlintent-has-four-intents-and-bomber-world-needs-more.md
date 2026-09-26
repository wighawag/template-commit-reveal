---
title: The framework's input seam has four intents, and bomber-world has three actions for its one secondary
type: observation
status: RESOLVED 2026-09-26, template-commit-reveal main 2751ccd9, cascaded; bomber-world moved onto it
spotted: 2026-09-26
relates-to: web/src/lib/game/render/intents.ts, web/src/lib/game/render/keys.ts, web/src/lib/game/render/gamepad.ts, work/tasks/done/port-bomber-world-onto-reveal-or-die.md
---

# `ControlIntent` is direction, confirm, secondary and cancel, and a game can outgrow it

## RESOLVED, the same day, with the first option below

`ControlIntent` gained `{type: 'action'; name: string}`, and the adapters take a game's bindings: `KeyOptions.actions` (key to name) and `GamepadOptions.actions` / `createGamepadRecognizer(actions)` (button index to name), each consulted before the defaults so a game can also take a default back. Additive: reveal-or-die binds nothing and needed no change. bomber-world's delayed bomb is now that action, on B and on the gamepad's north button, and its private key listener is gone. The overload of `secondary` (leave on the exit tile, instant bomb elsewhere) stays, deliberately: those two are never available together.

The rest of this note is what it said before the fix.

**What bomber-world needs to say with a key or a pad:** step (four ways), commit, undo, leave the world, drop an instant bomb, drop a delayed bomb. That is three non-directional actions where the framework has one (`secondary`).

**What the port did, without touching `lib/game`:**

- `secondary` (Space, X, the pad's secondary button) LEAVES on the exit tile and DROPS AN INSTANT BOMB anywhere else. That is also how bomber-world's pre-port client read that key, so nothing a player knew changed. `exitAt` refuses off the exit tile, so the order only matters on that one cell.
- The delayed bomb has **no intent**. It is `B`, heard by a listener in `world/controls.ts` that follows the same rules as the framework's keys (not while typing, not in a chord, not on auto-repeat), and a HUD button. **A gamepad cannot drop one.**

**Why this is a seam question and not a bomber-world bug.** The intents are the framework's vocabulary for "what the player asked for, whatever device they used", and every device adapter (`keys.ts`, `gamepad.ts`, the DPad) maps into them. A game with a fifth action has two choices today: overload an intent (which works exactly when the two actions can never both be available, as here on the exit tile) or go around the seam for one device at a time, which is what the delayed bomb does, and which loses the gamepad.

**Options for the template, none taken:** a game-defined extra intent (`{type: 'game'; name: string}`) that each adapter can be told how to produce; or a second secondary (`tertiary`), which only moves the ceiling. The first is the honest shape, and the cost is that `keys.ts` and `gamepad.ts` take a game's mapping as a parameter instead of owning one table.

**Not urgent.** Nothing breaks: the delayed bomb is reachable by keyboard and by pointer. It is recorded because Phase 7 (the UI swap) runs on bomber-world, and a swap that touches the HUD will meet this.
