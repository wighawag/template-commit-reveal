import {logs} from 'named-logs';

const console = logs('per-zone-cached-fetcher');

/**
 * A sophisticated caching fetcher that optimizes zone data retrieval through intelligent deduplication and epoch-based cache management.
 *
 * This class implements a multi-layered caching strategy designed for high-frequency zone data fetching scenarios,
 * particularly useful in game-like applications where zone data needs to be frequently accessed and updated.
 *
 * Key Features:
 * - **Epoch-based cache invalidation**: Automatically clears cache when the epoch changes
 * - **Request deduplication**: Prevents duplicate requests for the same zone data
 * - **Concurrent request optimization**: Efficiently handles multiple overlapping requests
 * - **Flexible data merging**: Allows custom data combination strategies
 *
 * @template T - The type of data being fetched and cached for each zone
 */
export class PerZoneCachedFetcher<T> {
	/**
	 * Tracks currently in-flight fetch requests to prevent duplicate requests for the same zone
	 * Key: zone identifier (bigint)
	 * Value: Promise that will resolve with the zone data
	 */
	protected inFlightRequests = new Map<bigint, Promise<T>>();

	/**
	 * Stores the current epoch value for cache invalidation
	 * When the epoch changes, the entire cache is cleared to ensure data consistency
	 */
	private cachedEpoch: number | undefined;

	/**
	 * Main cache storage for zone data
	 * Key: zone identifier (bigint)
	 * Value: Cached data for that zone
	 */
	protected zonesCache = new Map<bigint, T>();

	/**
	 * Fetches zones with intelligent deduplication and caching
	 *
	 * This method implements the core caching logic with the following optimizations:
	 * 1. **Epoch validation**: Automatically invalidates cache when epoch changes
	 * 2. **Smart request categorization**: Separates zones into cached, in-flight, and needs-fetching
	 * 3. **Concurrent request handling**: Efficiently manages multiple overlapping requests
	 * 4. **Data merging**: Combines results from cache and new fetches
	 *
	 * @param zones - Array of zone identifiers to fetch
	 * @param expectedEpoch - The current epoch value for cache validation
	 * @returns Promise resolving to merged zone data with epoch, or undefined if epoch becomes stale
	 *
	 * @example
	 * ```typescript
	 * const fetcher = new ZoneDataFetcher();
	 * const zones = [1n, 2n, 3n];
	 * const result = await fetcher.fetchZones(zones, 42);
	 * if (result) {
	 *   console.log('Zone data:', result);
	 * }
	 * ```
	 */
	async fetchZones(
		zones: bigint[],
		fromBlock: number,
		toBlock: number,
		expectedEpoch: number,
		// return undefined when request is no more valid (epoch superseded)
	): Promise<(T & {epoch: number}) | undefined> {
		// Check if epoch has changed and clear cache if needed
		if (this.cachedEpoch !== expectedEpoch) {
			console.debug(
				`epoch changed from ${this.cachedEpoch} to ${expectedEpoch}, clearing cache`,
			);
			this.zonesCache.clear();
			this.inFlightRequests.clear();
			this.cachedEpoch = expectedEpoch;
		}

		// Determine which zones need to be fetched (not in cache or in-flight)
		const zonesToFetch: bigint[] = [];
		const cachedZones: bigint[] = [];
		const inFlightZones: bigint[] = [];
		const inFlightPromises: Promise<T>[] = [];

		// Categorize zones based on their current state
		for (const zone of zones) {
			if (this.zonesCache.has(zone)) {
				// Zone data is already cached
				cachedZones.push(zone);
			} else if (this.inFlightRequests.has(zone)) {
				// Zone is currently being fetched by another request
				inFlightZones.push(zone);
				inFlightPromises.push(this.inFlightRequests.get(zone)!);
			} else {
				// Zone needs to be fetched
				zonesToFetch.push(zone);
			}
		}

		console.debug(
			`fetching ${zonesToFetch.length} zones, using ${cachedZones.length} cached zones, waiting for ${inFlightZones.length} in-flight zones`,
		);

		let allData: T[] = [];

		// Add cached data first (this is fast and doesn't require waiting)
		for (const zone of cachedZones) {
			const cachedData = this.zonesCache.get(zone);
			if (cachedData) {
				allData.push(cachedData);
			}
		}

		// Collect all pending promises (both existing in-flight and new requests)
		const allPromises: Promise<T>[] = [...inFlightPromises];

		if (zonesToFetch.length > 0) {
			// Start new requests immediately without waiting for in-flight promises

			const requestPromise = this.executeRequest(
				zonesToFetch,
				fromBlock,
				toBlock,
				expectedEpoch,
			);

			// we now know that currentPredictedEpoch = expectedEpoch as executeRequest is supposed to check for it

			// Cache the in-flight request for each zone to enable deduplication
			for (const zone of zonesToFetch) {
				this.inFlightRequests.set(zone, requestPromise);
			}

			// Clean up the in-flight requests when it completes to prevent memory leaks
			requestPromise.finally(() => {
				for (const zone of zonesToFetch) {
					if (this.inFlightRequests.get(zone) === requestPromise) {
						this.inFlightRequests.delete(zone);
					}
				}
			});

			allPromises.push(requestPromise);
		}

		const allResults = await Promise.all(allPromises);

		// Check if epoch changed while we were fetching - if so, discard results
		if (this.cachedEpoch != expectedEpoch) {
			console.debug(
				`we are on a new epoch now, discarding pending requests' results`,
			);
			return undefined;
		}

		// Merge all data from cache and new fetches
		for (const result of allResults) {
			allData.push(result);
		}

		// Merge all data - this assumes T can be merged appropriately
		// The caller should provide an executeRequest that returns properly mergeable data
		return this.mergeData(allData, expectedEpoch);
	}

	/**
	 * Executes the actual request for zones - must be implemented by subclasses
	 *
	 * This method should contain the actual logic for fetching zone data from the data source.
	 * It receives a batch of zone identifiers and should return the combined data for all zones.
	 *
	 * @param zones - Array of zone identifiers to fetch
	 * @param expectedEpoch - The current epoch for validation
	 * @returns Promise resolving to the fetched zone data
	 *
	 * @throws {Error} If not implemented by subclass
	 *
	 * @example
	 * ```typescript
	 * protected async executeRequest(zones: bigint[], expectedEpoch: number): Promise<ZoneData> {
	 *   const response = await fetch('/api/zones', {
	 *     method: 'POST',
	 *     body: JSON.stringify({ zones, epoch: expectedEpoch })
	 *   });
	 *   return response.json();
	 * }
	 * ```
	 */
	protected async executeRequest(
		zones: bigint[],
		fromBlock: number,
		toBlock: number,
		expectedEpoch?: number,
	): Promise<T & {epoch: number}> {
		throw new Error(
			'executeRequest must be implemented by subclass or provided via constructor',
		);
	}

	/**
	 * Merges multiple data results into one - must be implemented by subclasses
	 *
	 * This method defines how to combine data from multiple zones into a single result.
	 * The implementation should handle the specific data structure of type T.
	 *
	 * @param data - Array of zone data to merge
	 * @param epoch - The epoch number to include in the result
	 * @returns Merged data with epoch information
	 *
	 * @throws {Error} If not implemented by subclass
	 *
	 * @example
	 * ```typescript
	 * protected mergeData(data: ZoneData[], epoch: number): ZoneData & { epoch: number } {
	 *   return {
	 *     zones: data.reduce((acc, zoneData) => [...acc, ...zoneData.zones], []),
	 *     epoch
	 *   };
	 * }
	 * ```
	 */
	protected mergeData(data: T[], epoch: number): T & {epoch: number} {
		throw new Error(
			'mergeData must be implemented by subclass or provided via constructor',
		);
	}

	/**
	 * Clears all cached data and resets the fetcher state
	 *
	 * Use this method to force a complete cache refresh, such as when:
	 * - User triggers a manual refresh
	 * - Application state needs to be reset
	 * - Memory management requires cleanup
	 *
	 * @example
	 * ```typescript
	 * // User clicks refresh button
	 * fetcher.clearCache();
	 * await fetcher.fetchZones([1n, 2n], currentEpoch);
	 * ```
	 */
	clearCache(): void {
		this.zonesCache.clear();
		this.inFlightRequests.clear();
		this.cachedEpoch = undefined;
	}

	/**
	 * Gets the current cache statistics for debugging and monitoring
	 *
	 * This method provides insight into the current state of the cache, useful for:
	 * - Performance monitoring
	 * - Debugging cache behavior
	 * - Understanding cache hit rates
	 *
	 * @returns Object containing cache statistics
	 *
	 * @example
	 * ```typescript
	 * const stats = fetcher.getCacheStats();
	 * console.log(`Cache stats:`, stats);
	 * // Output: { cachedEpoch: 42, cachedZones: 5, inFlightRequests: 2 }
	 * ```
	 */
	getCacheStats() {
		return {
			cachedEpoch: this.cachedEpoch,
			cachedZones: this.zonesCache.size,
			inFlightRequests: this.inFlightRequests.size,
		};
	}
}
