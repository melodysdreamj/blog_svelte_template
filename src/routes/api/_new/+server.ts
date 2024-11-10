// --- src/routes/api/verify-recaptcha/+server.ts ---
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {

    return new Response(JSON.stringify({ success: true }), { status: 200 });
};