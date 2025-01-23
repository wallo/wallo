import { setEnvDefaults } from '@auth/core';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';
import Gitlab from '@auth/sveltekit/providers/gitlab';
import { D1Adapter } from '@auth/d1-adapter';
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';

export const getProviders = async (env_map: Env) => {
	const possible_auth_methods = [Google({}), GitHub({}), Gitlab({})];
	const filtered_auth_methods = possible_auth_methods.filter((provider) => {
		const ID = provider.id.toUpperCase().replace(/-/g, '_');
		return (
			Object.hasOwnProperty.call(env_map, `AUTH_${ID}_ID`) &&
			Object.hasOwnProperty.call(env_map, `AUTH_${ID}_SECRET`)
		);
	});

	return filtered_auth_methods;
};

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const db = event.platform?.env.DB;

	if (!db) {
		throw new Error('DB adapter is not provided');
	}

	const env_map = event.platform?.env;

	if (!env_map) {
		throw new Error('Environment variables are not provided');
	}

	if (!env_map.AUTH_SECRET) {
		throw new Error('Session secret is not provided');
	}

	const filtered_auth_methods = await getProviders(env_map);

	if (filtered_auth_methods.length === 0) {
		throw new Error('No authentication methods are configured');
	}

	const config: SvelteKitAuthConfig = {
		providers: filtered_auth_methods,
		trustHost: true,
		adapter: D1Adapter(db),
		callbacks: {
			session({ session, user }) {
				session.user.id = user.id;
				return session;
			}
		},
		pages: {
			signIn: '/login',
			signOut: '/404'
		}
	};

	setEnvDefaults(event.platform?.env, config);

	return config;
});
