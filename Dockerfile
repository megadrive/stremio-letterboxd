FROM node:22.14.0

ENV NODE_ENV=production
# dummy for Prisma
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

RUN apt-get update && apt-get install -y git build-essential

WORKDIR /app

# Copy the entire monorepo (including all packages and workspace files)
COPY . .

RUN npm install -g pnpm@10.5.0

# Install all dependencies for all workspace packages
RUN pnpm install

# Generate Prisma client in the database package
RUN pnpm --filter @stremio-addon/database prisma generate

# Build all packages
RUN pnpm -r build

# Start all packages (or adjust to your entrypoint)
CMD ["pnpm", "-r", "start"]
