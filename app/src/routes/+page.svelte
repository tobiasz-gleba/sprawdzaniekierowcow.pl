<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';
	import AboutApp from '$lib/components/AboutApp.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data }: { data: PageServerData } = $props();

	// If user is logged in, redirect to dashboard
	onMount(() => {
		if (data.user) {
			goto('/dashboard', { replaceState: true });
		}
	});
</script>

<SEO 
	title="Sprawdzanie Kierowców - Darmowe monitorowanie uprawnień kierowców"
	description="Darmowa aplikacja do monitorowania uprawnień kierowców. Automatyczne sprawdzanie statusu praw jazdy w Centralnej Ewidencji Kierowców (CEK). Otrzymuj powiadomienia o zmianach statusu uprawnień. System dla firm transportowych i zarządców flot."
	keywords="sprawdzanie kierowców, uprawnienia kierowców, prawo jazdy, monitoring kierowców, CEK, Centralna Ewidencja Kierowców, weryfikacja kierowców, flota pojazdów, firma transportowa, powiadomienia kierowcy"
/>

<div class="min-h-screen">
	<!-- Landing Page -->
	<AboutApp />
</div>
