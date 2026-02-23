import {get} from 'svelte/store';
import {createContext} from 'svelte';
import {
	establishEmbeddedConnection,
	establishRemoteConnection,
} from './core/connection';
import {createBalanceStore} from './core/connection/balance';
import {createCostStore} from './core/connection/costs';
import {createGasFeeStore} from './core/connection/gasFee';
import {createEpochConfigStore} from './core/epoch/config';
import {createRenderer} from './render/renderer';
import {createViewState} from './view';
import {createOnchainState} from './onchain/state';
import {createCamera} from './core/render/camera';
import {createLocalState} from './private/localState';
import {eventEmitter} from './render/eventEmitter';
import {createWriteOperations} from './onchain/writes';
import {ZonesFetcher} from './onchain/zones-fetcher';
import {createSyncedTime} from './core/time';
import {
	createManualEpochTrackers,
	createTimedEpochTrackers,
} from './core/epoch';
import type {GameDependencies} from './types';

export async function createGameDependenciesForRemotePlay(): Promise<GameDependencies> {
	const window = globalThis as any;

	// ----------------------------------------------------------------------------
	// CONNECTION
	// ----------------------------------------------------------------------------

	const {
		signer,
		connection,
		walletClient,
		publicClient,
		paymentConnection,
		paymentWalletClient,
		paymentPublicClient,
		account,
		deployments,
	} = await establishRemoteConnection();

	window.paymentConnection = paymentConnection;
	window.paymentWalletClient = paymentWalletClient;
	window.paymentPublicClient = paymentPublicClient;
	window.connection = connection;
	window.walletClient = walletClient;
	window.publicClient = publicClient;
	window.deployments = deployments;

	// ----------------------------------------------------------------------------

	// ----------------------------------------------------------------------------
	// BALANCE AND COSTS
	// ----------------------------------------------------------------------------

	const costs = createCostStore(deployments);
	window.costs = costs;

	const balance = createBalanceStore({publicClient, signer, costs});
	window.balance = balance;

	// ----------------------------------------------------------------------------

	// ----------------------------------------------------------------------------
	// TIME
	// ----------------------------------------------------------------------------

	const syncedTime = createSyncedTime(
		{provider: connection.provider},
		{
			minPollingInterval: 100,
		},
	);
	window.syncedTime = syncedTime;

	const epochConfig = createEpochConfigStore(deployments);
	window.epochConfig = epochConfig;

	const {epochInfo, twoPhase} = createTimedEpochTrackers({
		syncedTime,
		config: epochConfig,
		publicClient,
	});
	window.twoPhase = twoPhase;
	window.epochInfo = epochInfo;
	// ----------------------------------------------------------------------------

	// TODO use deployment store ?
	const gasFee = createGasFeeStore({
		publicClient: publicClient as any, // TODO fix publicClient type
		deployments: deployments.current,
	});
	window.gasFee = gasFee;

	// TODO remove
	// we trigger it
	gasFee.subscribe((v) => {
		console.log(`gas fee updated`, v);
	});
	window.gasFee = gasFee;
	// ----------------------------------------------------------------------------

	const {camera, cameraControl} = createCamera();
	window.camera = camera;
	window.cameraControl = cameraControl;

	const writes = createWriteOperations({
		costs,
		connection,
		publicClient: publicClient as any, // TODO fix publicClient type,
		walletClient: walletClient as any, // TODO fix publicClient type,
		paymentConnection,
		paymentPublicClient: paymentPublicClient as any, // TODO fix publicClient type,
		paymentWalletClient: paymentWalletClient as any, // TODO fix publicClient type,
		gasFee,
		deployments,
	});

	const zonesFetcher = new ZonesFetcher({
		publicClient,
		deployments: deployments.current,
	});

	// For now use deployments.current
	const onchainState = createOnchainState({
		camera,
		deployments: deployments.current,
		zonesFetcher,
		epochInfo,
		publicClient,
	});
	window.onchainState = onchainState;

	// For now use deployments.current
	const localState = createLocalState({
		signer,
		epochInfo,
		deployments: deployments.current,
		writes,
	});
	window.localState = localState;

	// For now use deployments.current
	const viewState = createViewState(
		onchainState,
		localState,
		deployments.current,
	);

	window.viewState = viewState;
	const renderer = createRenderer({
		viewState,
		eventEmitter,
		epochInfo,
		localState,
		epochConfig,
		camera,
		cameraControl,
		deployments: deployments.current, // TODO use deployment store ?
	});

	return {
		gasFee,
		epochInfo,
		twoPhase,
		epochConfig,
		costs,
		balance,
		paymentConnection,
		paymentWalletClient,
		paymentPublicClient,
		renderer,
		viewState,
		localState,
		onchainState,
		camera,
		cameraControl,
		connection,
		walletClient,
		publicClient,
		account,
		writes,
		deployments,
	};
}

export async function createGameDependenciesForEmbeddedPlay(): Promise<GameDependencies> {
	const window = globalThis as any;

	// ----------------------------------------------------------------------------
	// CONNECTION
	// ----------------------------------------------------------------------------

	const {
		signer,
		connection,
		walletClient,
		publicClient,
		paymentConnection,
		paymentWalletClient,
		paymentPublicClient,
		account,
		deployments,
	} = await establishEmbeddedConnection();

	window.paymentConnection = paymentConnection;
	window.paymentWalletClient = paymentWalletClient;
	window.paymentPublicClient = paymentPublicClient;
	window.connection = connection;
	window.walletClient = walletClient;
	window.publicClient = publicClient;
	window.deployments = deployments;

	// ----------------------------------------------------------------------------

	// ----------------------------------------------------------------------------
	// BALANCE AND COSTS
	// ----------------------------------------------------------------------------

	const costs = createCostStore(deployments);
	window.costs = costs;

	const balance = createBalanceStore({publicClient, signer, costs});
	window.balance = balance;

	// ----------------------------------------------------------------------------

	const epochConfig = createEpochConfigStore(deployments);
	window.epochConfig = epochConfig;

	const {epochInfo, twoPhase} = createManualEpochTrackers({
		config: epochConfig,
		publicClient,
	});
	window.twoPhase = twoPhase;
	window.epochInfo = epochInfo;
	// ----------------------------------------------------------------------------

	// TODO use deployment store ?
	const gasFee = createGasFeeStore({
		publicClient: publicClient as any, // TODO fix publicClient type
		deployments: deployments.current,
	});
	window.gasFee = gasFee;

	// TODO remove
	// we trigger it
	gasFee.subscribe((v) => {
		console.log(`gas fee updated`, v);
	});
	window.gasFee = gasFee;
	// ----------------------------------------------------------------------------

	const {camera, cameraControl} = createCamera();
	window.camera = camera;
	window.cameraControl = cameraControl;

	const writes = createWriteOperations({
		costs,
		connection,
		publicClient: publicClient as any, // TODO fix publicClient type,
		walletClient: walletClient as any, // TODO fix publicClient type,
		paymentConnection,
		paymentPublicClient: paymentPublicClient as any, // TODO fix publicClient type,
		paymentWalletClient: paymentWalletClient as any, // TODO fix publicClient type,
		gasFee,
		deployments,
	});

	const zonesFetcher = new ZonesFetcher({
		publicClient,
		deployments: deployments.current,
	});

	// For now use deployments.current
	const onchainState = createOnchainState({
		camera,
		deployments: deployments.current,
		zonesFetcher,
		epochInfo,
		publicClient,
	});
	window.onchainState = onchainState;

	// For now use deployments.current
	const localState = createLocalState({
		signer,
		epochInfo,
		deployments: deployments.current,
		writes,
	});
	window.localState = localState;

	// For now use deployments.current
	const viewState = createViewState(
		onchainState,
		localState,
		deployments.current,
	);

	window.viewState = viewState;
	const renderer = createRenderer({
		viewState,
		eventEmitter,
		epochInfo,
		localState,
		epochConfig,
		camera,
		cameraControl,

		deployments: deployments.current, // TODO use deployment store ?
	});

	return {
		gasFee,
		epochInfo,
		twoPhase,
		epochConfig,
		costs,
		balance,
		paymentConnection,
		paymentWalletClient,
		paymentPublicClient,
		renderer,
		viewState,
		localState,
		onchainState,
		camera,
		cameraControl,
		connection,
		walletClient,
		publicClient,
		account,
		writes,
		deployments,
	};
}

(globalThis as any).get = get;

const [getUserContextFunction, setUserContext] =
	createContext<() => GameDependencies>();

const getUserContext = () => getUserContextFunction()();
export {getUserContext, setUserContext};
