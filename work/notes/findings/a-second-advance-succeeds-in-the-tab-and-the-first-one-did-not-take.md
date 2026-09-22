---
title: In a browser, the advance that opens the reveal phase succeeds, emits its event, and leaves the cycle in the commit phase
type: finding
status: CLOSED 2026-09-23. Diagnosed here, fixed upstream in webevm 0.6.0 (its ADR 0012, "one request at a time"), verified here against 0.6.0 with the same reproduction, and re-measured. `MOST_SEATS` moves 5 -> 10.
spotted: 2026-09-22
relates-to: work/specs/proposed/games-on-this-foundation.md (Phase 6, the lobby), web/src/lib/offline-seats.ts (MOST_SEATS), web/src/lib/game/core/advance.ts, contracts/src/game/internal/UsingGameInternal.sol, web/src/lib/embedded/node.ts
---

# Two `advanceCycle` transactions open the same reveal phase, and the first one did nothing

**What this is about.** The offline world now has a lobby, so a player can sit down at a table of three to five. The plan asked whether a round degrades LINEARLY with the number of seats, since the world acts for its players in one sequential pass and N seats is 2(N-1) transactions in series. The answer is that it does not degrade linearly, it does not degrade with transactions at all, and what it actually degrades with is a lost state write.

**And the lost state write now has a cause.** `webevm` executes an `eth_call` and a transaction against ONE state manager with ONE checkpoint stack, and nothing serialises them. A read that opens its checkpoint while a transaction is mid-execution takes that transaction's `commit()` into its own overlay and then `revert()`s it. The transaction succeeds, emits its logs, is mined into a block, and writes nothing. See "The mechanism" below; everything above it is the original observation, unchanged, and everything below it is new.

**AND IT IS FIXED.** `webevm` 0.6.0 queues every public entry point of a node onto a single promise chain, so one node runs one piece of work at a time. Verified here rather than taken on trust, and re-measured; see "Verified against 0.6.0" at the bottom, which is also where one claim this note made is withdrawn.

## The measurement

Headless chromium, production build (`pnpm web:build localhost` then `vite preview`), five runs per row, load 1.3 to 2.1. A ROUND is the human's commit, an advance, every reveal, and a second advance.

| seats | transactions in a round | a round |
|---|---|---|
| 3 | 6 | 114-237 ms |
| 4 | 8 | **1.33 s** first, then 224-230 ms |
| 5 | 10 | **1.32 s** first, then 210-273 ms |
| 6 | 12 | **3.8-4.4 s**, every round |
| 8 | 16 | **3.8-4.4 s**, every round |

A transaction on a chain in a tab costs 15 to 20 ms, so the arithmetic says sixteen of them is a third of a second. The table is a staircase in whole POLL INTERVALS instead: one second is the advance client's backstop poll and the played players' own, and two seconds is `RETRY_BASE_MS` in `game/core/advance.ts`. 1.33 s is one lost advance; 4.3 s is one lost advance plus one refused advance's backoff.

Boot and restore are flat across the same range (332-370 ms and 178-211 ms at three seats, 353-364 ms and 218-233 ms at eight), which is worth stating because it rules out the obvious suspect: provisioning is per seat, it buys a stake through the real sale for each one, and it costs nothing measurable.

**What the seat count actually varies is now known, and it is not the seats.** It is how much POLLING TRAFFIC is in flight while the world's writes execute. More seats means more members to read for, more commits and reveals to overlap with, and therefore a higher chance that some ordinary read is inside its checkpoint at the moment an advance commits. The staircase is that probability crossing one; it is not a cost that scales with transactions, which is exactly why it never looked like one.

## What is actually happening, read off the chain

Instrumented in the page: subscribe to `cycleAdvance`, and after every attempt read `getCycle` and `getAttendance` repeatedly. At five seats, with all five committed:

```
63ms  advance Advancing
77ms  advance Idle            <- success: the receipt is not reverted
79ms  after: blk 20 c2 commit 5/5 rev 0
      ... eleven more reads over 300ms, all "c2 commit 5/5" ...
955ms advance Advancing       <- the one-second backstop poll
980ms advance Idle
985ms after: blk 22 c2 reveal 5/5 rev 1
```

And the blocks, with their logs:

```
blk 19  makeCommitment   success
blk 20  advanceCycle     success   CycleAdvanced(cycleNumber=2, commiting=false)
blk 21  advanceCycle     success   CycleAdvanced(cycleNumber=2, commiting=false)
blk 22+ reveal x5
blk 27  advanceCycle     success   CycleAdvanced(cycleNumber=3, commiting=true)
```

So **two transactions both took the commit branch of `_advanceCycle` and both emitted the event**, 890 ms apart, and only the second one's write is visible afterwards. The first one is not reverted, is not out of gas, and its event is in its own receipt.

At six seats and above the mirror image also appears: an `advanceCycle` sent after every reveal has landed REVERTS (with `StillWaitingToReveal`, on a state that reads 6 revealed of 6 committed), which starts the framework's exponential backoff and costs the extra two seconds. The next attempt succeeds.

## Why it is not the contract, and not the client

**Not the contract.** The same contract, the same deployment data, the same webevm, driven under NODE (`vitest --project server`, five enrolled members, all committed) advances once and then refuses:

```
advance 0: status=success blk=19 before=2/true after=2/false
advance 1: ContractFunctionRevertedError: StillWaitingToReveal(0, 5)
```

which is exactly right. `_advanceCycle` reads `_cycle()`, and `_cycle()` under `Manual` returns the stored `commiting` flag, so a second advance in the reveal phase cannot take the commit branch.

**Not `advancePermitted`, and not the backoff.** The client-side mirror of the guards refuses silently and records no failure, so it cannot produce a backoff on its own; and the client only re-sent because the chain kept telling it the phase had not moved.

**Not a race between two `check()` calls.** There is a real hole there - `check()` awaits `readAttendance()` before calling `push()`, and `push()` does not re-test `inFlight` - but the two advances here are 890 ms apart, and the second is the backstop poll firing because the first appeared not to work. Repeated fresh reads in between (a dozen over 300 ms) all say the phase is still commit, before any second send exists.

**And it was never "the reads are lying".** That was the third hypothesis worth separating, and it is dead twice over. The reproduction below reads storage LIVE after the fact and sees the old value, and it loses a plain transfer's NONCE, which no read cache can invent; and a LATER transaction executes against the pre-transaction state and takes the commit branch, which a stale read cannot cause. The reads are honest. The write is gone.

## The mechanism

`webevm`'s default engine makes a read pure by wrapping it in a state-manager checkpoint (`src/engine.ts`, `createEthereumjsEngine.call`):

```js
await stateManager.checkpoint();
try { return await evm.runCall(...); }
finally { await stateManager.revert(); }
```

That is correct for a read taken ALONE, and the comment above it explains why the EVM requires it. What nothing in the node guarantees is that a read is ever alone. `createNode`'s dispatcher has no queue, no lock and no serialisation of any kind (`src/node.ts`): `eth_sendRawTransaction` goes straight to `executeAndMine`, which `await`s `engine.transact` (`runTx`), and `runTx` in turn checkpoints, executes, and commits. Both halves are `async`, `@ethereumjs/evm` yields to the microtask queue while it interprets, and both use the SAME `SimpleStateManager` stack.

So this interleaving is reachable, and it is what a browser with pollers in it does all day:

```
tx   checkpoint        (stack: [base, tx])
call checkpoint        (stack: [base, tx, call])   <- the read arrives mid-execution
tx   write             -> lands in the TOP overlay, which is the CALL's
tx   commit            -> merges the top into the one below and pops
call revert            -> pops that merged level: the transaction's write is gone
```

`commit()` merges downward and `revert()` discards; neither knows who opened the level it is acting on. Six lines with no node at all reproduce it:

```js
const sm = new SimpleStateManager();
await sm.putAccount(a, new Account(0n, 0n));
await sm.checkpoint();                      // the transaction
await sm.checkpoint();                      // an eth_call, inside it
await sm.putAccount(a, new Account(7n, 0n)); // the transaction writes
await sm.commit();                           // the transaction commits
await sm.revert();                           // the eth_call reverts
(await sm.getAccount(a)).nonce  // 0, and it should be 7
```

The node builds the receipt, the logs and the block from what the engine RETURNED, not from what survived in state, which is why the transaction still reports success and still carries `CycleAdvanced`. A receipt here is evidence that a transaction EXECUTED; it is not evidence that its writes are still there.

## The reproduction

No app, no context, no players, no pollers, no Svelte, no game contracts: a chain in the tab, one contract of 49 bytes, one transaction, and one read-only `eth_call` in flight while it executes. Bundled with esbuild and run in headless chromium.

```js
import {createNode} from 'webevm';
import {privateKeyToAccount} from 'viem/accounts';

const account = privateKeyToAccount('0x59c6...690d');            // hardhat #1
const COUNTER = '0x600f600c600039600f6000f360005460010160005560006000a000';
// runtime: sstore(0, sload(0) + 1); log0(0, 0)
const READER  = '0x6005600c6000396005' + '6000f3' + '6000545000';
// runtime: sload(0); pop   -- the concurrent read writes NOTHING

const afterTicks = (n, fn) => {
  let p = Promise.resolve();
  for (let i = 0; i < n; i++) p = p.then(() => {});
  return p.then(fn);
};

const node = await createNode({
  chainId: 31337,
  miningConfig: {type: 'auto'},
  initialBalances: {[account.address]: 10n ** 21n},
});
// ... deploy COUNTER and READER with two ordinary transactions ...

const before = await node.request({
  method: 'eth_getStorageAt', params: [counter, '0x0', 'latest'],
});
const txP = send({to: counter, data: '0x', gas: 100000n});   // eth_sendRawTransaction
const readP = afterTicks(16, () => node.request({
  method: 'eth_call', params: [{to: reader, data: '0x'}, 'latest'],
}));
const [tx] = await Promise.all([txP, readP]);
```

In chromium, minified bundle:

```
CONTROL: no read in flight
  status=0x1 logs=1 slot0 0 -> 1
  status=0x1 logs=1 slot0 0 -> 1
  status=0x1 logs=1 slot0 0 -> 1
ONE read-only eth_call in flight, by tick offset
  d=0..60: ................XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ONE EXAMPLE IN FULL (offset 16):
  receipt status  : 0x1
  receipt logs    : 1   (the contract's log0 IS there)
  mined in block  : 3
  storage slot 0  : 0x00..00 -> 0x00..00
  VERDICT         : the transaction succeeded and did not write
```

One read. Not a burst, not a crowd: **one ordinary `eth_call`, overlapping one ordinary transaction, is enough**, deterministically, at every offset from 16 ticks onwards.

## Which hypothesis it supports, and which it kills

The two to separate were CONCURRENCY (something in flight at the same moment) and VOLUME (how many transactions the chain has seen, or how many accounts have sent). Varied one at a time, under node so the scan is cheap:

| what was varied | result |
|---|---|
| 60 transactions from one sender, strictly sequential | 60/60 landed |
| 40 transactions from 8 senders, strictly sequential | 40/40 landed |
| 1 transaction, 1-3 `eth_blockNumber` in flight | 0 lost |
| 1 transaction, 1-3 `eth_getBalance` in flight | 0 lost |
| 1 transaction, 1 `eth_call` in flight | **lost, at every offset in a wide window** |
| 2 transactions, 2 senders, overlapping | **one of the two writes lost, both receipts success** |

**VOLUME IS DEAD.** Nothing degrades with the number of transactions or the number of senders as long as nothing overlaps. The chain does not get tired.

**CONCURRENCY IS THE ANSWER, AND IT IS NARROWER THAN "CONCURRENCY" IN ONE WAY AND WIDER IN ANOTHER.** Narrower: pure state reads (`eth_getBalance`) and metadata reads (`eth_blockNumber`) never lose a write however many are in flight, because they never touch the EVM and never checkpoint. What loses a write is an operation that EXECUTES - for reads that is `evmCall`, i.e. `eth_call`, `eth_estimateGas` and `eth_fillTransaction` (`src/node.ts` cases at 1439, 1444, 1451). `eth_estimateGas` is the worst of the three: it is a binary SEARCH, so one estimate is a whole sequence of checkpoint/revert pairs and a correspondingly wider window.

Wider: it is not about READS at all. **Two TRANSACTIONS overlapping lose a write the same way.** Two senders, one contract, the second send delayed by d ticks, counter expected to reach 2:

```
d=0..60:  11111111111111...............................................
  slot=1  rejected=0  receipts=0x1,0x1   x14
  slot=2  rejected=0  receipts=0x1,0x1   x47
```

Fourteen of sixty-one offsets end with BOTH transactions reporting success, both holding a receipt, and the counter incremented ONCE. So the rule is not "a read corrupts a write"; it is **any two EVM executions overlapping corrupt each other**, because they share one checkpoint stack. A read is merely the common case, since pollers read constantly and a browser has several of them.

**It is not the deployment's and it is not the router's.** The smallest version of this needs no contract at all: a plain ETH transfer with two `eth_call`s in flight loses its own NONCE, so the next transaction from that sender is refused with "nonce too high" and the chain stops accepting anything from it. No storage slot, no route, no proxy, no selector. The node control in the section above had already made this unlikely; this makes it impossible.

## Two things that are worse than a lost write

Both fall out of the same stack and both were measured, because "the transaction was lost" is the kindest reading and it is not the only one.

**State can TEAR.** A writes its own slot, then CALLs B, which writes its own. With one read-only `eth_call` in flight, scanning the offset 0..90:

```
d=0..90: ...........TTTTTTTTTTTTTTTT....TTTTTTTTTTT..................TTTTTTTTTTTTTTTTTTTTTTTTTTTXXXX
  ok            33      both writes landed
  TORN a=1 b=0  27      the outer frame's write kept, the inner CALL's discarded
  TORN a=0 b=1  27      the reverse
  LOST-whole     4
```

`a=1 b=0` is a state no execution of A could produce, because the EVM checkpoints per message frame and the read's checkpoint can land between an inner frame's checkpoint and its commit. So the failure is not "a transaction is atomic and sometimes lost". It is "a transaction's writes are cut at an arbitrary frame boundary". That is very likely what the six-seat `StillWaitingToReveal` against an apparently complete tally is: a reveal whose accounting is half applied.

**A read can WRITE.** Point the concurrent `eth_call` at a contract that SSTOREs, and the counter comes back at 2 after a single transaction incremented it: the call's own write was committed rather than reverted, because the TRANSACTION's `commit()` popped the call's overlay into the committed level. `eth_call` is documented everywhere as having no effect on state, and here it can leave one behind permanently.

## The verdict

**It is webevm's.** Specifically: the node has no serialisation between requests, and the default engine's `call` makes a read pure by checkpointing a state manager it shares with transaction execution. Either half alone is defensible; together they mean any `eth_call` that overlaps a transaction can discard, tear or forge committed state.

Filed as: `eth_call` concurrent with `eth_sendRawTransaction` discards the transaction's state write. Smallest input, the six `SimpleStateManager` lines above; smallest input through the public RPC surface, one transaction and one `eth_call`, shown above.

**The remedy is a serialisation point, and it belongs in the node** - one promise chain across `request`, so that no execution ever opens a checkpoint while another is between its own. It has to cover BOTH directions (read-vs-write and write-vs-write), which is an argument for putting it at `request` rather than around `engine.call`. A consumer can buy the same thing by queueing what `startEmbeddedNode` hands out (`web/src/lib/embedded/node.ts` builds that EIP-1193 object already and is the natural place), and that is worth doing here if upstream is slow, but it is a workaround: anything holding the node directly, including `@rocketh/web` during the deploy, would bypass it.

**What must NOT be done about it**, and the reasoning is unchanged from the version of this note that predicted it: making the advance client verify that the phase moved and retry would hide a lost state write inside `web/src/lib/game/core/advance.ts`, which every repo in this tree inherits, and would leave the same defect corrupting everything else the world writes. The same goes for any per-call retry.

## What this costs the tree, beyond the lobby

It is why `MOST_SEATS` is five, and the number does not move: the measurement is unchanged, and only the reason is sharper. `offline-seats.ts` now says what the ceiling is a proxy for (read/write overlap, not seats) and what would justify raising it (the node serialising, not a client retry).

It is also a warning about a claim this tree has relied on. An offline world exists so the game can be exercised end to end without a node, and the claim underneath it is that what the client sees in a tab is what it would see anywhere. **A receipt that is not reverted is not, in this environment, evidence that the state moved** - and after the tearing measurement above, it is not evidence that the state moved CONSISTENTLY either. Everything that has been measured in the tab so far involved one member and six transactions a round, which is exactly the regime where this rarely fires.

## Verified against 0.6.0

Upstream took the verdict and put the serialisation point exactly where this note argued it had to go: in `createNode`, above both engines and below no transport. Its ADR 0012 records the decision, and it went further than asked in one place worth knowing about - `eth_getBalance` and `eth_getTransactionCount` mid-execution were ALSO reporting state from a block that did not exist yet (27 of 32 offsets), so every request queues rather than only the ones that execute. That was the open question this note handed over, and the answer is measured rather than assumed.

**Every scan in this note was re-run against 0.6.0 in this repo, and all of them are clean:**

| scan | 0.5.0 | 0.6.0 |
|---|---|---|
| one read-only `eth_call` overlapping one increment, chromium, d=0..60 | 45 of 61 offsets lost the write | **0 of 61** |
| the same in node, 1/2/3 calls, d=-20..60 | lost from d=-4 onwards, all three | **0 of 81, all three** |
| state torn at a frame boundary, d=0..90 | 54 torn, 4 wholly lost | **0 of 91** |
| the overlapping `eth_call` pointed at a contract that SSTOREs | the read's own write committed | **0 of 91** |
| two overlapping TRANSACTIONS, d=0..60 | 14 of 61 lost a write, both receipts success | **0 of 61** |
| volume controls (60 from one sender, 40 across eight, sequential) | clean | clean |

**The state manager itself is UNCHANGED, and that is worth knowing.** The six-line `SimpleStateManager` sequence at the top of "The mechanism" still returns nonce 0 where 7 was committed. The fix is a lock above the state manager, not a repair to it, so anything that reaches PAST `node.request` - holding the state manager, or an engine, directly - still has the sharp edge. Nothing in this repo does.

## A CLAIM THIS NOTE GOT WRONG, withdrawn here

While diagnosing this, `offline.e2e.ts` was found failing 4 of 4 on a pristine `main`, with the delegation store stalled at `Unloaded`. It was written up as a SEPARATE finding, and the reasoning for separating it was explicit: this defect discards a state WRITE, so its symptom would be `refused` (a registration that did not stick) rather than `Unloaded` (a read that never started), and assuming one cause is how a diagnosis gets written for the wrong bug.

**That was wrong.** The only change was `webevm` 0.5.0 -> 0.6.0, and the same test now passes 4 of 4 in the same isolated run, in 777-833 ms. It was this bug all along.

The reasoning was sound and the conclusion was still wrong, which is the part worth keeping: a symptom's SHAPE is a weak signal about its cause when the mechanism can discard, tear or forge any write in the system, because at that point every downstream store is reading something that may never have existed. The correct instinct was the other half of the same note - that the two should not be merged without evidence - and the cheap evidence was one dependency bump away the whole time. **When a suspected cause has a candidate fix, TEST THE FIX AGAINST THE OTHER SYMPTOM before writing down why they are different bugs.**

## What this cost, and what it bought back

Re-measured against 0.6.0, the same way (headless chromium, production build, load ~1.1, five runs of six rounds, counting every steady round rather than quoting a range):

| seats | boot | a steady round | rounds over 500 ms |
|---|---|---|---|
| 3 | 348-350 ms | median 228 ms | 0/25 |
| 5 | 318-364 ms | median 221 ms | 0/25 |
| 8 | 339-352 ms | median 223 ms | 0/25 |
| 10 | 350-377 ms | median 232 ms | **0/56** |
| 11 | 353-836 ms | median 231 ms | 4/56 |
| 12 | 824-841 ms | median 235 ms | 2/25 |
| 16 | 833-845 ms | median 330 ms | 5/25 |
| 19 | 823-846 ms | median 334 ms | 10/25 |

The staircase is gone, the anomalous first round is gone, and the median is flat at about 230 ms from three seats to twelve - which is the arithmetic the lobby predicted before any of this. **`MOST_SEATS` goes from 5 to 10**, ten being the largest table at which every round measured was steady (56 of 56, against 4 of 56 already slow at eleven).

What degrades above ten is the OLD SHAPE WITHOUT THE OLD CAUSE, and it should not be mistaken for a relapse: a pass over that many members occasionally outlasts the poke that would have ended the round, so the round waits out a one-second backstop. That is a latency budget, not a lost write, and a bigger table should be bought by spending on the poke rather than by raising the constant.

## What has NOT been done

- **The `inFlight` hole in `createCycleAdvance` is still open.** A second `check()` entering while the first is between its read and its push can send a duplicate advance. It is real, it is small, and it was never this: deliberately left alone so this diagnosis stayed readable, and still worth closing on its own merits.
- **No queue was added to `embedded/node.ts`,** and none should be now: the node serialises itself, so a second lock would be a second thing to keep true.
- **The worker-hosted node is still not measured.** It matters less now (the lock is inside the node, which is where a Worker puts it too) but the main-thread cost 0.6.0 introduces - a cheap read issued during a long `eth_estimateGas` now waits for it, measured upstream at 208 ms against 0.1 ms - is exactly what moving the node into a Worker is for. If a round ever needs the main thread back, that is the lever.
