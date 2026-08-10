#!/bin/bash
# aaPanel → Path = project root → Run opt = start [bash start-aapanel.sh]
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "[parag-agency] ERROR: .env not found."
  echo "Copy: cp .env.example .env"
  echo "Then set PORT=3602 and CMS / content env vars."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ ! -d node_modules/next ]; then
  echo "[parag-agency] Installing dependencies..."
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
fi

if [ ! -f .next/standalone/server.js ]; then
  echo "[parag-agency] Build missing. Building production (standalone)..."
  export NODE_ENV=production
  npm run build
  bash scripts/finish-standalone.sh
elif [ ! -d .next/standalone/.next/static ]; then
  echo "[parag-agency] Standalone static assets missing. Fixing..."
  bash scripts/finish-standalone.sh
fi

export NODE_ENV=production
export PORT="${PORT:-3602}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

# aaPanel often loses the pid file while the old next-server keeps listening.
# Free this project's port before bind to avoid EADDRINUSE on restart.
free_port() {
  local port="$1"
  local pids=""

  if command -v fuser >/dev/null 2>&1; then
    echo "[parag-agency] Freeing port ${port} (fuser)..."
    fuser -k "${port}/tcp" 2>/dev/null || true
    sleep 1
    return 0
  fi

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)"
  fi

  if [ -z "$pids" ] && command -v ss >/dev/null 2>&1; then
    pids="$(
      ss -lntp "sport = :${port}" 2>/dev/null \
        | grep -oE 'pid=[0-9]+' \
        | cut -d= -f2 \
        | sort -u \
        | tr '\n' ' '
    )"
  fi

  if [ -n "$pids" ]; then
    echo "[parag-agency] Freeing port ${port} (pids: ${pids})..."
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

free_port "$PORT"

echo "[parag-agency] Starting on ${HOSTNAME}:${PORT}..."
exec node .next/standalone/server.js
