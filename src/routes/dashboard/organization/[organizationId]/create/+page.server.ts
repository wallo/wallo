import { superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { fail, redirect } from '@sveltejs/kit';
import { generateApiSecret, generateId } from '$lib/crypto';
import { dev } from '$app/environment';
import { getOrganization } from '$lib/database';

export const load = (async () => {
    return {
        form: await superValidate(zod(formSchema))
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod(formSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const { locals, platform, params } = event;

        const session = await locals.auth();

        const userId = session?.user?.id;

        if (!userId) return fail(401);

        // verify user is admin of organization
        const organization = await getOrganization(params.organizationId, userId, platform);

        if (organization === null) return fail(403);

        const { callbackUrl, platformName } = form.data;
        const secret = generateApiSecret();

        if (!platformName) return fail(400, { organizationName: platformName, missing: true });

        const platformId = 'plat_' + generateId();

        await platform?.env.DB.prepare(
            'INSERT INTO platforms (id, organizationId, name, callbackUrl, secret) VALUES (?, ?, ?, ?, ?)'
        )
            .bind(platformId, params.organizationId, platformName, callbackUrl, secret)
            .run();

        await event.cookies.set('secret', secret, {
            path: '/',
            httpOnly: true,
            secure: !dev,
            sameSite: 'strict'
        });

        redirect(303, `/dashboard/platform/${platformId}/edit`);
    }
};
