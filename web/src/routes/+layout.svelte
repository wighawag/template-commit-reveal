<script lang="ts">
	import Notifications from '$lib/core/notifications/Notifications.svelte';
	import VersionAndInstallNotfications from '$lib/core/service-worker/VersionAndInstallNotfications.svelte';
	import SplashScreen from '$lib/core/ui/loading/SplashScreen.svelte';
	import Warning from '$lib/core/ui/modal/Warning.svelte';
	import Head from '$lib/Head.svelte';
	import '../app.css';
	let {children} = $props();
</script>

<Head home={true} />

{@render children()}

<Warning />

<Notifications />

<VersionAndInstallNotfications src="" alt="" />

<SplashScreen />
