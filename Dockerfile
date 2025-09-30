FROM node:24-bookworm-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ENV NODE_ENV=production
# dummy for Prisma
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

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

# Start server
CMD ["pnpm", "start"]
