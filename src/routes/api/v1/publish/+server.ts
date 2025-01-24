import type { Platform } from '$lib/types';
import type { RequestHandler } from './$types';
import { timingSafeEqual } from '$lib/crypto';

export const POST: RequestHandler = async ({ request, platform }) => {
    const authorizationHeader = request.headers.get('Authorization');

    if (!authorizationHeader) return new Response('Missing Authorization Header', { status: 400 });

    const bearerString = 'Bearer ';

    if (!authorizationHeader.startsWith(bearerString))
        return new Response('Missing Bearer Prefix', { status: 400 });

    const clientSecret = authorizationHeader.slice(bearerString.length).trim();

    const {
        subjectId: id,
        platformId: clientId,
        subjectKind: kind
    } = await request.json<{
        subjectId: string;
        subjectKind: 'content' | 'account' | 'community';
        platformId: string;
    }>();

    const client =
        (await platform?.env.DB.prepare('SELECT * FROM platforms WHERE id = ?')
            .bind(clientId)
            .first<Platform>()) ?? null;

    if (!client) return new Response('', { status: 400 });

    if (!timingSafeEqual(clientSecret ?? '', client.secret))
        return new Response('Wrong API Key', { status: 403 });

    await platform?.env.DB.prepare(
        'INSERT INTO cases (platformId, relevantId, kind, status) VALUES (?, ?, ?, ?)'
    )
        .bind(clientId, id, kind, 'unresolved')
        .run();

    await platform?.env.DB.prepare(
        'INSERT INTO actions (platformId, relevantId, kind, actionInfo) VALUES (?, ?, ?, ?)'
    )
        .bind(clientId, id, kind, '{"kind":"requestPublication"}')
        .run();

    return new Response();
};
