import { getProviders } from '$lib/auth';
import type { PageServerLoad } from './$types';
import { signIn } from '$lib/auth';
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
	const { session } = await event.parent();

	if (session?.user) {
		redirect(303, '/dashboard');
	}

	return {
		providerMap: event.platform?.env
			? (await getProviders(event.platform?.env)).map((provider) => ({
					id: provider.id,
					name: provider.name
				}))
			: []
	};
}) satisfies PageServerLoad;

export const actions = { default: signIn } satisfies Actions;
