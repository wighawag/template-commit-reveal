<script lang="ts">
	import {setUserContext} from '$lib';
	import ConnectionFlow from '$lib/core/connection/ConnectionFlow.svelte';
	import WalletOnlyConnectionFlow from '$lib/core/connection/WalletOnlyConnectionFlow.svelte';
	import PixiCanvas from '$lib/core/render/PixiCanvas.svelte';
	import {eventEmitter} from '$lib/render/eventEmitter.js';
	import type {GameDependencies} from '$lib/types';
	import GameClock from '$lib/ui/GameClock.svelte';
	import GameInfo from '$lib/ui/GameInfo.svelte';
	import TopBar from '$lib/ui/structure/TopBar.svelte';
	import Tutorial from '$lib/ui/tutorial/Tutorial.svelte';

	interface Props {
		dependencies: GameDependencies;
	}

	let {dependencies}: Props = $props();
	setUserContext(() => dependencies);

	let {connection, paymentConnection, cameraControl, renderer} =
		$derived(dependencies);
</script>

<main>
	<div class="pointer-events-auto">
		<TopBar />
	</div>
	<div class="mt-16 ml-2"><GameClock /></div>
</main>

<ConnectionFlow {connection} />
<WalletOnlyConnectionFlow connection={paymentConnection} />

<div class="canvas">
	<PixiCanvas
		{cameraControl}
		{renderer}
		{eventEmitter}
		cellSize={10}
		showGrid={false}
	/>
</div>

<GameInfo />

<Tutorial />

<style>
	main {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.canvas {
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
	}
</style>
