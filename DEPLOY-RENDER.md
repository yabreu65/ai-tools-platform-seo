# 🚀 DESPLIEGUE EN RENDER - GUÍA RÁPIDA

Guía simplificada para desplegar tu app en Render **100% GRATIS** en 30 minutos.

---

## ⚡ RESUMEN

- **Costo**: $0/mes (plan Free)
- **Tiempo**: 30 minutos
- **Limitación**: Se duerme tras 15 min inactivo
- **Sin Docker Compose**: Render construye cada servicio individual

---

## 📋 ANTES DE EMPEZAR

### 1. OpenAI API Key (OBLIGATORIO)
```
https://platform.openai.com/api-keys
→ Create new secret key
→ Guarda la key (sk-proj-...)
```

### 2. MongoDB Atlas (GRATIS)
```
https://www.mongodb.com/cloud/atlas/register
→ Create Free Cluster (M0)
→ Database Access: Create user
→ Network Access: Allow 0.0.0.0/0
→ Connect → Application → Copy connection string
```

### 3. Upstash Redis (GRATIS)
```
https://upstash.com
→ Signup with GitHub
→ Create Database
→ Copy Redis URL
```

---

## 🎯 DEPLOYMENT - 3 PASOS

### PASO 1: Crear Cuenta Render

```
1. Ve a: https://render.com
2. Sign up with GitHub
3. Autoriza Render
```

---

### PASO 2: Desplegar Backend

#### 2.1 Crear Servicio

```
Dashboard → New + → Web Service
→ Connect GitHub repo: ai-tools-platform
```

#### 2.2 Configuración

| Campo | Valor |
|-------|-------|
| **Name** | `ai-tools-backend` |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | `packages/api` |
| **Runtime** | Docker |
| **Instance Type** | Free |

#### 2.3 Variables de Entorno

Click **"Advanced"** → **"Add Environment Variable"**

Copia EXACTAMENTE estas variables:

```bash
OPENAI_API_KEY=sk-proj-TU_KEY_AQUI
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-tools-platform?retryWrites=true&w=majority
REDIS_URL=redis://default:XXXX@region.upstash.io:6379
JWT_SECRET=ERv7qk50w2NSu5YDplHGS9D08GpWXM7n8+Za5ozLz8U=
JWT_REFRESH_SECRET=R2Lvk98GyhpS71ulr6+X/WHRz5Np6LkPUfDffPXQ+LI=
PORT=3001
NODE_ENV=production
```

⚠️ **Reemplaza:**
- `TU_KEY_AQUI` → Tu OpenAI API Key real
- `MONGODB_URI` → Tu connection string de MongoDB Atlas
- `REDIS_URL` → Tu URL de Upstash

#### 2.4 Deploy

```
Click "Create Web Service"
Espera ~3-5 minutos
```

#### 2.5 Obtener URL

```
Una vez "Live", copia el URL:
https://ai-tools-backend.onrender.com

⚠️ GUARDA ESTE URL - lo necesitas para el frontend
```

---

### PASO 3: Desplegar Frontend

#### 3.1 Crear Servicio

```
Dashboard → New + → Web Service
→ Connect mismo repo: ai-tools-platform
```

#### 3.2 Configuración

| Campo | Valor |
|-------|-------|
| **Name** | `ai-tools-frontend` |
| **Region** | Oregon (US West) - MISMA que backend |
| **Branch** | `main` |
| **Root Directory** | `apps/web` |
| **Runtime** | Docker |
| **Instance Type** | Free |

#### 3.3 Variables de Entorno

```bash
NEXT_PUBLIC_API_URL=https://ai-tools-backend.onrender.com
OPENAI_API_KEY=sk-proj-TU_KEY_AQUI
NEXTAUTH_SECRET=xDmxu+CZWOQ1xkOrbrAqwWuR2SKhup37+621sKqLyP8=
NODE_ENV=production
```

⚠️ **Reemplaza:**
- `ai-tools-backend.onrender.com` → URL REAL de tu backend (del paso 2.5)
- `TU_KEY_AQUI` → La MISMA OpenAI API Key

⚠️ **IMPORTANTE**: NO pongas `/` al final del URL

#### 3.4 Deploy

```
Click "Create Web Service"
Espera ~5-7 minutos (Next.js tarda más)
```

---

## ✅ VERIFICAR

### Backend
```
Abre: https://ai-tools-backend.onrender.com/health
Deberías ver: {"status":"ok"}
```

### Frontend
```
Abre: https://ai-tools-frontend.onrender.com
Deberías ver tu aplicación
```

### Probar
```
1. Crea una cuenta
2. Inicia sesión
3. Usa una herramienta
```

---

## 🐛 TROUBLESHOOTING

### ❌ Build Failed - Backend

**Problema**: Error al construir Docker

**Solución**:
```
1. Ve a Logs en Render
2. Verifica que Root Directory sea: packages/api
3. Verifica que Runtime sea: Docker
4. Asegúrate de que el Dockerfile exista en packages/api/
```

### ❌ Build Failed - Frontend

**Problema**: Error al construir Next.js

**Solución**:
```
1. Verifica Root Directory: apps/web
2. Verifica que NEXT_PUBLIC_API_URL esté configurado
3. Revisa logs para errores específicos
```

### ❌ Cannot connect to database

**Problema**: Backend no se conecta a MongoDB

**Solución**:
```
1. Verifica MONGODB_URI en variables
2. En MongoDB Atlas → Network Access → Allow 0.0.0.0/0
3. Verifica usuario/contraseña en connection string
```

### ❌ Frontend no se conecta al Backend

**Problema**: Frontend no puede llamar al backend

**Solución**:
```
1. Verifica NEXT_PUBLIC_API_URL
2. Debe ser: https://ai-tools-backend.onrender.com
3. NO debe terminar en /
4. Debe usar https:// (no http://)
```

### ❌ App muy lenta

**Esto es NORMAL en plan Free**:
- Primera carga tras inactividad: ~30-60 segundos
- Luego funciona normal
- Usar UptimeRobot.com para mantenerla activa (gratis)

---

## 💰 COSTOS

| Servicio | Plan | Costo |
|----------|------|-------|
| Render Backend | Free | $0 |
| Render Frontend | Free | $0 |
| MongoDB Atlas | M0 | $0 |
| Upstash Redis | Free | $0 |
| OpenAI | Pay-as-you-go | ~$5/mes |
| **TOTAL** | | **~$5/mes** |

---

## 📊 ARQUITECTURA FINAL

```
Usuario
  ↓
Frontend (Render Free)
https://ai-tools-frontend.onrender.com
  ↓
Backend (Render Free)
https://ai-tools-backend.onrender.com
  ↓
├── MongoDB Atlas (Gratis)
├── Upstash Redis (Gratis)
└── OpenAI API (~$5/mes)
```

---

## 🔐 SEGURIDAD

### ✅ Buenas Prácticas

1. **Variables de entorno**: NUNCA las subas a GitHub
2. **API Keys**: Monitorea uso en OpenAI dashboard
3. **MongoDB**: Establece límites de conexión
4. **Secrets**: Ya están generados de forma segura

### ⚠️ Revoca Keys Comprometidas

Si compartiste tu OpenAI API Key por error:
```
1. Ve a: https://platform.openai.com/api-keys
2. Revoke la key comprometida
3. Create new secret key
4. Actualiza en Render → Environment
```

---

## 📝 RESUMEN DE ARCHIVOS

Después de la limpieza, tu proyecto tiene:

```
ai-tools-platform/
├── packages/api/
│   ├── Dockerfile ← Render usa este
│   ├── .env.example ← Template con todas las variables
│   └── [código backend]
│
├── apps/web/
│   ├── Dockerfile ← Render usa este
│   ├── .env.example ← Template con todas las variables
│   └── [código frontend]
│
├── render.yaml ← Configuración opcional
└── DEPLOY-RENDER.md ← Esta guía
```

**Eliminados** (innecesarios para Render):
- ❌ docker-compose.yml
- ❌ Archivos .env de la raíz
- ❌ Guías de Railway/Docker
- ❌ Dockerfiles duplicados

---

## 🎉 ¡LISTO!

Tu app está corriendo en Render 100% GRATIS.

**URLs**:
- App: `https://ai-tools-frontend.onrender.com`
- API: `https://ai-tools-backend.onrender.com`

**Próximos pasos**:
1. Configura dominio custom (opcional)
2. Monitorea logs regularmente
3. Usa UptimeRobot para evitar que se duerma
4. Monitorea uso de OpenAI

---

**¿Problemas?** Revisa:
- Logs en Render Dashboard
- Variables de entorno (typos comunes)
- MongoDB Atlas → Network Access
- OpenAI API usage dashboard

**Render Docs**: https://render.com/docs
