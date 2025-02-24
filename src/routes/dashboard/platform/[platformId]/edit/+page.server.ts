import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editFormSchema } from './edit-schema';
import type { Organization, Platform } from '$lib/types';
import { generateApiSecret, generateRuleId } from '$lib/crypto';
import { inviteFormSchema } from './invite-moderator';
import { deleteModeratorFormSchema } from './delete-moderator';
import { dev } from '$app/environment';
import { archiveRuleSchema, editRuleSchema, createRuleSchema } from './rules-schema';
import { getModerationPlatform, getOrganization, getRules } from '$lib/database';

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
    organization: Organization;
}> {
    const session = await locals.auth();
    const userId = session?.user?.id;
    if (!userId) redirect(303, '/login');
    const { platformId } = params;

    const moderationPlatform = await getModerationPlatform(platformId, platform);

    if (!moderationPlatform) throw fail(404);

    const { organizationId } = moderationPlatform;

    const organization = await getOrganization(organizationId, userId, platform);

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

    const rules = await getRules(moderationPlatform.id, platform);

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
        editRuleForms: await Promise.all(
            rules.map(
                async (rule) =>
                    await superValidate(
                        {
                            ruleId: rule.ruleId,
                            readableName: rule.readableName,
                            title: rule.information.title,
                            description: rule.information.description
                        },
                        zod(editRuleSchema)
                    )
            )
        ),
        archiveRuleForms: await Promise.all(
            rules.map(
                async (rule) =>
                    await superValidate(
                        {
                            ruleId: rule.ruleId
                        },
                        zod(archiveRuleSchema)
                    )
            )
        ),
        createRuleForm: await superValidate(zod(createRuleSchema)),
        moderators,
        invitations,
        rules
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

        await platform?.env.DB.prepare(
            `UPDATE platforms SET name = ?, callbackUrl = ? WHERE id = ?`
        )
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
    },
    createRule: async (event) => {
        const { locals, params, platform } = event;
        const { moderationPlatform } = await isAuth({ locals, platform, params });

        const form = await superValidate(event, zod(createRuleSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const { readableName, title, description } = form.data;

        const ruleId = generateRuleId();

        await platform?.env.DB.prepare(
            `INSERT INTO rules (platformId, ruleId, readableName, information) VALUES (?, ?, ?, ?)`
        )
            .bind(
                moderationPlatform.id,
                ruleId,
                readableName,
                JSON.stringify({ title, description })
            )
            .run();

        return { form };
    },
    updateRule: async (event) => {
        const { locals, params, platform } = event;
        const { moderationPlatform } = await isAuth({ locals, platform, params });

        const form = await superValidate(event, zod(editRuleSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const { ruleId, readableName, title, description } = form.data;

        await platform?.env.DB.prepare(
            `UPDATE rules SET readableName = ?, information = ?, updatedAt = CURRENT_TIMESTAMP WHERE ruleId = ? AND platformId = ?`
        )
            .bind(
                readableName,
                JSON.stringify({ title, description }),
                ruleId,
                moderationPlatform.id
            )
            .run();

        return { form };
    },
    archiveRule: async (event) => {
        const { locals, params, platform } = event;
        const { moderationPlatform } = await isAuth({ locals, platform, params });

        const form = await superValidate(event, zod(archiveRuleSchema));

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const { ruleId } = form.data;

        await platform?.env.DB.prepare(
            `UPDATE rules SET active = 0, updatedAt = CURRENT_TIMESTAMP WHERE ruleId = ? AND platformId = ?`
        )
            .bind(ruleId, moderationPlatform.id)
            .run();

        return { form };
    },
    unarchiveRule: async (event) => {
        const { locals, params, platform } = event;
        const { moderationPlatform } = await isAuth({ locals, platform, params });

        const form = await superValidate(event, zod(archiveRuleSchema));

        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        const { ruleId } = form.data;

        await platform?.env.DB.prepare(
            `UPDATE rules SET active = 1, updatedAt = CURRENT_TIMESTAMP WHERE ruleId = ? AND platformId = ?`
        )
            .bind(ruleId, moderationPlatform.id)
            .run();

        return { form };
    }
};
