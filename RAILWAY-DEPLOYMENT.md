# 🚂 Despliegue en Railway

Esta guía te ayudará a desplegar YA Tools en Railway de forma rápida y sencilla.

## 📋 Pre-requisitos

1. Cuenta en [Railway](https://railway.app/)
2. Cuenta de GitHub vinculada a Railway
3. API Keys necesarias (OpenAI, Google)

---

## 🚀 Método 1: Despliegue Rápido (Recomendado)

### Paso 1: Crear Proyecto en Railway

1. Ve a [Railway](https://railway.app/)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu repositorio
5. Selecciona este repositorio

### Paso 2: Configurar Servicios

Railway creará automáticamente los servicios basándose en tu `docker-compose.yml`.

Necesitarás crear los siguientes servicios:

#### 1. **PostgreSQL** (Para n8n)
- Click en **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- Railway generará automáticamente: `DATABASE_URL`

#### 2. **Redis** (Para caché y colas)
- Click en **"+ New"** → **"Database"** → **"Add Redis"**
- Railway generará automáticamente: `REDIS_URL`

#### 3. **MongoDB** (Para datos de la app)
- Click en **"+ New"** → **"Database"** → **"Add MongoDB"**
- Railway generará automáticamente: `MONGO_URL`

#### 4. **Backend API** (packages/api)
- Click en **"+ New"** → **"GitHub Repo"**
- Root Directory: `packages/api`
- Start Command: `pnpm install && pnpm start`
- Variables de entorno:

```env
# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# Google APIs
GOOGLE_API_KEY=tu_google_api_key
PAGESPEED_API_KEY=tu_google_api_key
GOOGLE_CX=tu_custom_search_id

# Database (Railway proveerá estos valores)
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Secrets (genera nuevos)
JWT_SECRET=genera_un_secret_seguro_aqui
JWT_REFRESH_SECRET=genera_otro_secret_seguro_aqui

# Server
PORT=3001
NODE_ENV=production
```

#### 5. **Frontend Web** (apps/web)
- Click en **"+ New"** → **"GitHub Repo"**
- Root Directory: `apps/web`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start`
- Variables de entorno:

```env
# API URL (Railway proveerá el URL del backend)
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}

# OpenAI
OPENAI_API_KEY=tu_openai_api_key

# NextAuth (opcional si usas autenticación)
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=genera_un_secret_seguro_aqui
```

#### 6. **n8n** (Automatización - Opcional)
- Click en **"+ New"** → **"GitHub Repo"**
- Usar imagen Docker: `n8nio/n8n:1.100.1`
- Variables de entorno:

```env
# n8n Config
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_RUNNERS_ENABLED=true
N8N_EDITOR_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
WEBHOOK_URL=${{RAILWAY_PUBLIC_DOMAIN}}
N8N_API_KEY=genera_una_api_key_segura

# Auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=cambia_este_password

# Database (Railway proveerá estos valores)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{Postgres.PGHOST}}
DB_POSTGRESDB_PORT=${{Postgres.PGPORT}}
DB_POSTGRESDB_DATABASE=${{Postgres.PGDATABASE}}
DB_POSTGRESDB_USER=${{Postgres.PGUSER}}
DB_POSTGRESDB_PASSWORD=${{Postgres.PGPASSWORD}}
```

### Paso 3: Conectar Servicios

Railway conectará automáticamente los servicios usando las variables de entorno.

Asegúrate de que:
- El Frontend apunte al Backend usando `NEXT_PUBLIC_API_URL`
- El Backend pueda acceder a MongoDB y Redis
- n8n pueda acceder a PostgreSQL

### Paso 4: Desplegar

1. Guarda todas las variables de entorno
2. Railway desplegará automáticamente
3. Espera a que todos los servicios estén en estado **"Active"**
4. Accede a tu aplicación usando el URL público de Railway

---

## 🔧 Método 2: Despliegue con Railway CLI

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Link al proyecto
railway link

# 5. Agregar variables de entorno
railway variables set OPENAI_API_KEY="tu_key"
railway variables set MONGODB_URI="tu_mongodb_uri"
# ... agregar todas las variables necesarias

# 6. Desplegar
railway up
```

---

## 🌐 URLs de Acceso

Una vez desplegado, tendrás:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | `https://tu-app.up.railway.app` | Aplicación principal |
| **Backend API** | `https://api-tu-app.up.railway.app` | API REST |
| **n8n** | `https://n8n-tu-app.up.railway.app` | Automatización |

---

## 🔐 Seguridad

### Generar Secrets Seguros

```bash
# JWT Secret
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32

# n8n API Key
openssl rand -hex 32
```

### Variables de Entorno Críticas

**NUNCA** commits estos valores al repositorio:
- ✅ Usa las variables de entorno de Railway
- ✅ Rota las API keys regularmente
- ✅ Usa secrets diferentes para cada ambiente

---

## 📊 Monitoreo

Railway provee:
- **Logs en tiempo real**: Click en cualquier servicio → Logs
- **Métricas**: CPU, RAM, Network
- **Alertas**: Configura alertas para downtime

---

## 💰 Costos Estimados

Railway ofrece:
- **$5 gratis** por mes (Hobby plan)
- **$20/mes** (Pro plan) - Recomendado para producción

Costos aproximados para esta app:
- Frontend: ~$5/mes
- Backend: ~$5-10/mes
- Databases: ~$5/mes cada una
- n8n: ~$5/mes

**Total estimado**: $20-30/mes

---

## 🐛 Troubleshooting

### Error: "Build failed"

```bash
# Verifica los logs
railway logs

# Verifica las variables de entorno
railway variables
```

### Error: "Cannot connect to database"

1. Verifica que las variables `MONGODB_URI`, `REDIS_URL` estén configuradas
2. Verifica que los servicios de DB estén activos
3. Usa las referencias de Railway: `${{MongoDB.MONGO_URL}}`

### Error: "Puppeteer crashed"

Railway tiene limitaciones con Puppeteer. Usa Playwright o alternativas cloud como:
- **Browserless** (https://www.browserless.io/)
- **Apify** (https://apify.com/)

---

## ✅ Checklist de Deployment

Antes de desplegar:

- [ ] Todas las API keys están configuradas
- [ ] Secrets están generados (JWT, NextAuth, etc.)
- [ ] Variables de entorno están en Railway (NO en el código)
- [ ] Servicios de DB están activos
- [ ] Frontend apunta al backend correcto
- [ ] n8n está configurado (si se usa)
- [ ] Build exitoso en Railway
- [ ] Todas las herramientas funcionan
- [ ] HTTPS está habilitado

---

## 🆘 Soporte

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **GitHub Issues**: Reporta bugs en el repo

---

## 🔄 CI/CD Automático

Railway desplegará automáticamente cuando hagas `git push` a la rama principal.

Para desactivar auto-deploy:
1. Ve a Settings del servicio
2. Desactiva "Auto Deploy"

---

¡Listo! Tu aplicación estará corriendo en Railway 🚀
