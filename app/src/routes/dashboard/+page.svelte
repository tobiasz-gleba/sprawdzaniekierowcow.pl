<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import type { PageServerData, ActionData } from './$types';
	import type { Driver } from '$lib/server/db/schema';
	import AddDriverForm from '$lib/components/AddDriverForm.svelte';
	import DriverList from '$lib/components/DriverList.svelte';
	import DriverStats from '$lib/components/DriverStats.svelte';
	import ImportDriversForm from '$lib/components/ImportDriversForm.svelte';
	import SEO from '$lib/components/SEO.svelte';

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

	// Auto-refresh when there are pending drivers
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		// Check if there are any pending drivers (status === 2)
		const hasPendingDrivers = data.drivers.some((driver) => driver.status === 2);

		if (hasPendingDrivers && !pollInterval) {
			// Start polling every 3 seconds
			pollInterval = setInterval(() => {
				invalidateAll();
			}, 3000);
		} else if (!hasPendingDrivers && pollInterval) {
			// Stop polling when no more pending drivers
			clearInterval(pollInterval);
			pollInterval = null;
		}

		// Cleanup function
		return () => {
			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = null;
			}
		};
	});

	// Ensure cleanup on component destroy
	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
	});
</script>

<SEO
	title="Dashboard - Sprawdzanie Kierowców"
	description="Panel zarządzania kierowcami - monitoruj uprawnienia, dodawaj kierowców i otrzymuj powiadomienia o zmianach statusu praw jazdy."
	noindex={true}
/>

<div class="min-h-screen bg-base-200">
	<div class="container mx-auto max-w-7xl p-4 md:p-8">
		<div class="space-y-6">
			<div class="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
				<div>
					<h1 class="mb-2 text-4xl font-bold">Witaj, {data.user.email.split('@')[0]}!</h1>
					<p class="text-base-content/70">Monitoruj uprawnienia kierowców</p>
				</div>
				<form method="post" action="?/logout" use:enhance>
					<button type="submit" class="btn btn-outline btn-sm">Wyloguj</button>
				</form>
			</div>

			<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<div class="space-y-6 xl:col-span-1">
					<DriverStats drivers={data.drivers} />
					<AddDriverForm editDriver={editingDriver} onCancel={handleCancelEdit} />
					<ImportDriversForm {form} />
				</div>
				<div class="xl:col-span-2">
					<DriverList drivers={data.drivers} onEdit={handleEdit} />
				</div>
			</div>
		</div>
	</div>
</div>
