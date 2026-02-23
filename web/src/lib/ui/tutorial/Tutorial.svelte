<script lang="ts">
	import Button from '$lib/core/ui/ethereum/generic/Button.svelte';
	import {startTour} from '$lib/ui/tutorial/tour';
	import {getUserContext} from '$lib';
	const {localState} = getUserContext();
</script>

{#if $localState.signer && !$localState.tutorialSeen}
	<div
		class="absolute top-0 left-0 z-50 flex h-screen w-screen items-center justify-center"
	>
		<div
			class="max-h-[calc(100vh-128px)] max-w-[calc(100vw-128px)] bg-gray-900 p-16"
		>
			<h1 class="text-lg font-bold">Welcome to Bomber.world</h1>

			<p>Masked warriors. Real stakes. Endless spectacle.</p>

			<p>
				You’re the Handler—build your fighter, outthink rivals, and claim glory.
			</p>

			<p>The arena is live. The world is watching.</p>

			<p>Ready?</p>

			<p></p>

			<div>
				<Button onclick={() => startTour(() => localState.markTutorialAsSeen())}
					>Start Tour</Button
				>
				<Button onclick={() => localState.markTutorialAsSeen()}>Skip</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	p {
		margin-top: 1rem;
	}
</style>
