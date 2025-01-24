import type { RouteParams } from './$types';

export async function skip(
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
        SET assignedTo = NULL,
            assignedAt = NULL
        WHERE platformId = ?1
            AND assignedTo = ?2`
    )
        .bind(platformId, userId)
        .run();

    await platform?.env.DB.prepare(
        `INSERT INTO caseViews (platformId, relevantId, kind, userId, viewedAt) VALUES (?1, ?2, ?3, ?4, datetime('now'))`
    )
        .bind(platformId, params.caseId, params.kindId, userId)
        .run();
}
