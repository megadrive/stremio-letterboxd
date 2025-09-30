# Self-hosting

NOTE: Self-hosting will work but it'll slightly more work than the previous iteration. See [Configuration](#configuration).

## Docker

Docker is currently not recommended. It will work but you'll need a separate detached Postgres DB or be happy to reconfigure your lists every time you update. I'm in the process of creating a docker-compose.yml file.

## Prerequisites

- Node.js
- PNPM - for workspaces
- A database (anything that Prisma supports, see [Prisma docs](https://www.prisma.io/docs/orm/overview/databases)), SQLite is recommended for self-hosting. (Honestly SQLite is great in production as well, but my service uses docker containers, so every push I would lose all the data. Otherwise I'd be using SQLite. :))
- NOTE: I am now using Prisma Migrations, so you will need to use `pnpm db:push: to create your database if you are using anything other than Postgres.

## Installation

1. Clone the repo
2. Change environment variables. You'll need to create more than one if self-hosting. See [Configuration](#configuration).
3. Run `pnpm install` to install dependencies
4. Run `pnpm build` to build the project
5. Run `pnpm start` to start the addon, it will then be available at `http://localhost:3000` by default

If you ever need to start fresh, run `node clean.js` then run `pnpm install` again.

## Upgrading

1. Run `git pull` to update to the latest codebase
2. Run `node clean.js` to clean all working directories.
3. Run `pnpm build` to re-build the project
4. Run `pnpm db:deploy` if using Postgres, or `pnpm db:push` if using anything else.
5. Run `pnpm start` to start the addon, it will then be available at `http://localhost:3000`

## Configuration

Create an `.env` file in the root directory check out the [env package](/packages/env/src/env.ts) for variables.

Notes:

- TMDB_APIKEY, current required. Just chuck a "" in there, I'm pretty sure it's unused but haven't checked thoroughly.
- NODE_ENV, is "development" by default for ease of self-hosting. If this is set to "production", you'll need to change the below.
- BASE_URL, not required unless setting NODE_ENV to "production". This should point to your instance. If running in production set this to "http://localhost:3000" or your instance's base URL: https://letterboxd.almosteffective.com

### Databases

The addon uses Prisma to interact with the database, so you need to change the settings in two spots in `packages/database`:

- `prisma/schema.prisma`: Change line 9 to the database provider. For self-hosting, `sqlite` is recommended.
- `.env`: Change the `DATABASE_URL` to the database URL, following the [Prisma docs](https://www.prisma.io/docs/reference/database-reference/connection-urls). If you are using `sqlite`, you can use `file:./db.sqlite`.
