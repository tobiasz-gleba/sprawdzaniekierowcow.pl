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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showHistoryModal) {
			closeHistoryModal();
		}
	}

	function getVerificationHistory(driver: Driver) {
		const history = driver.verificationHistory as any[];
		return [...(history || [])].sort(
			(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

	function formatDateShort(dateString: string) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('pl-PL', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});
	}

	function getCurrentVerification(driver: Driver) {
		const history = getVerificationHistory(driver);
		return history.length > 0 ? history[0] : null;
	}

	function extractLicenseCategories(data: any) {
		if (!data?.dokumentPotwierdzajacyUprawnienia?.uprawnienia) {
			return [];
		}

		const uprawnienia = data.dokumentPotwierdzajacyUprawnienia.uprawnienia;
		
		// Handle both array and single object cases
		const categories = Array.isArray(uprawnienia) ? uprawnienia : [uprawnienia];

		return categories.map((category: any) => ({
			name: category.kategoriaUprawnienia?.wartosc || 'N/A',
			issueDate: category.dataWydania || '',
			expiryDate: category.dataWaznosci || '',
			isValid: category.dataWaznosci ? new Date(category.dataWaznosci) >= new Date() : false
		}));
	}

	function getDocumentExpiryDate(data: any): string {
		return data?.dokumentPotwierdzajacyUprawnienia?.dataWaznosci || '';
	}

	function exportToCSV() {
		if (drivers.length === 0) {
			notifications.add('Brak kierowców do eksportu', 'warning');
			return;
		}

		try {
			// Create CSV header
			const headers = ['Imię', 'Nazwisko', 'Numer Seryjny Dokumentu'];
			const csvRows = [headers.join(',')];

			// Add driver data
			drivers.forEach((driver) => {
				const row = [driver.name, driver.surname, driver.documentSerialNumber];
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

<svelte:window onkeydown={handleKeydown} />

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
										<span
											class="loading loading-md loading-spinner text-warning"
											title="W trakcie weryfikacji"
										></span>
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
	{@const currentVerification = getCurrentVerification(selectedDriver)}
	{@const isValid = selectedDriver.status === 1}
	<div class="modal-open modal">
		<div class="modal-box max-w-4xl">
			<h3 class="mb-4 text-lg font-bold">
				{isValid ? 'Szczegóły Prawa Jazdy' : 'Historia Weryfikacji'} - {selectedDriver.name}
				{selectedDriver.surname}
			</h3>
			<p class="mb-4 text-sm">
				<strong>Numer dokumentu:</strong>
				{selectedDriver.documentSerialNumber}
			</p>

			{#if !currentVerification}
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
					<span>Brak danych weryfikacji dla tego kierowcy.</span>
				</div>
			{:else if isValid && currentVerification.data}
				<!-- Valid License: Show detailed license information -->
				{@const docExpiry = getDocumentExpiryDate(currentVerification.data)}
				{@const categories = extractLicenseCategories(currentVerification.data)}
				
				<!-- Document Status -->
				<div class="alert alert-success mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<h3 class="font-bold">Prawo jazdy ważne</h3>
						{#if docExpiry}
							<div class="text-sm">Dokument ważny do: {formatDateShort(docExpiry)}</div>
						{/if}
					</div>
				</div>

				<!-- Categories Table -->
				{#if categories.length > 0}
					<div class="mb-4">
						<h4 class="mb-3 text-base font-semibold">Posiadane uprawnienia:</h4>
						<div class="overflow-x-auto">
							<table class="table table-zebra w-full">
								<thead>
									<tr>
										<th>Kategoria</th>
										<th>Data wydania</th>
										<th>Ważne do</th>
										<th class="text-center">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each categories as category}
										<tr>
											<td>
												<span class="badge badge-lg badge-primary font-bold"
													>{category.name}</span
												>
											</td>
											<td>{category.issueDate ? formatDateShort(category.issueDate) : '-'}</td>
											<td>{category.expiryDate ? formatDateShort(category.expiryDate) : '-'}</td>
											<td class="text-center">
												{#if category.isValid}
													<span class="badge badge-success">Ważne</span>
												{:else}
													<span class="badge badge-error">Wygasło</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Last verification info -->
				<div class="divider">Ostatnia weryfikacja</div>
				<div class="text-sm text-base-content/70">
					<p>Zweryfikowano: {formatDate(currentVerification.timestamp)}</p>
				</div>
			{:else}
				<!-- Invalid License: Show verification history -->
				{@const history = getVerificationHistory(selectedDriver)}
				
				{#if history.length === 0}
					<div class="alert alert-warning">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
						<span>Brak historii weryfikacji.</span>
					</div>
				{:else}
					<div class="alert alert-error mb-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<h3 class="font-bold">Prawo jazdy nieważne</h3>
							<div class="text-sm">Dokument został uznany za nieważny</div>
						</div>
					</div>

					<div class="divider">Historia weryfikacji</div>
					
					<ul class="timeline timeline-vertical timeline-compact">
						{#each history as verification, index}
							<li>
								{#if index > 0}
									<hr class={verification.isValid ? 'bg-success' : 'bg-error'} />
								{/if}
								<div class="timeline-start text-sm">{formatDate(verification.timestamp)}</div>
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
									<div class="text-sm font-bold {verification.isValid ? 'text-success' : 'text-error'}">
										{verification.isValid ? '✅ Ważne' : '❌ Nieważne'}
									</div>
								</div>
								{#if index < history.length - 1}
									<hr class={verification.isValid ? 'bg-success' : 'bg-error'} />
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			{/if}

			<div class="modal-action">
				<button class="btn" onclick={closeHistoryModal}>Zamknij</button>
			</div>
		</div>
		<button
			type="button"
			class="modal-backdrop"
			onclick={closeHistoryModal}
			aria-label="Zamknij modal"
		></button>
	</div>
{/if}
