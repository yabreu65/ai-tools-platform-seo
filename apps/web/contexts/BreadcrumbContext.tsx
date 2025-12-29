'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (href: string) => void;
  clearBreadcrumbs: () => void;
  generateAutoBreadcrumbs: () => BreadcrumbItem[];
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

// Mapeo de rutas a etiquetas legibles
const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/herramientas': 'Herramientas',
  '/generador-sitemap': 'Generador de Sitemap',
  '/analizador-seo': 'Analizador SEO',
  '/optimizador-imagenes': 'Optimizador de Imágenes',
  '/generador-robots': 'Generador de Robots.txt',
  '/verificador-ssl': 'Verificador SSL',
  '/analizador-velocidad': 'Analizador de Velocidad',
  '/generador-meta-tags': 'Generador de Meta Tags',
  '/analizador-palabras-clave': 'Analizador de Palabras Clave',
  '/verificador-enlaces': 'Verificador de Enlaces',
  '/generador-schema': 'Generador de Schema',
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/feedback': 'Feedback',
  '/share-demo': 'Demo de Compartir',
  '/test-optimization': 'Test de Optimización',
  '/accessibility-test': 'Test de Accesibilidad'
};

// Iconos para diferentes tipos de páginas
const routeIcons: Record<string, ReactNode> = {
  '/': '🏠',
  '/herramientas': '🛠️',
  '/generador-sitemap': '🗺️',
  '/analizador-seo': '🔍',
  '/optimizador-imagenes': '🖼️',
  '/generador-robots': '🤖',
  '/verificador-ssl': '🔒',
  '/analizador-velocidad': '⚡',
  '/generador-meta-tags': '🏷️',
  '/analizador-palabras-clave': '🔑',
  '/verificador-enlaces': '🔗',
  '/generador-schema': '📋',
  '/dashboard': '📊',
  '/analytics': '📈',
  '/feedback': '💬',
  '/share-demo': '🔗',
  '/test-optimization': '⚡',
  '/accessibility-test': '♿'
};

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const pathname = usePathname();

  const generateAutoBreadcrumbs = useCallback((): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Siempre incluir el inicio
    breadcrumbs.push({
      label: 'Inicio',
      href: '/',
      icon: routeIcons['/'],
      isActive: pathname === '/'
    });

    // Construir breadcrumbs basados en la ruta actual
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: currentPath,
        icon: routeIcons[currentPath],
        isActive: isLast
      });
    });

    return breadcrumbs;
  }, [pathname]);

  const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setCustomBreadcrumbs(breadcrumbs);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    setCustomBreadcrumbs(prev => [...prev, breadcrumb]);
  }, []);

  const removeBreadcrumb = useCallback((href: string) => {
    setCustomBreadcrumbs(prev => prev.filter(item => item.href !== href));
  }, []);

  const clearBreadcrumbs = useCallback(() => {
    setCustomBreadcrumbs([]);
  }, []);

  // Usar breadcrumbs personalizados si existen, sino generar automáticamente
  const breadcrumbs = customBreadcrumbs.length > 0 ? customBreadcrumbs : generateAutoBreadcrumbs();

  const value: BreadcrumbContextType = {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
    generateAutoBreadcrumbs
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

// Hook para establecer breadcrumbs personalizados en páginas específicas
export function useBreadcrumbPage(breadcrumbs: BreadcrumbItem[]) {
  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumb();

  React.useEffect(() => {
    setBreadcrumbs(breadcrumbs);
    return () => clearBreadcrumbs();
  }, [breadcrumbs, setBreadcrumbs, clearBreadcrumbs]);
}