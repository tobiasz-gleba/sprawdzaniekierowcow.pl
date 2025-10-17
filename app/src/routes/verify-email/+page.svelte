<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
	<div class="hero-content flex-col max-w-2xl px-4">
		<div class="card w-full max-w-md bg-base-100 shadow-2xl">
			<div class="card-body items-center text-center">
				{#if data.success}
					<!-- Success State -->
					<div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6 animate-pulse">
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
					<h2 class="text-3xl font-bold text-success mb-2">Weryfikacja pomyślna!</h2>
					<div class="badge badge-success gap-2 mb-4">
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
					<div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-error/10 mb-6">
						<svg class="h-12 w-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h2 class="text-3xl font-bold text-error mb-2">Weryfikacja nie powiodła się</h2>
					<div class="badge badge-error gap-2 mb-4">
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

				<p class="text-base-content/80 mb-6 max-w-sm">{data.message}</p>

				<div class="divider"></div>

				<div class="flex gap-2 w-full flex-col sm:flex-row">
					<a
						href="/login"
						class={`btn flex-1 ${data.success ? 'btn-primary' : 'btn-outline'}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 mr-2"
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
						<a href="/resend-verification" class="btn btn-primary flex-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 mr-2"
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
					<div class="alert alert-success mt-6 w-full">
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
