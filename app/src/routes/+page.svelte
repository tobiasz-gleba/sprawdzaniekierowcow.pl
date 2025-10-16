<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { PageServerData, ActionData } from './$types';
	import type { Driver } from '$lib/server/db/schema';
	import AddDriverForm from '$lib/components/AddDriverForm.svelte';
	import DriverList from '$lib/components/DriverList.svelte';
	import DriverStats from '$lib/components/DriverStats.svelte';

	let { data, form }: { data: PageServerData; form: ActionData } = $props();
	
	let editingDriver: Driver | null = $state(null);
	
	function handleEdit(driver: Driver) {
		editingDriver = driver;
	}
	
	function handleCancelEdit() {
		editingDriver = null;
	}
	
	// Clear editing state when form is successfully submitted
	$effect(() => {
		if (form?.success) {
			editingDriver = null;
		}
	});
</script>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto p-4 md:p-8 max-w-7xl">
		<div class="space-y-6">
			<div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
				<div>
					<h1 class="text-4xl font-bold mb-2">Welcome, {data.user.email.split('@')[0]}!</h1>
					<p class="text-base-content/70">Manage and monitor your driver license data</p>
				</div>
				<form method="post" action="?/logout" use:enhance>
					<button type="submit" class="btn btn-outline btn-sm">Logout</button>
				</form>
			</div>

		<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
			<div class="xl:col-span-1 space-y-6">
				<AddDriverForm {form} editDriver={editingDriver} onCancel={handleCancelEdit} />
				<DriverStats drivers={data.drivers} />
			</div>
			<div class="xl:col-span-2">
				<DriverList drivers={data.drivers} onEdit={handleEdit} />
			</div>
		</div>
		</div>
	</div>
</div>
