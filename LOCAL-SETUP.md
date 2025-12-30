# 💻 DESARROLLO LOCAL - GUÍA RÁPIDA

Dos formas de correr la app localmente.

---

## 🚀 OPCIÓN 1: SIN DOCKER (Más Simple)

### Pre-requisitos

- Node.js 18+
- MongoDB local O MongoDB Atlas
- Redis local O Upstash

### Pasos

#### 1. Configurar Backend

```bash
cd packages/api
cp .env.example .env
nano .env
```

Edita `.env`:
```bash
OPENAI_API_KEY=sk-proj-tu_key_aqui
MONGODB_URI=mongodb://localhost:27017/ai-tools-platform  # O MongoDB Atlas
REDIS_URL=redis://localhost:6379  # O Upstash Redis
JWT_SECRET=ERv7qk50w2NSu5YDplHGS9D08GpWXM7n8+Za5ozLz8U=
JWT_REFRESH_SECRET=R2Lvk98GyhpS71ulr6+X/WHRz5Np6LkPUfDffPXQ+LI=
PORT=3001
NODE_ENV=development
```

#### 2. Configurar Frontend

```bash
cd ../../apps/web
cp .env.example .env.local
nano .env.local
```

Edita `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=sk-proj-tu_key_aqui
NEXTAUTH_SECRET=xDmxu+CZWOQ1xkOrbrAqwWuR2SKhup37+621sKqLyP8=
NODE_ENV=development
```

#### 3. Iniciar MongoDB y Redis (si usas local)

**Con Docker:**
```bash
# MongoDB
docker run -d --name ai-mongo -p 27017:27017 mongo:7

# Redis
docker run -d --name ai-redis -p 6379:6379 redis:7-alpine
```

**Sin Docker (macOS):**
```bash
brew install mongodb-community redis
brew services start mongodb-community
brew services start redis
```

#### 4. Iniciar Backend

**Terminal 1:**
```bash
cd packages/api
npm install
npm run dev
```

Verás: `🔥 Servidor backend corriendo en http://localhost:3001`

#### 5. Iniciar Frontend

**Terminal 2:**
```bash
cd apps/web
npm install
npm run dev
```

Verás: `Ready on http://localhost:3000`

#### 6. Abrir en Navegador

```
http://localhost:3000
```

---

## 🐳 OPCIÓN 2: CON DOCKER COMPOSE (Todo en Uno)

### Pre-requisitos

- Docker Desktop instalado y corriendo

### Pasos

#### 1. Verificar Docker

```bash
docker --version
docker ps
```

Si Docker no está corriendo, abre Docker Desktop.

#### 2. Configurar Variables

El archivo `.env.local` ya está creado con tu API Key.

Para cambiarla:
```bash
nano .env.local
```

#### 3. Iniciar Todo

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Primera vez tarda ~5-10 minutos (descarga imágenes, instala dependencias).

#### 4. Verificar Logs

Verás logs de todos los servicios:
- ✅ mongodb: Ready
- ✅ redis: Ready
- ✅ backend: Servidor corriendo
- ✅ frontend: Ready

#### 5. Abrir en Navegador

```
http://localhost:3000
```

#### 6. Detener Todo

```bash
# Ctrl+C en la terminal

# O en otra terminal:
docker-compose -f docker-compose.dev.yml down
```

---

## 📊 URLs Locales

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | App principal |
| **Backend** | http://localhost:3001 | API REST |
| **MongoDB** | localhost:27017 | Base de datos |
| **Redis** | localhost:6379 | Caché |

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to MongoDB"

**Sin Docker:**
```bash
# Verificar MongoDB
brew services list | grep mongodb

# Reiniciar
brew services restart mongodb-community
```

**Con Docker:**
```bash
docker ps | grep mongo
docker restart ai-mongo
```

### ❌ "Cannot connect to Redis"

**Sin Docker:**
```bash
brew services list | grep redis
brew services restart redis
```

**Con Docker:**
```bash
docker ps | grep redis
docker restart ai-redis
```

### ❌ "Port 3000 already in use"

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
PORT=3002 npm run dev
```

### ❌ "Module not found"

```bash
# Limpiar e instalar
rm -rf node_modules
npm install
```

### ❌ Docker: "Build failed"

```bash
# Limpiar cache de Docker
docker system prune -a

# Rebuild sin cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## 🔄 Comandos Útiles

### Sin Docker

```bash
# Ver logs del backend
cd packages/api && npm run dev

# Ver logs del frontend
cd apps/web && npm run dev

# Reinstalar dependencias
cd packages/api && rm -rf node_modules && npm install
cd apps/web && rm -rf node_modules && npm install
```

### Con Docker

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Solo backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Solo frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Rebuild un servicio específico
docker-compose -f docker-compose.dev.yml up --build backend

# Detener y eliminar todo (incluyendo volumes)
docker-compose -f docker-compose.dev.yml down -v
```

---

## ✅ Verificar que Todo Funcione

1. **Backend**: http://localhost:3001/health
   - Debería ver: `{"status":"ok"}`

2. **Frontend**: http://localhost:3000
   - Debería ver la app

3. **Probar funcionalidad**:
   - Crear cuenta
   - Iniciar sesión
   - Usar una herramienta

---

## 💡 Recomendaciones

### Para Desarrollo Activo:
- ✅ Usa **Opción 1 (sin Docker)** - Hot reload más rápido
- ✅ MongoDB y Redis con Docker es suficiente

### Para Testing:
- ✅ Usa **Opción 2 (con Docker)** - Más cercano a producción
- ✅ Prueba que todo funcione antes de desplegar

---

## 🔐 Seguridad Local

- ✅ `.env` y `.env.local` están en `.gitignore`
- ✅ NO subas estos archivos a GitHub
- ✅ Usa API keys de prueba/desarrollo
- ✅ Diferentes keys para dev y producción

---

**¡Listo para desarrollar!** 🚀
