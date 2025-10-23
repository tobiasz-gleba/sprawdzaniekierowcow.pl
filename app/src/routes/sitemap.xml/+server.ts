import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const siteUrl = 'https://sprawdzaniekierowcow.pl';

	// Define all public pages
	const pages = [
		{ url: '', priority: '1.0', changefreq: 'daily' }, // Homepage
		{ url: '/login', priority: '0.8', changefreq: 'monthly' },
		{ url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
		{ url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
		{ url: '/contact', priority: '0.6', changefreq: 'monthly' },
		{ url: '/forgot-password', priority: '0.4', changefreq: 'monthly' },
		{ url: '/resend-verification', priority: '0.4', changefreq: 'monthly' }
	];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
	.map(
		(page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
