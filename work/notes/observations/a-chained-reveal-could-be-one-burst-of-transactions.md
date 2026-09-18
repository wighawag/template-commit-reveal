---
title: A chained reveal is sent one chunk at a time, and nonces mean it need not be
type: observation
spotted: 2026-09-17
relates-to: web/src/lib/game/core/reveal-window.ts, web/src/lib/placement/commit-reveal.ts, contracts/rocketh/config.ts (revealPhaseDuration), with/nft-identity
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

## MEASURED, 2026-09-18, and the burst was not the biggest term

Against a local node mining on a 1s interval (never the instant-mining `test`
network, which would make a sequential client look free), at the shipped 10s
reveal phase and four actions per reveal. `k` is chunks; "landed" is chunks that
actually resolved before the window shut.

| k | sequential @ 4000ms poll | burst | sequential @ 100ms poll |
| --- | --- | --- | --- |
| 1 | 4,026ms, 1/1 | 4,020ms, 1 block | 853ms, 1/1 |
| 2 | 8,045ms, 2/2 | 4,018ms, 1 block | 1,904ms, 2/2 |
| 4 | 12,079ms, **3/4** | 4,022ms, 1 block | 3,916ms, 4/4 |
| 8 | 12,075ms, **3/8** | 4,024ms, 1 block | 7,951ms, 8/8 |
| 13 | 12,076ms, **3/13** | 4,028ms, 1 block | 9,867ms, **9/13** |

`with/nft-identity` reproduces every timing, and scales: 104 chunks (416
actions) landed in ONE block, 29,888,710 gas against a 60,000,000 limit, all 104
broadcast in 98ms.

**The burst works, which was the thing actually in doubt.** Chunk `i + 1` is
checked against a head chunk `i` writes, and 104 of them executed in nonce order
inside a single block with every hash check passing. Nonce ordering holds WITHIN
a block, not merely between blocks.

**But the client's own poll interval was the binding term, not the send
pattern.** The app builds its `publicClient` with no `pollingInterval`
(`core/connection/remote.ts`), so it ran on viem's 4,000ms default, and the cost
of one sequential chunk is `max(block time, poll interval)`. That is why only
THREE chunks fitted a ten-second phase. Sizing the poll from the phase takes it
to nine, costs nothing, and needs no nonce work, no batch shape and no new
failure reporting. Done in `game/core/reveal-window.ts`.

**BUILT, 2026-09-18, and not in the shape this note proposed.** The chunks are
broadcast one after another WITHOUT waiting for each receipt, and the wait
happens once at the end - not signed in advance at hand-computed nonces.
Measured at 13 chunks on a 1s chain: 10,282ms sequential (and only 9 landed),
1,199ms pipelined, 1,040ms pre-signed. The pipelined version gives up 159ms and
keeps everything the pre-signed one gives up:

- **A rejected send strands nothing.** This is the reason, and it is the hazard
  this note already named: on the local node a rejected send burns a nonce
  permanently, so in a pre-signed burst every chunk behind it holds a nonce the
  chain will never reach - a whole turn lost rather than one transaction.
  Awaiting each broadcast stops the loop before the rest are built.
- **Failure attribution is exact**, which this note listed as work to be done.
  It needed none: the loop knows which broadcast failed.
- **The nonce machinery stays one-dispatch-at-a-time**, so the `send()` batch
  shape this note asked for was not needed either.

Broadcasting is simply not the expensive part: 13 chunks go out in 168ms
awaited, 23ms pre-signed, both negligible beside one 1,000ms block. The two
pieces of work this note predicted - sequential nonces out of the cache, and a
batch shape for `send()` - were both consequences of the pre-signed design and
neither was written.

**What it would have bought, for the record**, since the deferral below was
written before the build:

- **It cannot be built without a gas LIMIT, which is the credits work.**
  Measured directly: estimating chunk 1 succeeds (537,642 on `main`, 366,002 on
  `with/nft-identity`); estimating chunk 2 before chunk 1 lands FAILS, because it
  is an estimate of a reverting call. Deriving the limit from chunk 1's estimate
  is not safe either - a chunk of four fresh cells in four new zones costs far
  more than four warm ones. So item 1 depends on item 4, which is the reverse of
  the order this was queued in.
- **The failure story is worse but cheap.** A burst of 8 whose first chunk
  carries a wrong secret: 8/8 revert in one block for 338,486 gas total, about
  42k per doomed chunk, less than one successful chunk for all eight. So the
  objection is about REPORTING which of `k` failed, not about cost.
- **The harness proved the hazard on itself.** A fixed 1,500,000 gas limit was
  under the real cost at `actionsPerReveal` 16, so every chunk burned the limit
  and reverted out of gas. That is precisely what "a limit that is too low is a
  missed reveal, not a slow turn" means, arriving in a measuring script.

**The sentence this note used to end on was too narrow, and it was ours.** "The
sequential version is MEASURED to fit: two chunks land inside a ten-second reveal
phase in the e2e suite" is true and reads as a general statement. The fit was
only ever measured at the size the suite exercises. The actual ceiling was three
chunks - twelve actions - and nothing in the tree exercises four, which is why a
sixteen-action turn silently costing a stake had never shown up in a suite.

**What is NOT settled: a real testnet.** This is one local EDR node, no mempool
competition, no reorgs, one sender. It answers "does the pattern work and is it
faster" and not "how does a 104-transaction burst behave on a congested public
chain". The EDR nonce-burn hazard is also EDR-specific, and in a burst it strands
a whole turn rather than one transaction.

**And `eth_sendRawTransactionSync` is a third route nobody has taken.**
`contracts/rocketh/config.ts` already carries `supportsSendRawTransactionSync`
per chain, it already reaches the client in the generated `deployments.ts`, and
jolly-roger's `dispatch-guard.ts` already wraps the sync send variants. Nothing
reads the flag. On a chain that supports it the poll disappears entirely and a
send becomes one request that returns on inclusion. **It cannot be exercised
here**: the local node answers `Method eth_sendRawTransactionSync is not
supported`, so the 31337 entry declaring `false` is correct and honest, and
wiring it would be untestable code in the reveal path. That is the argument for
not doing it yet rather than an oversight.
