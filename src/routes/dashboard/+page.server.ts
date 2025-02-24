import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { OrganizationDB, Platform } from '$lib/types';
import { superValidate } from 'sveltekit-superforms';
import { inviteFormSchema } from './invite-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { fixOrganization } from '$lib/database';

export const load = (async (event) => {
    const { session } = await event.parent();

    const userId = session?.user?.id;

    if (!userId) redirect(303, '/');

    const organizationsAdminOf = (
        (
            await event.platform?.env.DB.prepare(
                `SELECT o.*, COUNT(p.id) as platformCount
                FROM organizations o
                LEFT JOIN platforms p ON o.id = p.organizationId
                WHERE o.adminId = ?
                GROUP BY o.id, o.name, o.adminId, o.createdAt, o.updatedAt`
            )
                .bind(userId)
                .all<OrganizationDB & { platformCount: number }>()
        )?.results ?? []
    ).map((o) => ({ ...fixOrganization(o), platformCount: o.platformCount }));

    const platformsModeratorOf = (
        (
            await event.platform?.env.DB.prepare(
                `SELECT p.*, COUNT(c.relevantId) as caseCount
                FROM platforms p 
                JOIN platformModerators pm ON p.id = pm.platformId
                LEFT JOIN cases c ON p.id = c.platformId
                WHERE pm.userId = ?
                GROUP BY p.id, p.organizationId, p.name, p.callbackUrl, p.secret`
            )
                .bind(userId)
                .all<Platform & { caseCount: number }>()
        )?.results ?? []
    ).map((p) => ({
        id: p.id,
        name: p.name,
        organizationId: p.organizationId,
        caseCount: p.caseCount
    }));

    const platformsAdminOf = (
        (
            await event.platform?.env.DB.prepare(
                `SELECT p.*, COUNT(c.relevantId) as caseCount
                FROM organizations o
                JOIN platforms p ON o.id = p.organizationId
                LEFT JOIN cases c ON p.id = c.platformId
                WHERE o.adminId = ?
                GROUP BY p.id, p.organizationId, p.name, p.callbackUrl, p.secret`
            )
                .bind(userId)
                .all<Platform & { caseCount: number }>()
        )?.results ?? []
    ).map((p) => ({
        id: p.id,
        name: p.name,
        organizationId: p.organizationId,
        caseCount: p.caseCount
    }));

    const email = session?.user?.email;

    const platformsInvitedTo = (
        (
            await event.platform?.env.DB.prepare(
                `SELECT p.*
                FROM invitation i
                JOIN platforms p ON i.platformId = p.id
                WHERE i.email = ?`
            )
                .bind(email)
                .all<Platform>()
        )?.results ?? []
    ).map((p) => ({ id: p.id, name: p.name, organizationId: p.organizationId }));

    return {
        organizationsAdminOf,
        platformsModeratorOf,
        platformsAdminOf,
        platformsInvitedTo,
        inviteForm: await superValidate(zod(inviteFormSchema))
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    acceptInvite: async (event) => {
        const session = await event.locals.auth();

        const userId = session?.user?.id;

        if (!userId) redirect(303, '/');

        const form = await superValidate(event, zod(inviteFormSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const isInvited =
            (
                await event.platform?.env.DB.prepare(
                    'DELETE FROM invitation WHERE email = ? AND platformId = ?'
                )
                    .bind(session?.user?.email, form.data.platformId)
                    .run()
            )?.meta.changed_db ?? false;

        if (isInvited) {
            await event.platform?.env.DB.prepare(
                'INSERT INTO platformModerators (userId, platformId) VALUES (?, ?)'
            )
                .bind(userId, form.data.platformId)
                .run();
        }

        return redirect(303, '/dashboard');
    },
    deleteInvite: async (event) => {
        const session = await event.locals.auth();

        const userId = session?.user?.id;

        if (!userId) redirect(303, '/');

        const form = await superValidate(event, zod(inviteFormSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        await event.platform?.env.DB.prepare(
            'DELETE FROM invitation WHERE email = ? AND platformId = ?'
        )
            .bind(session?.user?.email, form.data.platformId)
            .run();

        return redirect(303, '/dashboard');
    }
};
