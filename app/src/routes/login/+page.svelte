<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text-center lg:text-left">
			<h1 class="text-5xl font-bold">Zaloguj się lub Zarejestruj</h1>
			<p class="py-6">
				Wprowadź swoje dane logowania, aby uzyskać dostęp do konta lub utworzyć nowe.
			</p>
		</div>
		<div class="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
			<form class="card-body" method="post" action="?/login" use:enhance>
				{#if form?.message}
					<div role="alert" class="alert alert-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 shrink-0 stroke-current"
							fill="none"
							viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
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
						class="input input-bordered"
						required
					/>
				</div>
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Hasło</span>
					</label>
					<input
						id="password"
						type="password"
						name="password"
						placeholder="Wprowadź swoje hasło"
						class="input input-bordered"
						required
					/>
				</div>
				<div class="form-control mt-6 gap-2">
					<button class="btn btn-primary">Zaloguj się</button>
					<button formaction="?/register" class="btn btn-secondary">
						Zarejestruj się
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
