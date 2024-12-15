import { fixOrganization, type OrgnaizationDB, type Platform } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, platform, locals }) => {
	const session = await locals.auth();
	const userId = session?.user?.id;
	if (!userId) redirect(303, '/auth/signin');
	const { organizationId } = params;

	const organization =
		(await platform?.env.DB.prepare('SELECT * FROM organizations WHERE id = ? AND adminId = ?')
			.bind(organizationId, userId)
			.first<OrgnaizationDB>()) ?? null;

	if (organization === null) redirect(303, '/dashboard');

	const platforms = (
		(
			await platform?.env.DB.prepare(
				`SELECT p.*, COUNT(c.relevantId) as caseCount
				FROM organizations o
				INNER JOIN platforms p ON o.id = p.organizationId
				LEFT JOIN cases c ON p.id = c.platformId
				WHERE o.id = ?
				GROUP BY p.id, p.organizationId, p.name, p.callbackUrl, p.secret`
			)
				.bind(organizationId)
				.all<Platform & { caseCount: number }>()
		)?.results ?? []
	).map((p) => ({ id: p.id, name: p.name, caseCount: p.caseCount }));

	return {
		organization: fixOrganization(organization),
		platforms
	};
}) satisfies PageServerLoad;
