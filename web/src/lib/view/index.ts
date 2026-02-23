import type {OnchainState} from '$lib/onchain/types';
import {derived, type Readable} from 'svelte/store';
import {computeUpdatedLocalState, type LocalState} from '../private/localState';
import type {TypedDeployments} from '$lib/core/connection/types';

export type ViewState = {
	epoch: number;
};

export type ViewStateStore = Readable<ViewState>;

export function createViewState(
	onchainState: Readable<OnchainState>,
	localState: Readable<LocalState>,
	deployments: TypedDeployments, // TODO use store
) {
	const viewState = derived(
		[onchainState, localState],
		([$onchainState, localStateFromStore]): ViewState => {
			const epoch = $onchainState.epoch;
			const $localState = computeUpdatedLocalState(localStateFromStore, epoch);

			return {
				epoch: $onchainState.epoch,
			};
		},
	);

	return viewState;
}
