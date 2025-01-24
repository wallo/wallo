import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from '$lib/auth';
import { sequence } from '@sveltejs/kit/hooks';

const authorizationHandle = (async ({ event, resolve }) => {
    // Protect any routes under /dashboard
    if (event.url.pathname.startsWith('/dashboard')) {
        const session = await event.locals.auth();
        if (!session) {
            // Redirect to the signin page
            throw redirect(303, '/login');
        }
    }

    // If the request is still here, just proceed as normally
    return resolve(event);
}) satisfies Handle;

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
