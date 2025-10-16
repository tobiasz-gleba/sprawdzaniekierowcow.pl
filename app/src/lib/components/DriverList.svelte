<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Driver } from '$lib/server/db/schema';
	import CryptoJS from 'crypto-js';

	let { drivers, onEdit }: { drivers: Driver[]; onEdit: (driver: Driver) => void } = $props();
	
	function confirmDelete(driver: Driver) {
		return confirm(`Are you sure you want to delete driver ${driver.name} ${driver.surname} (Document: ${driver.documentSerialNumber})?\n\nThis action cannot be undone.`);
	}
	
	function handleCheckDriver(driver: Driver, e: MouseEvent) {
		e.preventDefault();
		// Generate hash for verification
		const hash = CryptoJS.SHA256(driver.documentSerialNumber).toString();
		// Open government verification page with the document serial number
		const url = `https://info-car.pl/sprawdz-historie-pojazdu?doc=${encodeURIComponent(driver.documentSerialNumber)}`;
		window.open(url, '_blank');
	}
	
	function exportToCSV() {
		if (drivers.length === 0) {
			alert('No drivers to export');
			return;
		}
		
		// Create CSV header
		const headers = ['Name', 'Surname', 'Document Serial Number', 'Status'];
		const csvRows = [headers.join(',')];
		
		// Add driver data
		drivers.forEach(driver => {
			const row = [
				driver.name,
				driver.surname,
				driver.documentSerialNumber,
				driver.status ? 'Valid' : 'Invalid'
			];
			// Escape fields that might contain commas
			const escapedRow = row.map(field => `"${field}"`);
			csvRows.push(escapedRow.join(','));
		});
		
		// Create blob and download
		const csvContent = csvRows.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		
		link.setAttribute('href', url);
		link.setAttribute('download', `drivers_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<div class="card bg-base-100 shadow-xl h-full">
	<div class="card-body">
		<div class="flex justify-between items-center mb-4">
			<h2 class="card-title">Drivers Report</h2>
			{#if drivers.length > 0}
				<button
					type="button"
					class="btn btn-primary btn-sm"
					onclick={exportToCSV}
					aria-label="Export to CSV">
					📥 Export CSV
				</button>
			{/if}
		</div>
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
											onclick={(e) => handleCheckDriver(driver, e)}
											aria-label="Check driver license">
											🔗
										</button>
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
