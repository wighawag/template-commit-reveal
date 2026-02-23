import {browser} from '$app/environment';
import type {UnderlyingEthereumProvider} from '@etherplay/connect';
import {logs} from 'named-logs';
import {writable, type Readable} from 'svelte/store';

const console = logs('time', {
	decoration: 'background: #222; padding: 0.2rem; color: #bada55',
});

export type LastSync = {
	timestampMS: number;
	blockNumber: number;
	averageBlockTime: number;
};
export type SyncedTime = {
	lastSync?: LastSync;
	value: number;
};

function formatTime(timestamp: number): string {
	return `${new Date(timestamp * 1000).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})},${(timestamp * 1000) % 1000}`;
}

export type SyncedTimeStore = Readable<SyncedTime> & {now(): number};

export class TimeNotSyncedError extends Error {}

export function createSyncedTime(
	params: {provider: UnderlyingEthereumProvider},
	options?: {minPollingInterval?: number},
): SyncedTimeStore {
	const {provider} = params;
	let minPollingInterval = options?.minPollingInterval || 200;
	let syncing: Promise<LastSync | undefined> | undefined;
	let last_time = Math.floor(Date.now() / 1000);
	let last_fetch_time_ms = Date.now();
	let last_fetch_block_number: number | null = null;
	let started = false;

	let pollingInterval: NodeJS.Timeout | null = null;
	let hasAccurateTime = false; // Track if we have the most accurate blockchain time

	let $time: SyncedTime = {value: last_time};
	const time = writable<SyncedTime>($time, start);

	function set(newTime: SyncedTime) {
		$time.lastSync = newTime.lastSync;
		$time.value = newTime.value;
		time.set($time);
	}

	function start() {
		// console.log(`starting..`);
		started = true;
		// console.log(`start`);
		// Main time update interval (updates every second)
		const timeUpdateInterval = setInterval(() => {
			const now = Date.now();
			const timePassedMS = now - last_fetch_time_ms;
			set({value: last_time + timePassedMS / 1000, lastSync: $time.lastSync});
		}, 1000);

		// Start with immediate first approximation
		initialSync();

		return () => {
			// console.log(`stopped`);
			started = false;
			// console.log(`stop`);
			hasAccurateTime = false; // Track if we have the most accurate
			clearInterval(timeUpdateInterval);
			if (pollingInterval) {
				// console.log(`interuptring polling...`);
				clearInterval(pollingInterval);
				pollingInterval = null;
			}
		};
	}

	async function initialSync() {
		if (!browser) {
			// we do not sync time on SSR
			return;
		}
		let synced = $time.lastSync;
		if (!synced) {
			if (!syncing) {
				// console.log(`not synced, syncing....`);
				syncing = updateTimeFromProvider();
			} else {
				// console.log(`waiting for previous syncing....`);
				// we return as the previous will get into the next loop
				return;
			}
			synced = await syncing;

			if (!started) {
				syncing = undefined;
				return;
			}

			if (synced) {
				// Initial sync successful, now start polling to catch the next block
				// for maximum accuracy, then we'll stop polling
				startBlockPolling(synced);
			} else {
				console.error('Initial sync failed, retrying...');
				setTimeout(initialSync, 1000);
			}
		} else if (!hasAccurateTime) {
			startBlockPolling(synced);
		}
	}

	function startBlockPolling(lastSync: LastSync) {
		// Only start polling if we don't have accurate time yet
		if (hasAccurateTime) return;
		// console.log(`polling for accurate block time...`);

		// Poll more frequently for faster networks, less for slower ones
		// Aim for roughly 1/10th of expected block time
		const pollInterval = Math.max(
			Math.floor((lastSync.averageBlockTime * 1000) / 100),
			minPollingInterval,
		);

		if (pollingInterval) {
			// console.log(`polling already running`);
			return;
			// clearInterval(pollingInterval);
			// pollingInterval = null;
		}

		pollingInterval = setInterval(async () => {
			try {
				const before_fetch = Date.now();
				const latestBlockResponse = await provider.call('eth_getBlockByNumber')(
					[
						'latest',
						false as true, // TODO fix eip-1193 Methods
					],
				);

				if (!started) {
					// console.log(`stoped while polling`);
					return;
				}

				if (hasAccurateTime) {
					// console.log(`accurate time already found`);
					if (pollingInterval) {
						clearInterval(pollingInterval);
						pollingInterval = null;
					}
					return;
				}

				if (latestBlockResponse.success && latestBlockResponse.value) {
					const latestBlockNumber = Number(latestBlockResponse.value.number);
					const latestBlockTime = Number(latestBlockResponse.value.timestamp);

					// console.debug(
					// 	`got ${latestBlockNumber} at ${formatTime(latestBlockTime)}, ${formatTime((before_fetch + Date.now()) / 2 / 1000)}`
					// );

					if (!last_fetch_block_number) {
						throw new Error(`last_fetch_block_number not set`);
					}

					// If we have a new block, we now have the most accurate blockchain time
					if (latestBlockNumber > last_fetch_block_number) {
						const after_fetch = Date.now();
						const predicted_fetch_time = (before_fetch + after_fetch) / 2;

						console.log(
							`got ${latestBlockNumber} at local time: ${formatTime(predicted_fetch_time / 1000)} (block time: ${formatTime(latestBlockTime)})`,
						);

						updateTimeFromBlock(
							predicted_fetch_time,
							{
								blockTime: latestBlockTime,
								blockNumber: latestBlockNumber,
							},
							lastSync.averageBlockTime,
						);

						// We now have the most accurate blockchain time, stop polling
						hasAccurateTime = true;
						if (pollingInterval) {
							// console.log(`done, stopping polling...`);
							clearInterval(pollingInterval);
							pollingInterval = null;
						}
					} else {
						// console.log({
						// 	latestBlockNumber,
						// 	last_fetch_block_number
						// });
					}
				}
			} catch (err) {
				// Silently fail on polling errors to avoid console spam
				console.debug('Block polling failed:', err);
			}
		}, pollInterval);
	}

	function updateTimeFromBlock(
		fetchTimeMS: number,
		block: {blockTime: number; blockNumber: number},
		averageBlockTime: number,
	) {
		last_time = block.blockTime;
		last_fetch_time_ms = fetchTimeMS;
		last_fetch_block_number = block.blockNumber;

		const nowMS = Date.now();
		const timePassedMS = nowMS - last_fetch_time_ms;
		// console.debug(`timePassed: ${timePassedMS / 1000}`);
		console.log(`time is ${formatTime(last_time + timePassedMS / 1000)}`);
		const lastSync = {
			timestampMS: last_fetch_time_ms,
			blockNumber: block.blockNumber,
			averageBlockTime,
		};
		set({
			value: last_time + timePassedMS / 1000,
			lastSync,
		});
		return lastSync;
	}

	async function updateTimeFromProvider(): Promise<LastSync | undefined> {
		const before_fetch = Date.now();
		try {
			const latestBlockResponse = await provider.call('eth_getBlockByNumber')([
				'latest',
				false as true, // TODO fix eip-1193 Methods
			]);

			if (!started) {
				// console.log(`stoped 1`);
				return;
			}

			if (latestBlockResponse.success && latestBlockResponse.value) {
				const latestBlockTime = Number(latestBlockResponse.value.timestamp);
				const latestBlockNumber = Number(latestBlockResponse.value.number);
				const after_fetch = Date.now();
				const predicted_fetch_time = (before_fetch + after_fetch) / 2;

				console.debug(
					`our first block (${latestBlockNumber}) at ${formatTime(latestBlockTime)} / ${formatTime(predicted_fetch_time)}`,
				);

				const distance = 64;
				const sampleSize =
					latestBlockNumber > distance ? distance : latestBlockNumber;
				const fromBlock = latestBlockNumber - sampleSize;

				const olderBlockResponse = await provider.call('eth_getBlockByNumber')([
					`0x${fromBlock.toString(16)}`,
					false as true, // TODO fix eip-1193 Methods
				]);

				if (!started) {
					// console.log(`stoped 2`);
					return;
				}

				let averageBlockTime: number;
				if (olderBlockResponse.success && olderBlockResponse.value) {
					const olderBlockTime = Number(olderBlockResponse.value.timestamp);

					// Calculate the time difference in seconds
					const timeDiff = latestBlockTime - olderBlockTime;

					// Calculate average block time (time difference / number of blocks)
					const blockCount = latestBlockNumber - fromBlock;
					averageBlockTime = timeDiff / blockCount;
				} else {
					return $time.lastSync;
				}

				return updateTimeFromBlock(
					predicted_fetch_time,
					{
						blockTime: latestBlockTime,
						blockNumber: latestBlockNumber,
					},
					averageBlockTime,
				);
			}
			return $time.lastSync;
		} catch (err) {
			console.error(`failed to fetch from block time`, err);
			return undefined;
		}
	}

	function now() {
		const nowMS = Date.now();
		const timePassedMS = nowMS - last_fetch_time_ms;
		return last_time + timePassedMS / 1000;
	}

	return {
		now,
		subscribe: time.subscribe,
	};
}
