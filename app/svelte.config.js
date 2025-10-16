import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto automatically picks the right adapter for your deployment
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
