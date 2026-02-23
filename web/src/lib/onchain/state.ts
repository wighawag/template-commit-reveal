import {createDirectReadStore} from '$lib/onchain/direct-read';
import type {CameraWatcher} from '$lib/core/render/camera';
import type {ZonesFetcher} from './zones-fetcher';
import type {PublicClient} from 'viem';
import type {EpochInfoStore} from '$lib/types';
import type {TypedDeployments} from '$lib/core/connection/types';

import type {OnchainState} from './types';

const defaultState = (): OnchainState => ({
	epoch: 0,
});

export function createOnchainState(params: {
	camera: CameraWatcher;
	deployments: TypedDeployments;
	zonesFetcher: ZonesFetcher;
	epochInfo: EpochInfoStore;
	publicClient: PublicClient;
}) {
	const {camera, deployments, zonesFetcher, epochInfo, publicClient} = params;
	const onchainState = createDirectReadStore<OnchainState>(
		{camera, epochInfo, publicClient, deployments},
		defaultState,
		async (zones, fromBlock, toBlock, expectedEpoch) => {
			const zoneData = await zonesFetcher.fetchZones(
				zones,
				fromBlock,
				toBlock,
				expectedEpoch,
			);

			if (!zoneData) {
				// the request has been dismissed
				return undefined;
			}

			const state: OnchainState = defaultState();

			const epoch = BigInt(zoneData.epoch);
			state.epoch = Number(epoch);

			return state;
		},
	);
	return onchainState;
}
