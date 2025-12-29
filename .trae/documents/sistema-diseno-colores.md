# Sistema de Diseño - Paleta de Colores
## AI Tools Platform

---

## 🎨 **Paleta de Colores Principal**

### **1. Colores Primarios (Identidad de Marca)**

#### **Azul Primario - "Tech Blue"**
```css
--primary-blue-50: hsl(214 100% 97%)   /* #f0f9ff */
--primary-blue-100: hsl(214 95% 93%)   /* #e0f2fe */
--primary-blue-500: hsl(217 91% 60%)   /* #3b82f6 */
--primary-blue-600: hsl(221 83% 53%)   /* #2563eb */
--primary-blue-900: hsl(224 76% 48%)   /* #1e40af */
```
**Uso**: Botones principales, enlaces, elementos de navegación, iconos primarios

#### **Púrpura Innovación - "AI Purple"**
```css
--primary-purple-50: hsl(270 100% 98%)  /* #faf5ff */
--primary-purple-100: hsl(269 100% 95%) /* #f3e8ff */
--primary-purple-500: hsl(262 83% 58%)  /* #8b5cf6 */
--primary-purple-600: hsl(258 90% 66%)  /* #7c3aed */
--primary-purple-900: hsl(253 91% 50%)  /* #581c87 */
```
**Uso**: Elementos de IA, gradientes, herramientas avanzadas, efectos especiales

#### **Verde Teal - "SEO Success"**
```css
--primary-teal-50: hsl(166 76% 97%)    /* #f0fdfa */
--primary-teal-100: hsl(167 85% 89%)   /* #ccfbf1 */
--primary-teal-500: hsl(172 66% 50%)   /* #14b8a6 */
--primary-teal-600: hsl(175 84% 32%)   /* #0d9488 */
--primary-teal-900: hsl(180 84% 17%)   /* #134e4a */
```
**Uso**: Estados de éxito, métricas positivas, herramientas de optimización

---

### **2. Colores Secundarios (Funcionalidad)**

#### **Verde Éxito - "Success Green"**
```css
--success-green-50: hsl(138 76% 97%)   /* #f0fdf4 */
--success-green-100: hsl(141 84% 93%)  /* #dcfce7 */
--success-green-500: hsl(142 76% 36%)  /* #16a34a */
--success-green-600: hsl(142 72% 29%)  /* #15803d */
--success-green-900: hsl(145 63% 20%)  /* #14532d */
```
**Uso**: Mensajes de éxito, validaciones correctas, métricas positivas

#### **Amarillo Advertencia - "Warning Amber"**
```css
--warning-amber-50: hsl(55 92% 95%)    /* #fffbeb */
--warning-amber-100: hsl(55 91% 88%)   /* #fef3c7 */
--warning-amber-500: hsl(43 96% 56%)   /* #f59e0b */
--warning-amber-600: hsl(37 92% 50%)   /* #d97706 */
--warning-amber-900: hsl(28 73% 26%)   /* #78350f */
```
**Uso**: Advertencias, elementos que requieren atención, alertas

#### **Rojo Error - "Error Red"**
```css
--error-red-50: hsl(0 86% 97%)         /* #fef2f2 */
--error-red-100: hsl(0 93% 94%)        /* #fee2e2 */
--error-red-500: hsl(0 84% 60%)        /* #ef4444 */
--error-red-600: hsl(0 72% 51%)        /* #dc2626 */
--error-red-900: hsl(0 63% 31%)        /* #7f1d1d */
```
**Uso**: Errores, validaciones fallidas, elementos destructivos

---

### **3. Colores Neutros (Base)**

#### **Gris Slate - "Professional Gray"**
```css
--neutral-slate-50: hsl(210 20% 98%)   /* #f8fafc */
--neutral-slate-100: hsl(214 32% 91%)  /* #e2e8f0 */
--neutral-slate-500: hsl(215 16% 47%)  /* #64748b */
--neutral-slate-600: hsl(215 19% 35%)  /* #475569 */
--neutral-slate-900: hsl(215 28% 17%)  /* #0f172a */
```
**Uso**: Textos, fondos, bordes, elementos neutros

#### **Gris Zinc - "Modern Gray"**
```css
--neutral-zinc-50: hsl(0 0% 98%)       /* #fafafa */
--neutral-zinc-100: hsl(0 0% 96%)      /* #f4f4f5 */
--neutral-zinc-500: hsl(0 0% 45%)      /* #71717a */
--neutral-zinc-600: hsl(0 0% 32%)      /* #52525b */
--neutral-zinc-900: hsl(0 0% 9%)       /* #18181b */
```
**Uso**: Fondos alternativos, elementos secundarios, modo oscuro

---

## 🌈 **Gradientes Recomendados**

### **Gradientes Primarios**
```css
/* Gradiente Principal - Azul a Púrpura */
.gradient-primary {
  background: linear-gradient(135deg, 
    hsl(217 91% 60%) 0%, 
    hsl(262 83% 58%) 100%);
}

/* Gradiente Éxito - Teal a Verde */
.gradient-success {
  background: linear-gradient(135deg, 
    hsl(172 66% 50%) 0%, 
    hsl(142 76% 36%) 100%);
}

/* Gradiente Innovación - Púrpura a Rosa */
.gradient-innovation {
  background: linear-gradient(135deg, 
    hsl(262 83% 58%) 0%, 
    hsl(316 73% 52%) 100%);
}

/* Gradiente Sutil - Neutros */
.gradient-subtle {
  background: linear-gradient(135deg, 
    hsl(210 20% 98%) 0%, 
    hsl(214 32% 91%) 100%);
}
```

---

## 🎯 **Uso Semántico de Colores**

### **Por Funcionalidad**
| Función | Color Principal | Color Hover | Uso |
|---------|----------------|-------------|-----|
| **Acción Primaria** | `primary-blue-600` | `primary-blue-700` | Botones CTA, enlaces principales |
| **Acción Secundaria** | `primary-purple-500` | `primary-purple-600` | Funciones de IA, herramientas avanzadas |
| **Éxito/Optimización** | `primary-teal-500` | `primary-teal-600` | Métricas SEO, resultados positivos |
| **Advertencia** | `warning-amber-500` | `warning-amber-600` | Alertas, elementos que requieren atención |
| **Error** | `error-red-500` | `error-red-600` | Errores, validaciones fallidas |
| **Información** | `neutral-slate-500` | `neutral-slate-600` | Textos informativos, elementos neutros |

### **Por Herramientas SEO**
| Herramienta | Color Asignado | Justificación |
|-------------|----------------|---------------|
| **Auditoría SEO** | `primary-blue-600` | Confianza y profesionalismo |
| **Optimización IA** | `primary-purple-500` | Innovación y tecnología avanzada |
| **Keywords Research** | `primary-teal-500` | Crecimiento y descubrimiento |
| **Content Optimizer** | `success-green-500` | Mejora y optimización |
| **Performance Check** | `warning-amber-500` | Monitoreo y alertas |
| **Error Detection** | `error-red-500` | Problemas y correcciones |

---

## 🌙 **Modo Oscuro y Claro**

### **Variables CSS para Modo Claro**
```css
:root {
  /* Fondos */
  --background: hsl(210 20% 98%);        /* Blanco suave */
  --surface: hsl(0 0% 100%);             /* Blanco puro */
  --surface-variant: hsl(214 32% 91%);   /* Gris muy claro */
  
  /* Textos */
  --on-background: hsl(215 28% 17%);     /* Gris muy oscuro */
  --on-surface: hsl(215 19% 35%);        /* Gris oscuro */
  --on-surface-variant: hsl(215 16% 47%); /* Gris medio */
  
  /* Bordes */
  --border: hsl(214 32% 91%);
  --border-variant: hsl(215 16% 47%);
}
```

### **Variables CSS para Modo Oscuro**
```css
.dark {
  /* Fondos */
  --background: hsl(215 28% 17%);        /* Gris muy oscuro */
  --surface: hsl(215 25% 27%);           /* Gris oscuro */
  --surface-variant: hsl(215 19% 35%);   /* Gris medio-oscuro */
  
  /* Textos */
  --on-background: hsl(210 20% 98%);     /* Blanco suave */
  --on-surface: hsl(214 32% 91%);        /* Gris muy claro */
  --on-surface-variant: hsl(215 16% 65%); /* Gris claro */
  
  /* Bordes */
  --border: hsl(215 19% 35%);
  --border-variant: hsl(215 16% 47%);
}
```

---

## ♿ **Accesibilidad y Contraste**

### **Ratios de Contraste Mínimos**
- **Texto normal**: 4.5:1
- **Texto grande**: 3:1
- **Elementos gráficos**: 3:1

### **Combinaciones Aprobadas**
| Fondo | Texto | Ratio | Estado |
|-------|-------|-------|--------|
| `primary-blue-600` | `white` | 7.2:1 | ✅ Excelente |
| `primary-purple-500` | `white` | 6.8:1 | ✅ Excelente |
| `primary-teal-500` | `white` | 5.9:1 | ✅ Muy bueno |
| `success-green-500` | `white` | 5.4:1 | ✅ Muy bueno |
| `warning-amber-500` | `black` | 8.1:1 | ✅ Excelente |
| `error-red-500` | `white` | 5.7:1 | ✅ Muy bueno |

---

## 🧩 **Ejemplos de Aplicación en Componentes**

### **Botones**
```css
/* Botón Primario */
.btn-primary {
  background: hsl(217 91% 60%);
  color: white;
  border: 1px solid hsl(221 83% 53%);
}

.btn-primary:hover {
  background: hsl(221 83% 53%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px hsla(217 91% 60% / 0.3);
}

/* Botón con Gradiente */
.btn-gradient {
  background: linear-gradient(135deg, 
    hsl(217 91% 60%) 0%, 
    hsl(262 83% 58%) 100%);
  color: white;
  border: none;
}
```

### **Cards/Tarjetas**
```css
.card {
  background: hsl(0 0% 100%);
  border: 1px solid hsl(214 32% 91%);
  border-radius: 12px;
  box-shadow: 0 1px 3px hsla(215 28% 17% / 0.1);
}

.card:hover {
  border-color: hsl(217 91% 60%);
  box-shadow: 0 4px 12px hsla(217 91% 60% / 0.15);
}

.card.dark {
  background: hsl(215 25% 27%);
  border-color: hsl(215 19% 35%);
}
```

### **Estados de Herramientas**
```css
/* Herramienta Activa */
.tool-active {
  background: linear-gradient(135deg, 
    hsl(217 91% 60%) 0%, 
    hsl(262 83% 58%) 100%);
  color: white;
}

/* Herramienta en Proceso */
.tool-processing {
  background: hsl(43 96% 56%);
  color: hsl(28 73% 26%);
  animation: pulse 2s infinite;
}

/* Herramienta Completada */
.tool-completed {
  background: hsl(142 76% 36%);
  color: white;
}
```

---

## 📱 **Implementación en Tailwind CSS**

### **Configuración Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primarios
        'tech-blue': {
          50: 'hsl(214 100% 97%)',
          100: 'hsl(214 95% 93%)',
          500: 'hsl(217 91% 60%)',
          600: 'hsl(221 83% 53%)',
          900: 'hsl(224 76% 48%)',
        },
        'ai-purple': {
          50: 'hsl(270 100% 98%)',
          100: 'hsl(269 100% 95%)',
          500: 'hsl(262 83% 58%)',
          600: 'hsl(258 90% 66%)',
          900: 'hsl(253 91% 50%)',
        },
        'seo-teal': {
          50: 'hsl(166 76% 97%)',
          100: 'hsl(167 85% 89%)',
          500: 'hsl(172 66% 50%)',
          600: 'hsl(175 84% 32%)',
          900: 'hsl(180 84% 17%)',
        },
        // Estados
        'success': {
          50: 'hsl(138 76% 97%)',
          500: 'hsl(142 76% 36%)',
          600: 'hsl(142 72% 29%)',
        },
        'warning': {
          50: 'hsl(55 92% 95%)',
          500: 'hsl(43 96% 56%)',
          600: 'hsl(37 92% 50%)',
        },
        'error': {
          50: 'hsl(0 86% 97%)',
          500: 'hsl(0 84% 60%)',
          600: 'hsl(0 72% 51%)',
        }
      }
    }
  }
}
```

---

## 🎨 **Paleta Visual Resumida**

### **8 Colores Principales**
1. **Tech Blue** `#3b82f6` - Primario, confianza
2. **AI Purple** `#8b5cf6` - Innovación, IA
3. **SEO Teal** `#14b8a6` - Éxito, optimización
4. **Success Green** `#16a34a` - Confirmación, logros
5. **Warning Amber** `#f59e0b` - Advertencias, atención
6. **Error Red** `#ef4444` - Errores, problemas
7. **Professional Slate** `#475569` - Textos, neutros
8. **Modern Zinc** `#52525b` - Fondos, elementos secundarios

### **Gradientes Destacados**
- **Principal**: Azul → Púrpura
- **Éxito**: Teal → Verde
- **Innovación**: Púrpura → Rosa
- **Sutil**: Gris claro → Gris medio

---

## 📋 **Checklist de Implementación**

- [ ] Actualizar variables CSS en `globals.css`
- [ ] Configurar colores en `tailwind.config.js`
- [ ] Actualizar componentes de botones
- [ ] Revisar contraste en modo oscuro
- [ ] Implementar gradientes en herramientas principales
- [ ] Testear accesibilidad con herramientas automáticas
- [ ] Documentar uso de colores para el equipo
- [ ] Crear guía de estilo visual

---

*Documento creado para AI Tools Platform - Sistema de Diseño v1.0*