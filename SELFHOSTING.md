# Self-hosting

NOTE: Self-hosting will work but it'll slightly more work than the previous iteration. See [Configuration](#configuration).

## Prerequisites

- Node.js
- PNPM - for workspaces
- A database (anything that Prisma supports, see [Prisma docs](https://www.prisma.io/docs/orm/overview/databases)), SQLite is recommended for self-hosting. (Honestly SQLite is great in production as well, but my service uses docker containers, so every push I would lose all the data. Otherwise I'd be using SQLite. :))

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
4. Run `pnpm start` to start the addon, it will then be available at `http://localhost:3000`

## Configuration

You'll need to creat multiple .env files (unless setting the variables globally). If an entry has a "!" next to it, only change it if you're sure, it will change how the addon works.

- `packages/database`: `DATABASE_URL`
- `packages/server`:
  - `TMDB_APIKEY`
  - `PORT`!
  - `QUEUE_CONCURRENCY`!
  - `CATALOG_PAGE_SIZE`!

### Databases

The addon uses Prisma to interact with the database, so you need to change the settings in two spots in `packages/database`:

- `prisma/schema.prisma`: Change line 9 to the database provider. For self-hosting, `sqlite` is recommended.
- `.env`: Change the `DATABASE_URL` to the database URL, following the [Prisma docs](https://www.prisma.io/docs/reference/database-reference/connection-urls). If you are using `sqlite`, you can use `file:./db.sqlite`.
