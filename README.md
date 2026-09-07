# The `work` branch

Maintainer material for `template-commit-reveal`: the specs that plan the template tree, the handoff, and the design notes. **It is an orphan branch and it is not part of any working tree**, so `ls` from the repo root will not show it and it never cascades into a descendant.

Read a file with `git show work:<path>`, or check it out beside the repo with `git worktree add ../template-commit-reveal-work work`.

## Why a branch and not `docs/` on `main`

`main` is a template. Every file on it is inherited by every game built from it, forever, and maintainer material inherits worst of all: a plan about which repo stems from which is noise in a game repo, it goes stale there the moment it is copied, and deleting it in the descendant turns into a modify/delete conflict on the next cascade. jolly-roger reached the same conclusion first and moved its own `docs/` here in `0727847`, so this follows an established convention rather than inventing one.

The test for whether something belongs here rather than on `main`: **is it addressed to somebody MAINTAINING the template, or to somebody USING it?** `AGENTS.md` and `README.md` are for the user and stay on `main`. So does a note about shipped code that an adopter needs, which is why reveal-or-die keeps `docs/plans/identity-without-consent.md` on its own `main`: it documents a live weakness in a contract that gets deployed, and the person who most needs it is the one who cloned and did not know there was a branch.

## Layout

- `work/specs/proposed/` - specs (`type: prd`), following the `work/` on-disk contract, which is also where `notes/`, `tasks/` and `questions/` would go if this repo grows them.
- `docs/plans/` - design notes that are not specs.
- `HANDOFF.md` - the working document for the template-building effort. Scaffolding: delete it when the work is done.

`fanout.config.json` on the `offshoot` branch lists only `main`, and `branches` is opt-in, so this branch is excluded from the cascade by construction rather than by being remembered.
