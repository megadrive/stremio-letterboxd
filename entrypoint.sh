#!/usr/bin/env bash
set -euo pipefail

# Honour Railway's PORT env var; your app should read PORT internally.
: "${PORT:=3000}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[entrypoint] Running migrations..."
  pnpm --filter @stremio-addon/database prisma migrate deploy
else
  echo "[entrypoint] DATABASE_URL not set, skipping migrations."
fi

echo "[entrypoint] Starting app on port ${PORT}..."
exec pnpm start
