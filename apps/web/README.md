# YA Tools - Plataforma de Herramientas SEO

Una plataforma moderna y optimizada de herramientas SEO construida con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Características Principales

### ✅ Optimizaciones de Rendimiento Implementadas

- **Loading States Globales**: Sistema completo de skeleton loaders reutilizables
- **Error Boundaries**: Manejo robusto de errores con recuperación automática
- **Lazy Loading**: Carga diferida de componentes y code splitting inteligente
- **PWA Features**: Instalación como app nativa con soporte offline completo

### 🎯 Herramientas SEO

- Análisis de palabras clave
- Auditoría técnica SEO
- Generador de meta tags
- Análisis de competencia
- Herramientas de contenido
- Monitoreo de rankings

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Componentes personalizados
- **Estado**: Zustand
- **Optimización**: Sistema personalizado de optimizaciones
- **PWA**: Service Worker avanzado

## 📊 Sistema de Optimizaciones

### Core Web Vitals Monitoreados
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1
- **FCP** (First Contentful Paint) < 1.8s
- **TTFB** (Time to First Byte) < 800ms

### Características de Rendimiento
- ⚡ **Image Optimization**: Formatos WebP/AVIF automáticos
- 🔤 **Font Optimization**: Precarga inteligente de fuentes
- 🎨 **Critical CSS**: Inyección de CSS crítico
- 📱 **PWA Ready**: Instalable como app nativa
- 🔄 **Service Worker**: Cache inteligente y soporte offline
- 📈 **Performance Monitoring**: Métricas en tiempo real

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd ai-tools-platform/apps/web

# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev
# o
pnpm dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## 📁 Estructura del Proyecto

```
apps/web/
├── app/                          # App Router (Next.js 14)
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página de inicio
│   └── test-optimization/       # Página de testing
├── components/                   # Componentes reutilizables
│   ├── ui/                      # Componentes UI básicos
│   └── optimization/            # Sistema de optimizaciones
│       ├── SkeletonLoaders.tsx  # Skeleton loaders
│       ├── ErrorBoundary.tsx    # Error boundaries
│       ├── LazyLoading.tsx      # Lazy loading
│       ├── PWAComponents.tsx    # Componentes PWA
│       ├── ImageOptimizer.tsx   # Optimización de imágenes
│       ├── FontOptimizer.tsx    # Optimización de fuentes
│       ├── CriticalCSS.tsx      # CSS crítico
│       ├── PerformanceMonitor.tsx # Monitoreo
│       └── useOptimization.ts   # Hook principal
├── hooks/                       # Custom hooks
├── lib/                         # Utilidades y configuración
├── public/                      # Archivos estáticos
│   ├── icons/                   # Iconos PWA
│   ├── manifest.json           # Manifiesto PWA
│   └── sw.js                   # Service Worker
└── next.config.js              # Configuración Next.js
```

## 🧪 Testing de Optimizaciones

Visita `/test-optimization` para acceder al panel de testing completo que incluye:

- **Métricas de Rendimiento**: Core Web Vitals en tiempo real
- **Optimización de Imágenes**: Soporte de formatos modernos
- **Optimización de Fuentes**: Estado de carga de fuentes
- **Service Worker**: Estado de registro y cache
- **Lazy Loading**: Soporte de IntersectionObserver
- **CSS Crítico**: Inyección y optimización

### Funciones de Testing
- `testPerformanceMetrics()`: Prueba métricas de rendimiento
- `testImageOptimization()`: Verifica optimización de imágenes
- `testFontOptimization()`: Comprueba carga de fuentes
- `testServiceWorker()`: Valida service worker
- `testLazyLoading()`: Prueba lazy loading
- `testCriticalCSS()`: Verifica CSS crítico

## 📈 Métricas y Monitoreo

### Performance Score
El sistema calcula un puntaje de rendimiento basado en:
- Core Web Vitals (40%)
- Tiempo de Carga (20%)
- Tamaño del Bundle (15%)
- Rendimiento de Cache (15%)
- Estado de Optimizaciones (10%)

### Exportación de Métricas
```javascript
// Exportar métricas actuales
const metrics = useOptimization();
metrics.exportMetrics(); // Descarga JSON con métricas
```

## 🔧 Configuración

### Variables de Entorno
```env
# Configuración de optimizaciones
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
```

### Configuración de Optimizaciones
```tsx
// En layout.tsx
<OptimizationProvider
  enablePerformanceMonitoring={true}
  enableFontOptimization={true}
  enableCSSOptimization={true}
  enableLoadingIndicators={true}
>
  {children}
</OptimizationProvider>
```

## 🌐 PWA Features

### Instalación
La aplicación es completamente instalable como PWA:
- Prompt de instalación automático
- Iconos adaptativos para todas las plataformas
- Splash screens personalizadas
- Soporte offline completo

### Service Worker
- Cache inteligente de recursos
- Estrategias de cache personalizables
- Sincronización en background
- Actualizaciones automáticas

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch Friendly**: Interfaces táctiles optimizadas
- **Performance**: Carga rápida en dispositivos móviles

## 🔍 Debugging

### Logs de Desarrollo
```javascript
// Habilitar logs detallados
localStorage.setItem('debug-optimization', 'true');

// Ver métricas en consola
console.log('Performance Metrics:', window.__OPTIMIZATION_METRICS__);
```

### Error Tracking
Los errores se capturan automáticamente y se pueden revisar en:
- Console del navegador
- Panel de testing (`/test-optimization`)
- Error boundaries específicos

## 🚀 Deployment

### Build de Producción
```bash
npm run build
npm run start
```

### Optimizaciones de Producción
- Minificación automática
- Tree shaking
- Code splitting
- Image optimization
- Font optimization
- CSS optimization

## 📚 Documentación Adicional

- [Sistema de Optimizaciones](./components/optimization/README.md)
- [Documentación Completa](./OPTIMIZACIONES.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🎯 Roadmap

### Próximas Características
- [ ] Advanced Analytics Dashboard
- [ ] AI-Powered SEO Suggestions
- [ ] Multi-language Support
- [ ] Advanced Caching Strategies
- [ ] Edge Computing Integration

### Optimizaciones Futuras
- [ ] Advanced Image Formats (JPEG XL)
- [ ] HTTP/3 Support
- [ ] Advanced Service Worker Strategies
- [ ] Machine Learning Performance Optimization

---

**YA Tools** - Herramientas SEO modernas con rendimiento optimizado 🚀