<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col">
		<div class="text-center">
			<h1 class="text-4xl font-bold">Wyślij ponownie email weryfikacyjny</h1>
			<p class="py-6">Wprowadź swój adres email, aby otrzymać nowy link weryfikacyjny.</p>
		</div>
		<div class="card w-full max-w-sm bg-base-100 shadow-2xl">
			<form class="card-body" method="post" use:enhance>
				{#if form?.message}
					<div role="alert" class={form.success ? 'alert alert-success' : 'alert alert-error'}>
						{#if form.success}
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
						{:else}
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
						{/if}
						<span>{form.message}</span>
					</div>
				{/if}
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">Email</span>
					</label>
					<input
						id="email"
						type="email"
						name="email"
						placeholder="email@przyklad.pl"
						class="input-bordered input"
						required
					/>
				</div>
				<div class="form-control mt-6">
					<button class="btn btn-primary">Wyślij email weryfikacyjny</button>
				</div>
				<div class="mt-4 text-center">
					<a href="/login" class="link text-sm link-primary">Wróć do logowania</a>
				</div>
			</form>
		</div>
	</div>
</div>
