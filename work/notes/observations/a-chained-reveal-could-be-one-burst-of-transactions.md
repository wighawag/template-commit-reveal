---
title: A chained reveal is sent one chunk at a time, and nonces mean it need not be
type: observation
spotted: 2026-09-17
relates-to: web/src/lib/placement/commit-reveal.ts, contracts/rocketh/config.ts (revealPhaseDuration), with/nft-identity
---

# The reveal phase is sized for N round trips, and that is a client choice

## What is true today

A turn longer than `actionsPerReveal` is revealed in
`ceil(actions / actionsPerReveal)` transactions. The client sends them in order,
**waiting for each receipt before signing the next**, because chunk `i + 1` is
checked against a head that chunk `i` writes. So the reveal phase has to
accommodate that many sequential round trips, and the deploy config says so.

## Why it need not be sequential

Nonces are per account and strictly ordered: a transaction at nonce `n + 1`
cannot execute before the one at `n`. So all `k` chunks could be signed and
broadcast in **one burst** and would still resolve in exactly this order, in the
same block or in consecutive ones. The cost of a long turn would stop being `k`
round trips inside the window and become block space.

**That is worth more on the identity branches than on `main`.** There a placement
costs nothing, so a turn is unbounded, so the number of reveals is unbounded, and
no reveal window is long enough for the worst case - the window cannot be the
answer. A burst replaces an unbounded number of round trips with a bound that
actually exists.

## Three reasons it is sequential today, none of them "it would not work"

- **The failure story gets worse.** If chunk `i` reverts, every later chunk is
  still mined, still reverts, and is still paid for. `send()` reports one failure
  at a time; a burst needs "which of `k`", and the submission's `Error` state
  carries one `during` and one message.
- **The nonce and in-flight machinery is one-dispatch-at-a-time here.** That
  matters more than it sounds: on the local node a REJECTED send burns a nonce
  permanently (`a-rejected-transaction-burns-a-nonce-on-edr.md`), and in a burst
  one burned nonce strands every chunk behind it - a whole turn rather than one
  transaction.
- **The sequential version is measured to fit.** Two chunks land inside a
  ten-second reveal phase in the e2e suite, on every node, at four actions per
  reveal.

## What would settle it

A measurement, not an argument: sign and broadcast `k` chunks without waiting,
against the local node and against a real testnet, and record how long the last
one takes to land versus `k` round trips. If the burst is meaningfully faster, the
work is bounded and known - the nonce cache handing out `k` sequential nonces,
`send()` growing a batch shape, and the submission's progress counting landings
rather than sends (which it already does).

Until then the honest statement is the one now in both files: a reveal phase too
short for a long turn is **two** things to weigh rather than one, and the factor
of `k` belongs to this client rather than to the chain.
