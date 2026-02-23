<script lang="ts">
	import type {GameDependencies} from '$lib/types';
	import GameScreen from './GameScreen.svelte';
	interface Props {
		createGameDependencies: () => Promise<GameDependencies>;
	}

	let {createGameDependencies}: Props = $props();

	let promise = (() => createGameDependencies())();
</script>

{#await promise}
	<!-- TODO -->
	Please wait...
{:then dependencies}
	<GameScreen {dependencies} />
{/await}
