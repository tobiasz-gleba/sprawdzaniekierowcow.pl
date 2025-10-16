<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Driver } from '$lib/server/db/schema';
	import { notifications } from '$lib/stores/notifications';

	let { editDriver, onCancel }: { editDriver?: Driver | null; onCancel?: () => void } = $props();

	let isEditing = $derived(!!editDriver);
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-6">
		<h2 class="mb-6 card-title">{isEditing ? 'Edytuj Kierowcę' : 'Dodaj Nowego Kierowcę'}</h2>
		<form
			method="post"
			action={isEditing ? '?/updateDriver' : '?/addDriver'}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						notifications.add(
							isEditing ? 'Kierowca zaktualizowany pomyślnie!' : 'Kierowca dodany pomyślnie!',
							'success'
						);
					} else if (
						result.type === 'failure' &&
						result.data &&
						typeof result.data === 'object' &&
						'message' in result.data
					) {
						notifications.add(result.data.message as string, 'error');
					}
					await update();
				};
			}}
			class="space-y-6"
		>
			{#if isEditing}
				<input type="hidden" name="driverId" value={editDriver?.id} />
			{/if}
			<div class="form-control w-full">
				<label class="label" for="name">
					<span class="label-text font-medium">Imię</span>
				</label>
				<input
					id="name"
					type="text"
					name="name"
					placeholder="Wprowadź imię kierowcy"
					class="input-bordered input w-full"
					value={editDriver?.name || ''}
					required
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="surname">
					<span class="label-text font-medium">Nazwisko</span>
				</label>
				<input
					id="surname"
					type="text"
					name="surname"
					placeholder="Wprowadź nazwisko kierowcy"
					class="input-bordered input w-full"
					value={editDriver?.surname || ''}
					required
				/>
			</div>
			<div class="form-control w-full">
				<label class="label" for="documentSerialNumber">
					<span class="label-text font-medium">Numer Seryjny Dokumentu</span>
				</label>
				<input
					id="documentSerialNumber"
					type="text"
					name="documentSerialNumber"
					placeholder="Wprowadź numer seryjny dokumentu"
					class="input-bordered input w-full"
					value={editDriver?.documentSerialNumber || ''}
					required
				/>
			</div>
			<div class="form-control w-full space-y-3 pt-2">
				<button type="submit" class="btn w-full btn-primary">
					{isEditing ? 'Zaktualizuj Kierowcę' : 'Dodaj Kierowcę'}
				</button>
				{#if isEditing && onCancel}
					<button type="button" class="btn w-full btn-outline" onclick={onCancel}> Anuluj </button>
				{/if}
			</div>
		</form>
	</div>
</div>
