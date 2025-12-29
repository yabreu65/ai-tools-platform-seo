#!/bin/bash

# ============================================
# YA TOOLS - Script de Inicio Local
# ============================================

echo "🚀 Iniciando YA Tools en modo local..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un puerto está en uso
check_port() {
    lsof -i :$1 &> /dev/null
    return $?
}

# Función para verificar si un servicio Docker está corriendo
check_docker_service() {
    docker ps --format '{{.Names}}' | grep -q "$1"
    return $?
}

# ============================================
# 1. Verificar servicios Docker
# ============================================
echo "📦 Verificando servicios Docker..."
echo ""

# MongoDB
if check_docker_service "seo-mongo"; then
    echo -e "${GREEN}✓${NC} MongoDB corriendo (puerto 27017)"
else
    echo -e "${YELLOW}⚠${NC} MongoDB no está corriendo"
    echo "  Iniciando MongoDB..."
    docker start seo-mongo || docker run -d --name seo-mongo -p 27017:27017 mongo:latest
fi

# Redis
if check_docker_service "seo-redis"; then
    echo -e "${GREEN}✓${NC} Redis corriendo (puerto 6379)"
else
    echo -e "${YELLOW}⚠${NC} Redis no está corriendo"
    echo "  Iniciando Redis..."
    docker start seo-redis || docker run -d --name seo-redis -p 6379:6379 redis:7-alpine
fi

# n8n
if check_docker_service "seo-n8n"; then
    echo -e "${GREEN}✓${NC} n8n corriendo (puerto 5678)"
else
    echo -e "${YELLOW}⚠${NC} n8n no está corriendo"
    echo "  Iniciando n8n..."
    cd apps/n8n && docker-compose up -d && cd ../..
fi

echo ""
echo "============================================"
echo ""

# ============================================
# 2. Verificar puertos disponibles
# ============================================
echo "🔍 Verificando puertos..."
echo ""

if check_port 3001; then
    echo -e "${RED}✗${NC} Puerto 3001 (Backend) ya está en uso"
    echo "  Deteniendo proceso anterior..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

if check_port 3000; then
    echo -e "${RED}✗${NC} Puerto 3000 (Frontend) ya está en uso"
    echo "  Deteniendo proceso anterior..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo -e "${GREEN}✓${NC} Puertos 3000 y 3001 disponibles"
echo ""
echo "============================================"
echo ""

# ============================================
# 3. Verificar variables de entorno
# ============================================
echo "🔐 Verificando configuración..."
echo ""

if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${RED}✗${NC} Falta apps/web/.env.local"
    echo "  Copiando desde .env.example..."
    cp apps/web/.env.example apps/web/.env.local
    echo -e "${YELLOW}⚠${NC} Por favor configura tus API keys en apps/web/.env.local"
fi

if [ ! -f "packages/api/.env" ]; then
    echo -e "${RED}✗${NC} Falta packages/api/.env"
    echo "  Copiando desde .env.example..."
    cp packages/api/.env.example packages/api/.env
    echo -e "${YELLOW}⚠${NC} Por favor configura tus API keys en packages/api/.env"
fi

echo -e "${GREEN}✓${NC} Archivos de configuración presentes"
echo ""
echo "============================================"
echo ""

# ============================================
# 4. Iniciar Backend API
# ============================================
echo "🔧 Iniciando Backend API (puerto 3001)..."
echo ""

cd packages/api

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    pnpm install
fi

# Iniciar en background
pnpm dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✓${NC} Backend iniciado (PID: $BACKEND_PID)"
echo "  Logs: logs/backend.log"

cd ../..

echo ""
echo "⏳ Esperando 3 segundos para que el backend se inicialice..."
sleep 3

# ============================================
# 5. Iniciar Frontend Next.js
# ============================================
echo ""
echo "🎨 Iniciando Frontend Next.js (puerto 3000)..."
echo ""

cd apps/web

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    pnpm install
fi

# Iniciar en background
pnpm dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✓${NC} Frontend iniciado (PID: $FRONTEND_PID)"
echo "  Logs: logs/frontend.log"

cd ../..

# ============================================
# 6. Resumen Final
# ============================================
echo ""
echo "============================================"
echo "✅ YA TOOLS INICIADO EXITOSAMENTE"
echo "============================================"
echo ""
echo "📍 URLs de acceso:"
echo ""
echo "  🎨 Frontend:     http://localhost:3000"
echo "  🔧 Backend API:  http://localhost:3001"
echo "  🤖 n8n:          http://localhost:5678"
echo ""
echo "📊 Servicios activos:"
echo "  • MongoDB:   localhost:27017"
echo "  • Redis:     localhost:6379"
echo "  • PostgreSQL: localhost:5432"
echo ""
echo "📝 PIDs de procesos:"
echo "  • Backend:  $BACKEND_PID"
echo "  • Frontend: $FRONTEND_PID"
echo ""
echo "📋 Comandos útiles:"
echo ""
echo "  Ver logs en tiempo real:"
echo "    tail -f logs/backend.log"
echo "    tail -f logs/frontend.log"
echo ""
echo "  Detener servicios:"
echo "    ./stop-local.sh"
echo ""
echo "  O manualmente:"
echo "    kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "============================================"
echo ""
echo "⏳ Esperando 5 segundos antes de abrir el navegador..."
sleep 5

# Abrir navegador
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
fi

echo ""
echo "✨ ¡Listo! Tu aplicación está corriendo."
echo ""
echo "Presiona Ctrl+C para detener los servicios"
echo ""

# Mantener el script corriendo
wait
