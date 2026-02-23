// ----------------------------------------------------------------------------
// Typed Config
// ----------------------------------------------------------------------------
import type {
	EnhancedEnvironment,
	UnknownDeployments,
	UserConfig,
} from 'rocketh/types';

// We import each extensions we are interested in using in our deploy script or elsewhere

// this one provide a deploy function
import * as deployExtension from '@rocketh/deploy';
// this one provide read,execute functions
import * as readExecuteExtension from '@rocketh/read-execute';
// this one provide a deployViaProxy function that let you declaratively
//  deploy proxy based contracts
import * as deployProxyExtension from '@rocketh/proxy';
// this one provide a viem handle to clients and contracts
import * as viemExtension from '@rocketh/viem';
//  deploy proxy based contracts
import * as deployRouterExtensions from '@rocketh/router';

import {parseEther} from 'viem';

// we define our config and export it as "config"
export const config = {
	chains: {
		31337: {
			properties: {
				expectedWorstGasPrice: parseEther('1', 'gwei'), // TODO use same value from hardhat config
				supportsSendRawTransactionSync: false,
			},
			tags: ['local', 'memory', 'testnet'],
		},
		6342: {
			properties: {
				// mega-eth testnet
				expectedWorstGasPrice: parseEther('0.003', 'gwei'),
				supportsSendRawTransactionSync: false,
			},
		},
		50312: {
			properties: {
				// somnia testnet
				expectedWorstGasPrice: parseEther('8', 'gwei'),
				supportsSendRawTransactionSync: false,
			},
		},
		11142220: {
			properties: {
				// celo sepolia testnet
				expectedWorstGasPrice: parseEther('25', 'gwei'),
				supportsSendRawTransactionSync: false,
			},
		},
		900: {
			properties: {
				supportsSendRawTransactionSync: false,
				expectedWorstGasPrice: parseEther('10', 'gwei'),
			},
		},
	},
	defaultChainProperties: {
		// if not specified, fallback on:
		expectedWorstGasPrice: parseEther('0.000001', 'gwei'),
		supportsSendRawTransactionSync: false,
	},
	accounts: {
		deployer: {
			default: 0,
		},
		admin: {
			default: 0, // TODO
		},
	},
	data: {
		sale: {
			default: {
				price: parseEther('0.00000001'),
			},
		},
		Game: {
			'celos-epolia': {
				commitPhaseDuration: 50n,
				revealPhaseDuration: 10n,
				numMoves: 10n,
			},
			localhost: {
				commitPhaseDuration: 40n,
				revealPhaseDuration: 3n,
				numMoves: 10n,
			},
			default: {
				commitPhaseDuration: 40n,
				revealPhaseDuration: 4n,
				numMoves: 10n,
			},
			'rise-testnet': {
				commitPhaseDuration: 32n,
				revealPhaseDuration: 5n,
				numMoves: 10n,
			},
		},
	},
} as const satisfies UserConfig;

// and export them as a unified object
const extensions = {
	...deployExtension,
	...readExecuteExtension,
	...deployProxyExtension,
	...viemExtension,
	...deployRouterExtensions,
};
export {extensions};

// then we also export the types that our config ehibit so other can use it

type Extensions = typeof extensions;
type Accounts = typeof config.accounts;
type Data = typeof config.data;
type Environment = EnhancedEnvironment<
	Accounts,
	Data,
	UnknownDeployments,
	Extensions
>;

export type {Extensions, Accounts, Data, Environment};
