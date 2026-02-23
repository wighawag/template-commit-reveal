import {derived, type Readable} from 'svelte/store';
import type {DeploymentsStore} from './types';
import {getBigIntPowerOf10} from '../utils/math';

export type Costs = {
	maxCommitGas: bigint;
	maxRevealGas: bigint;
	maxActionCost: bigint;
	stippend: bigint;
	price: bigint;
	creditsDivider: bigint;
};

export type CostsStore = Readable<Costs>;

export function createCostStore(deployments: DeploymentsStore): CostsStore {
	return derived([deployments], ([$deployments]) => {
		const maxCommitGas = 100_000n;
		const maxRevealGas = 5_000_000n;
		const maxActionGas = maxCommitGas + maxRevealGas;
		const maxActionCost =
			BigInt($deployments.chain.properties.expectedWorstGasPrice) *
			maxActionGas;
		const stippend = maxActionCost * 100n; // 100 turn, we need to show
		const price = BigInt(
			$deployments.contracts.AvatarsSale.linkedData.paymentAmount,
		);
		const creditsDivider = getBigIntPowerOf10(maxActionCost);
		return {
			maxCommitGas,
			maxRevealGas,
			maxActionCost,
			stippend,
			price,
			creditsDivider,
		};
	});
}
