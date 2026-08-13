#!/usr/bin/env bash
# Production deploy: pull → install → build → standalone assets.
# Run on the server after pushing to GitHub:
#   bash scripts/deploy.sh
# Then Restart the Node project in aaPanel (default: no auto-start).
# Optional:
#   BRANCH=master bash scripts/deploy.sh
#   SKIP_RESTART=0 bash scripts/deploy.sh   # also start via nohup (not recommended with aaPanel)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="${BRANCH:-master}"
REMOTE="${REMOTE:-origin}"
# Keep process control in aaPanel unless explicitly overridden.
SKIP_RESTART="${SKIP_RESTART:-1}"

log() { echo "[deploy] $*"; }
die() { echo "[deploy] ERROR: $*" >&2; exit 1; }

if [ ! -f .env ]; then
  die ".env not found. Copy .env.example → .env and configure production values before deploy."
fi

# Load PORT for restart (do not override shell NODE_ENV during build unnecessarily)
set -a
# shellcheck disable=SC1091
source .env
set +a
PORT="${PORT:-3602}"

command -v git >/dev/null 2>&1 || die "git is required"
command -v npm >/dev/null 2>&1 || die "npm is required"
command -v node >/dev/null 2>&1 || die "node is required"

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  die "Node >= 20.9 required (found $(node -v))"
fi

# Ignore untracked server-only paths (.well-known, local uploads, etc.).
# Tracked local edits are reset to match remote so deploy always wins.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  log "Tracked local changes detected; resetting to match ${REMOTE}/${BRANCH}..."
fi

log "Fetching ${REMOTE}/${BRANCH}..."
git fetch "$REMOTE" "$BRANCH"

LOCAL="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse "${REMOTE}/${BRANCH}")"
if [ "$LOCAL" = "$REMOTE_SHA" ]; then
  log "Already up to date (${LOCAL:0:7}). Rebuilding anyway..."
  git reset --hard "$REMOTE_SHA"
  git clean -fd -e .well-known -e .env -e .env.local
else
  log "Updating ${LOCAL:0:7} → ${REMOTE_SHA:0:7}..."
  git reset --hard "$REMOTE_SHA"
  git clean -fd -e .well-known -e .env -e .env.local
fi

log "Installing dependencies..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

log "Building production (standalone)..."
export NODE_ENV=production
npm run build

log "Copying standalone static assets..."
bash scripts/finish-standalone.sh

if [ ! -f .next/standalone/server.js ]; then
  die "Build did not produce .next/standalone/server.js"
fi

free_port() {
  local port="$1"
  local pids=""

  if command -v fuser >/dev/null 2>&1; then
    log "Freeing port ${port} (fuser)..."
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
    log "Freeing port ${port} (pids: ${pids})..."
    # shellcheck disable=SC2086
    kill $pids 2>/dev/null || true
    sleep 1
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
}

if [ "$SKIP_RESTART" = "1" ]; then
  log "Build complete. Restart «parag_agency» in aaPanel to apply the new build."
  log "Done."
  exit 0
fi

log "Restarting app on port ${PORT} (SKIP_RESTART=0)..."
free_port "$PORT"
nohup bash "$ROOT/start-aapanel.sh" >> /tmp/parag-agency.log 2>&1 &
APP_PID=$!
sleep 2

if command -v curl >/dev/null 2>&1; then
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    log "Health check OK (http://127.0.0.1:${PORT}/)"
  else
    log "Process started (pid ${APP_PID}); health check not ready yet — see /tmp/parag-agency.log"
  fi
else
  log "Process started (pid ${APP_PID}). Log: /tmp/parag-agency.log"
fi

log "Deploy complete. If aaPanel shows Stopped, click Restart once so the panel tracks the process."
