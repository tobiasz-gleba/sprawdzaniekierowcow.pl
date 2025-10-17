<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Driver } from '$lib/server/db/schema';
	import { notifications } from '$lib/stores/notifications';

	let { drivers, onEdit }: { drivers: Driver[]; onEdit: (driver: Driver) => void } = $props();

	let selectedDriver: Driver | null = $state(null);
	let showHistoryModal = $state(false);

	function confirmDelete(driver: Driver) {
		return confirm(
			`Czy na pewno chcesz usunąć kierowcę ${driver.name} ${driver.surname} (Dokument: ${driver.documentSerialNumber})?\n\nTej operacji nie można cofnąć.`
		);
	}

	function showVerificationHistory(driver: Driver) {
		selectedDriver = driver;
		showHistoryModal = true;
	}

	function closeHistoryModal() {
		showHistoryModal = false;
		selectedDriver = null;
	}

	function getVerificationHistory(driver: Driver) {
		const history = driver.verificationHistory as any[];
		return [...(history || [])].sort((a, b) => 
			new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);
	}

	function formatDate(timestamp: string) {
		const date = new Date(timestamp);
		return date.toLocaleString('pl-PL', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
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
											onclick={() => showVerificationHistory(driver)}
											aria-label="Zobacz historię weryfikacji"
										>
											ℹ️
										</button>
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

<!-- Verification History Modal -->
{#if showHistoryModal && selectedDriver}
	<div class="modal modal-open">
		<div class="modal-box max-w-4xl">
			<h3 class="font-bold text-lg mb-4">
				Historia Weryfikacji - {selectedDriver.name} {selectedDriver.surname}
			</h3>
			<p class="text-sm mb-4">
				<strong>Numer dokumentu:</strong> {selectedDriver.documentSerialNumber}
			</p>
			
			{#if getVerificationHistory(selectedDriver).length === 0}
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
					<span>Brak historii weryfikacji dla tego kierowcy.</span>
				</div>
			{:else}
				<ul class="timeline timeline-vertical">
					{#each getVerificationHistory(selectedDriver) as verification, index}
						<li>
							{#if index > 0}
								<hr class={verification.isValid ? 'bg-success' : 'bg-error'} />
							{/if}
							<div class="timeline-start">{formatDate(verification.timestamp)}</div>
							<div class="timeline-middle">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									class="h-5 w-5 {verification.isValid ? 'text-success' : 'text-error'}"
								>
									{#if verification.isValid}
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
											clip-rule="evenodd"
										/>
									{:else}
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
											clip-rule="evenodd"
										/>
									{/if}
								</svg>
							</div>
							<div class="timeline-end timeline-box">
								<div class="font-bold {verification.isValid ? 'text-success' : 'text-error'}">
									{verification.isValid ? '✅ Ważne' : '❌ Nieważne'}
								</div>
								{#if verification.data}
									<div class="text-sm mt-2">
										{#if verification.data.drivingLicenceNumber}
											<p><strong>Numer prawa jazdy:</strong> {verification.data.drivingLicenceNumber}</p>
										{/if}
										{#if verification.data.issueDate}
											<p><strong>Data wydania:</strong> {verification.data.issueDate}</p>
										{/if}
										{#if verification.data.expiryDate}
											<p><strong>Data ważności:</strong> {verification.data.expiryDate}</p>
										{/if}
										{#if verification.data.categories && verification.data.categories.length > 0}
											<p><strong>Kategorie:</strong> {verification.data.categories.join(', ')}</p>
										{/if}
									</div>
								{/if}
							</div>
							{#if index < getVerificationHistory(selectedDriver).length - 1}
								<hr class={verification.isValid ? 'bg-success' : 'bg-error'} />
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
			
			<div class="modal-action">
				<button class="btn" onclick={closeHistoryModal}>Zamknij</button>
			</div>
		</div>
		<button type="button" class="modal-backdrop" onclick={closeHistoryModal} aria-label="Zamknij modal"></button>
	</div>
{/if}
