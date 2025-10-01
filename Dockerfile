FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# deps
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential ca-certificates curl openssl \
  && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY . .
RUN pnpm install --frozen-lockfile

# build
FROM deps AS build
WORKDIR /app

RUN pnpm --filter @stremio-addon/database prisma generate
RUN pnpm -r build

# runtime
FROM node:24-bookworm-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# copy runtime node_modules and built artifacts
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app /app

# run migrations at startup and then start the app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Environment: keep DB config out of the image; pass at runtime
ENV NODE_ENV=production

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# Fallback command if entrypoint execs it
CMD ["pnpm", "start"]
