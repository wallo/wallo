import { error, fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { RouteParams } from './$types';
import type { Platform } from '$lib/types';
import { getModerationPlatform, getOrganization } from '$lib/database';

export async function canEnterAction(
    params: RouteParams,
    platform: Readonly<App.Platform> | undefined,
    locals: App.Locals
): Promise<ActionFailure | { moderationPlatform: Platform; userId: string }> {
    const session = await locals.auth();

    const userId = session?.user?.id;

    if (!userId) return fail(401);

    const { platformId } = params;

    const moderationPlatform = await getModerationPlatform(platformId, platform);

    const isModerator =
        ((await platform?.env.DB.prepare(
            'SELECT * FROM platformModerators WHERE platformId = ? AND userId = ?'
        )
            .bind(platformId, userId)
            .first()) ?? null) !== null;

    if (!moderationPlatform) return fail(404);

    if (!isModerator) {
        const isAdmin =
            (await getOrganization(moderationPlatform.organizationId, userId, platform)) !== null;

        if (!isAdmin) {
            return fail(403);
        }
    }

    return { moderationPlatform, userId };
}

export async function canEnter(
    params: RouteParams,
    platform: Readonly<App.Platform> | undefined,
    locals: App.Locals
): Promise<{ moderationPlatform: Platform; userId: string }> {
    const session = await locals.auth();

    const userId = session?.user?.id;

    if (!userId) redirect(303, '/login');

    const { platformId } = params;

    const moderationPlatform = await getModerationPlatform(platformId, platform);

    const isModerator =
        ((await platform?.env.DB.prepare(
            'SELECT * FROM platformModerators WHERE platformId = ? AND userId = ?'
        )
            .bind(platformId, userId)
            .first()) ?? null) !== null;

    if (!moderationPlatform) error(404, 'Platform not found');

    if (!isModerator) {
        const isAdmin =
            (await getOrganization(moderationPlatform.organizationId, userId, platform)) !== null;

        if (!isAdmin) {
            redirect(303, '/dashboard');
        }
    }

    return { moderationPlatform, userId };
}
