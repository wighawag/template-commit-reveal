import {PUBLIC_FAUCET_PRIVATE_KEY} from '$env/static/public';
import type {DeploymentsStore} from '$lib/core/connection/types';
import type {Costs} from '$lib/core/connection/costs';
import type {GasFeeStore} from '$lib/core/connection/gasFee';
import deploymentsFromFiles from '$lib/deployments';

import type {
	ConnectionStore,
	UnderlyingEthereumProvider,
} from '@etherplay/connect';
import {get, type Readable} from 'svelte/store';
import {type CustomTransport, type PublicClient, type WalletClient} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
export type TransactionExecution = {
	transactionID: string;
	wait(): Promise<void>;
};

export function createWriteOperations(params: {
	costs: Readable<Costs>;
	connection: ConnectionStore<UnderlyingEthereumProvider>;
	walletClient: WalletClient<
		CustomTransport,
		typeof deploymentsFromFiles.chain
	>;
	publicClient: PublicClient<
		CustomTransport,
		typeof deploymentsFromFiles.chain
	>;
	paymentWalletClient: WalletClient<
		CustomTransport,
		typeof deploymentsFromFiles.chain
	>;
	paymentPublicClient: PublicClient<
		CustomTransport,
		typeof deploymentsFromFiles.chain
	>;
	gasFee: GasFeeStore;
	paymentConnection: ConnectionStore<UnderlyingEthereumProvider>;
	deployments: DeploymentsStore;
}) {
	const {
		costs,
		connection,
		walletClient,
		publicClient,
		paymentPublicClient,
		paymentWalletClient,
		gasFee,
		paymentConnection,
		deployments: deploymentsStore,
	} = params;

	async function requestFundFromFaucet() {
		// TODO remove get, add a current field to CostStore
		const currentCosts = get(costs);
		const $connection = await connection.ensureConnected();
		const faucetAccount = privateKeyToAccount(
			PUBLIC_FAUCET_PRIVATE_KEY as `0x${string}`,
		);
		const hash = await walletClient.sendTransaction({
			account: faucetAccount,
			to: $connection.account.signer.address,
			value: currentCosts.price + currentCosts.stippend,
		});
		return {
			transactionID: hash,
			wait: () => publicClient.waitForTransactionReceipt({hash}),
		};
	}

	return {
		requestFundFromFaucet,
	};
}

export type WriteOperations = ReturnType<typeof createWriteOperations>;
