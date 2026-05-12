<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageServerData } from './$types';
	import AboutApp from '$lib/components/AboutApp.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data }: { data: PageServerData } = $props();

	const INTEROFFICE_URL = 'https://interoffice.sprawdzaniekierowcow.pl';
	const INTEROFFICE_CHECK_TIMEOUT_MS = 2500;

	async function hasOkInterofficeResponse(method: 'HEAD' | 'GET', signal: AbortSignal) {
		try {
			const response = await fetch(INTEROFFICE_URL, {
				method,
				cache: 'no-store',
				credentials: 'omit',
				mode: 'cors',
				signal
			});

			return response.status === 200;
		} catch {
			return false;
		}
	}

	onMount(() => {
		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => controller.abort(), INTEROFFICE_CHECK_TIMEOUT_MS);
		let mounted = true;

		async function redirectIfNeeded() {
			const isInterofficeReachable =
				(await hasOkInterofficeResponse('HEAD', controller.signal)) ||
				(await hasOkInterofficeResponse('GET', controller.signal));

			window.clearTimeout(timeoutId);

			if (!mounted) {
				return;
			}

			if (isInterofficeReachable) {
				window.location.replace(INTEROFFICE_URL);
				return;
			}

			if (data.user) {
				await goto(resolve('/dashboard'), { replaceState: true });
			}
		}

		void redirectIfNeeded();

		return () => {
			mounted = false;
			window.clearTimeout(timeoutId);
			controller.abort();
		};
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
