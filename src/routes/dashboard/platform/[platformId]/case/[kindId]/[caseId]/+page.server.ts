import {
	fixAction,
	fixCase,
	type ActionDB,
	type CaseDB,
	type CustomAction,
	type DiscussionAction,
	type PlatformAction
} from '$lib/types';
import { error, fail, isActionFailure } from '@sveltejs/kit';
import { canEnter, canEnterAction } from '../../../auth';
import type { Actions, PageServerLoad } from './$types';
import { commentFormSchema } from './comment-schema';
import { zod } from 'sveltekit-superforms/adapters';
import { superValidate } from 'sveltekit-superforms';
import { actionFormSchema } from './action-schema';
import { redirectMe } from '../../../queue';
import { skip } from './queue';
import { informPlaformOfAction, retrieveSubjectData } from '$lib/api';

export const load = (async ({ params, platform, locals }) => {
	const { moderationPlatform } = await canEnter(params, platform, locals);
	const moderationCase = await platform?.env.DB.prepare(
		'SELECT * FROM cases WHERE platformId = ? AND relevantId = ? AND kind = ?'
	)
		.bind(moderationPlatform.id, params.caseId, params.kindId)
		.first<CaseDB>();

	if (!moderationCase) error(404, 'Case not found in database');

	const url = new URL(moderationPlatform.callbackUrl);

	const subject = await retrieveSubjectData(
		{
			url,
			secret: moderationPlatform.secret
		},
		params.kindId,
		params.caseId
	);

	if (subject.valid === false) error(subject.error.code, subject.error.message);

	const actions = (
		(
			await platform?.env.DB.prepare(
				`SELECT actions.*, users.name 
				FROM actions 
				LEFT JOIN users ON actions.authorId = users.id 
				WHERE actions.platformId = ? AND actions.relevantId = ? AND actions.kind = ?`
			)
				.bind(moderationPlatform.id, params.caseId, params.kindId)
				.all<ActionDB>()
		)?.results ?? []
	).map(fixAction);

	return {
		moderationCase: fixCase(moderationCase),
		kind: params.kindId,
		subject: subject.data,
		actions,
		commentForm: await superValidate(zod(commentFormSchema)),
		actionForm: await superValidate(zod(actionFormSchema))
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
		const failureOrInfo = await canEnterAction(event.params, event.platform, event.locals);

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

			await informPlaformOfAction(
				{
					url: new URL(moderationPlatform.callbackUrl),
					secret: moderationPlatform.secret
				},
				event.params.kindId,
				event.params.caseId,
				form.data.id
			);

			await event.platform?.env.DB.prepare(
				`UPDATE cases
					SET status = 'resolved'
					WHERE platformId = ?1
						AND relevantId = ?2
						AND kind = ?3`
			)
				.bind(moderationPlatform.id, event.params.caseId, event.params.kindId)
				.run();
		}

		await redirectMe(userId, { ...event });
	}
};
