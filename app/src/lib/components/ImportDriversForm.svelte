<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { form }: { form: any } = $props();
	let fileInput: HTMLInputElement;
	let selectedFile: File | null = $state(null);
	let isProcessing = $state(false);
	
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
		<h2 class="card-title">Import Drivers from CSV</h2>
		<p class="text-sm text-base-content/70 mb-4">
			Upload a CSV file with columns: Name, Surname, Document Serial Number
		</p>
		
		{#if form?.importSuccess}
			<div class="alert alert-success">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{form.importMessage || 'Drivers imported successfully!'}</span>
			</div>
		{/if}
		
		{#if form?.importError}
			<div class="alert alert-error">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				<span>{form.importMessage || 'Failed to import drivers'}</span>
			</div>
		{/if}
		
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
			}}>
			
			<div class="form-control w-full">
				<label class="label" for="csv-file">
					<span class="label-text">Select CSV file</span>
				</label>
				<input
					id="csv-file"
					type="file"
					name="csvFile"
					accept=".csv"
					class="file-input file-input-bordered w-full"
					bind:this={fileInput}
					onchange={handleFileSelect}
					required
					disabled={isProcessing}
				/>
			</div>
			
			<div class="mt-4 flex gap-2">
				<button 
					type="submit" 
					class="btn btn-primary"
					disabled={!selectedFile || isProcessing}>
					{#if isProcessing}
						<span class="loading loading-spinner loading-sm"></span>
						Importing...
					{:else}
						📤 Import CSV
					{/if}
				</button>
				
				{#if selectedFile}
					<button
						type="button"
						class="btn btn-ghost"
						onclick={handleReset}
						disabled={isProcessing}>
						Clear
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>

