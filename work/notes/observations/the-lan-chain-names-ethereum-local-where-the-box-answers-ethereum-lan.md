---
title: The LAN chain's RPC url says ethereum.local, and the box's DNS answers ethereum.lan
type: observation
status: spotted
spotted: 2026-11-05
relates-to: contracts/rocketh/config.ts (chains[19216801].info.rpcUrls), contracts/.env (ETH_NODE_URI_lan), ethereum-lan-node README
---

# The LAN chain names a host the box does not answer

Found by stratagems' step L3 (its plan, `work/plans/join-template-commit-reveal.md` on its `main` since 2026-11-05, decision L3-17), while taking this template's LAN chain properties.

`contracts/rocketh/config.ts` here declares chain 19216801 with `rpcUrls: {default: {http: ['http://ethereum.local:8545']}}`. ethereum-lan-node's README says its DNS answers `ethereum.lan`, and stratagems has used `http://ethereum.lan:8545` since its step L2 (where a deploy from a laptop on the box's hotspot reached the node by that name). The packaged build does not depend on it (`web/.env.lan` is same-host, `//:8545`), so nothing breaks on a box today; what the url misleads is a deploy or a script run from a laptop, and any wallet offered the chain's info.

Not verified on a box here: only the README and stratagems' L2 rehearsal say which name answers. Worth checking against the box (`getent hosts ethereum.lan ethereum.local` on its hotspot) before changing it, and then changing it at its home (jolly-roger, where `nix/lan.nix` and the chain entry came from) so every game gets it.

**Update 2026-11-11**: the LAN package moved to ethereum-lan-node (`lib.mkRockethGame`), whose export described the chain with the same `ethereum.local`; it says `ethereum.lan` since ethereum-lan-node e9032da. Still here, measured on `main` the same day: `contracts/.env` line 11 (`ETH_NODE_URI_lan`) and `contracts/rocketh/config.ts` line 173.
