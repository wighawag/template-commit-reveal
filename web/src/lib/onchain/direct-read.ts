import type {TypedDeployments} from '$lib/core/connection/types';
import {TimeNotSyncedError} from '$lib/core/time';
import type {EpochInfoStore} from '$lib/types';
import {calculateVisibleZones} from 'template-commit-reveal-contracts';
import {logs} from 'named-logs';
import {get, writable, type Readable} from 'svelte/store';
import type {PublicClient} from 'viem';

const console = logs('onchain:read');

type Camera = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/**
 * Creates a reactive store that manages direct blockchain data fetching based on camera position.
 *
 * This function sets up an automatic data fetching system that:
 * - Monitors camera position changes to determine which blockchain zones are visible
 * - Fetches data for those zones when they change
 * - Handles epoch synchronization to ensure data freshness (epochs represent discrete time units)
 * - Automatically fetches new data when the epoch changes (indicating time progression and requiring fresh state)
 * - Automatically retries failed fetches
 *
 * The returned store provides a reactive interface to the fetched data and includes
 * an update method to force refresh the current data.
 *
 * @template T The type of data managed by this store
 * @param camera A readable store containing camera position and dimensions
 * @param defaultState Function that returns the initial/default state value
 * @param fetchFunction Function that fetches data for given zones and epoch.
 *                     Should return the data (T) or undefined if the request is obsolete
 *                     (e.g., due to epoch desynchronization and should be discarded).
 *                     The function receives:
 *                     - zones: Array of zone identifiers currently visible in the camera
 *                     - expectedEpoch: The epoch that was active when the request was initiated
 * @returns Object with subscribe method (for reactive data access) and update method (for manual refresh)
 */
export function createDirectReadStore<T>(
	params: {
		camera: Readable<Camera>;
		epochInfo: EpochInfoStore;
		publicClient: PublicClient;
		deployments: TypedDeployments;
	},
	defaultState: () => T,
	fetchFunction: (
		zones: bigint[],
		fromBlock: number,
		toBlock: number,
		expectedEpoch: number,
	) => Promise<T | undefined>,
) {
	const {camera, epochInfo, publicClient, deployments} = params;
	let $state: T = defaultState();
	let currentPredictedEpoch = epochInfo.now().currentEpoch;
	let lastZones: bigint[] | undefined;

	const _store = writable<T>($state, start);
	function set(state: T) {
		$state = state;
		_store.set($state);
		return $state;
	}

	function hasZonesChanged(zonesA?: bigint[], zonesB?: bigint[]) {
		if (!zonesA) {
			return true;
		}
		if (!zonesB) {
			return true;
		}
		if (zonesA == zonesB) {
			return false;
		}
		if (zonesA.length != zonesB.length) {
			return true;
		}
		for (let i = 0, l = zonesA.length; i < l; i++) {
			if (zonesA[i] != zonesB[i]) {
				return true;
			}
		}
		return false;
	}

	async function fetchState(zones: bigint[], expectedEpoch: number) {
		const {fromBlock, toBlock} = await epochInfo.getBlockRange();

		// Call the provided fetch function to get the data
		const state = await fetchFunction(zones, fromBlock, toBlock, expectedEpoch);

		if (!state) {
			// undefined state indicate that the request has been dismissed
			return;
		}

		// Check if this request is still valid (not superseded by a newer request)
		if (currentPredictedEpoch > expectedEpoch) {
			console.debug(
				`old request using epoch ${expectedEpoch} while we are now at epoch ${currentPredictedEpoch}, discarding...`,
			);
			return;
		} else if (currentPredictedEpoch < expectedEpoch) {
			throw new Error(`not possible, request is for a future epoch`);
		}

		set(state);
	}

	let timeout: NodeJS.Timeout | undefined;
	async function fetchUntilSuccess(zones: bigint[], expectedEpoch: number) {
		try {
			await fetchState(zones, expectedEpoch);
		} catch (err) {
			if (err instanceof TimeNotSyncedError) {
				const timeElapsed = performance.now() / 1000;
				const maxExpectedSyncDelay = 2;
				if (timeElapsed > maxExpectedSyncDelay) {
					console.error(
						`time not synced, even after ${timeElapsed} seconds`,
						err,
					);
				}
			} else {
				console.error(`failed to fetch state`, err);
			}
			const retryIn = 200; // TODO configure ?
			console.debug(`retrying in ${retryIn}`);
			timeout = setTimeout(fetchUntilSuccess, retryIn, zones, expectedEpoch);
		}
	}

	let unsubscribeFromCamera: (() => void) | undefined;
	let unsubscribeFromEpochInfo: (() => void) | undefined;

	function start() {
		unsubscribeFromCamera = camera.subscribe((camera) => {
			if (camera.width > 0 && camera.height > 0) {
				const newZones = calculateVisibleZones(camera);
				const zonesChanged = hasZonesChanged(lastZones, newZones);
				lastZones = newZones;
				if (zonesChanged) {
					// console.debug(`zones changed`, camera);
					fetchUntilSuccess(lastZones, currentPredictedEpoch);
				}
			}
		});

		unsubscribeFromEpochInfo = epochInfo.subscribe((epochInfo) => {
			if (epochInfo.currentEpoch != currentPredictedEpoch) {
				// console.debug(`epoch changed: ${epochInfo.currentEpoch} !== ${currentPredictedEpoch}`);
				currentPredictedEpoch = epochInfo.currentEpoch;
				if (lastZones) {
					fetchUntilSuccess(lastZones, currentPredictedEpoch);
				} else {
					console.debug(`camera not ready yet`);
				}
			}
		});

		return stop;
	}

	async function update() {
		console.debug(`force fetch`);
		if (lastZones) {
			await fetchUntilSuccess(lastZones, currentPredictedEpoch);
		} else {
			console.error(`camera not ready yet`);
		}

		return $state;
	}

	function stop() {
		if (unsubscribeFromCamera) {
			unsubscribeFromCamera();
			unsubscribeFromCamera = undefined;
		}

		if (unsubscribeFromEpochInfo) {
			unsubscribeFromEpochInfo();
			unsubscribeFromEpochInfo = undefined;
		}
		if (timeout) {
			clearTimeout(timeout);
		}
		// TODO set as IDle ?
		set(defaultState());
	}

	return {
		subscribe: _store.subscribe,
		update,
	};
}
