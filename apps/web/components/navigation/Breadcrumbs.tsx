'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

// Route mappings for better breadcrumb labels
const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/dashboard': 'Dashboard',
  '/profile': 'Mi Perfil',
  '/settings': 'Configuración',
  '/precios': 'Planes y Precios',
  '/seleccionar-plan': 'Seleccionar Plan',
  '/analisis': 'Mis Análisis',
  '/herramientas': 'Herramientas',
  
  // SEO Tools
  '/generar-titulo-seo': 'Generador de Títulos SEO',
  '/seo-audit-tool': 'Auditoría SEO',
  '/optimizador-contenido': 'Optimizador de Contenido',
  '/keyword-scraper-tool': 'Extractor de Keywords',
  '/generador-sitemap': 'Generador de Sitemap',
  '/generador-robots': 'Generador de Robots.txt',
  '/generador-robots-txt': 'Generador de Robots.txt',
  '/generador-sitemap-xml': 'Generador de Sitemap XML',
  '/detector-contenido-duplicado': 'Detector de Contenido Duplicado',
  '/renombrador-images': 'Renombrador de Imágenes',
  '/test-accessibility': 'Test de Accesibilidad',
  '/test-optimization': 'Test de Optimización',
  '/vitals-checker-tool': 'Checker de Core Web Vitals',
  
  // Content pages
  '/acerca-de': 'Acerca de',
  '/contacto': 'Contacto',
  '/faq': 'Preguntas Frecuentes',
  '/blog': 'Blog',
  '/casos-de-uso': 'Casos de Uso',
  '/testimonios': 'Testimonios',
  '/newsletter': 'Newsletter',
  
  // Legal
  '/privacidad': 'Política de Privacidad',
  '/terminos': 'Términos de Servicio',
  
  // Auth
  '/login': 'Iniciar Sesión',
  '/registro': 'Registro',
}

// Tool categories for better organization
const toolCategories: Record<string, string> = {
  '/generar-titulo-seo': 'Herramientas SEO',
  '/seo-audit-tool': 'Herramientas SEO',
  '/optimizador-contenido': 'Herramientas SEO',
  '/keyword-scraper-tool': 'Herramientas SEO',
  '/generador-sitemap': 'Herramientas SEO',
  '/generador-robots': 'Herramientas SEO',
  '/generador-robots-txt': 'Herramientas SEO',
  '/generador-sitemap-xml': 'Herramientas SEO',
  '/detector-contenido-duplicado': 'Herramientas SEO',
  '/renombrador-images': 'Herramientas SEO',
  '/test-accessibility': 'Herramientas de Testing',
  '/test-optimization': 'Herramientas de Testing',
  '/vitals-checker-tool': 'Herramientas de Testing',
}

export function Breadcrumbs({ items, showHome = true, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home if requested
    if (showHome) {
      breadcrumbs.push({
        label: 'Inicio',
        href: '/',
        icon: Home
      })
    }

    // Build breadcrumbs from path segments
    let currentPath = ''
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Skip if this is the last segment (current page)
      if (index === segments.length - 1) return
      
      const label = routeLabels[currentPath] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      breadcrumbs.push({
        label,
        href: currentPath
      })
    })

    // Add category for tools if applicable
    const category = toolCategories[pathname]
    if (category && breadcrumbs.length > 0) {
      // Insert category before the tool
      breadcrumbs.splice(-1, 0, {
        label: category,
        href: '/herramientas'
      })
    }

    return breadcrumbs
  }

  const breadcrumbItems = generateBreadcrumbs()
  const currentPageLabel = routeLabels[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Página'

  // Don't show breadcrumbs on home page
  if (pathname === '/' || breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            )}
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          </li>
        ))}
        
        {/* Current page */}
        <li className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
          <span className="font-medium text-foreground">
            {currentPageLabel}
          </span>
        </li>
      </ol>
    </nav>
  )
}

// Breadcrumb wrapper component for consistent styling
export function BreadcrumbWrapper({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border-b bg-muted/30 px-4 py-3 ${className}`}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  )
}

// Hook to get current page info for breadcrumbs
export function useBreadcrumbInfo() {
  const pathname = usePathname()
  
  const getCurrentPageInfo = () => {
    const label = routeLabels[pathname] || pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Página'
    const category = toolCategories[pathname]
    
    return {
      label,
      category,
      pathname,
      isToolPage: !!category,
      isAuthPage: ['/login', '/registro'].includes(pathname),
      isDashboardPage: pathname.startsWith('/dashboard') || pathname === '/profile' || pathname === '/settings',
      isPublicPage: !['/dashboard', '/profile', '/settings', '/analisis'].some(path => pathname.startsWith(path))
    }
  }

  return getCurrentPageInfo()
}