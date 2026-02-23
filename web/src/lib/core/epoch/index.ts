import {derived, get, writable, type Readable} from 'svelte/store';
import {TimeNotSyncedError, type SyncedTimeStore} from '../time';
import type {PublicClient} from 'viem';
import type {
	EpochConfig,
	EpochConfigStore,
	EpochInfoStore,
	ManualEpochInfo,
	TimedEpochInfo,
	TimedTwoPhase,
	TwoPhase,
	TwoPhaseStore,
} from '$lib/types';

function calculateEpochInfo(
	currentTime: number,
	config: EpochConfig,
): TimedEpochInfo {
	const COMMIT_PHASE_DURATION = config.commitPhaseDuration;
	const REVEAL_PHASE_DURATION = config.revealPhaseDuration;
	const EPOCH_DURATION = COMMIT_PHASE_DURATION + REVEAL_PHASE_DURATION;
	const START_TIME = config.startTime || 0;

	const timePassed = currentTime - START_TIME;

	// Calculate current epoch (minimum epoch is 2 as per contract logic)
	const currentEpoch = Math.floor(timePassed / EPOCH_DURATION) + 2;

	// Calculate time within current epoch cycle
	const timeInCurrentEpochCycle =
		timePassed - (currentEpoch - 2) * EPOCH_DURATION;

	// Calculate time left in current epoch
	const timeLeftInEpoch = EPOCH_DURATION - timeInCurrentEpochCycle;

	// Determine if we're in commit phase or reveal phase
	const isCommitPhase = timeInCurrentEpochCycle < COMMIT_PHASE_DURATION;

	// Calculate time left for commit phase end (when commit phase will end)
	const timeLeftForCommitEnd = isCommitPhase
		? COMMIT_PHASE_DURATION - timeInCurrentEpochCycle
		: 0; // If we're in reveal phase, commit phase has already ended

	// Calculate time left for reveal phase end (when reveal phase will end, i.e., epoch end)
	const timeLeftForRevealEnd = timeLeftInEpoch;

	return {
		type: 'timed',
		currentEpoch,
		timeLeftInEpoch,
		timeInCurrentEpochCycle,
		isCommitPhase,
		timeLeftInPhase: isCommitPhase
			? COMMIT_PHASE_DURATION - timeInCurrentEpochCycle
			: REVEAL_PHASE_DURATION -
				(timeInCurrentEpochCycle - COMMIT_PHASE_DURATION),
		timeLeftForCommitEnd,
		timeLeftForRevealEnd,
		currentPhaseDuration: isCommitPhase
			? COMMIT_PHASE_DURATION
			: REVEAL_PHASE_DURATION,
		config,
	};
}

export function createTimedEpochTrackers(params: {
	syncedTime: SyncedTimeStore;
	config: EpochConfigStore;
	publicClient: PublicClient;
}): {
	epochInfo: EpochInfoStore;
	twoPhase: TwoPhaseStore;
} {
	const {syncedTime, config, publicClient} = params;
	let lastConfig: EpochConfig = config.current;
	const _epochInfo = derived([syncedTime, config], ([$syncedTime, $config]) => {
		lastConfig = $config;
		return calculateEpochInfo($syncedTime.value, $config);
	});

	async function getBlockRange(): Promise<{
		fromBlock: number;
		toBlock: number;
	}> {
		const lastSync = get(syncedTime).lastSync;
		if (!lastSync) {
			console.debug(`time not synced yet`);
			throw new TimeNotSyncedError(`time not synced yet`);
		}

		const currentBlockNumber = Number(await publicClient.getBlockNumber());
		const avarageBlockTime = lastSync.averageBlockTime;
		const blockDistanceToFetchFrom = Math.floor(
			(4 * // we multiply by 4 as we fetch for 2 epochs and we double it to ensure we get all the events even in case of late blocks, etc...
				(Number(config.current.commitPhaseDuration) +
					Number(config.current.revealPhaseDuration))) /
				avarageBlockTime,
		);

		let fromBlock = currentBlockNumber - blockDistanceToFetchFrom;
		if (fromBlock < 0) {
			fromBlock = 0;
		}

		return {fromBlock, toBlock: currentBlockNumber};
	}

	const epochInfo = {
		subscribe: _epochInfo.subscribe,
		now() {
			return calculateEpochInfo(syncedTime.now(), lastConfig);
		},
		fromTime(now: number) {
			return calculateEpochInfo(now, lastConfig);
		},
		getBlockRange,
	};

	type ThreePhase = {
		phase: 'play' | 'commit' | 'reveal';
		timeLeft: number;
		duration: number;
		config: EpochConfig;
	};
	type ThreePhaseStore = Readable<ThreePhase>;

	const threePhase = derived<Readable<TimedEpochInfo>, ThreePhase>(
		epochInfo,
		($epochInfo) => {
			let phase: 'play' | 'commit' | 'reveal' = 'reveal';
			let timeLeft = $epochInfo.timeLeftInPhase;
			let duration = $epochInfo.currentPhaseDuration;

			const config = $epochInfo.config;

			if ($epochInfo.isCommitPhase) {
				phase = 'play';
				if ($epochInfo.timeLeftInPhase < config.commitTimeAllowance) {
					phase = 'commit';
					duration = config.commitTimeAllowance;
				} else {
					duration -= config.commitTimeAllowance;
					timeLeft -= config.commitTimeAllowance;
				}
			}
			return {
				config,
				phase,
				timeLeft,
				duration,
			};
		},
	);

	const twoPhase = derived<ThreePhaseStore, TimedTwoPhase>(
		threePhase,
		($threePhase) => {
			let phase: 'play' | 'wait' = 'play';
			let timeLeft = $threePhase.timeLeft;
			let duration = $threePhase.duration;
			const config = $threePhase.config;

			if ($threePhase.phase === 'commit') {
				phase = 'wait';
				timeLeft = $threePhase.timeLeft + Number(config.revealPhaseDuration); // TODO reuse
				duration = $threePhase.duration + Number(config.revealPhaseDuration); // TODO reuse
			}
			if ($threePhase.phase === 'reveal') {
				phase = 'wait';
				duration = $threePhase.duration + config.commitTimeAllowance;
			}
			return {
				type: 'timed' as 'timed',
				phase,
				timeLeft,
				duration,
			};
		},
	);

	return {
		epochInfo,
		twoPhase,
	};
}

export function createManualEpochTrackers(params: {
	config: EpochConfigStore;
	publicClient: PublicClient;
}): {
	epochInfo: EpochInfoStore;
	twoPhase: TwoPhaseStore;
} {
	const {config, publicClient} = params;
	let lastConfig: EpochConfig = config.current;
	const $epochInfo: ManualEpochInfo = {
		type: 'manual',
		config: lastConfig, // TODO derived from it
		currentEpoch: 2,
		isCommitPhase: false,
	};
	const _epochInfo = writable<ManualEpochInfo>($epochInfo);

	async function getBlockRange(): Promise<{
		fromBlock: number;
		toBlock: number;
	}> {
		const currentBlockNumber = Number(await publicClient.getBlockNumber());

		let fromBlock = currentBlockNumber - 100;
		if (fromBlock < 0) {
			fromBlock = 0;
		}

		return {fromBlock, toBlock: currentBlockNumber};
	}

	const epochInfo = {
		subscribe: _epochInfo.subscribe,
		now() {
			return $epochInfo;
		},
		fromTime(now: number) {
			return calculateEpochInfo(now, lastConfig);
		},
		getBlockRange,
	};

	const twoPhase = derived<Readable<ManualEpochInfo>, TwoPhase>(
		epochInfo,
		($epochInfo) => {
			let phase: 'play' | 'wait' = 'play';
			// TODO phase
			// TODO add more field ?
			return {
				type: 'manual' as 'manual',
				phase,
			};
		},
	);

	return {
		epochInfo,
		twoPhase,
	};
}
