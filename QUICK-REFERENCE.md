# ⚡ Referencia Rápida - YA Tools

## 🚀 Comandos Esenciales

### Iniciar/Detener
```bash
# Iniciar todo
docker-compose -f docker-compose.dev.yml up

# Detener todo
docker-compose -f docker-compose.dev.yml down

# Iniciar en background
docker-compose -f docker-compose.dev.yml up -d

# Reconstruir
docker-compose -f docker-compose.dev.yml up --build
```

### Logs
```bash
# Ver todos los logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

### Mantenimiento
```bash
# Limpiar volúmenes
docker-compose -f docker-compose.dev.yml down -v

# Reiniciar servicio específico
docker-compose -f docker-compose.dev.yml restart frontend

# Ver servicios activos
docker-compose -f docker-compose.dev.yml ps

# Entrar a un contenedor
docker exec -it ai-tools-frontend-local sh
```

## 🌐 URLs Importantes

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| MongoDB | mongodb://localhost:27017 |
| Redis | redis://localhost:6379 |

## 📁 Archivos Clave

```
.env                          # Variables de entorno principales
docker-compose.dev.yml        # Configuración Docker
apps/web/.env                 # Variables frontend
packages/api/.env.example     # Template backend
```

## 🔧 Solución Rápida de Problemas

### Puerto ocupado
```bash
lsof -i :3000
kill -9 <PID>
```

### Docker no responde
```bash
open -a Docker
# Espera 30 segundos
docker-compose -f docker-compose.dev.yml up
```

### Limpiar todo
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
rm -rf apps/web/.next
```

## 💡 Tips Rápidos

- ✅ Cambios en código → Auto-reload
- ✅ Cambios en .env → Reinicia contenedor
- ✅ Cambios en package.json → Reconstruye imagen
- ✅ Logs con `docker-compose logs -f`
- ✅ MongoDB GUI → MongoDB Compass

## 🎯 Flujo de Trabajo Diario

1. **Iniciar**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Desarrollar**
   - Edita archivos en `apps/web/` o `packages/api/`
   - Los cambios se reflejan automáticamente

3. **Debugging**
   - Frontend: Chrome DevTools
   - Backend: Logs con `docker-compose logs -f backend`

4. **Detener**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

---

¿Necesitas más detalles? → Ver `LOCAL-DEV-GUIDE.md`
