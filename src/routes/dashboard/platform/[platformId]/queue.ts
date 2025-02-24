import { redirect } from '@sveltejs/kit';
import type { RouteParams } from './$types';
import type { CaseDB } from '$lib/types';
import { fixCase } from '$lib/database';

export async function redirectMe(
    userId: string,
    {
        params,
        platform
    }: {
        params: RouteParams;
        platform: Readonly<App.Platform> | undefined;
        locals: App.Locals;
    }
) {
    const { platformId } = params;

    await platform?.env.DB.prepare(
        `UPDATE cases
        SET assignedTo = ?1,
            assignedAt = datetime('now')
        WHERE (cases.platformId, cases.relevantId, cases.kind) IN (
            SELECT cases.platformId, cases.relevantId, cases.kind
            FROM cases
            LEFT JOIN caseViews ON cases.platformId = caseViews.platformId
                AND cases.relevantId = caseViews.relevantId
                AND cases.kind = caseViews.kind
                AND caseViews.userId = ?1
            WHERE cases.platformId = ?2
                AND cases.status = 'unresolved'
                AND (
                    cases.assignedTo = ?1
                    OR cases.assignedTo IS NULL
                    OR (cases.assignedTo != ?1 AND cases.assignedAt < datetime('now', '-10 minutes'))
                )
            ORDER BY 
                CASE
                    WHEN cases.assignedTo = ?1 THEN 2
                    WHEN cases.assignedTo IS NULL THEN 1
                    ELSE 0
                END DESC,
                CASE
                    WHEN caseViews.viewedAt IS NULL THEN 2
                    WHEN caseViews.viewedAt >= datetime('now', '-30 days') THEN 1
                    ELSE 0
                END DESC,
                cases.createdAt ASC,
                cases.assignedAt ASC
            LIMIT 1
        )`
    )
        .bind(userId, platformId)
        .run();

    const caseDB = await platform?.env.DB.prepare(
        `SELECT * FROM cases
        WHERE platformId = ?1
            AND assignedTo = ?2
            AND status = 'unresolved'
        LIMIT 1`
    )
        .bind(platformId, userId)
        .first<CaseDB>();

    if (!caseDB) redirect(303, `/dashboard/platform/${platformId}`);

    const moderationCase = fixCase(caseDB);

    redirect(
        303,
        `/dashboard/platform/${platformId}/case/${moderationCase.kind}/${moderationCase.relevantId}`
    );
}
