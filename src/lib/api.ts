import {
    failure,
    getError,
    success,
    type Account,
    type Community,
    type Content,
    type Result
} from './types';

function guessApiVersion(platformUrl: string): number | undefined {
    // match the version number from the URL
    const matches = platformUrl.match(/v\d+/);

    // if there is a match, return the last version number
    const versionString = matches?.pop()?.slice(1);

    // if there is a version number, return it as a number
    return versionString ? parseInt(versionString) : undefined;
}

type PlatformApiError = {
    code: number;
    message: string;
};

async function retrieveSubjectDataV0(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string
): Promise<Result<Account | Community | Content, PlatformApiError>> {
    try {
        const resp = await fetch(platform.url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${platform.secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                kind: kindId,
                relevantId: caseId
            })
        });

        if (!resp.ok) {
            return failure({
                code: resp.status,
                message: `Platform API returned status ${resp.status}: ${await resp.text()}`
            });
        }

        return success(await resp.json<Account | Community | Content>());
    } catch (e) {
        return failure({
            code: 500,
            message: getError(e)
        });
    }
}

async function retrieveSubjectDataV1(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string
): Promise<Result<Account | Community | Content, PlatformApiError>> {
    try {
        const resp = await fetch(platform.url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${platform.secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subjectId: caseId,
                subjectKind: kindId
            })
        });

        if (!resp.ok) {
            return failure({
                code: resp.status,
                message: `Platform API returned status ${resp.status}: ${await resp.text()}`
            });
        }

        return success(await resp.json<Account | Community | Content>());
    } catch (e) {
        return failure({
            code: 500,
            message: getError(e)
        });
    }
}

export async function retrieveSubjectData(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string
): Promise<Result<Account | Community | Content, PlatformApiError>> {
    const version = guessApiVersion(platform.url.toString());
    switch (version) {
        case 0:
        case undefined:
            return await retrieveSubjectDataV0(platform, kindId, caseId);
        case 1:
            return await retrieveSubjectDataV1(platform, kindId, caseId);
        default:
            return failure({
                code: 501,
                message: `Unsupported API version ${version}`
            });
    }
}

async function informPlaformOfActionV0(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string,
    action: string
): Promise<Result<void, PlatformApiError>> {
    try {
        const resp = await fetch(platform.url, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${platform.secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                kind: kindId,
                relevantId: caseId,
                action
            })
        });

        if (!resp.ok) {
            return failure({
                code: resp.status,
                message: `Platform API returned status ${resp.status}: ${await resp.text()}`
            });
        }

        return success((() => {})());
    } catch (e) {
        return failure({
            code: 500,
            message: getError(e)
        });
    }
}

async function informPlaformOfActionV1(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string,
    action: string
): Promise<Result<void, PlatformApiError>> {
    try {
        const resp = await fetch(platform.url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${platform.secret}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subjectId: caseId,
                subjectKind: kindId,
                action
            })
        });

        if (!resp.ok) {
            return failure({
                code: resp.status,
                message: `Platform API returned status ${resp.status}: ${await resp.text()}`
            });
        }

        return success((() => {})());
    } catch (e) {
        return failure({
            code: 500,
            message: getError(e)
        });
    }
}

export async function informPlaformOfAction(
    platform: {
        url: URL;
        secret: string;
    },
    kindId: string,
    caseId: string,
    action: string
): Promise<Result<void, PlatformApiError>> {
    const version = guessApiVersion(platform.url.toString());
    switch (version) {
        case 0:
        case undefined:
            return await informPlaformOfActionV0(platform, kindId, caseId, action);
        case 1:
            return await informPlaformOfActionV1(platform, kindId, caseId, action);
        default:
            return failure({
                code: 501,
                message: `Unsupported API version ${version}`
            });
    }
}
