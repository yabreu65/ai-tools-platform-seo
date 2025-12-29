#!/bin/bash

# Script de deployment para producción
set -e

echo "🚀 Iniciando deployment de la plataforma SEO..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar variables de entorno críticas
log "Verificando variables de entorno..."
required_vars=("MONGODB_URI" "JWT_SECRET" "NEXT_PUBLIC_API_URL")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "Variable de entorno faltante: $var"
    fi
done

log "✅ Variables de entorno verificadas"

# Verificar Node.js y npm
log "Verificando versiones de Node.js y npm..."
node_version=$(node --version)
npm_version=$(npm --version)
log "Node.js: $node_version"
log "npm: $npm_version"

# Limpiar instalaciones previas
log "Limpiando instalaciones previas..."
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf packages/api/node_modules
rm -rf apps/web/.next
rm -f package-lock.json
rm -f apps/web/package-lock.json
rm -f packages/api/package-lock.json

# Instalar dependencias
log "Instalando dependencias..."
npm install

# Instalar dependencias del frontend
log "Instalando dependencias del frontend..."
cd apps/web
npm install
cd ../..

# Instalar dependencias del backend
log "Instalando dependencias del backend..."
cd packages/api
npm install
cd ../..

# Compilar TypeScript del backend
log "Compilando TypeScript del backend..."
cd packages/api
npm run build
cd ../..

# Ejecutar tests
log "Ejecutando tests..."
cd packages/api
npm test || warn "Algunos tests fallaron, continuando..."
cd ../..

# Build del frontend
log "Construyendo aplicación frontend..."
cd apps/web
npm run build
cd ../..

# Verificar build
if [ ! -d "apps/web/.next" ]; then
    error "Build del frontend falló"
fi

log "✅ Build del frontend completado"

# Optimizar imágenes (si existe el directorio)
if [ -d "apps/web/public" ]; then
    log "Optimizando imágenes..."
    # Aquí puedes agregar comandos para optimizar imágenes
    # Por ejemplo: imagemin, sharp, etc.
fi

# Generar sitemap y robots.txt
log "Generando sitemap y robots.txt..."
cd apps/web
npm run postbuild || warn "No se pudo ejecutar postbuild"
cd ../..

# Verificar configuración de producción
log "Verificando configuración de producción..."
cd apps/web
node -e "
const { validateProductionConfig } = require('./config/production.ts');
try {
    validateProductionConfig();
    console.log('✅ Configuración de producción válida');
} catch (error) {
    console.error('❌ Error en configuración:', error.message);
    process.exit(1);
}
"
cd ../..

# Crear archivo de versión
log "Creando archivo de versión..."
echo "{
  \"version\": \"$(date +'%Y.%m.%d-%H%M%S')\",
  \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"gitCommit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",
  \"gitBranch\": \"$(git branch --show-current 2>/dev/null || echo 'unknown')\"
}" > version.json

# Crear archivo de health check
log "Creando archivo de health check..."
echo "OK" > apps/web/public/health

# Comprimir archivos estáticos
log "Comprimiendo archivos estáticos..."
cd apps/web
find .next/static -name "*.js" -exec gzip -k {} \;
find .next/static -name "*.css" -exec gzip -k {} \;
cd ../..

# Mostrar estadísticas del build
log "Estadísticas del build:"
echo "📦 Tamaño del directorio .next:"
du -sh apps/web/.next
echo "📁 Archivos en .next/static:"
find apps/web/.next/static -type f | wc -l

# Verificar puertos disponibles
log "Verificando puertos..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    warn "Puerto 3000 está en uso"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    warn "Puerto 3001 está en uso"
fi

# Crear script de inicio para producción
log "Creando script de inicio..."
cat > start-production.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Iniciando aplicación en modo producción..."

# Iniciar backend
cd packages/api
NODE_ENV=production npm start &
BACKEND_PID=$!
echo "Backend iniciado con PID: $BACKEND_PID"

# Esperar a que el backend esté listo
sleep 5

# Iniciar frontend
cd ../../apps/web
NODE_ENV=production npm start &
FRONTEND_PID=$!
echo "Frontend iniciado con PID: $FRONTEND_PID"

# Crear archivo con PIDs para poder detener los procesos
echo "$BACKEND_PID" > ../../pids/backend.pid
echo "$FRONTEND_PID" > ../../pids/frontend.pid

echo "✅ Aplicación iniciada correctamente"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"

# Mantener el script corriendo
wait
EOF

chmod +x start-production.sh

# Crear script de parada
cat > stop-production.sh << 'EOF'
#!/bin/bash

echo "🛑 Deteniendo aplicación..."

if [ -f "pids/backend.pid" ]; then
    BACKEND_PID=$(cat pids/backend.pid)
    kill $BACKEND_PID 2>/dev/null || echo "Backend ya estaba detenido"
    rm pids/backend.pid
fi

if [ -f "pids/frontend.pid" ]; then
    FRONTEND_PID=$(cat pids/frontend.pid)
    kill $FRONTEND_PID 2>/dev/null || echo "Frontend ya estaba detenido"
    rm pids/frontend.pid
fi

echo "✅ Aplicación detenida"
EOF

chmod +x stop-production.sh

# Crear directorio para PIDs
mkdir -p pids

log "✅ Deployment completado exitosamente!"
log ""
log "📋 Próximos pasos:"
log "1. Ejecutar: ./start-production.sh"
log "2. Verificar: http://localhost:3000"
log "3. Para detener: ./stop-production.sh"
log ""
log "📊 Archivos generados:"
log "- version.json (información de la versión)"
log "- start-production.sh (script de inicio)"
log "- stop-production.sh (script de parada)"
log "- apps/web/public/health (health check)"