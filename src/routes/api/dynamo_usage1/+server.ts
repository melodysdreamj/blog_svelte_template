// --- src/routes/api/verify-recaptcha/+server.ts ---
import type { RequestHandler } from '@sveltejs/kit';
import { PracticeDynamoDb } from '$lib/server/dynamodb/practice/_';

export const GET: RequestHandler = async ({ request, platform }) => {

    // await PracticeDynamoDb.createTable(platform);

    let result = await PracticeDynamoDb.get('example', platform);


    return new Response(JSON.stringify({ success: true, result: result }), { status: 200 });
};