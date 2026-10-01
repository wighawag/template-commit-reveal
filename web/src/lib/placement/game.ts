/**
 * THE GAME, AS THE FRAMEWORK SEES IT: everything the framework needs from the
 * game, in one module, reached only through the `$game` alias.
 *
 * Same mechanism as `$ui` (see svelte.config.js): the framework imports
 * `$game`, never `$lib/placement`, so a game that is not this one points the
 * alias at its own module and the framework compiles against that instead,
 * without a framework file being edited. A game supplies exactly what this file
 * exports.
 *
 * The two contract choices are FUNCTIONS OF THE TYPED DEPLOYMENTS and not
 * names, so naming a contract the deployment does not have is a compile error
 * here, in the game, rather than a string the framework looks up and gets
 * `undefined` for. Only an address crosses into the framework: what is called
 * on the delegation registry is typed by `DELEGATION_ABI`, which is the
 * delegation surface whichever contract implements it.
 */
import type {TypedDeployments} from '$lib/core/connection/types';

export {createGameContext, SIGNER_GRANT} from './context';
export type {GameMembers} from './context';
/** What `?debug` traces, on top of the framework's own. */
export {startDiagnostics} from './diagnostics';

/** The contract that records who may act for whom (`UsingDelegation`). */
export function delegationRegistry(
	deployments: TypedDeployments,
): `0x${string}` {
	return deployments.contracts.Game.address;
}

/**
 * The contract whose address scopes this browser's local operation records.
 * One whose address is stable for the deployment's lifetime (a proxy, not an
 * implementation).
 */
export function operationScope(deployments: TypedDeployments): `0x${string}` {
	return deployments.contracts.Game.address;
}
