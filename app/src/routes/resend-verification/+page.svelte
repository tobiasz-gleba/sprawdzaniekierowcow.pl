<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { form }: { form: ActionData } = $props();
	let isLoading = $state(false);
</script>

<SEO 
	title="Wyślij ponownie email weryfikacyjny - Sprawdzanie Kierowców"
	description="Nie otrzymałeś emaila weryfikacyjnego? Wyślemy Ci nowy link weryfikacyjny."
	noindex={true}
/>

<div class="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
	<div class="hero-content max-w-2xl flex-col px-4">
		<!-- Header -->
		<div class="max-w-md text-center">
			<div
				class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-warning/10"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-8 w-8 text-warning"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<h1 class="mb-3 text-4xl font-bold">Email weryfikacyjny</h1>
			<p class="text-base-content/70">Nie otrzymałeś emaila? Wyślemy Ci nowy link weryfikacyjny.</p>
		</div>

		<!-- Form Card -->
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
				<!-- Alert -->
				{#if form?.message}
					<div role="alert" class={`mb-4 alert ${form.success ? 'alert-success' : 'alert-error'}`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24"
						>
							{#if form.success}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							{:else}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							{/if}
						</svg>
						<span class="text-sm">{form.message}</span>
					</div>
				{/if}

				<!-- Info Box -->
				{#if !form?.success}
					<div class="mb-4 alert">
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
							<div class="mb-1 font-semibold">Co powinieneś sprawdzić?</div>
							<ul class="list-inside list-disc space-y-1 opacity-80">
								<li>Folder spam lub wiadomości niechciane</li>
								<li>Poprawność adresu email przy rejestracji</li>
								<li>Czas dostarczenia - może potrwać kilka minut</li>
							</ul>
						</div>
					</div>
				{/if}

				<!-- Email Field -->
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text font-semibold">Adres email</span>
					</label>
					<label class="input-bordered input flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 16 16"
							fill="currentColor"
							class="h-4 w-4 opacity-70"
						>
							<path
								d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
							/>
							<path
								d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
							/>
						</svg>
						<input
							id="email"
							type="email"
							name="email"
							class="grow"
							placeholder="email@przyklad.pl"
							autocomplete="email"
							required
						/>
					</label>
				</div>

				<!-- Submit Button -->
				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={isLoading}>
						{#if isLoading}
							<span class="loading loading-spinner"></span>
							Wysyłanie...
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
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							Wyślij ponownie email
						{/if}
					</button>
				</div>

				<!-- Additional Info -->
				<div class="mt-4 alert alert-warning">
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
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<span class="text-xs">
						Możesz wysłać ponownie email tylko raz na 5 minut. Sprawdź folder spam przed kolejną
						próbą.
					</span>
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
	</div>
</div>
