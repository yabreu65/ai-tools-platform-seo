# ✅ Checklist de Deployment - Render

## 🎯 Tu Progreso

Marca cada paso conforme lo completes. **Tiempo estimado total: 30-40 minutos**

---

## 📦 FASE 1: PREPARACIÓN (5 min) ✅ COMPLETADO

- [x] ✅ Aplicación funcionando localmente
- [x] ✅ Scripts de build verificados
- [x] ✅ .gitignore configurado
- [x] ✅ Guía de deployment creada

**Estado:** ✅ LISTO PARA CONTINUAR

---

## 🗄️ FASE 2: CONFIGURAR BASES DE DATOS (10 min)

### MongoDB Atlas
- [ ] Ir a https://www.mongodb.com/cloud/atlas/register
- [ ] Crear cuenta (gratis)
- [ ] Crear cluster M0 Free
- [ ] Crear usuario de base de datos
      ```
      Username: aitools_user
      Password: [genera una segura]
      Role: Atlas Admin
      ```
- [ ] Whitelist IP: 0.0.0.0/0 (todas las IPs)
- [ ] Obtener connection string
- [ ] **GUARDAR:** `MONGODB_URI=mongodb+srv://...`

### Upstash Redis
- [ ] Ir a https://console.upstash.com/login
- [ ] Crear cuenta (gratis)
- [ ] Crear database Redis
      ```
      Name: ai-tools-redis
      Region: us-east-1 (o la más cercana)
      ```
- [ ] Obtener connection string
- [ ] **GUARDAR:** `REDIS_URL=redis://...`

**Variables que debes tener ahora:**
```bash
✅ OPENAI_API_KEY = your_openai_api_key_here
⏳ MONGODB_URI = mongodb+srv://yoryiabreu:Eloina23..@cluster0.rfwdrju.mongodb.net/herramientas-seo?retryWrites=true&w=majority&appName=Cluster0
⏳ REDIS_URL = [copiar de Upstash]
```

---

## 🐙 FASE 3: SUBIR A GITHUB (5 min)

### Verificar estado de Git
- [ ] Abrir terminal en: `/Users/yoryiabreu/projects/ai-tools-platform`
- [ ] Ejecutar: `git status`

### Si YA es un repositorio Git:
- [ ] Hacer commit de cambios recientes:
      ```bash
      git add .
      git commit -m "Prepare for Render deployment"
      git push
      ```

### Si NO es un repositorio Git:
- [ ] Inicializar Git:
      ```bash
      git init
      git add .
      git commit -m "Initial commit - ready for deployment"
      ```
- [ ] Crear repo en GitHub:
      - Ir a: https://github.com/new
      - Nombre: `ai-tools-platform`
      - Visibilidad: Private
      - NO inicializar con README
      - Click "Create repository"
- [ ] Conectar y push:
      ```bash
      git remote add origin https://github.com/TU_USUARIO/ai-tools-platform.git
      git branch -M main
      git push -u origin main
      ```

**Verificar:**
- [ ] Código visible en GitHub
- [ ] Archivo .env NO está en GitHub (debe ser ignorado)

---

## 🚀 FASE 4: DESPLEGAR BACKEND EN RENDER (10 min)

### Crear cuenta y servicio
- [ ] Ir a: https://dashboard.render.com/register
- [ ] Registrarse con GitHub
- [ ] Autorizar acceso a repositorios
- [ ] Click "New +" → "Web Service"
- [ ] Seleccionar repositorio: `ai-tools-platform`

### Configurar servicio
- [ ] Name: `ai-tools-backend`
- [ ] Region: `Oregon (US West)` - gratis
- [ ] Branch: `main`
- [ ] Root Directory: `packages/api`
- [ ] Runtime: `Node`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Instance Type: `Free`

### Agregar Variables de Entorno
Agregar una por una en "Environment Variables":

- [ ] `OPENAI_API_KEY` = `your_openai_api_key_here`
- [ ] `MONGODB_URI` = `[tu connection string de MongoDB]`
- [ ] `REDIS_URL` = `[tu connection string de Upstash]`
- [ ] `JWT_SECRET` = `ERv7qk50w2NSu5YDplHGS9D08GpWXM7n8+Za5ozLz8U=`
- [ ] `JWT_REFRESH_SECRET` = `R2Lvk98GyhpS71ulr6+X/WHRz5Np6LkPUfDffPXQ+LI=`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`

### Deploy
- [ ] Click "Create Web Service"
- [ ] Esperar 5-10 minutos (ver logs en tiempo real)
- [ ] Cuando diga "Your service is live 🎉" → ¡Listo!

### Verificar
- [ ] Copiar URL del backend: `https://ai-tools-backend.onrender.com`
- [ ] Probar: `https://ai-tools-backend.onrender.com/health`
- [ ] Debería responder (puede tardar ~30s si se durmió)

**GUARDAR URL del backend:**
```
Backend URL: https://ai-tools-backend.onrender.com
```

---

## 🎨 FASE 5: DESPLEGAR FRONTEND EN RENDER (10 min)

### Crear Static Site
- [ ] En Dashboard Render, click "New +" → "Static Site"
- [ ] Seleccionar mismo repositorio: `ai-tools-platform`

### Configurar site
- [ ] Name: `ai-tools-frontend`
- [ ] Branch: `main`
- [ ] Root Directory: `apps/web`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `.next`

### Agregar Variables de Entorno
- [ ] `NEXT_PUBLIC_API_URL` = `https://ai-tools-backend.onrender.com`
- [ ] `OPENAI_API_KEY` = `your_openai_api_key_here`
- [ ] `NEXTAUTH_SECRET` = `xDmxu+CZWOQ1xkOrbrAqwWuR2SKhup37+621sKqLyP8=`
- [ ] `NODE_ENV` = `production`

### Deploy
- [ ] Click "Create Static Site"
- [ ] Esperar 5-10 minutos
- [ ] Cuando termine → ¡Tu app está live!

### Verificar
- [ ] Abrir: `https://ai-tools-frontend.onrender.com`
- [ ] Debería cargar tu aplicación
- [ ] Navegar por las páginas
- [ ] Probar una funcionalidad (ej: generar contenido con IA)

---

## 🧪 FASE 6: TESTING POST-DEPLOY (10 min)

### Tests Básicos
- [ ] Página principal carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Navegación funciona entre páginas
- [ ] Estilos se ven correctos

### Tests de Funcionalidad
- [ ] Registro de nuevo usuario funciona
- [ ] Login funciona
- [ ] Generación de contenido con IA funciona
- [ ] Dashboard carga correctamente
- [ ] Los datos se guardan en MongoDB

### Performance
- [ ] Primera carga < 5 segundos
- [ ] Navegación entre páginas < 1 segundo
- [ ] Si backend estaba dormido, despertó correctamente

---

## 🎉 DEPLOYMENT COMPLETO

### URLs de tu Aplicación
```
✅ Frontend: https://ai-tools-frontend.onrender.com
✅ Backend:  https://ai-tools-backend.onrender.com
✅ MongoDB:  [Atlas Cloud]
✅ Redis:    [Upstash Cloud]
```

### Próximos Pasos
- [ ] Compartir link con amigos/testers
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar analytics (Google Analytics)
- [ ] Monitorear logs primeros días
- [ ] Planear features futuras

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs
```bash
Backend:  Dashboard → ai-tools-backend → Logs
Frontend: Dashboard → ai-tools-frontend → Logs
MongoDB:  Atlas → Monitoring
Redis:    Upstash → Metrics
```

### Auto-Deploy
✅ Ya configurado - cada push a `main` re-deploya automáticamente

### Actualizaciones
```bash
# Hacer cambios localmente
git add .
git commit -m "Update feature X"
git push

# Render detecta el push y re-deploya automáticamente
# Espera 3-5 minutos para que complete
```

---

## 🆘 Si algo falla

### Backend no inicia
1. Revisar logs en Render
2. Verificar variables de entorno
3. Verificar conexión a MongoDB/Redis
4. Intentar "Manual Deploy"

### Frontend error 500
1. Verificar que backend esté corriendo
2. Verificar NEXT_PUBLIC_API_URL apunta a backend correcto
3. Limpiar cache: Settings → Clear build cache & deploy

### App muy lenta
- Normal si se durmió (tier gratuito)
- Primer request tarda ~30 segundos
- Considera upgrade a $7/mes para siempre activo

---

## 📞 Recursos de Ayuda

- 📖 Guía Detallada: `RENDER-DEPLOYMENT-GUIDE.md`
- 🚀 Opciones de Deploy: `DEPLOYMENT-OPTIONS.md`
- ⚡ Comandos Rápidos: `QUICK-REFERENCE.md`
- 🛠️ Desarrollo Local: `LOCAL-DEV-GUIDE.md`

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Upstash:** https://docs.upstash.com

---

**Última actualización:** 2025-12-29

¡Buena suerte con tu deployment! 🚀
