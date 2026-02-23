import type {
	ConnectionStore,
	UnderlyingEthereumProvider,
} from '@etherplay/connect';
import type {PublicClient, WalletClient} from 'viem';
import type {BalanceStore} from './core/connection/balance';
import type {CostsStore} from './core/connection/costs';
import type {GasFeeStore} from './core/connection/gasFee';
import type {CameraControl, CameraWatcher} from './core/render/camera';
import type {OnChainStateStore} from './onchain/types';
import type {WriteOperations} from './onchain/writes';
import type {LocalStateStore} from './private/localState';
import type {Renderer} from './render/renderer';
import type {ViewStateStore} from './view';
import type {Readable} from 'svelte/store';
import type {AccountStore, DeploymentsStore} from './core/connection/types';

export type EpochConfig = {
	revealPhaseDuration: number;
	commitPhaseDuration: number;
	startTime: number;
	commitTimeAllowance: number;
};

export type EpochConfigStore = Readable<EpochConfig> & {
	current: EpochConfig;
};

type BaseEpochInfo = {currentEpoch: number; config: EpochConfig};
export type TimedEpochInfo = BaseEpochInfo & {
	type: 'timed';
	timeLeftInEpoch: number;
	timeInCurrentEpochCycle: number;
	isCommitPhase: boolean;
	timeLeftInPhase: number;
	timeLeftForCommitEnd: number;
	timeLeftForRevealEnd: number;
	currentPhaseDuration: number;
};

export type ManualEpochInfo = BaseEpochInfo & {
	type: 'manual';
	isCommitPhase: boolean;
};

export type EpochInfo = TimedEpochInfo | ManualEpochInfo;

export type EpochInfoStore = Readable<EpochInfo> & {
	now(): EpochInfo;
	fromTime(t: number): EpochInfo;
	getBlockRange(): Promise<{fromBlock: number; toBlock: number}>;
};

type BaseTwoPhase = {phase: 'play' | 'wait'};

export type TimedTwoPhase = BaseTwoPhase & {
	type: 'timed';
	timeLeft: number;
	duration: number;
};
export type ManualTwoPhase = BaseTwoPhase & {
	type: 'manual';
};

export type TwoPhase = TimedTwoPhase | ManualTwoPhase;

export type TwoPhaseStore = Readable<TwoPhase>;
export type TimedTwoPhaseStore = Readable<TimedTwoPhase>;

export type GameDependencies = {
	gasFee: GasFeeStore;
	epochInfo: EpochInfoStore;
	twoPhase: TwoPhaseStore;
	epochConfig: EpochConfigStore;
	costs: CostsStore;
	balance: BalanceStore;
	paymentConnection: ConnectionStore<UnderlyingEthereumProvider>;
	paymentWalletClient: WalletClient;
	paymentPublicClient: PublicClient;
	renderer: Renderer;
	viewState: ViewStateStore;
	localState: LocalStateStore;
	onchainState: OnChainStateStore;
	camera: CameraWatcher;
	cameraControl: CameraControl;
	connection: ConnectionStore<UnderlyingEthereumProvider>;
	walletClient: WalletClient;
	publicClient: PublicClient;
	account: AccountStore;
	writes: WriteOperations;
	deployments: DeploymentsStore;
};
