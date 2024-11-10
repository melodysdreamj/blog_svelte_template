import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		env: {
			dir: process.env // 클라이언트와 서버 모두에서 접근 가능하게 설정
		}
	}
};

export default config;
