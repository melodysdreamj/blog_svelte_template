// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {

	declare namespace App {
		// interface Error {}
		interface Locals {}
		// interface PageData {}
		interface Platform {
			env: {
				TESTKV: test;
				DeployArticles: google_trend_chat_gpt_wiki;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache }
		}

		interface Session {}

		interface Stuff {}
	}

	// interface Platform {
	// 	env: {
	// 		COUNTER: TESTKV;
	// 	};
	// 	context: {
	// 		waitUntil(promise: Promise<any>): void;
	// 	};
	// 	caches: CacheStorage & { default: Cache }
	// }
}

export {};
