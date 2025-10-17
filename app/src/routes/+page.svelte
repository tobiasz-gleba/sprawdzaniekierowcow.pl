<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import AboutApp from '$lib/components/AboutApp.svelte';

	let { data }: { data: PageServerData } = $props();

	// If user is logged in, redirect to dashboard
	onMount(() => {
		if (data.user) {
			goto('/dashboard', { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Sprawdzanie Kierowców - Darmowe monitorowanie uprawnień kierowców</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Landing Page -->
	<AboutApp />
</div>
