import {PerZoneCachedFetcher} from '$lib/core/utils/fetcher/per-zone-cached-fetcher';
import {logs} from 'named-logs';
import {type GetContractEventsReturnType, type PublicClient} from 'viem';
import deploymentsFromFiles from '$lib/deployments';
import type {TypedDeployments} from '$lib/core/connection/types';

const console = logs('zones-fetcher');

export type CombinedZonesData = {};

export class ZonesFetcher extends PerZoneCachedFetcher<CombinedZonesData> {
	protected publicClient: PublicClient;
	protected deployments: TypedDeployments;
	constructor(params: {
		publicClient: PublicClient;
		deployments: TypedDeployments;
	}) {
		super();
		this.publicClient = params.publicClient;
		this.deployments = params.deployments;
	}
	/**
	 * Executes the actual request for zones
	 */
	protected async executeRequest(
		zones: bigint[],
		fromBlock: number,
		toBlock: number,
		expectedEpoch?: number,
	): Promise<CombinedZonesData & {epoch: number}> {
		// TODO
		return {epoch: expectedEpoch || 0};
	}

	/**
	 * Merges multiple data results into one
	 */
	protected mergeData(
		data: CombinedZonesData[],
		epoch: number,
	): CombinedZonesData & {epoch: number} {
		// TODO
		return {
			epoch,
		};
	}
}
