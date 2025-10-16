<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200">
	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<div class="card-body">
			{#if data.success}
				<div class="flex justify-center mb-4">
					<svg 
						class="h-16 w-16 text-success" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							stroke-linecap="round" 
							stroke-linejoin="round" 
							stroke-width="2" 
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h2 class="card-title justify-center text-success">Weryfikacja pomyślna!</h2>
			{:else}
				<div class="flex justify-center mb-4">
					<svg 
						class="h-16 w-16 text-error" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							stroke-linecap="round" 
							stroke-linejoin="round" 
							stroke-width="2" 
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h2 class="card-title justify-center text-error">Weryfikacja nie powiodła się</h2>
			{/if}

			<p class="text-center mt-4">{data.message}</p>

			<div class="card-actions justify-center mt-6">
				<a href="/login" class="btn btn-primary">
					{data.success ? 'Przejdź do logowania' : 'Wróć do logowania'}
				</a>
			</div>
		</div>
	</div>
</div>

