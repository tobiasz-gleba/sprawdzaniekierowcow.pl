<script lang="ts">
	import { enhance } from '$app/forms';
	import { notifications } from '$lib/stores/notifications';

	let { form }: { form: any } = $props();
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);
	let isProcessing = $state(false);

	// Show notification when form response changes
	$effect(() => {
		if (form?.importSuccess) {
			notifications.add(form.importMessage || 'Kierowcy zaimportowani pomyślnie!', 'success');
		} else if (form?.importError) {
			notifications.add(form.importMessage || 'Nie udało się zaimportować kierowców', 'error');
		}
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			selectedFile = target.files[0];
		}
	}

	function handleReset() {
		selectedFile = null;
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title">Importuj Kierowców z CSV</h2>
		<p class="mb-4 text-sm text-base-content/70">
			Prześlij plik CSV z kolumnami: <strong>Imię, Nazwisko, Numer Seryjny Dokumentu</strong>
			<br />
			<span class="text-xs text-base-content/60">(Możesz użyć wyeksportowanego pliku CSV)</span>
		</p>

		<form
			method="post"
			action="?/importDrivers"
			enctype="multipart/form-data"
			use:enhance={() => {
				isProcessing = true;
				return async ({ update }) => {
					await update();
					isProcessing = false;
					handleReset();
				};
			}}
		>
			<div class="form-control w-full">
				<label class="label" for="csv-file">
					<span class="label-text">Wybierz plik CSV</span>
				</label>
				<input
					id="csv-file"
					type="file"
					name="csvFile"
					accept=".csv"
					class="file-input-bordered file-input w-full"
					bind:this={fileInput}
					onchange={handleFileSelect}
					required
					disabled={isProcessing}
				/>
			</div>

			<div class="mt-4 flex gap-2">
				<button type="submit" class="btn btn-primary" disabled={!selectedFile || isProcessing}>
					{#if isProcessing}
						<span class="loading loading-sm loading-spinner"></span>
						Importowanie...
					{:else}
						📤 Importuj CSV
					{/if}
				</button>

				{#if selectedFile}
					<button type="button" class="btn btn-ghost" onclick={handleReset} disabled={isProcessing}>
						Wyczyść
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>
