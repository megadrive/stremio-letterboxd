FROM node:24-bookworm-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG DATABASE_URL

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y git build-essential

WORKDIR /app

# Copy the entire monorepo (including all packages and workspace files)
COPY . .

# Install all dependencies for all workspace packages
RUN pnpm install --frozen-lockfile

# Generate Prisma client in the database package
RUN pnpm --filter @stremio-addon/database prisma generate

# Build all packages
RUN pnpm -r build

# run migrations
RUN pnpm run db:deploy

# Start server
CMD ["pnpm", "start"]
