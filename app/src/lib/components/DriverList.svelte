<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Driver } from '$lib/server/db/schema';

	let { drivers, onEdit }: { drivers: Driver[]; onEdit: (driver: Driver) => void } = $props();
	
	function confirmDelete(driver: Driver) {
		return confirm(`Are you sure you want to delete driver ${driver.name} ${driver.surname} (Document: ${driver.documentSerialNumber})?\n\nThis action cannot be undone.`);
	}
</script>

<div class="card bg-base-100 shadow-xl h-full">
	<div class="card-body">
		<h2 class="card-title mb-4">Driver Report</h2>
		{#if drivers.length === 0}
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span>No drivers added yet. Add your first driver above!</span>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table table-zebra w-full">
					<thead>
						<tr>
							<th>Name</th>
							<th>Surname</th>
							<th>Document Serial Number</th>
							<th class="w-20">Status</th>
							<th class="w-20">Action</th>
						</tr>
					</thead>
					<tbody>
						{#each drivers as driver}
							<tr class="hover">
								<td class="font-semibold">{driver.name}</td>
								<td class="font-semibold">{driver.surname}</td>
								<td>
									<span class="badge badge-neutral badge-lg">{driver.documentSerialNumber}</span>
								</td>
								<td class="text-center text-2xl">
									{driver.status ? '✅' : '❌'}
								</td>
								<td>
									<div class="flex gap-1">
										<button
											type="button"
											class="btn btn-ghost btn-sm"
											onclick={() => onEdit(driver)}
											aria-label="Edit driver">
											✏️
										</button>
										<form
											method="post"
											action="?/deleteDriver"
											use:enhance
											onsubmit={(e) => {
												if (!confirmDelete(driver)) {
													e.preventDefault();
													return false;
												}
											}}>
											<input type="hidden" name="driverId" value={driver.id} />
											<button type="submit" class="btn btn-ghost btn-sm" aria-label="Delete driver">
												🗑️
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
