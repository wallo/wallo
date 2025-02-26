import type { CustomAction, DiscussionAction, PlatformAction } from '$lib/types';
import { error, fail, isActionFailure } from '@sveltejs/kit';
import { canEnter, canEnterAction } from '../../../auth';
import type { Actions, PageServerLoad } from './$types';
import { commentFormSchema } from './comment-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { actionFormSchema } from './action-schema';
import { redirectMe } from '../../../queue';
import { skip } from './queue';
import { retrieveSubjectData } from '$lib/api';
import { getActions, getCase, getRules } from '$lib/database';

export const load = (async ({ params, platform, locals }) => {
    const timeAtLoad = performance.now();
    const { moderationPlatform } = await canEnter(params, platform, locals);
    console.log('Time to check permissions:', performance.now() - timeAtLoad);

    const timeAtGetCase = performance.now();
    const moderationCase = await getCase(
        moderationPlatform.id,
        params.caseId,
        params.kindId,
        platform
    );
    console.log('Time to get case:', performance.now() - timeAtGetCase);

    if (!moderationCase) error(404, 'Case not found in database');

    const url = new URL(moderationPlatform.callbackUrl);

    const timeAtRetrieveSubjectData = performance.now();
    const subject = await retrieveSubjectData(
        {
            url,
            secret: moderationPlatform.secret
        },
        params.kindId,
        params.caseId
    );
    console.log('Time to retrieve subject data:', performance.now() - timeAtRetrieveSubjectData);

    if (subject.valid === false) error(subject.error.code, subject.error.message);

    const timeAtGetRulesAndActions = performance.now();
    const [rules, actions] = await Promise.all([
        getRules(moderationPlatform.id, platform),
        getActions(moderationPlatform.id, params.caseId, params.kindId, platform)
    ]);
    console.log('Time to get rules and actions:', performance.now() - timeAtGetRulesAndActions);

    return {
        moderationCase: moderationCase,
        kind: params.kindId,
        subject: subject.data,
        actions,
        commentForm: await superValidate(zod(commentFormSchema)),
        actionForm: await superValidate(zod(actionFormSchema)),
        rules
    };
}) satisfies PageServerLoad;

export const actions: Actions = {
    comment: async (event) => {
        const failureOrInfo = await canEnterAction(event.params, event.platform, event.locals);

        if (isActionFailure(failureOrInfo)) {
            return failureOrInfo;
        }

        const { moderationPlatform, userId } = failureOrInfo;

        const form = await superValidate(event, zod(commentFormSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        await event.platform?.env.DB.prepare(
            'INSERT INTO actions(platformId, relevantId, authorId, kind, actionInfo) VALUES(?, ?, ?, ?, ?)'
        )
            .bind(
                moderationPlatform.id,
                event.params.caseId,
                userId,
                event.params.kindId,
                JSON.stringify({
                    kind: 'comment',
                    text: form.data.comment
                } satisfies CustomAction | DiscussionAction | PlatformAction)
            )
            .run();

        return { success: true };
    },
    action: async (event) => {
        const timeAtCanEnterAction = performance.now();
        const failureOrInfo = await canEnterAction(event.params, event.platform, event.locals);
        console.log('Time to check permissions:', performance.now() - timeAtCanEnterAction);

        if (isActionFailure(failureOrInfo)) {
            return failureOrInfo;
        }

        const { moderationPlatform, userId } = failureOrInfo;

        const form = await superValidate(event, zod(actionFormSchema));
        if (!form.valid) {
            return fail(400, {
                form
            });
        }

        if (form.data.id === '__skip__') {
            await skip(userId, { ...event });
        } else {
            const timeAtInsertAction = performance.now();
            await event.platform?.env.DB.prepare(
                'INSERT INTO actions(platformId, relevantId, authorId, kind, actionInfo) VALUES(?, ?, ?, ?, ?)'
            )
                .bind(
                    moderationPlatform.id,
                    event.params.caseId,
                    userId,
                    event.params.kindId,
                    JSON.stringify({
                        kind: 'custom',
                        id: form.data.id,
                        display: form.data.display ?? form.data.id
                    } satisfies CustomAction | DiscussionAction | PlatformAction)
                )
                .run();
            console.log('Time to insert action:', performance.now() - timeAtInsertAction);

            const timeAtSendNotification = performance.now();
            await event.platform?.env.CLIENT_NOTIFICATIONS.send({
                platformId: moderationPlatform.id,
                case: {
                    id: event.params.caseId,
                    kind: event.params.kindId
                },
                action: form.data.id
            });
            console.log('Time to send notification:', performance.now() - timeAtSendNotification);

            const timeAtUpdateCaseStatus = performance.now();
            await event.platform?.env.DB.prepare(
                `UPDATE cases
					SET status = 'resolved'
					WHERE platformId = ?1
						AND relevantId = ?2
						AND kind = ?3`
            )
                .bind(moderationPlatform.id, event.params.caseId, event.params.kindId)
                .run();
            console.log('Time to update case status:', performance.now() - timeAtUpdateCaseStatus);
        }

        await redirectMe(userId, { ...event });
    }
};
