'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  noindex?: boolean;
  nofollow?: boolean;
}

// Configuraciones SEO por página
const pageConfigs: Record<string, SEOConfig> = {
  '/': {
    title: 'Herramientas SEO con IA - Optimización Web Inteligente',
    description: 'Descubre YA Tools: la plataforma de inteligencia artificial para crear títulos, descripciones y nombres SEO optimizados, comprimir imágenes y más.',
    keywords: 'herramientas SEO, inteligencia artificial, IA, optimización web, marketing digital, análisis SEO, generador títulos, meta descriptions, SEO tools',
    type: 'website'
  },
  '/generar-titulo-seo': {
    title: 'Generador de Títulos SEO con IA - Optimiza tus Meta Títulos',
    description: 'Genera títulos SEO optimizados con inteligencia artificial. Crea meta títulos atractivos que mejoren tu CTR y posicionamiento en Google.',
    keywords: 'generador títulos SEO, meta títulos, IA, inteligencia artificial, optimización títulos, CTR, posicionamiento Google',
    type: 'service'
  },
  '/optimizador-contenido': {
    title: 'Optimizador de Contenido SEO - Mejora tu Texto con IA',
    description: 'Optimiza tu contenido existente con IA. Analiza textos publicados, sugiere mejoras SEO y aumenta tu visibilidad en buscadores.',
    keywords: 'optimizador contenido, SEO contenido, análisis texto, mejoras SEO, inteligencia artificial, optimización texto',
    type: 'service'
  },
  '/detector-contenido-duplicado': {
    title: 'Detector de Contenido Duplicado - Verifica Originalidad SEO',
    description: 'Detecta contenido duplicado en la web con IA. Verifica la originalidad de tu texto y evita penalizaciones de Google.',
    keywords: 'detector contenido duplicado, verificar originalidad, penalizaciones Google, contenido único, SEO',
    type: 'service'
  },
  '/seo-audit-tool': {
    title: 'Auditoría SEO Completa - Analiza tu Web con IA',
    description: 'Realiza una auditoría SEO completa de tu sitio web. Detecta errores técnicos, problemas de contenido y oportunidades de mejora.',
    keywords: 'auditoría SEO, análisis web, errores SEO, SEO técnico, optimización web, análisis sitio web',
    type: 'service'
  },
  '/vitals-checker-tool': {
    title: 'Validador Core Web Vitals - Mide Rendimiento Web',
    description: 'Valida los Core Web Vitals de tu sitio. Mide velocidad, estabilidad visual y accesibilidad para mejorar tu SEO.',
    keywords: 'Core Web Vitals, velocidad web, rendimiento web, LCP, FID, CLS, PageSpeed, SEO técnico',
    type: 'service'
  },
  '/generador-sitemap': {
    title: 'Generador de Sitemap XML - Mejora tu Indexación SEO',
    description: 'Genera un sitemap.xml optimizado para tu sitio web. Mejora la indexación en Google y otros buscadores.',
    keywords: 'generador sitemap, sitemap XML, indexación Google, SEO técnico, crawling, buscadores',
    type: 'service'
  },
  '/generador-robots': {
    title: 'Generador de Robots.txt - Controla el Crawling SEO',
    description: 'Crea y optimiza tu archivo robots.txt. Controla cómo los buscadores rastrean tu sitio web.',
    keywords: 'generador robots.txt, crawling, SEO técnico, buscadores, indexación, rastreo web',
    type: 'service'
  },
  '/keyword-scraper-tool': {
    title: 'Scraper de Palabras Clave - Extrae Keywords de Competidores',
    description: 'Extrae palabras clave de páginas de competidores con IA. Descubre oportunidades SEO y mejora tu estrategia.',
    keywords: 'scraper keywords, palabras clave, competidores, investigación SEO, análisis competencia',
    type: 'service'
  },
  '/analizador-competencia': {
    title: 'Analizador de Competencia SEO - Espía Estrategias Rivales',
    description: 'Analiza las estrategias SEO de tus competidores. Descubre sus keywords, backlinks y oportunidades de mejora.',
    keywords: 'análisis competencia, estrategias SEO, competidores, backlinks, keywords competencia',
    type: 'service'
  },
  '/renombrador-images': {
    title: 'Renombrador de Imágenes SEO - Optimiza Nombres con IA',
    description: 'Renombra imágenes automáticamente con keywords SEO. Mejora el posicionamiento de tus imágenes en Google.',
    keywords: 'renombrador imágenes, SEO imágenes, optimización imágenes, keywords imágenes, Google Imágenes',
    type: 'service'
  },
  '/compresor-imagenes': {
    title: 'Compresor de Imágenes - Reduce Peso sin Perder Calidad',
    description: 'Comprime imágenes manteniendo la calidad. Mejora la velocidad de carga y el SEO de tu sitio web.',
    keywords: 'compresor imágenes, optimización imágenes, velocidad web, Core Web Vitals, rendimiento web',
    type: 'service'
  },
  '/verificador-enlaces': {
    title: 'Verificador de Enlaces Rotos - Detecta Links que no Funcionan',
    description: 'Encuentra y repara enlaces rotos en tu sitio web. Mejora la experiencia de usuario y tu SEO.',
    keywords: 'enlaces rotos, verificador links, SEO técnico, experiencia usuario, broken links',
    type: 'service'
  },
  '/dashboard': {
    title: 'Dashboard - Panel de Control SEO',
    description: 'Accede a tu panel de control SEO. Gestiona tus análisis, resultados guardados y estadísticas.',
    keywords: 'dashboard SEO, panel control, estadísticas SEO, análisis guardados',
    type: 'website',
    noindex: true
  },
  '/analisis': {
    title: 'Análisis Guardados - Historial de Resultados SEO',
    description: 'Revisa tus análisis SEO guardados. Accede al historial completo de tus optimizaciones.',
    keywords: 'análisis guardados, historial SEO, resultados SEO',
    type: 'website',
    noindex: true
  },
  '/login': {
    title: 'Iniciar Sesión - Accede a YA Tools',
    description: 'Inicia sesión en YA Tools para acceder a todas las herramientas SEO premium.',
    keywords: 'login, iniciar sesión, acceso YA Tools',
    type: 'website',
    noindex: true
  },
  '/registro': {
    title: 'Registro - Únete a YA Tools Gratis',
    description: 'Regístrate gratis en YA Tools y accede a herramientas SEO potenciadas por IA.',
    keywords: 'registro, crear cuenta, YA Tools gratis',
    type: 'website'
  },
  '/precios': {
    title: 'Precios - Planes de YA Tools SEO',
    description: 'Descubre nuestros planes de precios. Desde herramientas gratuitas hasta soluciones empresariales SEO.',
    keywords: 'precios YA Tools, planes SEO, herramientas SEO gratis, planes premium',
    type: 'website'
  },
  '/acerca-de': {
    title: 'Acerca de YA Tools - Revolucionando el SEO con IA',
    description: 'Conoce YA Tools, la plataforma que revoluciona el SEO con inteligencia artificial. Nuestra misión y equipo.',
    keywords: 'acerca de YA Tools, equipo, misión, SEO inteligencia artificial',
    type: 'website'
  },
  '/contacto': {
    title: 'Contacto - Soporte YA Tools SEO',
    description: 'Contacta con el equipo de YA Tools. Soporte técnico, consultas comerciales y ayuda con herramientas SEO.',
    keywords: 'contacto YA Tools, soporte técnico, ayuda SEO, consultas',
    type: 'website'
  },
  '/faq': {
    title: 'Preguntas Frecuentes - FAQ YA Tools SEO',
    description: 'Encuentra respuestas a las preguntas más frecuentes sobre YA Tools y nuestras herramientas SEO.',
    keywords: 'FAQ, preguntas frecuentes, ayuda YA Tools, dudas SEO',
    type: 'website'
  },
  '/privacidad': {
    title: 'Política de Privacidad - YA Tools',
    description: 'Política de privacidad de YA Tools. Cómo protegemos y utilizamos tus datos personales.',
    keywords: 'política privacidad, protección datos, GDPR',
    type: 'website',
    noindex: true
  },
  '/terminos': {
    title: 'Términos y Condiciones - YA Tools',
    description: 'Términos y condiciones de uso de YA Tools. Conoce nuestras políticas y condiciones de servicio.',
    keywords: 'términos condiciones, políticas uso, condiciones servicio',
    type: 'website',
    noindex: true
  }
};

export function useSEO(customConfig?: SEOConfig) {
  const pathname = usePathname();
  
  const seoConfig = useMemo(() => {
    const pageConfig = pageConfigs[pathname] || {};
    
    return {
      ...pageConfig,
      ...customConfig
    };
  }, [pathname, customConfig]);
  
  return seoConfig;
}

export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Inicio', url: 'https://yatools.com/' }
  ];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Mapear segmentos a nombres legibles
    const segmentNames: Record<string, string> = {
      'generar-titulo-seo': 'Generador SEO',
      'optimizador-contenido': 'Optimizador de Contenido',
      'detector-contenido-duplicado': 'Detector de Duplicados',
      'seo-audit-tool': 'Auditor SEO',
      'vitals-checker-tool': 'Core Web Vitals',
      'generador-sitemap': 'Generador Sitemap',
      'generador-robots': 'Generador Robots.txt',
      'keyword-scraper-tool': 'Scraper Keywords',
      'analizador-competencia': 'Análisis Competencia',
      'renombrador-images': 'Renombrador Imágenes',
      'compresor-imagenes': 'Compresor Imágenes',
      'verificador-enlaces': 'Verificador Enlaces',
      'dashboard': 'Dashboard',
      'analisis': 'Análisis',
      'precios': 'Precios',
      'acerca-de': 'Acerca de',
      'contacto': 'Contacto',
      'faq': 'FAQ',
      'login': 'Iniciar Sesión',
      'registro': 'Registro'
    };
    
    const name = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      name,
      url: `https://yatools.com${currentPath}`
    });
  });
  
  return breadcrumbs;
}