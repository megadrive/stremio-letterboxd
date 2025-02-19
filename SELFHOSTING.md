# Self-hosting

## Prerequisites

- Node.js
- A database (anything that Prisma supports, see [Prisma docs](https://www.prisma.io/docs/orm/overview/databases)), SQLite is recommended for self-hosting. (Honestly SQLite is great in production as well, but my service uses docker containers, so every push I would lose all the data. Otherwise I'd be using SQLite. :))

## Installation

1. Clone the repo
2. Change environment variables in `.env`. See [Configuration](#configuration).
3. Change /prisma/schema.prisma line 6 to reflect the database you want to use.
4. Run `npm install` to install dependencies
5. Run `npm run build` to build the project
6. Run `npm run start` to start the addon, it will then be available at `http://localhost:PORT`

If you ever need to start fresh, run `npm run cleanbuild`. This will run the npm scripts: `clean`, `clean:node_modules` and `build`.

## Upgrading

1. Run `git pull` to update to the latest codebase
2. Run `node clean.js` to clean all working directories.
3. Run `npm run build` to re-build the project
4. Run `npm run start` to start the addon, it will then be available at `http://localhost:PORT`

## Configuration

The server is configured via environment variables. The following variables are required:

- `DATABASE_URL`: The URL of the database.
- `NODE_ENV`: The environment, either `development` or `production`
- `DEBUG`: Logs are prefixed with `letterboxd`, separated by a `:`. Set to `letterboxd:*` to see all logs for the addon.
- `PORT`: The port the addon will run on. Default: 3030

### Databases

The addon uses Prisma to interact with the database, so you need to change the settings in two spots:

- `prisma/schema.prisma`: Change line 9 to the database provider. For self-hosting, `sqlite` is recommended.
- `.env`: Change the `DATABASE_URL` to the database URL, following the [Prisma docs](https://www.prisma.io/docs/reference/database-reference/connection-urls). If you are using `sqlite`, you can use `file:./db.sqlite`.
