<script lang="ts">
	import type { Driver } from '$lib/server/db/schema';

	let { drivers }: { drivers: Driver[] } = $props();

	// Status: 0=invalid, 1=valid, 2=pending
	let validCount = $derived(drivers.filter((d) => d.status === 1).length);
	let invalidCount = $derived(drivers.filter((d) => d.status === 0).length);
	let pendingCount = $derived(drivers.filter((d) => d.status === 2).length);
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-6">
		<div class="flex flex-row gap-4">
			<div class="flex flex-1 flex-col items-center justify-center rounded-lg bg-success/10 p-4">
				<div class="mb-2 text-4xl">✅</div>
				<div class="text-3xl font-bold text-success">{validCount}</div>
				<div class="mt-1 text-xs text-base-content/70">Ważne</div>
			</div>

			<div class="flex flex-1 flex-col items-center justify-center rounded-lg bg-warning/10 p-4">
				<div class="mb-2 text-4xl">⏳</div>
				<div class="text-3xl font-bold text-warning">{pendingCount}</div>
				<div class="mt-1 text-xs text-base-content/70">Weryfikacja</div>
			</div>

			<div class="flex flex-1 flex-col items-center justify-center rounded-lg bg-error/10 p-4">
				<div class="mb-2 text-4xl">❌</div>
				<div class="text-3xl font-bold text-error">{invalidCount}</div>
				<div class="mt-1 text-xs text-base-content/70">Nieważne</div>
			</div>
		</div>
	</div>
</div>
