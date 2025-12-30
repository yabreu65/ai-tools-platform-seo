# 🚀 Guía de Desarrollo Local - YA Tools

## ✅ Estado Actual: FUNCIONANDO

Tu aplicación está completamente configurada y funcionando en local con Docker.

## 📋 Servicios Activos

| Servicio | Puerto | URL | Estado |
|----------|--------|-----|--------|
| **Frontend** (Next.js 15) | 3000 | http://localhost:3000 | ✅ Running |
| **Backend** (Express + TypeScript) | 3001 | http://localhost:3001 | ✅ Running |
| **MongoDB** | 27017 | mongodb://localhost:27017 | ✅ Running |
| **Redis** | 6379 | redis://localhost:6379 | ✅ Running |

## 🎯 Arquitectura

```
ai-tools-platform/
├── apps/
│   └── web/                    # Frontend Next.js 15
│       ├── app/                # App Router
│       ├── components/         # Componentes React
│       ├── contexts/           # Context Providers
│       ├── public/             # Assets estáticos
│       └── Dockerfile.dev      # Docker para desarrollo
├── packages/
│   └── api/                    # Backend Express
│       ├── index.ts            # Punto de entrada
│       ├── routes/             # Rutas API
│       └── Dockerfile          # Docker backend
├── docker-compose.dev.yml      # Orchestración Docker
└── .env                        # Variables de entorno
```

## 🔧 Variables de Entorno Configuradas

### Frontend (.env)
```bash
OPENAI_API_KEY=sk-proj-...     # ✅ Configurado
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=...            # ✅ Auto-generado
```

### Backend (docker-compose.dev.yml)
```bash
OPENAI_API_KEY=...             # ✅ Configurado
MONGODB_URI=mongodb://mongodb:27017/ai-tools-platform  # ✅ Local
REDIS_URL=redis://redis:6379   # ✅ Local
JWT_SECRET=...                 # ✅ Auto-generado
JWT_REFRESH_SECRET=...         # ✅ Auto-generado
PORT=3001
NODE_ENV=development
```

## 🎮 Comandos Principales

### Iniciar la Aplicación
```bash
docker-compose -f docker-compose.dev.yml up
```

### Detener la Aplicación
```bash
docker-compose -f docker-compose.dev.yml down
```

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Solo frontend
docker-compose -f docker-compose.dev.yml logs -f frontend

# Solo backend
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Reconstruir después de cambios en dependencias
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Limpiar todo (volúmenes, contenedores, imágenes)
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

## 🛠️ Desarrollo Sin Docker (Opcional)

Si prefieres ejecutar sin Docker para desarrollo más rápido:

### Backend
```bash
cd packages/api
npm install
npm run dev    # Inicia en puerto 3001
```

### Frontend
```bash
cd apps/web
npm install
npm run dev    # Inicia en puerto 3000
```

**Nota:** Aún necesitarás MongoDB y Redis. Puedes usar:
```bash
# Solo MongoDB y Redis con Docker
docker-compose -f docker-compose.dev.yml up mongodb redis
```

## 📦 Estructura de Datos

### MongoDB
- **Base de datos:** `ai-tools-platform`
- **Conexión:** `mongodb://localhost:27017`
- **Colecciones principales:**
  - `users` - Usuarios registrados
  - `analyses` - Análisis SEO guardados
  - `sitemaps` - Sitemaps generados
  - `sessions` - Sesiones de usuario

### Redis
- **Uso:** Caché de resultados, sesiones, rate limiting
- **TTL predeterminado:** 1 hora

## 🐛 Solución de Problemas

### Error: "Port already in use"
```bash
# Encuentra el proceso usando el puerto
lsof -i :3000
lsof -i :3001

# Mata el proceso
kill -9 <PID>
```

### Error: "Cannot connect to Docker daemon"
```bash
# Inicia Docker Desktop
open -a Docker

# Espera 30 segundos y reinicia
docker-compose -f docker-compose.dev.yml up
```

### Frontend no se actualiza después de cambios
```bash
# Limpia caché de Next.js
rm -rf apps/web/.next

# Reinicia el contenedor
docker-compose -f docker-compose.dev.yml restart frontend
```

### Errores de permisos en volúmenes
```bash
# Detén todo
docker-compose -f docker-compose.dev.yml down

# Limpia volúmenes
docker-compose -f docker-compose.dev.yml down -v

# Reinicia
docker-compose -f docker-compose.dev.yml up --build
```

## 🎨 Iconos y Favicons

Los iconos placeholder fueron generados automáticamente. Para usar tu logo real:

1. Ve a https://realfavicongenerator.net/
2. Sube tu logo (mínimo 512x512px)
3. Descarga el paquete de iconos
4. Reemplaza los archivos en `apps/web/public/`

## 📝 Próximos Pasos Recomendados

### 1. Personalizar la Aplicación
- [ ] Agregar tu logo real
- [ ] Personalizar colores en `tailwind.config.js`
- [ ] Configurar Google Analytics (opcional)

### 2. Agregar Herramientas SEO
- [ ] Keyword Research
- [ ] Backlink Checker
- [ ] Sitemap Generator
- [ ] Meta Tags Generator

### 3. Preparar para Producción
- [ ] Configurar variables de entorno de producción
- [ ] Configurar MongoDB Atlas
- [ ] Configurar Upstash Redis
- [ ] Configurar dominio personalizado

### 4. Testing
- [ ] Configurar Jest para tests unitarios
- [ ] Agregar tests E2E con Playwright
- [ ] Configurar CI/CD con GitHub Actions

## 📚 Recursos Útiles

- **Next.js 15 Docs:** https://nextjs.org/docs
- **Express.js:** https://expressjs.com/
- **MongoDB:** https://www.mongodb.com/docs/
- **Redis:** https://redis.io/docs/
- **Docker Compose:** https://docs.docker.com/compose/
- **Tailwind CSS:** https://tailwindcss.com/docs

## 🔐 Seguridad

- ✅ Secrets en .env (no en código)
- ✅ .env en .gitignore
- ✅ JWT tokens para autenticación
- ✅ Bcrypt para passwords
- ✅ Rate limiting configurado
- ✅ CORS configurado
- ⚠️ **NUNCA** subas archivos .env a Git
- ⚠️ Usa variables de entorno diferentes para producción

## 💡 Tips de Desarrollo

1. **Hot Reload:** Los cambios en el código se reflejan automáticamente
2. **Logs:** Usa `console.log` - se mostrarán en los logs de Docker
3. **Debugging:** Usa las DevTools de Chrome/Edge
4. **MongoDB:** Usa MongoDB Compass para ver la BD visualmente
5. **API Testing:** Usa Postman o Thunder Client (VS Code)

## 🎉 ¡Todo Listo!

Tu aplicación está completamente configurada y lista para desarrollo. ¡A codear! 🚀

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o consulta la documentación oficial.

---

Última actualización: $(date "+%Y-%m-%d %H:%M:%S")
