<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let isLoading = $state(false);
	let password = $state('');
	let confirmPassword = $state('');

	let passwordsMatch = $derived(password === confirmPassword && password.length > 0);
	let passwordValid = $derived(password.length >= 6);
</script>

<SEO 
	title="Resetuj hasło - Sprawdzanie Kierowców"
	description="Ustaw nowe hasło dla swojego konta w systemie sprawdzania kierowców."
	noindex={true}
/>

<div class="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
	<div class="hero-content max-w-2xl flex-col px-4">
		<!-- Header -->
		<div class="max-w-md text-center">
			<div
				class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 text-primary"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
			</div>
			<h1 class="mb-3 text-4xl font-bold">Resetuj hasło</h1>
			<p class="text-base-content/70">Wprowadź nowe hasło dla swojego konta.</p>
		</div>

		<!-- Error State -->
		{#if data.error}
			<div class="card w-full max-w-md bg-base-100 shadow-2xl">
				<div class="card-body">
					<div role="alert" class="alert alert-error">
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
						<div class="flex flex-col items-start">
							<span class="font-semibold">Link wygasł lub jest nieprawidłowy</span>
							<span class="text-sm opacity-80">{data.message}</span>
						</div>
					</div>
					<div class="mt-4 flex flex-col gap-2 sm:flex-row">
						<a href="/forgot-password" class="btn flex-1 btn-primary">
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
							Poproś o nowy link
						</a>
						<a href="/login" class="btn flex-1 btn-ghost">Wróć do logowania</a>
					</div>
				</div>
			</div>
		{:else}
			<!-- Form State -->
			<div class="card w-full max-w-md bg-base-100 shadow-2xl">
				<form
					class="card-body"
					method="post"
					use:enhance={() => {
						isLoading = true;
						return async ({ update }) => {
							await update();
							isLoading = false;
						};
					}}
				>
					<input type="hidden" name="token" value={data.token} />

					{#if form?.message}
						<div role="alert" class="mb-4 alert alert-error">
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
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span class="text-sm">{form.message}</span>
						</div>
					{/if}

					<!-- Password Requirements -->
					<div class="mb-4 alert alert-info">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-5 w-5 shrink-0 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							></path>
						</svg>
						<div class="text-sm">
							<div class="mb-1 font-semibold">Wymagania dla hasła:</div>
							<ul class="list-inside list-disc space-y-1 opacity-80">
								<li class={passwordValid ? 'text-success' : ''}>
									Minimum 6 znaków
									{#if passwordValid}
										<span class="ml-1">✓</span>
									{/if}
								</li>
								<li class={passwordsMatch ? 'text-success' : ''}>
									Oba hasła muszą być identyczne
									{#if passwordsMatch}
										<span class="ml-1">✓</span>
									{/if}
								</li>
							</ul>
						</div>
					</div>

					<!-- New Password Field -->
					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text font-semibold">Nowe hasło</span>
						</label>
						<label class="input-bordered input flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-4 w-4 opacity-70"
							>
								<path
									fill-rule="evenodd"
									d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
									clip-rule="evenodd"
								/>
							</svg>
							<input
								id="password"
								type="password"
								name="password"
								bind:value={password}
								class="grow"
								placeholder="Wprowadź nowe hasło"
								autocomplete="new-password"
								minlength="6"
								required
							/>
						</label>
					</div>

					<!-- Confirm Password Field -->
					<div class="form-control mt-4">
						<label class="label" for="confirmPassword">
							<span class="label-text font-semibold">Potwierdź hasło</span>
						</label>
						<label class="input-bordered input flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								fill="currentColor"
								class="h-4 w-4 opacity-70"
							>
								<path
									fill-rule="evenodd"
									d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
									clip-rule="evenodd"
								/>
							</svg>
							<input
								id="confirmPassword"
								type="password"
								name="confirmPassword"
								bind:value={confirmPassword}
								class="grow"
								placeholder="Potwierdź nowe hasło"
								autocomplete="new-password"
								minlength="6"
								required
							/>
							{#if confirmPassword.length > 0}
								{#if passwordsMatch}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-success"
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
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 text-error"
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
								{/if}
							{/if}
						</label>
					</div>

					<!-- Submit Button -->
					<div class="form-control mt-6">
						<button
							type="submit"
							class="btn btn-primary"
							disabled={isLoading || !passwordsMatch || !passwordValid}
						>
							{#if isLoading}
								<span class="loading loading-spinner"></span>
								Resetowanie...
							{:else}
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
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								Zresetuj hasło
							{/if}
						</button>
					</div>

					<!-- Back Link -->
					<div class="divider text-xs"></div>
					<div class="text-center">
						<a href="/login" class="btn gap-2 btn-ghost btn-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Wróć do logowania
						</a>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
