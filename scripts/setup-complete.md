# Setup Completo de Infraestructura (n8n + Backend + Frontend)

Este documento explica cómo arrancar, probar y monitorear toda la integración: n8n, backend (packages/api) y frontend (Next.js).

## Requisitos
- Docker Desktop instalado y corriendo
- Node.js 18+ y npm/pnpm disponibles
- Puertos disponibles: `3000` (web), `3001` (backend), `5678` (n8n)

## Arranque rápido

1. Inicia Docker Desktop.
2. Ejecuta el script de arranque desde la raíz del repo:
   - `bash scripts/start-all-services.sh`
3. El script:
   - Levanta n8n con `docker-compose`
   - Inicia backend en `packages/api`
   - Inicia frontend en `apps/web`
   - Espera health checks de cada servicio
   - Reporta códigos HTTP de conectividad

## Pruebas de integración n8n

- Ejecuta el script:
  - `node scripts/test-n8n-integration.js`
- Qué hace:
  - Verifica `http://localhost:5678/healthz` y `.../health`
  - Verifica `http://localhost:3000/api/ping` (Next.js)
  - Verifica `http://localhost:3001/api/keyword-scraper/health` (backend)
  - Dispara el webhook de competidores `POST http://localhost:5678/webhook/competitor-analysis`
  - Lee estado y detalles de análisis en:
    - `GET http://localhost:3000/api/competitor-analysis/status/<analysisId>`
    - `GET http://localhost:3000/api/competitor-analysis/results/<analysisId>`

## Endpoints útiles

- n8n Editor: `http://localhost:5678`
- n8n Health: `http://localhost:5678/healthz` (o `/health`)
- Next.js Ping: `http://localhost:3000/api/ping`
- Backend Health (keyword scraper): `http://localhost:3001/api/keyword-scraper/health`
- Webhook global competidores: `http://localhost:5678/webhook/competitor-analysis`
- Webhook en Next.js: `http://localhost:3000/api/competitor-analysis/webhook`

## Logs y monitoreo

- Logs generados por `start-all-services.sh`:
  - `logs/backend.log`
  - `logs/web.log`
- PIDs almacenados en `scripts/.pids`:
  - `backend.pid`, `web.pid`
- Detener procesos:
  - `kill $(cat scripts/.pids/backend.pid)`
  - `kill $(cat scripts/.pids/web.pid)`

## Troubleshooting

- Docker no corriendo:
  - Abre Docker Desktop y reintenta.
- n8n no responde en `5678`:
  - Verifica `docker compose ps` y `docker logs seo-n8n`
  - Confirma mapeo de puertos en `docker-compose.yml` y `apps/n8n/docker-compose.override.yml`
- Backend 404 en `/api/health`:
  - Usa `GET /api/keyword-scraper/health` o habilita un endpoint `/api/health` si lo necesitas.
- Webhook secreto:
  - Configura `N8N_WEBHOOK_SECRET` y añade/valida header `X-N8N-Webhook-Secret` en nodos HTTP.

## Notas de producción
- Usa HTTPS y secretos reales.
- Reemplaza `host.docker.internal` por direcciones internas de red en servidores Linux.
- Configura credenciales de MongoDB en n8n con usuario/contraseña si aplica.