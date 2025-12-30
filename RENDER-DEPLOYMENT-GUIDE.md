# 🚀 Guía Completa de Deployment en Render (GRATIS)

## ⏱️ Tiempo Total: 30-40 minutos

## 📋 Checklist Pre-Deploy

Antes de empezar, asegúrate de tener:
- [ ] Cuenta en GitHub (gratis)
- [ ] Código funcionando localmente
- [ ] Tu OpenAI API Key: `sk-proj-...`

## 🎯 Paso 1: Configurar MongoDB Atlas (5 minutos)

### 1.1 Crear Cuenta y Cluster
```bash
1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate con Google o Email (GRATIS)
3. Click en "Build a Database"
4. Selecciona "M0 FREE" (512MB gratis para siempre)
5. Provider: AWS
6. Region: Elige la más cercana (us-east-1 recomendado)
7. Cluster Name: "ai-tools-cluster"
8. Click "Create"
```

### 1.2 Crear Usuario de Base de Datos
```bash
1. En "Security" → "Database Access"
2. Click "Add New Database User"
3. Authentication: Password
4. Username: aitools_user
5. Password: Genera una segura (guárdala)
6. Built-in Role: "Atlas Admin"
7. Click "Add User"
```

### 1.3 Permitir Acceso desde Cualquier IP
```bash
1. En "Security" → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. IP: 0.0.0.0/0 (importante para Render)
5. Click "Confirm"
```

### 1.4 Obtener Connection String
```bash
1. Click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Driver: Node.js
4. Version: 4.1 or later
5. Copia el string de conexión:
   mongodb+srv://aitools_user:<password>@ai-tools-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

6. Reemplaza <password> con tu contraseña
7. Cambia el nombre de BD: ...mongodb.net/ai-tools-platform?retryWrites...
```

**✅ GUARDA ESTO:** Tu MONGODB_URI completo
```
mongodb+srv://aitools_user:TU_PASSWORD@ai-tools-cluster.xxxxx.mongodb.net/ai-tools-platform?retryWrites=true&w=majority
```

---

## 🎯 Paso 2: Configurar Upstash Redis (5 minutos)

### 2.1 Crear Cuenta y Base de Datos
```bash
1. Ve a: https://console.upstash.com/login
2. Regístrate con Google o Email (GRATIS)
3. Click "Create Database"
4. Name: "ai-tools-redis"
5. Type: Regional
6. Region: Elige la más cercana a tu MongoDB
7. TLS: Enabled
8. Click "Create"
```

### 2.2 Obtener Connection String
```bash
1. En tu database, ve a "Details"
2. Busca "Redis URL"
3. Formato: redis://default:XXXXXX@region.upstash.io:6379
```

**✅ GUARDA ESTO:** Tu REDIS_URL completo
```
redis://default:XXXXXXXXXXXXXXX@us1-adapted-monster-12345.upstash.io:6379
```

---

## 🎯 Paso 3: Subir Código a GitHub (5 minutos)

### 3.1 Inicializar Git (si no lo has hecho)
```bash
cd /Users/yoryiabreu/projects/ai-tools-platform

# Verificar status de git
git status

# Si no es un repo git aún, inicializar:
git init
git add .
git commit -m "Initial commit - ready for Render deployment"
```

### 3.2 Crear Repositorio en GitHub
```bash
1. Ve a: https://github.com/new
2. Repository name: "ai-tools-platform"
3. Visibility: Private (recomendado) o Public
4. NO inicialices con README (ya lo tienes)
5. Click "Create repository"
```

### 3.3 Push a GitHub
```bash
# Copia los comandos que GitHub te muestra, algo como:
git remote add origin https://github.com/TU_USUARIO/ai-tools-platform.git
git branch -M main
git push -u origin main
```

**✅ VERIFICA:** Tu código debe estar visible en GitHub

---

## 🎯 Paso 4: Desplegar Backend en Render (10 minutos)

### 4.1 Crear Cuenta en Render
```bash
1. Ve a: https://dashboard.render.com/register
2. Regístrate con GitHub (más fácil)
3. Autoriza acceso a tus repositorios
```

### 4.2 Crear Web Service para Backend
```bash
1. En Dashboard, click "New +" → "Web Service"
2. Conecta tu repositorio "ai-tools-platform"
3. Configuración:

   Name: ai-tools-backend
   Region: Oregon (US West) - gratis
   Branch: main
   Root Directory: packages/api
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start

   Instance Type: Free
```

### 4.3 Variables de Entorno del Backend
```bash
En "Environment Variables", agrega UNA POR UNA:

OPENAI_API_KEY = your_openai_api_key_here

MONGODB_URI = mongodb+srv://aitools_user:TU_PASSWORD@ai-tools-cluster.xxxxx.mongodb.net/ai-tools-platform?retryWrites=true&w=majority

REDIS_URL = redis://default:XXXXXXX@region.upstash.io:6379

JWT_SECRET = ERv7qk50w2NSu5YDplHGS9D08GpWXM7n8+Za5ozLz8U=

JWT_REFRESH_SECRET = R2Lvk98GyhpS71ulr6+X/WHRz5Np6LkPUfDffPXQ+LI=

NODE_ENV = production

PORT = 3001
```

### 4.4 Deploy Backend
```bash
1. Click "Create Web Service"
2. Espera 5-10 minutos (se construye la imagen)
3. Verás logs en tiempo real
4. Cuando diga "Your service is live 🎉" → ¡Listo!
```

**✅ GUARDA ESTO:** La URL de tu backend
```
https://ai-tools-backend.onrender.com
```

---

## 🎯 Paso 5: Desplegar Frontend en Render (10 minutos)

### 5.1 Crear Static Site para Frontend
```bash
1. Click "New +" → "Static Site"
2. Conecta el mismo repositorio
3. Configuración:

   Name: ai-tools-frontend
   Branch: main
   Root Directory: apps/web
   Build Command: npm install && npm run build
   Publish Directory: .next

   (Render detectará Next.js automáticamente)
```

### 5.2 Variables de Entorno del Frontend
```bash
En "Environment Variables":

NEXT_PUBLIC_API_URL = https://ai-tools-backend.onrender.com

OPENAI_API_KEY = your_openai_api_key_here

NEXTAUTH_SECRET = xDmxu+CZWOQ1xkOrbrAqwWuR2SKhup37+621sKqLyP8=

NODE_ENV = production
```

### 5.3 Deploy Frontend
```bash
1. Click "Create Static Site"
2. Espera 5-10 minutos
3. Verás el build process en logs
4. Cuando termine → ¡Tu app está live!
```

**✅ TU APP ESTÁ VIVA:**
```
https://ai-tools-frontend.onrender.com
```

---

## 🎉 ¡DEPLOYMENT COMPLETO!

### ✅ Verifica que Todo Funciona

1. **Backend Health Check:**
   ```
   https://ai-tools-backend.onrender.com/health
   ```
   Debería responder con: `{"status": "ok"}` o similar

2. **Frontend:**
   ```
   https://ai-tools-frontend.onrender.com
   ```
   Debería cargar tu aplicación

3. **Prueba una Feature:**
   - Registra un usuario
   - Genera contenido con IA
   - Verifica que guarda en MongoDB

---

## ⚙️ Configuración Post-Deploy

### Auto-Deploy desde GitHub
```bash
✅ Ya está configurado por defecto
Cada vez que hagas push a main:
git add .
git commit -m "Update feature"
git push

→ Render detecta el cambio y re-deploya automáticamente
```

### Dominio Personalizado (Opcional)
```bash
1. En Settings de tu Static Site
2. Click "Add Custom Domain"
3. Ingresa: tudominio.com
4. Sigue instrucciones DNS
5. SSL gratis automático
```

### Ver Logs en Tiempo Real
```bash
Backend: Dashboard → ai-tools-backend → Logs
Frontend: Dashboard → ai-tools-frontend → Logs
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
Problema: Build failed
Solución:
1. Verifica que packages/api/package.json tiene "build" script
2. Chequea que todas las variables de entorno están correctas
3. Revisa logs: pueden faltar dependencias
```

### Frontend error 500
```bash
Problema: Cannot connect to backend
Solución:
1. Verifica que NEXT_PUBLIC_API_URL apunta a tu backend
2. Asegúrate que backend está corriendo (health check)
3. Verifica CORS en backend (debe permitir tu dominio)
```

### App muy lenta
```bash
Problema: Primer request tarda ~30 segundos
Causa: App se durmió (tier gratuito)
Solución:
- Normal en tier gratuito
- Para evitarlo: Upgrade a plan pagado ($7/mes)
- O usa un servicio de ping cada 10 min (cron-job.org)
```

### MongoDB connection error
```bash
Problema: Cannot connect to MongoDB
Solución:
1. Verifica IP whitelist en MongoDB Atlas (0.0.0.0/0)
2. Chequea que MONGODB_URI tiene la password correcta
3. Verifica que el cluster está activo
```

---

## 📊 Monitoreo y Mantenimiento

### Ver Métricas
```bash
Render Dashboard → Service → Metrics
- Request count
- Response times
- Memory usage
- Build history
```

### Logs
```bash
# Ver últimos logs
Dashboard → Service → Logs

# Filtrar por fecha
Usa el selector de tiempo en la parte superior
```

### Reiniciar Servicios
```bash
Dashboard → Service → Manual Deploy
O
Settings → Clear build cache & deploy
```

---

## 💰 Costos y Límites (Tier Gratuito)

| Recurso | Límite Gratuito |
|---------|-----------------|
| **Build Time** | 500 horas/mes |
| **Bandwidth** | 100 GB/mes |
| **Requests** | Ilimitados |
| **Sleep** | Tras 15 min inactividad |
| **Databases** | 90 días (luego se archiva) |

### Cuándo Considerar Upgrade ($7/mes)
- ✅ Tienes usuarios reales activos
- ✅ Necesitas que esté siempre activo
- ✅ Quieres mejor performance
- ✅ Necesitas más de 512MB RAM

---

## 🎯 Siguientes Pasos

1. **Testea Exhaustivamente**
   - Todas las funcionalidades
   - Diferentes navegadores
   - Móvil y desktop

2. **Configura Analytics**
   - Google Analytics
   - Monitoreo de errores (Sentry)
   - Performance monitoring

3. **SEO**
   - Agrega sitemap.xml
   - Configura robots.txt
   - Meta tags optimizados

4. **Seguridad**
   - Rate limiting
   - CORS configurado
   - Validación de inputs

5. **Backup**
   - Exporta MongoDB regularmente
   - Guarda env vars en lugar seguro
   - Documenta todo

---

## 📞 Soporte

**Render Docs:** https://render.com/docs
**MongoDB Atlas:** https://docs.atlas.mongodb.com/
**Upstash:** https://docs.upstash.com/

---

## ✅ Checklist Final

- [ ] Backend desplegado y respondiendo
- [ ] Frontend desplegado y cargando
- [ ] MongoDB conectado
- [ ] Redis conectado
- [ ] Auto-deploy configurado
- [ ] Todas las features funcionando
- [ ] SSL/HTTPS activo
- [ ] Logs monitoreándose

---

**🎉 ¡FELICITACIONES!**
Tu aplicación está en producción y accesible desde cualquier parte del mundo.

**URL de tu app:** https://ai-tools-frontend.onrender.com

**Próximo:** Comparte el link, consigue usuarios, itera y mejora.

---

*Última actualización: 2025-12-29*
