import type { LayoutServerLoad } from './$types';

export const trailingSlash = 'always';

export const load = (async (event) => {
    const session = await event.locals.auth();

    return {
        session
    };
}) satisfies LayoutServerLoad;
