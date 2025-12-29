#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/scripts/.pids"
COMPOSE_ROOT="$ROOT_DIR/docker-compose.yml"
COMPOSE_OVERRIDE="$ROOT_DIR/apps/n8n/docker-compose.override.yml"

mkdir -p "$LOG_DIR" "$PID_DIR"

log() { echo "[start-all] $*"; }
err() { echo "[start-all][ERROR] $*" 1>&2; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "Comando requerido no encontrado: $1"; exit 1;
  fi
}

wait_for_url() {
  local url="$1"; local name="$2"; local max_attempts="${3:-60}"; local delay="${4:-2}"
  local attempt=0
  log "Esperando $name en $url ..."
  until [ $attempt -ge $max_attempts ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      log "$name OK"; return 0
    fi
    attempt=$((attempt+1)); sleep "$delay"
  done
  err "Timeout esperando $name en $url"; return 1
}

log "Verificando Docker..."
if ! docker info >/dev/null 2>&1; then
  err "Docker no está corriendo. Abre Docker Desktop y reintenta."; exit 1
fi

require_cmd docker
require_cmd curl

log "Levantando n8n con docker-compose..."
if [ ! -f "$COMPOSE_ROOT" ] || [ ! -f "$COMPOSE_OVERRIDE" ]; then
  err "Archivos docker-compose no encontrados"; exit 1
fi

docker compose -f "$COMPOSE_ROOT" -f "$COMPOSE_OVERRIDE" up -d

log "Iniciando backend (packages/api) en segundo plano..."
(
  cd "$ROOT_DIR/packages/api" && nohup bash -lc 'npm run dev' > "$LOG_DIR/backend.log" 2>&1 & echo $! > "$PID_DIR/backend.pid"
)

log "Iniciando frontend (apps/web) en segundo plano..."
(
  cd "$ROOT_DIR/apps/web" && nohup bash -lc 'if command -v pnpm >/dev/null 2>&1; then pnpm dev; else npm run dev; fi' > "$LOG_DIR/web.log" 2>&1 & echo $! > "$PID_DIR/web.pid"
)

# Esperar salud de servicios
# n8n intenta /healthz y fallback /health
if ! wait_for_url "http://localhost:5678/healthz" "n8n (healthz)" 60 2; then
  wait_for_url "http://localhost:5678/health" "n8n (health)" 60 2 || true
fi

# Next.js
wait_for_url "http://localhost:3000/api/ping" "Next.js (/api/ping)" 60 2 || true
# Backend keyword scraper health
wait_for_url "http://localhost:3001/api/keyword-scraper/health" "Backend (/api/keyword-scraper/health)" 60 2 || true

log "Pruebas rápidas de conectividad"
code_n8n=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/health || true)
code_web=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/ping || true)
code_api=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/keyword-scraper/health || true)

log "n8n: $code_n8n | web: $code_web | api: $code_api"

log "Listo. Logs: $LOG_DIR. PIDs: $PID_DIR"
log "Para detener backend/web: kill \$(cat $PID_DIR/backend.pid) ; kill \$(cat $PID_DIR/web.pid)"