# 🔒 INSTRUCCIONES CRÍTICAS DE SEGURIDAD

## ⚠️ ACCIÓN INMEDIATA REQUERIDA

Tus API keys han sido expuestas en archivos de código. Debes tomar estas acciones **INMEDIATAMENTE**:

---

## 1. REVOCAR API KEYS DE OPENAI

### Keys comprometidas encontradas:
- `sk-proj-W-M5N-c79egzEta18upQP0jN...` (en apps/web/.env.local)
- `sk-proj-ykSLVa8rjsNvq_PmAAdlmZJ...` (en packages/api/.env)

### Pasos para revocar:

1. **Ve al dashboard de OpenAI:**
   ```
   https://platform.openai.com/api-keys
   ```

2. **Inicia sesión** con tu cuenta

3. **Busca las keys** que comienzan con:
   - `sk-proj-W-M5N-c79e...`
   - `sk-proj-ykSLVa8rjs...`

4. **Haz clic en el ícono de eliminar** (🗑️) junto a cada key

5. **Confirma la eliminación**

6. **Crea una NUEVA API key:**
   - Click en "Create new secret key"
   - Dale un nombre descriptivo: "YA Tools - Production"
   - Copia la nueva key (solo se muestra una vez)

---

## 2. REVOCAR GOOGLE API KEYS

### Keys comprometidas:
- Google API Key: `AIzaSyA6nel6MSSjg1CptU9DoGJ03FvkQJhLaAc`
- Google Custom Search CX: `b3b609d20fb374688`

### Pasos para revocar:

1. **Ve a Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Selecciona tu proyecto**

3. **Encuentra la API key** `AIzaSyA6nel6MSSjg1CptU9DoGJ03FvkQJhLaAc`

4. **Haz clic en los 3 puntos** → "Delete key"

5. **Crea una NUEVA API key:**
   - Click en "+ CREATE CREDENTIALS" → "API key"
   - Restringe la key:
     - Application restrictions: HTTP referrers o IP addresses
     - API restrictions: Solo habilita las APIs que necesitas

---

## 3. CAMBIAR CONTRASEÑA DE MONGODB

### Credenciales comprometidas:
- Usuario: `yoryiabreu`
- Contraseña: `Eloina23..`
- Cluster: `cluster0.rfwdrju.mongodb.net`

### Pasos para cambiar:

1. **Ve a MongoDB Atlas:**
   ```
   https://cloud.mongodb.com/
   ```

2. **Ve a Database Access** (en el menú izquierdo)

3. **Busca el usuario** `yoryiabreu`

4. **Haz clic en "Edit"**

5. **Cambia la contraseña:**
   - Genera una contraseña segura (usa un generador)
   - Guárdala en un gestor de contraseñas

6. **Actualiza la connection string** en tus archivos .env

---

## 4. GENERAR NUEVOS JWT SECRETS

### Secrets comprometidos:
- JWT_SECRET: `your-super-secret-jwt-key-change-this-in-production-2024`
- JWT_REFRESH_SECRET: `your-super-secret-jwt-refresh-key-change-this-in-production-2024`

### Generar nuevos secrets seguros:

```bash
# En tu terminal, ejecuta:
openssl rand -base64 32
# Copia el output y úsalo como JWT_SECRET

openssl rand -base64 32
# Copia el output y úsalo como JWT_REFRESH_SECRET
```

**IMPORTANTE:** Al cambiar estos secrets, todos los usuarios tendrán que volver a iniciar sesión.

---

## 5. ACTUALIZAR ARCHIVOS .ENV

### Después de obtener las nuevas credenciales:

1. **Actualiza `apps/web/.env.local`:**
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3001
   OPENAI_API_KEY=tu_nueva_key_de_openai
   ```

2. **Actualiza `packages/api/.env`:**
   ```bash
   OPENAI_API_KEY=tu_nueva_key_de_openai
   GOOGLE_API_KEY=tu_nueva_google_api_key
   PAGESPEED_API_KEY=tu_nueva_google_api_key
   GOOGLE_CX=tu_nuevo_cx
   MONGODB_URI=mongodb+srv://yoryiabreu:NUEVA_PASSWORD@cluster0.rfwdrju.mongodb.net/ai-tools-platform?retryWrites=true&w=majority
   JWT_SECRET=tu_nuevo_jwt_secret_generado
   JWT_REFRESH_SECRET=tu_nuevo_jwt_refresh_secret_generado
   ```

---

## 6. VERIFICAR QUE LOS ARCHIVOS NO ESTÉN EN GIT

```bash
# Verifica el status
git status

# Los siguientes archivos NO deben aparecer para commit:
# - apps/web/.env.local
# - packages/api/.env
# - cookies.txt
# - cookies_test.txt

# Si aparecen, el .gitignore los bloqueará
```

---

## 7. HACER COMMIT SEGURO

```bash
# Agregar los archivos seguros
git add .gitignore
git add apps/web/.env.example
git add packages/api/.env.example
git add SECURITY-INSTRUCTIONS.md

# Verificar que NO se agreguen archivos sensibles
git status

# Commit
git commit -m "feat: Add security configuration and .gitignore

- Add comprehensive .gitignore
- Add .env.example files with documentation
- Add security instructions for API key management
- Protect sensitive credentials from being committed"
```

---

## 8. MEJORES PRÁCTICAS A FUTURO

### ✅ HACER:
- Usar variables de entorno para todas las credenciales
- Rotar API keys cada 90 días
- Usar diferentes keys para desarrollo y producción
- Implementar rate limiting en tu API
- Monitorear el uso de tus API keys
- Usar servicios como Vault para gestión de secretos

### ❌ NO HACER:
- Nunca hacer commit de archivos .env
- Nunca compartir API keys en código
- Nunca dejar API keys en comentarios
- Nunca usar las mismas credenciales en dev y prod
- Nunca exponer API keys en el frontend

---

## 9. MONITOREO DE SEGURIDAD

### Configura alertas en OpenAI:
1. Ve a: https://platform.openai.com/account/billing/limits
2. Configura límites de gasto diario/mensual
3. Activa alertas por email

### Revisa el uso regularmente:
- https://platform.openai.com/usage
- Verifica si hay picos inusuales de uso

---

## 10. CHECKLIST FINAL

Marca cada item cuando lo completes:

- [ ] Revocadas las 2 API keys de OpenAI
- [ ] Creada nueva API key de OpenAI
- [ ] Revocada Google API Key
- [ ] Creada nueva Google API Key
- [ ] Cambiada contraseña de MongoDB
- [ ] Generados nuevos JWT secrets
- [ ] Actualizados archivos .env locales
- [ ] Verificado que .env no está en git
- [ ] Commit realizado de archivos seguros
- [ ] Configuradas alertas de uso en OpenAI
- [ ] Documentadas nuevas credenciales en gestor de contraseñas

---

## ⚡ CONTACTO DE EMERGENCIA

Si sospechas que tus credenciales están siendo usadas maliciosamente:

1. **OpenAI:** Revoca keys inmediatamente
2. **MongoDB:** Cambia contraseña y revisa logs de acceso
3. **Google:** Revoca keys y revisa actividad de la cuenta

---

## 📚 RECURSOS ADICIONALES

- [OpenAI Security Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Fecha de creación:** 2025-11-20
**Estado:** ACCIÓN REQUERIDA
**Prioridad:** CRÍTICA 🔴
