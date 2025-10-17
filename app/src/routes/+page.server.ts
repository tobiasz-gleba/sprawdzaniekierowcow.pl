import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	// Cache the static landing page for 24 hours
	event.setHeaders({
		'Cache-Control': 'public, max-age=86400, s-maxage=86400'
	});

	return { user };
};
