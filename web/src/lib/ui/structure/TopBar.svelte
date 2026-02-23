<script lang="ts">
	import Button from '$lib/core/ui/ethereum/generic/Button.svelte';
	import Spinner from '$lib/core/ui/ethereum/generic/Spinner.svelte';
	import ImgBlockie from '$lib/core/ui/ethereum/ImgBlockie.svelte';
	import {getUserContext} from '$lib';
	import {url} from '$lib/core/utils/web/path';

	const {balance, connection, viewState, localState, deployments} =
		getUserContext();

	let showMenu = $state(false);

	function toggleMenu() {
		showMenu = !showMenu;
	}

	function closeMenu(event: Event) {
		// Only close if the click is on the panel background itself
		if (event.target === event.currentTarget) {
			showMenu = false;
		}
	}
</script>

<nav
	class="fixed top-0 left-0 z-50 flex h-12 w-full items-center justify-between bg-gray-900 px-4 text-white shadow-md"
>
	<div class="flex h-full items-center space-x-2">
		<!-- Logo or App Name -->
		<span class="text-lg font-bold">template-commit-reveal</span>
		<!-- <span
			>{#if $avatars.step == 'Loaded'}
				{$avatars.avatarsInWallet.length} / {$avatars.avatarsOnBench.length} / {$avatars
					.avatarsInGame.length}
			{:else if $avatars.step === 'Loading'}
				Loading...{/if}</span
		> -->
		<!-- <span>{$gasFee.step == 'Loaded' ? formatEther($gasFee.average.maxFeePerGas) : ''}</span> -->
		<!-- <span>{Math.floor($epochInfo.timeLeftInPhase * 100) / 100}</span> -->
		<span
			>{$balance.step == 'Loaded'
				? `${Math.floor($balance.credits * 100) / 100} Credits`
				: ''}</span
		>
	</div>

	<div class="relative flex h-full items-center space-x-4">
		{#if $connection.step === 'Idle' && $connection.loading}
			<Button disabled class="m-0 flex h-8 w-8 items-center justify-center p-0">
				<Spinner class="h-6 w-6" />
			</Button>
		{:else if $connection.step === 'SignedIn'}
			<div class="flex h-full items-center space-x-2">
				<button
					class="flex h-8 w-8 items-center justify-center focus:outline-none"
					onclick={toggleMenu}
					aria-label="Account menu"
				>
					<ImgBlockie
						address={$connection.account.address}
						class="h-6 w-6 rounded-full border border-gray-700"
					/>
				</button>
			</div>
		{:else}
			<!-- disabled={$connection.step != 'Idle'} -->
			<Button
				class="m-0 flex h-8 items-center justify-center p-0 px-3"
				onclick={() => connection.connect()}
			>
				Connect
			</Button>
		{/if}
	</div>
	{#if showMenu}
		<div
			class="absolute top-12 right-4 z-100 mt-2 w-64 rounded-lg border border-gray-700 bg-gray-800 shadow-lg transition-transform duration-200"
			onclick={closeMenu}
			onkeydown={(event) => {
				if (
					event.key === 'Escape' ||
					event.key === 'Enter' ||
					event.key === ' '
				) {
					closeMenu(event);
				}
			}}
			tabindex="0"
			role="dialog"
			aria-modal="true"
		>
			{#if $connection.step === 'SignedIn'}
				<div class="p-4">
					<div class="mb-2 text-xs text-gray-400">Connected as:</div>
					<div class="mb-4 font-mono text-sm break-all text-white">
						{$connection.account.address}
					</div>
					<div class="mb-2 text-xs text-gray-400">Controller:</div>
					<div class="mb-4 font-mono text-sm break-all text-white">
						{$connection.account.signer.address}
					</div>
					<Button
						class="w-full"
						onclick={() => {
							connection.disconnect();
							showMenu = false;
						}}
					>
						Disconnect
					</Button>
				</div>
			{:else}
				<div class="p-4 text-center text-gray-400">
					Please connect your wallet to access account details.
				</div>
			{/if}
		</div>
	{/if}
</nav>
