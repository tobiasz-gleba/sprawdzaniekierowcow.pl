<script lang="ts">
	import type { Driver } from '$lib/server/db/schema';

	let { drivers }: { drivers: Driver[] } = $props();
	
	// Match the display logic in DriverList: truthy = valid, falsy = invalid
	let validCount = $derived(drivers.filter(d => d.status).length);
	let invalidCount = $derived(drivers.filter(d => !d.status).length);
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-6">
		<div class="flex flex-row gap-4">
			<div class="flex-1 flex flex-col items-center justify-center p-4 bg-success/10 rounded-lg">
				<div class="text-4xl mb-2">✅</div>
				<div class="text-3xl font-bold text-success">{validCount}</div>
				<div class="text-xs text-base-content/70 mt-1">Ważne</div>
			</div>

			<div class="flex-1 flex flex-col items-center justify-center p-4 bg-error/10 rounded-lg">
				<div class="text-4xl mb-2">❌</div>
				<div class="text-3xl font-bold text-error">{invalidCount}</div>
				<div class="text-xs text-base-content/70 mt-1">Nieważne</div>
			</div>
		</div>
	</div>
</div>

