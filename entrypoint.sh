#!/usr/bin/env bash
set -euo pipefail

# Honour Railway's PORT env var; your app should read PORT internally.
: "${PORT:=3000}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "[entrypoint] Checking for pending migrations..."
  # Add timeout to prevent hanging
  timeout 30s pnpm --filter @stremio-addon/database prisma migrate deploy || {
    status=$?
    if [ $status -eq 124 ]; then
      echo "[entrypoint] Migration command timed out - assuming no migrations needed"
    else
      echo "[entrypoint] Migration failed with status $status"
      exit $status
    fi
  }
else
  echo "[entrypoint] DATABASE_URL not set, skipping migrations."
fi

echo "[entrypoint] Starting app on port ${PORT}..."
exec pnpm start
