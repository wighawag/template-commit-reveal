import type {EpochInfo, EpochInfoStore} from '$lib/types';
import type {SyncedTimeStore} from '$lib/core/time';
import {logs} from 'named-logs';
import {type Unsubscriber} from 'svelte/store';

const console = logs('auto-submit');

export type AutoSubmitConfig = {
	name?: string;
	/**
	 * Function to execute the submission
	 */
	execute: () => void;

	/**
	 * Function to determine if the submission should be executed (called at high frequency)
	 */
	shouldExecute: (params: {currentEpochInfo: EpochInfo}) => boolean;

	/**
	 * Function to get the timing for when to start high-frequency checking
	 */
	getTiming: (params: {currentEpochInfo: EpochInfo}) => {
		shouldStart: boolean;
		delayMs: number;
		highFrequencyInterval: number;
	};
};

export function createAutoSubmitter(
	params: {syncedTime: SyncedTimeStore; epochInfo: EpochInfoStore},
	config: AutoSubmitConfig,
) {
	const {syncedTime, epochInfo} = params;
	let highFreqInterval: NodeJS.Timeout | null = null;
	let startTimeout: NodeJS.Timeout | null = null;

	function performHighFrequencyCheck() {
		const now = syncedTime.now();
		const currentEpochInfo = epochInfo.fromTime(now);

		if (config.shouldExecute({currentEpochInfo})) {
			config.execute();
			clearTimers();
			return true;
		}
		clearTimers();
		return false;
	}

	function startHighFrequencyCheck(delayMs: number, interval: number) {
		console.log(`${config.name || ''}: `, {delayMs, interval});

		console.debug(
			`${config.name || ''}: Starting high-frequency check in ${delayMs}ms`,
		);

		startTimeout = setTimeout(() => {
			// Execute immediately first
			performHighFrequencyCheck();

			// Then continue with interval for subsequent checks
			highFreqInterval = setInterval(performHighFrequencyCheck, interval);
		}, delayMs);
	}

	let unsubscribe: Unsubscriber;
	function start() {
		unsubscribe = syncedTime.subscribe(($syncedTime) => {
			const $epochInfo = epochInfo.fromTime($syncedTime.value);

			const {shouldStart, delayMs, highFrequencyInterval} = config.getTiming({
				currentEpochInfo: $epochInfo,
			});

			if (shouldStart && !highFreqInterval && !startTimeout) {
				startHighFrequencyCheck(delayMs, highFrequencyInterval);
			} else if (!shouldStart) {
				clearTimers();
			}
		});

		return () => {
			unsubscribe();
			clearTimers();
		};
	}

	function stop() {
		if (unsubscribe) {
			unsubscribe();
		}
		clearTimers();
	}

	function clearTimers() {
		if (highFreqInterval) {
			clearInterval(highFreqInterval);
			highFreqInterval = null;
		}
		if (startTimeout) {
			clearTimeout(startTimeout);
			startTimeout = null;
		}
	}

	return {
		start,
		stop,
	};
}
