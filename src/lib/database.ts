import type {
    Action,
    ActionDB,
    Case,
    CaseDB,
    CustomAction,
    DiscussionAction,
    OrganizationId,
    Organization,
    OrganizationDB,
    Platform,
    PlatformAction,
    PlatformId,
    Rule,
    RuleDB
} from './types';

function normalizeDateFromDB(date: string): Date {
    return new Date(date + ' UTC');
}

export function fixAction(action: ActionDB): Action {
    return {
        ...action,
        createdAt: normalizeDateFromDB(action.createdAt),
        ...(JSON.parse(action.actionInfo) satisfies
            | CustomAction
            | DiscussionAction
            | PlatformAction)
    };
}

export function fixOrganization(organization: OrganizationDB): Organization {
    return {
        ...organization,
        createdAt: normalizeDateFromDB(organization.createdAt),
        updatedAt: normalizeDateFromDB(organization.updatedAt)
    };
}

export function fixRule(rule: RuleDB): Rule {
    return {
        ...rule,
        active: Boolean(rule.active),
        createdAt: normalizeDateFromDB(rule.createdAt + ' UTC'),
        updatedAt: normalizeDateFromDB(rule.updatedAt),
        information: JSON.parse(rule.information)
    };
}

export function fixCase(givenCase: CaseDB): Case {
    return {
        ...givenCase,
        createdAt: normalizeDateFromDB(givenCase.createdAt),
        updatedAt: normalizeDateFromDB(givenCase.updatedAt)
    };
}

export async function getModerationPlatform(
    platformId: PlatformId,
    platform: { env: { DB: D1Database } } | undefined
): Promise<Platform | null> {
    return (
        (await platform?.env.DB.prepare(`SELECT * FROM platforms WHERE id = ?`)
            .bind(platformId)
            .first<Platform>()) ?? null
    );
}

export async function getOrganization(
    organizationId: OrganizationId,
    adminId: string,
    platform: { env: { DB: D1Database } } | undefined
): Promise<Organization | null> {
    const organizationDatabase =
        (await platform?.env.DB.prepare(`SELECT * FROM organizations WHERE id = ? AND adminId = ?`)
            .bind(organizationId, adminId)
            .first<OrganizationDB>()) ?? null;
    return organizationDatabase ? fixOrganization(organizationDatabase) : null;
}

export async function getCase(
    platformId: PlatformId,
    caseId: string,
    kindId: string,
    platform: { env: { DB: D1Database } } | undefined
): Promise<Case | null> {
    const caseDatabase =
        (await platform?.env.DB.prepare(
            'SELECT * FROM cases WHERE platformId = ? AND relevantId = ? AND kind = ?'
        )
            .bind(platformId, caseId, kindId)
            .first<CaseDB>()) ?? null;
    return caseDatabase ? fixCase(caseDatabase) : null;
}

export async function getActions(
    platformId: PlatformId,
    caseId: string,
    kindId: string,
    platform: { env: { DB: D1Database } } | undefined
): Promise<Action[]> {
    return (
        (
            await platform?.env.DB.prepare(
                `SELECT actions.*, users.name 
				FROM actions 
				LEFT JOIN users ON actions.authorId = users.id 
				WHERE actions.platformId = ? AND actions.relevantId = ? AND actions.kind = ?`
            )
                .bind(platformId, caseId, kindId)
                .all<ActionDB>()
        )?.results ?? []
    ).map(fixAction);
}

export async function getRules(
    platformId: PlatformId,
    platform: { env: { DB: D1Database } } | undefined
): Promise<Rule[]> {
    const rules = (
        (
            await platform?.env.DB.prepare(`SELECT * FROM rules WHERE platformId = ?`)
                .bind(platformId)
                .all<RuleDB>()
        )?.results ?? []
    ).map(fixRule);

    return rules;
}
