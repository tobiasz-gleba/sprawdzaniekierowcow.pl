<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col">
		<div class="text-center">
			<h1 class="text-4xl font-bold">Resetuj hasło</h1>
			<p class="py-6">Wprowadź nowe hasło dla swojego konta.</p>
		</div>

		{#if data.error}
			<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
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
						<span>{data.message}</span>
					</div>
					<div class="mt-4 card-actions justify-center">
						<a href="/forgot-password" class="btn btn-primary">Poproś o nowy link</a>
						<a href="/login" class="btn btn-ghost">Wróć do logowania</a>
					</div>
				</div>
			</div>
		{:else}
			<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
				<form class="card-body" method="post" use:enhance>
					<input type="hidden" name="token" value={data.token} />

					{#if form?.message}
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
							<span>{form.message}</span>
						</div>
					{/if}

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">Nowe hasło</span>
						</label>
						<input
							id="password"
							type="password"
							name="password"
							placeholder="Wprowadź nowe hasło"
							class="input-bordered input"
							minlength="6"
							required
						/>
						<label class="label">
							<span class="label-text-alt">Minimum 6 znaków</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label" for="confirmPassword">
							<span class="label-text">Potwierdź hasło</span>
						</label>
						<input
							id="confirmPassword"
							type="password"
							name="confirmPassword"
							placeholder="Potwierdź nowe hasło"
							class="input-bordered input"
							minlength="6"
							required
						/>
					</div>

					<div class="form-control mt-6">
						<button class="btn btn-primary">Zresetuj hasło</button>
					</div>

					<div class="mt-4 text-center">
						<a href="/login" class="link text-sm link-primary">Wróć do logowania</a>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>
