# 🚀 GUÍA DE INICIO RÁPIDO - YA TOOLS

## ⚡ Inicio Rápido (1 comando)

```bash
./start-local.sh
```

Este script hará **TODO** automáticamente:
- ✅ Verifica e inicia servicios Docker (MongoDB, Redis, n8n)
- ✅ Verifica puertos disponibles
- ✅ Inicia el backend (puerto 3001)
- ✅ Inicia el frontend (puerto 3000)
- ✅ Abre tu navegador automáticamente

---

## 🛑 Para Detener Todo

```bash
./stop-local.sh
```

O manualmente:
```bash
# Ctrl+C en la terminal donde corre start-local.sh
```

---

## 📋 Pre-requisitos

Antes de ejecutar, asegúrate de tener:

- [x] **Docker** instalado y corriendo ✅ (verificado)
- [x] **Node.js 18+** instalado ✅ (v18.18.2)
- [x] **pnpm** instalado ✅ (v10.18.3)
- [ ] **API Keys configuradas** (ver abajo)

---

## 🔐 Configuración de API Keys

### ⚠️ IMPORTANTE: Credenciales Actuales Comprometidas

Tus API keys actuales están expuestas. Sigue estos pasos:

1. **Revocar API keys comprometidas:**
   - Lee `SECURITY-INSTRUCTIONS.md` para instrucciones detalladas
   - OpenAI: https://platform.openai.com/api-keys
   - Google: https://console.cloud.google.com/apis/credentials

2. **Actualizar archivos .env:**

**Frontend:** `apps/web/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=tu_nueva_key_aqui
```

**Backend:** `packages/api/.env`
```bash
OPENAI_API_KEY=tu_nueva_key_aqui
GOOGLE_API_KEY=tu_google_key_aqui
PAGESPEED_API_KEY=tu_google_key_aqui
GOOGLE_CX=tu_custom_search_id
MONGODB_URI=mongodb://localhost:27017/ai-tools-platform
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

---

## 📍 URLs de Acceso

Una vez iniciado:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🎨 **Frontend** | http://localhost:3000 | Aplicación principal |
| 🔧 **Backend API** | http://localhost:3001 | API REST |
| 🤖 **n8n** | http://localhost:5678 | Automatización |
| 🗄️ **MongoDB** | localhost:27017 | Base de datos |
| 💾 **Redis** | localhost:6379 | Caché |

---

## 🛠️ Comandos Útiles

### Ver logs en tiempo real:
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

### Reiniciar solo un servicio:
```bash
# Backend
cd packages/api
pnpm dev

# Frontend
cd apps/web
pnpm dev
```

### Ver contenedores Docker:
```bash
docker ps
```

### Reiniciar un contenedor Docker:
```bash
docker restart seo-mongo    # MongoDB
docker restart seo-redis    # Redis
docker restart seo-n8n      # n8n
```

---

## 🐛 Solución de Problemas

### ❌ "Puerto 3000/3001 ya está en uso"

```bash
# Matar procesos en esos puertos
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# O usa el script de parada
./stop-local.sh
```

### ❌ "Cannot connect to MongoDB"

```bash
# Verificar que MongoDB esté corriendo
docker ps | grep seo-mongo

# Si no está, iniciarlo
docker start seo-mongo

# O crear uno nuevo
docker run -d --name seo-mongo -p 27017:27017 mongo:latest
```

### ❌ "Redis connection error"

```bash
# Verificar Redis
docker ps | grep seo-redis

# Iniciar si no está corriendo
docker start seo-redis

# O crear uno nuevo
docker run -d --name seo-redis -p 6379:6379 redis:7-alpine
```

### ❌ "Module not found" o errores de dependencias

```bash
# Reinstalar dependencias
pnpm install

# O limpiar y reinstalar
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

### ❌ "OpenAI API error"

Verifica que tu API key esté correcta en los archivos `.env`:
- `apps/web/.env.local`
- `packages/api/.env`

---

## 📊 Estado de Servicios

Para verificar que todo esté corriendo:

```bash
# Verificar procesos Node.js
lsof -i :3000 -i :3001

# Verificar contenedores Docker
docker ps

# Verificar logs
ls -lh logs/
```

---

## 🔄 Flujo de Inicio Manual

Si prefieres iniciar manualmente en lugar de usar el script:

1. **Iniciar servicios Docker:**
```bash
docker start seo-mongo seo-redis seo-n8n
```

2. **Terminal 1 - Backend:**
```bash
cd packages/api
pnpm dev
```

3. **Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

4. **Abrir navegador:**
```
http://localhost:3000
```

---

## 🧪 Probar las Herramientas

Todas las 18 herramientas están disponibles en:
```
http://localhost:3000
```

### Nuevas herramientas agregadas:
1. **Descubrimiento de Keywords** - `/keyword-research-discover`
2. **Dificultad de Keywords** - `/keyword-difficulty`
3. **Tendencias de Keywords** - `/keyword-trends`
4. **Agrupación de Keywords** - `/keyword-clustering`
5. **Análisis SERP** - `/serp-analyzer`
6. **Verificador de Backlinks** - `/backlink-checker`

---

## 📝 Notas Importantes

1. **Primera vez:** El primer inicio puede tardar un poco mientras se descargan las imágenes Docker

2. **Desarrollo:** Los cambios en el código se recargan automáticamente (hot reload)

3. **Producción:** Este setup es solo para desarrollo local. Para producción ver `DEPLOYMENT.md`

4. **Base de datos:** Estás usando MongoDB Atlas (producción). Si quieres usar local:
   ```bash
   # En packages/api/.env cambiar:
   MONGODB_URI=mongodb://localhost:27017/ai-tools-platform
   ```

5. **API Keys:** Recuerda revocar las keys comprometidas antes de usar en producción

---

## 🆘 Ayuda

Si tienes problemas:

1. Lee `SECURITY-INSTRUCTIONS.md` para temas de credenciales
2. Revisa `IMPLEMENTATION-SUMMARY.md` para cambios recientes
3. Verifica logs en el directorio `logs/`
4. Asegúrate de que Docker esté corriendo

---

## ✅ Checklist de Inicio

Antes de usar en producción:

- [ ] Revocar API keys comprometidas
- [ ] Generar nuevas API keys
- [ ] Actualizar archivos .env
- [ ] Probar todas las herramientas
- [ ] Verificar que n8n funcione
- [ ] Configurar dominios (si aplica)
- [ ] Hacer backup de la base de datos

---

**¡Listo!** Ahora ejecuta:

```bash
./start-local.sh
```

Y tu aplicación estará corriendo en **http://localhost:3000** 🚀
