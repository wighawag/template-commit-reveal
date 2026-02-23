<script lang="ts">
	import {getUserContext} from '$lib';
	const {localState} = getUserContext();

	function clear() {
		localState.markTutorialAsUnSeen();
	}
</script>

<!-- TODO ?-->
