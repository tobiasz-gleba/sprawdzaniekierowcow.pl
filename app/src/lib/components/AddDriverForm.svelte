<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from '../../routes/$types';
	import type { Driver } from '$lib/server/db/schema';

	let { form, editDriver, onCancel }: { form: ActionData; editDriver?: Driver | null; onCancel?: () => void } = $props();
	
	let isEditing = $derived(!!editDriver);
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-6">
		<h2 class="card-title mb-6">{isEditing ? 'Edit Driver' : 'Add New Driver'}</h2>
		<form method="post" action={isEditing ? '?/updateDriver' : '?/addDriver'} use:enhance class="space-y-6">
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
			{#if form?.success}
				<div role="alert" class="alert alert-success">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{isEditing ? 'Driver updated successfully!' : 'Driver added successfully!'}</span>
				</div>
			{/if}
			{#if isEditing}
				<input type="hidden" name="driverId" value={editDriver?.id} />
			{/if}
			<div class="form-control w-full">
				<label class="label" for="name">
					<span class="label-text font-medium">Name</span>
				</label>
				<input
					id="name"
					type="text"
					name="name"
					placeholder="Enter driver's name"
					class="input input-bordered w-full"
					value={editDriver?.name || ''}
					required
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="surname">
					<span class="label-text font-medium">Surname</span>
				</label>
				<input
					id="surname"
					type="text"
					name="surname"
					placeholder="Enter driver's surname"
					class="input input-bordered w-full"
					value={editDriver?.surname || ''}
					required
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="documentSerialNumber">
					<span class="label-text font-medium">Document Serial Number</span>
				</label>
				<input
					id="documentSerialNumber"
					type="text"
					name="documentSerialNumber"
					placeholder="Enter document serial number"
					class="input input-bordered w-full"
					value={editDriver?.documentSerialNumber || ''}
					required
				/>
			</div>
			<div class="form-control w-full pt-2 space-y-3">
				<button type="submit" class="btn btn-primary w-full">
					{isEditing ? 'Update Driver' : 'Add Driver'}
				</button>
				{#if isEditing && onCancel}
					<button type="button" class="btn btn-outline w-full" onclick={onCancel}>
						Cancel
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>
