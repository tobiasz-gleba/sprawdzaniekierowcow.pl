<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		title: string;
		description: string;
		keywords?: string;
		image?: string;
		type?: 'website' | 'article';
		noindex?: boolean;
		canonical?: string;
	}

	let {
		title,
		description,
		keywords = 'sprawdzanie kierowców, uprawnienia kierowców, prawo jazdy, monitoring kierowców, CEK, Centralna Ewidencja Kierowców, weryfikacja kierowców, monitoring uprawnień',
		image = '/Screenshot.png',
		type = 'website',
		noindex = false,
		canonical
	}: Props = $props();

	const siteUrl = 'https://sprawdzaniekierowcow.pl';
	const fullTitle = title.includes('Sprawdzanie Kierowców') ? title : `${title} | Sprawdzanie Kierowców`;
	const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
	const canonicalUrl = canonical || `${siteUrl}${$page.url.pathname}`;
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{fullTitle}</title>
	<meta name="title" content={fullTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}
	
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:locale" content="pl_PL" />
	<meta property="og:site_name" content="Sprawdzanie Kierowców" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={fullTitle} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={fullImageUrl} />

	<!-- Additional SEO -->
	<meta name="author" content="Sprawdzanie Kierowców" />
	<meta name="language" content="Polish" />
</svelte:head>

