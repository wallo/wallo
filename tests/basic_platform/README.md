# basic_platform

To install dependencies:

```bash
bun install
```

The following environment variables are necessary:

```bash
# Secret API key
WALLO_SECRET=

# URL of wallo, most likely http://localhost:5173
WALLO_URL=

# The id of the platform in the platform edit form
PLATFORM_ID=
```

> [!IMPORTANT]  
> You must provide the callback to wallo with `/v1` suffix to use the V1 API scheme.

To run:

```bash
bun run index.ts
```

You should call `/populate` manually _after_ you add it to a wallo organization. Doing so will add ten random items.
