import type { PageServerLoad } from './$types';
import { fixCase, type CaseDB } from '$lib/types';
import { restrict } from '$lib/string';
import { canEnter } from './auth';
import type { ColumnFiltersState, SortingState } from '@tanstack/table-core';

export const load = (async ({ platform, url, locals, params }) => {
    const { moderationPlatform } = await canEnter(params, platform, locals);

    const order = restrict(url.searchParams.get('order'), ['ASC', 'DESC']) ?? 'DESC';

    const idLike = url.searchParams.get('relevantId') ?? '';

    const kind =
        restrict(url.searchParams.get('kind'), ['content', 'user', 'community', 'all']) ?? 'all';

    const kindFilterSQL = kind === 'all' ? '' : `AND kind = "${kind}" `;

    const status =
        restrict(url.searchParams.get('status'), ['resolved', 'unresolved', 'all']) ?? 'all';

    const statusFilterSql = status === 'all' ? '' : `AND status = "${status}" `;

    const whereClauses = kindFilterSQL + statusFilterSql;

    const column =
        restrict(url.searchParams.get('column'), ['createdAt', 'updatedAt']) ?? 'createdAt';

    const count =
        (await platform?.env.DB.prepare(
            `SELECT COUNT(*) AS total FROM cases WHERE relevantId LIKE ? AND platformId = ? ${whereClauses}`
        )
            .bind(`%${idLike}%`, moderationPlatform.id)
            .first<number>('total')) ?? 0;

    const pageSize = Math.max(Math.floor(Number(url.searchParams.get('pageSize'))), 10);
    const pageIndex = Math.max(
        0,
        Math.min(
            Math.floor(Number(url.searchParams.get('pageIndex'))),
            Math.ceil(count / pageSize) - 1
        )
    );

    const sortingState: SortingState = [
        {
            id: column,
            desc: order === 'DESC'
        }
    ];

    const kindFilterState: ColumnFiltersState = kind === 'all' ? [] : [{ id: 'kind', value: kind }];
    const statusFilterState: ColumnFiltersState =
        status === 'all' ? [] : [{ id: 'status', value: status }];
    const relevantIdFilterState: ColumnFiltersState =
        idLike === '' ? [] : [{ id: 'relevantId', value: idLike }];

    const columnFilterState = kindFilterState
        .concat(statusFilterState)
        .concat(relevantIdFilterState);

    const relevantCases = (
        (
            await platform?.env.DB.prepare(
                `SELECT * FROM cases WHERE relevantId LIKE ? AND platformId = ? ${whereClauses} ORDER BY ${column} ${order} LIMIT ${pageSize} OFFSET ${pageIndex * pageSize}`
            )
                .bind(`%${idLike}%`, moderationPlatform.id)
                .all<CaseDB>()
        )?.results ?? []
    ).map(fixCase);

    return {
        relevantCases: relevantCases,
        pagination: {
            pageIndex: pageIndex,
            pageSize: pageSize
        },
        sorting: sortingState,
        columnFilters: columnFilterState,
        count
    };
}) satisfies PageServerLoad;
