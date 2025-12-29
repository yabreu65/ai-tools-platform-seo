#!/bin/bash

# ============================================
# YA TOOLS - Script para Detener Servicios
# ============================================

echo "🛑 Deteniendo YA Tools..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Detener procesos en puertos específicos
echo "📦 Deteniendo servicios Node.js..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓${NC} Frontend detenido (puerto 3000)" || echo "  Frontend no estaba corriendo"
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✓${NC} Backend detenido (puerto 3001)" || echo "  Backend no estaba corriendo"

echo ""
echo "🐳 Servicios Docker (opcionales - comentados):"
echo "  Para detener también Docker, descomenta estas líneas:"
echo ""
echo "  # docker stop seo-mongo seo-redis seo-n8n seo-postgres"
echo ""

# Descomentar si quieres detener también los servicios Docker:
# docker stop seo-mongo seo-redis seo-n8n seo-postgres

echo "============================================"
echo -e "${GREEN}✅ Servicios detenidos${NC}"
echo "============================================"
echo ""
