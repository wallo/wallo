import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editFormSchema } from './edit-schema';
import type { Orgnaization, Platform } from '$lib/types';
import { generateApiSecret } from '$lib/crypto';
import { inviteFormSchema } from './invite-moderator';
import { deleteModeratorFormSchema } from './delete-moderator';
import { dev } from '$app/environment';

async function isAuth({
	locals,
	platform,
	params
}: {
	locals: App.Locals;
	platform: Readonly<App.Platform> | undefined;
	params: RouteParams;
}): Promise<{
	moderationPlatform: Platform;
	organization: Orgnaization;
}> {
	const session = await locals.auth();
	const userId = session?.user?.id;
	if (!userId) redirect(303, '/login');
	const { platformId } = params;

	const moderationPlatform = await platform?.env.DB.prepare(`SELECT * FROM platforms WHERE id = ?`)
		.bind(platformId)
		.first<Platform>();

	if (!moderationPlatform) throw fail(404);

	const { organizationId } = moderationPlatform;

	const organization = await platform?.env.DB.prepare(
		'SELECT * FROM organizations WHERE id = ? AND adminId = ?'
	)
		.bind(organizationId, userId)
		.first<Orgnaization>();

	if (!organization) redirect(303, '/dashboard');

	return {
		moderationPlatform,
		organization
	};
}

export const load = (async ({ locals, platform, params, cookies }) => {
	const { moderationPlatform, organization } = await isAuth({ locals, platform, params });

	const moderators =
		(
			await platform?.env.DB.prepare(
				`SELECT u.*
				FROM platformModerators pm
				JOIN users u ON pm.userId = u.id
				WHERE pm.platformId = ?`
			)
				.bind(moderationPlatform.id)
				.all<{
					id: string;
					name: string;
					email: string;
					image: string;
				}>()
		)?.results ?? [];

	const invitations = (
		(
			await platform?.env.DB.prepare(`SELECT email FROM invitation WHERE platformId = ?`)
				.bind(moderationPlatform.id)
				.all<{
					email: string;
				}>()
		)?.results ?? []
	).map((i) => i.email);

	let cookieSecret = cookies.get('secret');

	if (cookieSecret !== moderationPlatform.secret) {
		cookieSecret = undefined;
	} else {
		cookies.delete('secret', {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict'
		});
	}

	return {
		organization,
		editPlatformForm: await superValidate(
			{
				platformName: moderationPlatform.name,
				callbackUrl: moderationPlatform.callbackUrl
			},
			zod(editFormSchema)
		),
		platformId: moderationPlatform.id,
		secret: cookieSecret,
		invitePlatformForm: await superValidate(zod(inviteFormSchema)),
		deleteModeratorForm: await superValidate(zod(deleteModeratorFormSchema)),
		moderators,
		invitations
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	update: async (event) => {
		const { locals, params, platform } = event;

		const { moderationPlatform, organization } = await isAuth({ locals, platform, params });

		if (organization === null) return fail(403);

		const form = await superValidate(event, zod(editFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { platformName, callbackUrl } = form.data;

		const platformId = moderationPlatform.id;

		await platform?.env.DB.prepare(`UPDATE platforms SET name = ?, callbackUrl = ? WHERE id = ?`)
			.bind(platformName, callbackUrl, platformId)
			.run();

		return { form };
	},
	delete: async ({ locals, params, platform }) => {
		const { moderationPlatform } = await isAuth({ locals, platform, params });

		await platform?.env.DB.prepare(`DELETE FROM platforms WHERE id = ?`)
			.bind(moderationPlatform.id)
			.run();

		redirect(303, '/dashboard/organization/' + moderationPlatform.organizationId);
	},
	regenerate: async (event) => {
		const { locals, params, platform } = event;
		const { moderationPlatform } = await isAuth({ locals, platform, params });

		const secret = generateApiSecret();

		await platform?.env.DB.prepare(`UPDATE platforms SET secret = ? WHERE id = ?`)
			.bind(secret, moderationPlatform.id)
			.run();

		const form = await superValidate(event, zod(editFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		event.cookies.set('secret', secret, {
			path: '/',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict'
		});

		return {
			...form,
			data: {
				...form.data,
				secret
			}
		};
	},
	invite: async (event) => {
		const { locals, params, platform } = event;
		const { moderationPlatform } = await isAuth({ locals, platform, params });

		const form = await superValidate(event, zod(inviteFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email } = form.data;

		await platform?.env.DB.prepare(`INSERT INTO invitation (email, platformId) VALUES (?, ?)`)
			.bind(email, moderationPlatform.id)
			.run();

		return { form };
	},
	deleteInvite: async (event) => {
		const { locals, params, platform } = event;
		const { moderationPlatform } = await isAuth({ locals, platform, params });

		const form = await superValidate(event, zod(inviteFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email } = form.data;

		await platform?.env.DB.prepare(`DELETE FROM invitation WHERE email = ? AND platformId = ?`)
			.bind(email, moderationPlatform.id)
			.run();

		return {};
	},
	deleteModerator: async (event) => {
		const { locals, params, platform } = event;
		const { moderationPlatform } = await isAuth({ locals, platform, params });

		const form = await superValidate(event, zod(deleteModeratorFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { id } = form.data;

		await platform?.env.DB.prepare(
			`DELETE FROM platformModerators WHERE userId = ? AND platformId = ?`
		)
			.bind(id, moderationPlatform.id)
			.run();

		return {};
	}
};
