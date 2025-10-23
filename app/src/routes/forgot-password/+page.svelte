<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { form }: { form: ActionData } = $props();
	let isLoading = $state(false);
</script>

<SEO
	title="Zapomniałeś hasła? - Sprawdzanie Kierowców"
	description="Zresetuj hasło do systemu sprawdzania kierowców. Wyślemy Ci link do ustawienia nowego hasła."
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
						d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
					/>
				</svg>
			</div>
			<h1 class="mb-3 text-4xl font-bold">Zapomniałeś hasła?</h1>
			<p class="text-base-content/70">
				Nie martw się! Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła.
			</p>
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
						<span class="text-sm">
							Link będzie ważny przez 1 godzinę. Sprawdź folder spam, jeśli nie widzisz wiadomości.
						</span>
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
									d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							Wyślij link resetujący
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
	</div>
</div>
