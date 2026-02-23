import type {TypedDeployments} from '$lib/core/connection/types';
import type {CameraControl} from '$lib/core/render/camera';
import type {
	LocalReadyState,
	LocalState,
	LocalStateStore,
} from '$lib/private/localState';
import type {MyEventEmitter} from '$lib/render/eventEmitter';
import type {EpochConfigStore, EpochInfo, EpochInfoStore} from '$lib/types';
import type {ViewState} from '$lib/view';
import {get, type Readable} from 'svelte/store';

type ReadyState = {
	step: 'Ready';
	epoch: number;
	$viewState: ViewState;
	$localState: LocalReadyState;
	$epochInfo: EpochInfo;
	timeup: boolean;
};
type CurrentState =
	| {
			step: 'Idle';
			$viewState: ViewState;
			$localState: LocalState;
			$epochInfo: EpochInfo;
			timeup: boolean;
	  }
	| ReadyState;

export function createOperations(params: {
	localState: LocalStateStore;
	epochInfo: EpochInfoStore;
	epochConfig: EpochConfigStore;
	viewState: Readable<ViewState>;
	cameraControl: CameraControl;
	deployments: TypedDeployments;
	eventEmitter: MyEventEmitter;
}) {
	const {
		deployments,
		localState,
		epochInfo,
		epochConfig,
		viewState,
		cameraControl,
		eventEmitter,
	} = params;
	function gatherState(): CurrentState {
		const $epochInfo = epochInfo.now();
		const {currentEpoch: epoch} = $epochInfo;

		const timeup =
			$epochInfo.type === 'manual'
				? false
				: !$epochInfo.isCommitPhase ||
					// TODO add a current field on EpochConfigStore
					$epochInfo.timeLeftInPhase <
						get(epochConfig).commitTimeAllowance - 0.2;

		localState.update(epoch);
		const $localState = get(localState);
		const $viewState = get(viewState);

		return {
			step: 'Idle',
			$viewState,
			$localState,
			$epochInfo,
			timeup,
		};
	}

	function startListening() {
		eventEmitter.on('clicked', (pos) => {
			// TODO
		});
	}

	function stopListening() {
		eventEmitter.removeAllListeners();
	}

	return {
		startListening,
		stopListening,
	};
}
