<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Driver } from '$lib/server/db/schema';
	import CryptoJS from 'crypto-js';
	import { notifications } from '$lib/stores/notifications';

	let { drivers, onEdit }: { drivers: Driver[]; onEdit: (driver: Driver) => void } = $props();

	function confirmDelete(driver: Driver) {
		return confirm(
			`Czy na pewno chcesz usunąć kierowcę ${driver.name} ${driver.surname} (Dokument: ${driver.documentSerialNumber})?\n\nTej operacji nie można cofnąć.`
		);
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
			notifications.add('Brak kierowców do eksportu', 'warning');
			return;
		}

		try {
			// Create CSV header
			const headers = ['Imię', 'Nazwisko', 'Numer Seryjny Dokumentu', 'Status'];
			const csvRows = [headers.join(',')];

			// Add driver data
			drivers.forEach((driver) => {
				const statusText = driver.status === 1 ? 'Ważne' : driver.status === 2 ? 'W trakcie weryfikacji' : 'Nieważne';
				const row = [
					driver.name,
					driver.surname,
					driver.documentSerialNumber,
					statusText
				];
				// Escape fields that might contain commas
				const escapedRow = row.map((field) => `"${field}"`);
				csvRows.push(escapedRow.join(','));
			});

			// Create blob and download
			const csvContent = csvRows.join('\n');
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);

			link.setAttribute('href', url);
			link.setAttribute('download', `kierowcy_${new Date().toISOString().split('T')[0]}.csv`);
			link.style.visibility = 'hidden';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			notifications.add(`Pomyślnie wyeksportowano ${drivers.length} kierowców do CSV`, 'success');
		} catch (error) {
			notifications.add('Nie udało się wyeksportować pliku CSV', 'error');
		}
	}
</script>

<div class="card h-full bg-base-100 shadow-xl">
	<div class="card-body">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="card-title">Raport Kierowców</h2>
			{#if drivers.length > 0}
				<button
					type="button"
					class="btn btn-sm btn-primary"
					onclick={exportToCSV}
					aria-label="Eksportuj do CSV"
				>
					📥 Eksportuj CSV
				</button>
			{/if}
		</div>
		{#if drivers.length === 0}
			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				<span>Nie dodano jeszcze żadnych kierowców. Dodaj swojego pierwszego kierowcę powyżej!</span
				>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="table w-full table-zebra">
					<thead>
						<tr>
							<th>Imię</th>
							<th>Nazwisko</th>
							<th>Numer Seryjny Dokumentu</th>
							<th class="w-20">Status</th>
							<th class="w-20">Akcja</th>
						</tr>
					</thead>
					<tbody>
						{#each drivers as driver}
							<tr class="hover">
								<td class="font-semibold">{driver.name}</td>
								<td class="font-semibold">{driver.surname}</td>
								<td>
									<span class="badge badge-lg badge-neutral">{driver.documentSerialNumber}</span>
								</td>
								<td class="text-center">
									{#if driver.status === 1}
										<span class="text-2xl" title="Ważne">✅</span>
									{:else if driver.status === 2}
										<span class="loading loading-spinner loading-md text-warning" title="W trakcie weryfikacji"></span>
									{:else}
										<span class="text-2xl" title="Nieważne">❌</span>
									{/if}
								</td>
								<td>
									<div class="flex gap-1">
										<button
											type="button"
											class="btn btn-ghost btn-sm"
											onclick={(e) => handleCheckDriver(driver, e)}
											aria-label="Sprawdź prawo jazdy"
										>
											🔗
										</button>
										<form
											method="post"
											action="?/revalidateDriver"
											use:enhance={() => {
												return async ({ result, update }) => {
													if (result.type === 'success') {
														notifications.add(
															`Weryfikacja kierowcy ${driver.name} ${driver.surname} zakończona`,
															'success'
														);
													} else if (result.type === 'failure') {
														notifications.add('Nie udało się zweryfikować kierowcy', 'error');
													}
													await update();
												};
											}}
										>
											<input type="hidden" name="driverId" value={driver.id} />
											<button type="submit" class="btn btn-ghost btn-sm" aria-label="Zweryfikuj ponownie">
												🔄
											</button>
										</form>
										<button
											type="button"
											class="btn btn-ghost btn-sm"
											onclick={() => onEdit(driver)}
											aria-label="Edytuj kierowcę"
										>
											✏️
										</button>
										<form
											method="post"
											action="?/deleteDriver"
											use:enhance={({ cancel }) => {
												if (!confirmDelete(driver)) {
													cancel();
													return;
												}
												return async ({ result, update }) => {
													if (result.type === 'success') {
														notifications.add(
															`Kierowca ${driver.name} ${driver.surname} usunięty pomyślnie`,
															'success'
														);
													} else if (result.type === 'failure') {
														notifications.add('Nie udało się usunąć kierowcy', 'error');
													}
													await update();
												};
											}}
										>
											<input type="hidden" name="driverId" value={driver.id} />
											<button type="submit" class="btn btn-ghost btn-sm" aria-label="Usuń kierowcę">
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
