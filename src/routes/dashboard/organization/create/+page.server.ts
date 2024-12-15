import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { generateId } from '$lib/crypto';

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

		const { locals, platform } = event;

		const session = await locals.auth();

		if (!session?.user?.id) return fail(401);

		const organizationName = form.data.organization_name;

		const organizationId = 'org_' + generateId();

		await platform?.env.DB.prepare('INSERT INTO organizations (id, name, adminId) VALUES (?, ?, ?)')
			.bind(organizationId, organizationName, session.user.id)
			.run();

		redirect(303, `/dashboard/organization/${organizationId}`);
	}
};
