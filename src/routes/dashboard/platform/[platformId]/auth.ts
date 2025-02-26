import { error, fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { RouteParams } from './$types';
import type { Platform } from '$lib/types';
import { checkIsAdmin, checkIsModerator, getModerationPlatform } from '$lib/database';

export async function canEnterAction(
    params: RouteParams,
    platform: Readonly<App.Platform> | undefined,
    locals: App.Locals
): Promise<ActionFailure | { moderationPlatform: Platform; userId: string }> {
    const { platformId } = params;

    const [session, moderationPlatform] = await Promise.all([
        locals.auth(),
        getModerationPlatform(platformId, platform)
    ]);

    const userId = session?.user?.id;

    if (!userId) return fail(401);

    if (!moderationPlatform) return fail(404);

    const [isModerator, isAdmin] = await Promise.all([
        checkIsModerator(platformId, userId, platform),
        checkIsAdmin(moderationPlatform.organizationId, userId, platform)
    ]);

    if (!isModerator && !isAdmin) return fail(403);

    return { moderationPlatform, userId };
}

export async function canEnter(
    params: RouteParams,
    platform: Readonly<App.Platform> | undefined,
    locals: App.Locals
): Promise<{ moderationPlatform: Platform; userId: string }> {
    const { platformId } = params;

    const [session, moderationPlatform] = await Promise.all([
        locals.auth(),
        getModerationPlatform(platformId, platform)
    ]);

    const userId = session?.user?.id;

    if (!userId) redirect(303, '/login');

    if (!moderationPlatform) error(404, 'Platform not found');

    const [isModerator, isAdmin] = await Promise.all([
        checkIsModerator(platformId, userId, platform),
        checkIsAdmin(moderationPlatform.organizationId, userId, platform)
    ]);

    if (!isModerator && !isAdmin) redirect(303, '/dashboard');

    return { moderationPlatform, userId };
}
