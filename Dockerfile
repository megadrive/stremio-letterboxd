# ----------- Builder Stage -----------
FROM node:22.14.0 AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.5.0

# Copy all files (including workspace and packages)
COPY . .

# Set a dummy DATABASE_URL for Prisma generate
ENV DATABASE_URL="file:./dev.db"

# Install all dependencies (including dev)
RUN pnpm install

# (If you have a .pnpm-builds.yaml, it will be picked up automatically)
# If you see warnings about ignored build scripts, run:
# RUN pnpm exec pnpm approve-builds

# Generate Prisma client in the database package
RUN pnpm --filter @stremio-addon/database prisma generate

# Build all packages
RUN pnpm -r build

# ----------- Production Stage -----------
FROM node:22.14.0 AS prod

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10.5.0

# Copy only production node_modules and built output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# (Optional) Copy .env if you want to use it for local dev
# COPY .env .env

ENV NODE_ENV=production

# Start your app (adjust as needed)
CMD ["pnpm", "-r", "start"]
