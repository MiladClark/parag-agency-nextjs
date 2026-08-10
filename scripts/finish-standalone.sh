#!/usr/bin/env bash
# Copy static assets into .next/standalone (Next.js file tracing omits them)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STANDALONE="$ROOT/.next/standalone"

if [ ! -f "$STANDALONE/server.js" ]; then
  echo "[finish-standalone] ERROR: $STANDALONE/server.js not found. Run npm run build first."
  exit 1
fi

echo "[finish-standalone] Copying static assets..."
mkdir -p "$STANDALONE/.next"
rm -rf "$STANDALONE/.next/static"
cp -r "$ROOT/.next/static" "$STANDALONE/.next/static"
rm -rf "$STANDALONE/public"
cp -r "$ROOT/public" "$STANDALONE/public" 2>/dev/null || true

echo "[finish-standalone] Done."
