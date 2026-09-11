---
title: The branch READMEs cascade into every descendant, where they describe something the repo is not
type: observation
status: spotted
spotted: 2026-09-11
relates-to: work/specs/proposed/games-on-this-foundation.md (D11, Decision 2), README.pixi-js.md, README.nft-identity.md, README.all.md
---

# `README.pixi-js.md` now sits in reveal-or-die's root, saying "this branch"

Noticed during the `with/all` re-point. Three files arrived in reveal-or-die as
clean adds and were kept:

```
README.pixi-js.md        "The pixi host ... This branch carries the LIBRARY and its build."
README.nft-identity.md   "The reference game, keyed by a token instead of by an account."
README.all.md            "this repo's single integration branch ... reveal-or-die stems from here"
```

reveal-or-die is not a branch, does not carry the reference game, and is not an
integration node. Two of those three sentences are false where they now sit, and
the third is only true read as documentation of the parent.

## This is the same class as the thing that was just deleted

The `AGENTS.md` TEMPORARY section had exactly this shape: maintainer material
about the TEMPLATE TREE, written on a branch, cascading into a game repo where it
was not merely irrelevant but actively false - it warned reveal-or-die against a
merge reveal-or-die had just completed. It is gone now, from both repos.

The `work` branch solves this properly for the plan and the handoff: an orphan
branch has no merge base, so it cannot cascade. The spec file adds a belt to that
brace with its own first line, *"If you scaffolded a game from this template,
delete this file."*

**The branch READMEs have neither.** They are on the branches themselves, which
is exactly what makes them cascade, and they carry no banner.

## Why they were kept anyway, which is a judgement and not obviously right

Deleting three files in the descendant buys a `modify/delete` conflict in every
future cascade, forever - the cost this tree already knows well from
`web/src/routes/demo/`. Against that: the files are accurate about the
inheritance chain, a reader who knows the tree is not misled for long, and
nothing reads them programmatically.

So the cost of leaving them is confusion, and the cost of removing them is a
recurring conflict on three files. That trade is close enough to be worth
deciding on purpose rather than by default, which is why this is written down
rather than acted on.

## Two cheaper shapes than either

- **A banner, upstream, on each branch README**, in the spec file's words: "this
  describes a BRANCH of the template tree. If you are reading it in a game
  repo, it is describing where your code came from, not where it is." One line,
  costs no conflict, and it is true at every level.
- **Or move them off the branches**, onto `work`, and leave a pointer. That is
  the mechanism the tree already trusts, and it is the answer if the READMEs
  turn out to be for maintainers rather than for adopters. The argument against
  is that a branch README is the first thing somebody checking OUT that branch
  should see, and `work` is precisely the place they will not look.

The first is cheap enough to do next time any of the three is edited.

## One smaller instance of the same thing, recorded here rather than separately

`assets/sprites/cell.png` - the template's reference sprite, which exists so the
pipeline ships with something to draw - now arrives in reveal-or-die's
`assets/sprites/` and joins that game's texture atlas. 125 bytes, one unused
frame, and deleting it buys a modify/delete conflict on a BINARY file, which is
the most annoying shape there is to re-resolve. Left for that reason. Worth
knowing before somebody wonders why a maze game's spritesheet has a grid cell in
it.
