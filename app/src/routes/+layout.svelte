<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/components/Toast.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();

	// Structured Data for Organization
	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Sprawdzanie Kierowców',
		url: 'https://sprawdzaniekierowcow.pl',
		logo: 'https://sprawdzaniekierowcow.pl/Screenshot.png',
		description:
			'Darmowa aplikacja do monitorowania uprawnień kierowców i sprawdzania statusu praw jazdy w Centralnej Ewidencji Kierowców',
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'PL'
		}
	};

	// Structured Data for Website
	const websiteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Sprawdzanie Kierowców',
		url: 'https://sprawdzaniekierowcow.pl',
		description:
			'Darmowe monitorowanie uprawnień kierowców i automatyczne powiadomienia o zmianach statusu',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://sprawdzaniekierowcow.pl/dashboard?search={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`}
</svelte:head>

{@render children?.()}
<Footer />
<Toast />
