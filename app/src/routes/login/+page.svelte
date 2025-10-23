<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const resetSuccess = $page.url.searchParams.get('reset') === 'success';
	let isLoading = $state(false);
	let activeAction: 'login' | 'register' = $state('login');
</script>

<div class="hero min-h-screen bg-gradient-to-br from-base-200 to-base-300">
	<div class="hero-content w-full max-w-6xl flex-col gap-8 px-4 lg:flex-row-reverse">
		<!-- Info Section -->
		<div class="text-center lg:w-1/2 lg:text-left">
			<div class="mb-4 badge badge-lg badge-primary">Monitorowanie Kierowców</div>
			<h1
				class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-bold text-transparent"
			>
				Hi!
			</h1>
			<p class="py-6 text-lg text-base-content/80">
				Otrzymuj powiadomienia jeśli kierowca straci prawko, albo utracił uprawnienia z innych
				powodów. Oszczędzaj czas na automatyzacji.
			</p>
			<div class="mt-4 flex flex-col gap-3">
				<div class="flex items-center gap-3">
					<div class="badge badge-sm badge-success">✓</div>
					<span class="text-base-content/70">Powiadomienia na email</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="badge badge-sm badge-success">✓</div>
					<span class="text-base-content/70">Import danych z pliku CSV</span>
				</div>
				<div class="flex items-center gap-3">
					<div class="badge badge-sm badge-success">✓</div>
					<span class="text-base-content/70">Open source on GitHub</span>
				</div>
			</div>
		</div>

		<!-- Form Section -->
		<div class="card w-full max-w-md shrink-0 bg-base-100 shadow-2xl lg:w-1/2">
			<div class="card-body">
				<!-- Tabs -->
				<div class="tabs-boxed mb-4 tabs w-full">
					<button
						type="button"
						class="tab flex-1"
						class:tab-active={activeAction === 'login'}
						onclick={() => (activeAction = 'login')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-4 w-4"
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
						Logowanie
					</button>
					<button
						type="button"
						class="tab flex-1"
						class:tab-active={activeAction === 'register'}
						onclick={() => (activeAction = 'register')}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-2 h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
						Rejestracja
					</button>
				</div>

				<form
					method="post"
					action={activeAction === 'login' ? '?/login' : '?/register'}
					use:enhance={() => {
						isLoading = true;
						return async ({ result, update }) => {
							// If login is successful, invalidate all cached data including AboutApp
							if (result.type === 'redirect' && activeAction === 'login') {
								await invalidateAll();
							}
							await update();
							isLoading = false;
						};
					}}
				>
					<!-- Success Alert -->
					{#if resetSuccess}
						<div role="alert" class="mb-4 alert alert-success">
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
							<span>Hasło zostało pomyślnie zresetowane! Możesz się teraz zalogować.</span>
						</div>
					{/if}

					<!-- Form Alert -->
					{#if form?.message}
						<div
							role="alert"
							class={`mb-4 alert ${form.success ? 'alert-success' : 'alert-error'}`}
						>
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
							<span>{form.message}</span>
						</div>
					{/if}

					<!-- Email Field -->
					<div class="form-control mt-2 w-full">
						<label class="label" for="email">
							<span class="label-text font-semibold">Email</span>
						</label>
						<label class="input-bordered input flex w-full items-center gap-2">
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

					<!-- Password Field -->
					<div class="form-control mt-6 w-full">
						<label class="label" for="password">
							<span class="label-text font-semibold">Hasło</span>
						</label>
						<label class="input-bordered input flex w-full items-center gap-2">
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
								class="grow"
								placeholder={activeAction === 'login' ? 'Wprowadź hasło' : 'Min. 6 znaków'}
								autocomplete={activeAction === 'login' ? 'current-password' : 'new-password'}
								minlength="6"
								required
							/>
						</label>
						{#if activeAction === 'login'}
							<div class="label">
								<span class="label-text-alt"></span>
								<a href="/forgot-password" class="label-text-alt link link-primary link-hover">
									Zapomniałeś hasła?
								</a>
							</div>
						{:else}
							<div class="label">
								<span class="label-text-alt text-base-content/60">Minimum 6 znaków</span>
							</div>
						{/if}
					</div>

					<!-- Terms and Privacy Policy Acceptance (only for registration) -->
					{#if activeAction === 'register'}
						<div class="form-control mt-6">
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									name="acceptTerms"
									class="checkbox checkbox-primary"
									required
								/>
								<span class="label-text">
									Akceptuję <a href="/terms-of-service" target="_blank" class="link link-primary"
										>Warunki Użytkowania</a
									>
									oraz
									<a href="/privacy-policy" target="_blank" class="link link-primary"
										>Politykę Prywatności</a
									>
								</span>
							</label>
						</div>
					{/if}

					<!-- Submit Button -->
					<div class="form-control mt-8 w-full">
						<button type="submit" class="btn w-full btn-primary" disabled={isLoading}>
							{#if isLoading}
								<span class="loading loading-spinner"></span>
								Przetwarzanie...
							{:else if activeAction === 'login'}
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
								Zaloguj się
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
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
								Utwórz konto
							{/if}
						</button>
					</div>

					<!-- Additional Links -->
					<div class="divider text-xs">Potrzebujesz pomocy?</div>
					<div class="text-center">
						<a href="/resend-verification" class="link text-sm link-hover">
							Nie otrzymałeś emaila weryfikacyjnego?
						</a>
					</div>
				</form>
			</div>
		</div>
	</div>
</div>
