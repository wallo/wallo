import { error, fail, redirect, type ActionFailure } from '@sveltejs/kit';
import type { RouteParams } from './$types';
import type { Orgnaization, Platform } from '$lib/types';

export async function canEnterAction(
	params: RouteParams,
	platform: Readonly<App.Platform> | undefined,
	locals: App.Locals
): Promise<ActionFailure | { moderationPlatform: Platform; userId: string }> {
	const session = await locals.auth();

	const userId = session?.user?.id;

	if (!userId) return fail(401);

	const { platformId } = params;

	const moderationPlatform =
		(await platform?.env.DB.prepare('SELECT * FROM platforms WHERE id = ?')
			.bind(platformId)
			.first<Platform>()) ?? null;

	const isModerator =
		((await platform?.env.DB.prepare(
			'SELECT * FROM platformModerators WHERE platformId = ? AND userId = ?'
		)
			.bind(platformId, userId)
			.first()) ?? null) !== null;

	if (!moderationPlatform) return fail(404);

	if (!isModerator) {
		const isAdmin =
			((await platform?.env.DB.prepare('SELECT * FROM organizations WHERE id = ? AND adminId = ?')
				.bind(moderationPlatform.organizationId, userId)
				.first<Orgnaization>()) ?? null) !== null;

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

	if (!userId) redirect(303, '/auth/signin');

	const { platformId } = params;

	const moderationPlatform =
		(await platform?.env.DB.prepare('SELECT * FROM platforms WHERE id = ?')
			.bind(platformId)
			.first<Platform>()) ?? null;

	const isModerator =
		((await platform?.env.DB.prepare(
			'SELECT * FROM platformModerators WHERE platformId = ? AND userId = ?'
		)
			.bind(platformId, userId)
			.first()) ?? null) !== null;

	if (!moderationPlatform) error(404);

	if (!isModerator) {
		const isAdmin =
			((await platform?.env.DB.prepare('SELECT * FROM organizations WHERE id = ? AND adminId = ?')
				.bind(moderationPlatform.organizationId, userId)
				.first<Orgnaization>()) ?? null) !== null;

		if (!isAdmin) {
			redirect(303, '/dashboard');
		}
	}

	return { moderationPlatform, userId };
}
