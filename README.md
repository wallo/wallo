<div align="center">
<h1>Wallo</h1>

Open-Source moderation platform.

<img src="logo.png" alt="Wallo mascot, a little ghost" height="128" />

[![License](https://img.shields.io/gitlab/license/wallo-dev/wallo?style=for-the-badge)](https://gitlab.com/wallo-dev/wallo/-/raw/main/LICENSE)

</div>

## Developing

This application relies on Cloudflare's [wrangler](https://developers.cloudflare.com/workers/wrangler/).

We use [bun](https://bun.sh/) for development, but npm should work fine as well.

We use [Auth.js](https://authjs.dev/) for authentication, and in production we use [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) as a provider. If you want to use something else the code for configuring providers is in `src/lib/auth.ts`. The callback URL for local development should look like `http://localhost:5173/auth/callback/github`.

To setup environment variables, create `.dev.vars` file with the following:

```env
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

You can create `AUTH_SECRET` value with:

```bash
openssl rand -base64 33
```

For the two other values, follow [this tutorial at Auth.js](https://authjs.dev/getting-started/authentication/oauth).

Create a D1 database in Cloudflare and copy its id and name into `wrangler.toml`. Then run:

```bash
bun wrangler d1 execute YOUR_DB_NAME --local --file src/schema.sql
```

After setting up that you can start a server with:

```bash
bun run preview
```

To create a hot-reload server instead, use:

```bash
bun run dev
```

Some functionality is limited in hot-reload due to limitations of wrangler.

## Deployment

Make sure you're logged in with:

```bash
bun wrangler login
```

Set up the remote database:

```bash
bun wrangler d1 execute pluto --remote --file src/schema.sql
```

And then deploy:

```bash
bun wrangler deploy
```

## API

There's only one incoming API at the moment:

```http
POST /api/v1/publish
Content-Type: application/json
Authorization: Bearer {SECRET}
{
    subjectId: string;
    subjectKind: 'content';
    platformId: string;
}
```

Where `subjectId` is the content id, and `platformId` being the id relating to your platform.

Wallo also makes a callback request either of two types:

### Subject Retrieval

```http
POST {CALLBACK URL}/v1
Content-Type: application/json
Authorization: Bearer {SECRET}
{
    subjectId: string;
    subjectKind: 'content';
}
```

Of which the callback URL should respond with the content that the `subjectId` is associated with. **The callback URL must include the version ID. In the form of `v1`.**

It should respond with the following format:

```ts
type Response = {
	medias: Media[];
	possibleActions: PossibleAction[];
};

type PossibleAction = {
	id: string;
	display?: string;
	variant?: 'default' | 'secondary' | 'destructive' | 'outline';
};

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
	  }
	| {
			kind: 'video';
			url: string;
			tag?: string;

	| {
			kind: 'video';
			url: string;
			tag?: string;
			captions?: {
				url: string;
				srclang?: string;
				label?: string;
			}[];
	  };
```

### Action Notification

```http
POST {CALLBACK URL}
Content-Type: application/json
Authorization: Bearer {SECRET}
{
    subjectId: string;
    subjectKind: 'content';
    action: string;
}
```
