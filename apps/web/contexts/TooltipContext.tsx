'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface TooltipContent {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  relatedLinks?: { label: string; url: string }[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
}

interface TooltipContextType {
  activeTooltip: string | null;
  setActiveTooltip: (id: string | null) => void;
  tooltipContent: Record<string, TooltipContent>;
  registerTooltip: (id: string, content: TooltipContent) => void;
  unregisterTooltip: (id: string) => void;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  setUserLevel: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Base de datos de contenido de ayuda
const defaultTooltipContent: Record<string, TooltipContent> = {
  'sitemap-generator': {
    id: 'sitemap-generator',
    title: 'Generador de Sitemap',
    description: 'Un sitemap XML ayuda a los motores de búsqueda a entender la estructura de tu sitio web y indexar todas tus páginas de manera eficiente.',
    steps: [
      'Ingresa la URL de tu sitio web',
      'Configura las opciones de rastreo (profundidad, frecuencia)',
      'Haz clic en "Generar Sitemap"',
      'Descarga el archivo XML generado',
      'Sube el sitemap a la raíz de tu sitio web',
      'Envía el sitemap a Google Search Console'
    ],
    tips: [
      'Actualiza tu sitemap regularmente cuando agregues nuevo contenido',
      'Incluye solo páginas importantes y de calidad',
      'Verifica que todas las URLs en el sitemap sean accesibles'
    ],
    relatedLinks: [
      { label: 'Guía de Sitemaps de Google', url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview' },
      { label: 'Verificador de Sitemaps', url: '/verificador-sitemap' }
    ],
    level: 'beginner',
    category: 'SEO'
  },
  'seo-analyzer': {
    id: 'seo-analyzer',
    title: 'Analizador SEO',
    description: 'Analiza tu página web para identificar oportunidades de mejora en SEO on-page, incluyendo meta tags, estructura de contenido y rendimiento.',
    steps: [
      'Ingresa la URL de la página a analizar',
      'Espera a que se complete el análisis',
      'Revisa el puntaje general de SEO',
      'Examina cada sección de recomendaciones',
      'Implementa las mejoras sugeridas',
      'Vuelve a analizar para verificar los cambios'
    ],
    tips: [
      'Prioriza las mejoras marcadas como "críticas"',
      'Optimiza primero el título y la meta descripción',
      'Asegúrate de tener una estructura de encabezados clara (H1, H2, H3)'
    ],
    relatedLinks: [
      { label: 'Generador de Meta Tags', url: '/generador-meta-tags' },
      { label: 'Analizador de Palabras Clave', url: '/analizador-palabras-clave' }
    ],
    level: 'intermediate',
    category: 'SEO'
  },
  'image-optimizer': {
    id: 'image-optimizer',
    title: 'Optimizador de Imágenes',
    description: 'Reduce el tamaño de tus imágenes sin perder calidad visual, mejorando la velocidad de carga de tu sitio web.',
    steps: [
      'Selecciona las imágenes a optimizar',
      'Elige el nivel de compresión deseado',
      'Selecciona el formato de salida (WebP, JPEG, PNG)',
      'Haz clic en "Optimizar"',
      'Descarga las imágenes optimizadas',
      'Reemplaza las imágenes originales en tu sitio'
    ],
    tips: [
      'WebP ofrece la mejor compresión para la mayoría de casos',
      'Usa PNG solo para imágenes con transparencia',
      'Considera usar lazy loading para imágenes below the fold'
    ],
    relatedLinks: [
      { label: 'Analizador de Velocidad', url: '/analizador-velocidad' },
      { label: 'Guía de Core Web Vitals', url: '/guia-core-web-vitals' }
    ],
    level: 'beginner',
    category: 'Optimización'
  },
  'robots-generator': {
    id: 'robots-generator',
    title: 'Generador de Robots.txt',
    description: 'Crea un archivo robots.txt para controlar qué páginas de tu sitio pueden rastrear los motores de búsqueda.',
    steps: [
      'Selecciona el tipo de sitio web',
      'Configura las reglas para diferentes user-agents',
      'Especifica las páginas a bloquear o permitir',
      'Añade la ubicación de tu sitemap',
      'Genera el archivo robots.txt',
      'Sube el archivo a la raíz de tu dominio'
    ],
    tips: [
      'Siempre incluye la ubicación de tu sitemap',
      'Ten cuidado de no bloquear páginas importantes',
      'Testa tu robots.txt con Google Search Console'
    ],
    relatedLinks: [
      { label: 'Generador de Sitemap', url: '/generador-sitemap' },
      { label: 'Verificador de Robots.txt', url: '/verificador-robots' }
    ],
    level: 'intermediate',
    category: 'SEO'
  },
  'ssl-checker': {
    id: 'ssl-checker',
    title: 'Verificador SSL',
    description: 'Verifica el estado y configuración de tu certificado SSL/TLS para asegurar una conexión segura.',
    steps: [
      'Ingresa la URL de tu sitio web',
      'Haz clic en "Verificar SSL"',
      'Revisa el estado del certificado',
      'Verifica la fecha de expiración',
      'Comprueba la cadena de certificados',
      'Implementa las recomendaciones de seguridad'
    ],
    tips: [
      'Renueva tu certificado antes de que expire',
      'Usa certificados de autoridades reconocidas',
      'Implementa HSTS para mayor seguridad'
    ],
    relatedLinks: [
      { label: 'Guía de HTTPS', url: '/guia-https' },
      { label: 'Analizador de Seguridad', url: '/analizador-seguridad' }
    ],
    level: 'advanced',
    category: 'Seguridad'
  }
};

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<Record<string, TooltipContent>>(defaultTooltipContent);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Cargar preferencias del usuario
  React.useEffect(() => {
    const savedLevel = localStorage.getItem('ya-tools-user-level') as 'beginner' | 'intermediate' | 'advanced';
    const hasSeenOnboarding = localStorage.getItem('ya-tools-onboarding-completed');
    
    if (savedLevel) {
      setUserLevel(savedLevel);
    }
    
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Guardar preferencias del usuario
  React.useEffect(() => {
    localStorage.setItem('ya-tools-user-level', userLevel);
  }, [userLevel]);

  const registerTooltip = useCallback((id: string, content: TooltipContent) => {
    setTooltipContent(prev => ({
      ...prev,
      [id]: content
    }));
  }, []);

  const unregisterTooltip = useCallback((id: string) => {
    setTooltipContent(prev => {
      const newContent = { ...prev };
      delete newContent[id];
      return newContent;
    });
  }, []);

  const value: TooltipContextType = {
    activeTooltip,
    setActiveTooltip,
    tooltipContent,
    registerTooltip,
    unregisterTooltip,
    showOnboarding,
    setShowOnboarding,
    onboardingStep,
    setOnboardingStep,
    userLevel,
    setUserLevel
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

// Hook para registrar tooltips automáticamente
export function useTooltipRegistration(id: string, content: TooltipContent) {
  const { registerTooltip, unregisterTooltip } = useTooltip();

  React.useEffect(() => {
    registerTooltip(id, content);
    return () => unregisterTooltip(id);
  }, [id, content, registerTooltip, unregisterTooltip]);
}