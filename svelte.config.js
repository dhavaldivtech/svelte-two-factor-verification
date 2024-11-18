import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Specify the Node.js version for the adapter
			node: '18'
		})
	}
};

export default config;
