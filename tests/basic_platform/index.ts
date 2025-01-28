import { env } from 'bun';
import crypto from 'node:crypto';
import { faker } from '@faker-js/faker';

const { WALLO_SECRET, WALLO_URL, PLATFORM_ID } = env;

if (WALLO_SECRET === undefined) {
    throw new Error('WALLO_SECRET is required.');
}

if (PLATFORM_ID === undefined) {
    throw new Error('PLATFORM_ID is required.');
}

if (WALLO_URL === undefined) {
    throw new Error('WALLO_URL is required.');
}

type Media =
    | {
          kind: 'text';
          message: string;
          tag?: string;
      }
    | {
          kind: 'image';
          url: string;
          alt?: string;
          tag?: string;
      };

type PossibleAction = {
    id: string;
    display?: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

function possibleActionsForStatus(status: 'pending' | 'published' | 'rejected'): PossibleAction[] {
    if (status === 'pending') {
        return [
            { id: 'publish', display: 'Publish', variant: 'default' },
            { id: 'reject', display: 'Reject', variant: 'destructive' }
        ];
    }

    if (status === 'published') {
        return [{ id: 'unpublish', display: 'Unpublish', variant: 'destructive' }];
    }

    if (status === 'rejected') {
        return [{ id: 'publish', display: 'Publish', variant: 'default' }];
    }

    return [];
}

const subjects: {
    id: string;
    kind: 'content';
    media: Media[];
    status: 'pending' | 'published' | 'rejected';
}[] = [];

async function loadSubjectsFromLocal() {
    try {
        const file = Bun.file('subjects.json');
        const newSubjects = await file.json();
        subjects.splice(0, subjects.length, ...newSubjects);
    } catch (error) {
        console.warn('No subjects found. Starting fresh.');
    }
}

await loadSubjectsFromLocal();

async function saveSubjectsToLocal() {
    const file = Bun.file('subjects.json');
    await file.write(JSON.stringify(subjects));
}

const server = Bun.serve({
    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === '/populate') {
            for (const i of Array(10).keys()) {
                const id = crypto.randomUUID();
                const kind = 'content';

                const media: Media[] = [];

                for (const j of Array(Math.floor(Math.random() * 3) + 1).keys()) {
                    const kind = Math.random() < 0.5 ? 'text' : 'image';
                    if (kind === 'text') {
                        media.push({
                            kind,
                            message: faker.lorem.sentence()
                        });
                    } else {
                        media.push({
                            kind,
                            url: faker.image.url({
                                width: 400,
                                height: 400
                            })
                        });
                    }
                }

                await saveSubjectsToLocal();

                subjects.push({ id, kind, media, status: 'pending' });

                await fetch(`${WALLO_URL}/api/v1/publish`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${WALLO_SECRET}`
                    },
                    body: JSON.stringify({
                        subjectId: id,
                        subjectKind: kind,
                        platformId: PLATFORM_ID
                    })
                });
            }
            return new Response('Populated.', {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        }

        if (
            crypto.timingSafeEqual(
                new TextEncoder().encode(request.headers.get('Authorization') ?? ''),
                new TextEncoder().encode(`Bearer ${WALLO_SECRET}`)
            ) === false
        ) {
            return new Response('Unauthorized.', {
                status: 401,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        }

        const { action, subjectId, subjectKind } = await request.json();

        if (action === undefined) {
            for (const subject of subjects) {
                if (subject.id === subjectId && subject.kind === subjectKind) {
                    return new Response(
                        JSON.stringify({
                            medias: subject.media,
                            possibleActions: possibleActionsForStatus(subject.status)
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }

            return new Response('Not found.', {
                status: 404,
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
        }

        for (const subject of subjects) {
            if (subject.id === subjectId && subject.kind === subjectKind) {
                if (action === 'publish') {
                    subject.status = 'published';
                }

                if (action === 'reject') {
                    subject.status = 'rejected';
                }

                if (action === 'unpublish') {
                    subject.status = 'pending';
                }

                await saveSubjectsToLocal();

                return new Response(
                    JSON.stringify({
                        medias: subject.media,
                        possibleActions: possibleActionsForStatus(subject.status)
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
        }

        return new Response('Not found.', {
            status: 404,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
});

console.log('Server is running on', server.url.href);
