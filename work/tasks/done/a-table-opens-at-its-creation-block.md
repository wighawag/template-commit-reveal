---
title: A table opens at the block it was created in, and an invite link is checked before its page is composed
slug: a-table-opens-at-its-creation-block
spec: games-on-this-foundation
blockedBy: [a-table-ends-and-carries-the-games-options]
---

# A table opens at the block it was created in

Built from stratagems' port plan, step T2 (`main`, `work/plans/join-template-commit-reveal.md`, section "Step T2"), its decisions T2-1 to T2-9 taken with the maintainer on 2026-11-12.

**The defect**: a table's deployment record was its lobby implementation's record with the address swapped (`TableLobby.deploymentsAt`), so it carried the implementation's `startBlock`, and anything reading the table's history from its record (the indexer at `with/indexer`) started at the implementation's deployment: a table created months later folded every block in between. And an invite link composed a context for any address (`tableFromParam` checks only the shape), where a stake approves that contract.

**The decision**: the roster records its block, and a page at a table RESOLVES the table before composing its context, so the record is true and the link is checked in one place. Rejected: an asynchronous indexer source (it fixes one reader and leaves the record false), the block in the link (whoever shares it could hide history), a factory mapping (an extra storage write), scanning for `GameCreated` (range-limited).

## Done, 2026-11-12, on local preview branches `pt2/*`, NOT pushed

**`main`** (from `origin/main` dae11875):

- `2eda89ac` the test first (failing): `CommitRevealRoster.test.ts`, the roster records the block it was opened in, a later block than the deployment's.
- `59188017` the base: `Roster` gains `uint48 openedAtBlock` (still one slot: 31 of 32 bytes), written by `CommitReveal.openRoster` from `block.number` (its NatSpec: the chain's own block on Ethereum and OP-stack chains, an L1 approximation on Arbitrum); `getRoster` answers it. `Lobby.test.ts`: a table created blocks after the deploy opens at its creation block.
- `74f9353b` the client: `readRoster` reads it; `resolveTable(reader, address, implementation)` answers a table (`ResolvedTable`: address and `openedAtBlock`) when the address holds the 45-byte EIP-1167 clone of the game's implementation (`cloneCodeOf`) with a roster opened, `not-a-table` otherwise, and throws when the chain cannot be read; `TableLobby` gains `implementation(deployments)` and `deploymentsAt` takes the resolved table, both required, so a game that does not set the start block fails to compile at the cascade; the reference game's `placement/table.ts` sets `Game.startBlock`. The gate, `$lib/context/table-gate.ts` and `TableGate.svelte`: `openContext()` is `Ready` at once, synchronously, at no table (and on the server, which sees no query, so ADR-0002's prerender is untouched); at a table `Opening`, then `Ready` with `createContext({table})`, `NotATable` (the reason, a link to the lobby) or `Unreachable` (a retry). Its reader is the app's node (the URL the core resolves) or the injected wallet on the deployment's chain. The layout renders the gate until `Ready` (25 lines changed).
- `df22e3ca`, `dc4b08bc` `table-link.e2e.ts`: a link to an empty address and to a contract of the deployment are refused before any control, with no context composed and no hydration complaint. Written against the root page and the gate only, so it is the same in every game that has tables.

**Nodes**: every `with/*` node merged clean except `with/nft-identity`, whose `Lobby.test.ts` names a player by its avatar (one conflict, both sides kept), carried into `with/all` by its recorded resolution. `$lib/indexer` needed nothing: the record is true now.

**Descendants**: reveal-or-die takes the base and the client (its `Lobby.test.ts` and placement files omitted as before) and omits `table-link.e2e.ts` beside `table.e2e.ts` (it has no `lobby`, so the gate never opens); bomber-world by its stem, its `.offshoot-omissions` kept as its own; stratagems sets `Stratagems.startBlock` and `NoRewards.startBlock` (etherfold starts at the source's earliest).

## Measured

- Contracts: `main` **86 passing** (from 84); every node's suite passes (`with/nft-identity` and `with/all` 88).
- Unit: `main` **2054 + 84** (from 2042 + 84), `with/pixi-js` 2067, `with/nft-identity` 2064, `with/fuzd` 2096, `with/indexer` 2082, `with/all` 2077, `with/fuzd-pixi-indexer` 2137 (each + 84); reveal-or-die 2208 + 78, bomber-world 2298 + 78; check 0 errors and 0 warnings everywhere; dangling imports clean.
- e2e: `main` **61/61** (6.0 min, the two new cases included); `table.e2e.ts` and `table-link.e2e.ts` pass on `with/nft-identity` and `with/fuzd-pixi-indexer`.
- Gas: `createGame` 148,614 to 148,969 (+355, the wider packing; no new storage write).

## Surprises

- The rejected first design (an asynchronous indexer source) looked cheaper only because "an async context changes every route" was never checked: a table is a query, which no prerender sees, so the gate touches the layout and nothing else.
