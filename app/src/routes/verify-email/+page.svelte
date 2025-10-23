<script lang="ts">
	import type { PageData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SEO 
	title="Weryfikacja emaila - Sprawdzanie Kierowców"
	description="Weryfikacja adresu email w systemie sprawdzania kierowców."
	noindex={true}
/>

<div class="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
	<div class="hero-content max-w-2xl flex-col px-4">
		<div class="card w-full max-w-md bg-base-100 shadow-2xl">
			<div class="card-body items-center text-center">
				{#if data.success}
					<!-- Success State -->
					<div
						class="mb-6 inline-flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-success/10"
					>
						<svg
							class="h-12 w-12 text-success"
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
					<h2 class="mb-2 text-3xl font-bold text-success">Weryfikacja pomyślna!</h2>
					<div class="mb-4 badge gap-2 badge-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Email zweryfikowany
					</div>
				{:else}
					<!-- Error State -->
					<div
						class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-error/10"
					>
						<svg class="h-12 w-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="mb-2 text-3xl font-bold text-error">Weryfikacja nie powiodła się</h2>
					<div class="mb-4 badge gap-2 badge-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
						Link nieprawidłowy lub wygasły
					</div>
				{/if}

				<p class="mb-6 max-w-sm text-base-content/80">{data.message}</p>

				<div class="divider"></div>

				<div class="flex w-full flex-col gap-2 sm:flex-row">
					<a href="/login" class={`btn flex-1 ${data.success ? 'btn-primary' : 'btn-outline'}`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
							/>
						</svg>
						{data.success ? 'Zaloguj się teraz' : 'Wróć do logowania'}
					</a>
					{#if !data.success}
						<a href="/resend-verification" class="btn flex-1 btn-primary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-2 h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Wyślij ponownie
						</a>
					{/if}
				</div>

				{#if data.success}
					<div class="mt-6 alert w-full alert-success">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<span class="text-sm">Twoje konto jest już aktywne i możesz się zalogować.</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
