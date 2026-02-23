import {derived, type Readable} from 'svelte/store';
import type {
	DeploymentsStore,
	TypedDeployments,
} from '$lib/core/connection/types';
import type {EpochConfig, EpochConfigStore} from '$lib/types';

function fromDeployment($deployments: TypedDeployments): EpochConfig {
	return {
		revealPhaseDuration: Number(
			$deployments.contracts.Game.linkedData.revealPhaseDuration,
		),
		commitPhaseDuration: Number(
			$deployments.contracts.Game.linkedData.commitPhaseDuration,
		),
		startTime: Number($deployments.contracts.Game.linkedData.startTime),
		commitTimeAllowance:
			Number($deployments.contracts.Game.linkedData.revealPhaseDuration) + 0.1,
	};
}

export function createEpochConfigStore(
	deployments: DeploymentsStore,
): EpochConfigStore {
	let lastValue: EpochConfig = fromDeployment(deployments.current);
	const store = derived([deployments], ([$deployments]) => {
		// console.log(
		// 	JSON.stringify(
		// 		$deployments.contracts.Game.linkedData,
		// 		(k, v) => {
		// 			if (typeof v === 'bigint') {
		// 				return v.toString();
		// 			}
		// 		},
		// 		2
		// 	)
		// );
		lastValue = fromDeployment($deployments);
		return lastValue;
	});

	return {
		subscribe: store.subscribe,
		get current() {
			return lastValue;
		},
	};
}
