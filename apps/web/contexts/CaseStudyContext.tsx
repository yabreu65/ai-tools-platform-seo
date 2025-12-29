'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CaseStudy, CaseStudyFilters } from '@/types/content';

interface CaseStudyContextType {
  // Case studies
  caseStudies: CaseStudy[];
  loading: boolean;
  error: string | null;
  
  // Current case study
  currentCaseStudy: CaseStudy | null;
  
  // Filters and search
  filters: CaseStudyFilters;
  searchQuery: string;
  filteredCaseStudies: CaseStudy[];
  
  // Available filter options
  industries: string[];
  tools: string[];
  resultTypes: string[];
  
  // Actions
  fetchCaseStudies: () => Promise<void>;
  fetchCaseStudy: (slug: string) => Promise<CaseStudy | null>;
  setFilters: (filters: Partial<CaseStudyFilters>) => void;
  setSearchQuery: (query: string) => void;
  downloadCaseStudy: (caseStudyId: string) => Promise<void>;
  
  // Analytics
  trackView: (caseStudyId: string) => Promise<void>;
  getRelatedCaseStudies: (caseStudyId: string, limit?: number) => CaseStudy[];
  getFeaturedCaseStudies: (limit?: number) => CaseStudy[];
  getCaseStudiesByIndustry: (industry: string, limit?: number) => CaseStudy[];
}

const CaseStudyContext = createContext<CaseStudyContextType | undefined>(undefined);

export function useCaseStudy() {
  const context = useContext(CaseStudyContext);
  if (context === undefined) {
    throw new Error('useCaseStudy must be used within a CaseStudyProvider');
  }
  return context;
}

interface CaseStudyProviderProps {
  children: ReactNode;
}

export function CaseStudyProvider({ children }: CaseStudyProviderProps) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCaseStudy, setCurrentCaseStudy] = useState<CaseStudy | null>(null);
  const [filters, setFiltersState] = useState<CaseStudyFilters>({
    sortBy: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockCaseStudies: CaseStudy[] = [
    {
      id: '1',
      title: 'E-commerce: +300% Tráfico Orgánico en 6 Meses',
      slug: 'ecommerce-300-trafico-organico-6-meses',
      summary: 'Cómo una tienda online de moda aumentó su tráfico orgánico en un 300% utilizando estrategias SEO avanzadas y optimización técnica.',
      industry: 'E-commerce',
      client: {
        name: 'ModaStyle',
        website: 'https://modastyle.com',
        logo: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20ecommerce%20logo%20modern%20elegant&image_size=square'
      },
      challenge: 'ModaStyle tenía muy poca visibilidad online y dependía completamente de publicidad pagada. Su tráfico orgánico era mínimo y los costos de adquisición eran insostenibles.',
      solution: `Implementamos una estrategia SEO integral que incluyó:

## Auditoría Técnica Completa
- Optimización de velocidad de carga
- Mejora de Core Web Vitals
- Implementación de datos estructurados
- Optimización para móviles

## Estrategia de Contenido
- Investigación exhaustiva de palabras clave
- Creación de guías de estilo y tendencias
- Blog con contenido educativo
- Optimización de fichas de producto

## Link Building
- Colaboraciones con influencers de moda
- Guest posting en blogs del sector
- Menciones en medios especializados

## Optimización Técnica
- Mejora de la arquitectura del sitio
- Optimización de imágenes
- Implementación de AMP para móviles
- Configuración avanzada de Search Console`,
      results: {
        metrics: [
          { name: 'Tráfico Orgánico', before: '2,500', after: '10,200', improvement: '+308%' },
          { name: 'Keywords Posicionadas', before: '150', after: '1,250', improvement: '+733%' },
          { name: 'Conversiones Orgánicas', before: '25', after: '180', improvement: '+620%' },
          { name: 'Revenue Orgánico', before: '€3,200', after: '€28,500', improvement: '+791%' }
        ],
        timeline: '6 meses',
        roi: '890%'
      },
      tools: ['YA Tools', 'Google Search Console', 'Screaming Frog', 'Ahrefs'],
      testimonial: {
        quote: 'Los resultados superaron todas nuestras expectativas. No solo aumentamos el tráfico, sino que la calidad de los visitantes mejoró significativamente.',
        author: 'Laura Martínez',
        position: 'CEO de ModaStyle',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20woman%20CEO%20fashion%20industry%20confident&image_size=square'
      },
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ecommerce%20website%20fashion%20modern%20design%20before%20after&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=SEO%20analytics%20dashboard%20traffic%20growth%20charts&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20optimization%20fashion%20website%20responsive&image_size=portrait_4_3'
      ],
      tags: ['E-commerce', 'SEO Técnico', 'Content Marketing', 'Link Building'],
      publishedAt: new Date('2024-01-20'),
      featured: true,
      downloadUrl: '/downloads/case-study-modastyle.pdf',
      views: 1847,
      downloads: 234
    },
    {
      id: '2',
      title: 'SaaS B2B: De 0 a 50K Usuarios con SEO',
      slug: 'saas-b2b-0-50k-usuarios-seo',
      summary: 'Estrategia SEO completa para una startup SaaS que logró escalar de 0 a 50,000 usuarios registrados en 12 meses.',
      industry: 'SaaS',
      client: {
        name: 'ProductivityPro',
        website: 'https://productivitypro.com',
        logo: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=SaaS%20productivity%20software%20logo%20professional%20blue&image_size=square'
      },
      challenge: 'ProductivityPro era una startup completamente nueva sin presencia online. Necesitaban generar awareness y captar usuarios de forma orgánica con un presupuesto limitado.',
      solution: `Desarrollamos una estrategia SEO enfocada en el embudo completo:

## Investigación de Mercado
- Análisis de competidores directos e indirectos
- Identificación de gaps de contenido
- Mapeo de customer journey
- Definición de buyer personas

## Estrategia de Contenido Programático
- Landing pages para long-tail keywords
- Comparativas con competidores
- Casos de uso específicos por industria
- Calculadoras y herramientas gratuitas

## SEO Técnico Avanzado
- Arquitectura escalable
- Optimización de JavaScript
- Implementación de schema markup
- Configuración de hreflang para internacionalización

## Link Building Estratégico
- Digital PR en medios tech
- Partnerships con complementary tools
- Guest posting en blogs B2B
- Participación en directorios especializados`,
      results: {
        metrics: [
          { name: 'Usuarios Registrados', before: '0', after: '50,000', improvement: '+∞' },
          { name: 'Tráfico Orgánico', before: '0', after: '85,000', improvement: '+∞' },
          { name: 'Keywords Top 10', before: '0', after: '2,800', improvement: '+∞' },
          { name: 'MRR Orgánico', before: '$0', after: '$125,000', improvement: '+∞' }
        ],
        timeline: '12 meses',
        roi: '2,400%'
      },
      tools: ['YA Tools', 'Ahrefs', 'Clearscope', 'Hotjar', 'Google Analytics'],
      testimonial: {
        quote: 'El SEO fue fundamental para nuestro crecimiento. Nos permitió competir con empresas mucho más grandes sin gastar fortunas en ads.',
        author: 'David Chen',
        position: 'Founder & CEO',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20man%20startup%20founder%20tech%20entrepreneur&image_size=square'
      },
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=SaaS%20dashboard%20user%20growth%20analytics%20charts&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=content%20strategy%20planning%20SEO%20keywords%20research&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=B2B%20software%20landing%20page%20conversion%20optimization&image_size=landscape_4_3'
      ],
      tags: ['SaaS', 'B2B', 'Startup', 'Content Marketing', 'Growth Hacking'],
      publishedAt: new Date('2024-01-15'),
      featured: true,
      downloadUrl: '/downloads/case-study-productivitypro.pdf',
      views: 2156,
      downloads: 312
    },
    {
      id: '3',
      title: 'Local SEO: Restaurante +400% Reservas Online',
      slug: 'local-seo-restaurante-400-reservas-online',
      summary: 'Cómo un restaurante local multiplicó por 4 sus reservas online mediante una estrategia de SEO local y gestión de reputación.',
      industry: 'Restauración',
      client: {
        name: 'Sabores Mediterráneos',
        website: 'https://saboresmediterraneos.com',
        logo: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mediterranean%20restaurant%20logo%20elegant%20food&image_size=square'
      },
      challenge: 'El restaurante tenía poca visibilidad online y dependía principalmente del tráfico peatonal. Las reservas online eran escasas y la competencia local era intensa.',
      solution: `Implementamos una estrategia de SEO local integral:

## Optimización de Google My Business
- Completar y optimizar el perfil
- Gestión proactiva de reseñas
- Publicaciones regulares con ofertas
- Fotos profesionales de platos y ambiente

## SEO Local On-Page
- Optimización para búsquedas locales
- Implementación de schema markup local
- Páginas específicas para eventos y menús
- Integración con sistema de reservas

## Gestión de Reputación
- Estrategia de obtención de reseñas
- Respuesta profesional a comentarios
- Monitoreo de menciones online
- Gestión de crisis de reputación

## Marketing de Contenido Local
- Blog con recetas y consejos culinarios
- Colaboraciones con influencers locales
- Cobertura de eventos gastronómicos
- Partnerships con proveedores locales`,
      results: {
        metrics: [
          { name: 'Reservas Online', before: '45/mes', after: '220/mes', improvement: '+389%' },
          { name: 'Visibilidad Local', before: '15%', after: '78%', improvement: '+420%' },
          { name: 'Reseñas Google', before: '23', after: '187', improvement: '+713%' },
          { name: 'Revenue Mensual', before: '€12,000', after: '€35,000', improvement: '+192%' }
        ],
        timeline: '8 meses',
        roi: '650%'
      },
      tools: ['YA Tools', 'Google My Business', 'BrightLocal', 'ReviewTrackers'],
      testimonial: {
        quote: 'Nunca pensé que el SEO pudiera tener tanto impacto en un negocio local. Ahora tenemos lista de espera los fines de semana.',
        author: 'Antonio Ruiz',
        position: 'Propietario',
        avatar: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant%20owner%20chef%20mediterranean%20friendly%20smile&image_size=square'
      },
      images: [
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mediterranean%20restaurant%20interior%20elegant%20dining&image_size=landscape_16_9',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Google%20My%20Business%20optimization%20local%20SEO%20results&image_size=landscape_4_3',
        'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=online%20restaurant%20reservation%20system%20mobile%20app&image_size=portrait_4_3'
      ],
      tags: ['Local SEO', 'Restauración', 'Google My Business', 'Reputación Online'],
      publishedAt: new Date('2024-01-10'),
      featured: false,
      downloadUrl: '/downloads/case-study-sabores-mediterraneos.pdf',
      views: 1432,
      downloads: 189
    }
  ];

  // Available filter options
  const industries = Array.from(new Set(mockCaseStudies.map(cs => cs.industry)));
  const tools = Array.from(new Set(mockCaseStudies.flatMap(cs => cs.tools)));
  const resultTypes = ['Tráfico', 'Conversiones', 'Revenue', 'Rankings', 'Usuarios'];

  // Initialize mock data
  useEffect(() => {
    setCaseStudies(mockCaseStudies);
  }, []);

  // Filter case studies based on filters and search query
  const filteredCaseStudies = React.useMemo(() => {
    let filtered = [...caseStudies];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(cs =>
        cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.industry) {
      filtered = filtered.filter(cs => cs.industry === filters.industry);
    }

    if (filters.tool) {
      filtered = filtered.filter(cs => cs.tools.includes(filters.tool!));
    }

    if (filters.featured !== undefined) {
      filtered = filtered.filter(cs => cs.featured === filters.featured);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
    }

    return filtered;
  }, [caseStudies, filters, searchQuery]);

  const fetchCaseStudies = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Case studies are already set in useEffect
      setError(null);
    } catch (err) {
      setError('Error al cargar los casos de estudio');
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseStudy = async (slug: string): Promise<CaseStudy | null> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const caseStudy = caseStudies.find(cs => cs.slug === slug) || null;
      setCurrentCaseStudy(caseStudy);
      setError(null);
      return caseStudy;
    } catch (err) {
      setError('Error al cargar el caso de estudio');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const setFilters = (newFilters: Partial<CaseStudyFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const downloadCaseStudy = async (caseStudyId: string) => {
    try {
      const caseStudy = caseStudies.find(cs => cs.id === caseStudyId);
      if (caseStudy) {
        // In a real app, this would trigger a download
        console.log(`Downloading case study: ${caseStudy.title}`);
        
        // Update download count
        setCaseStudies(prev => prev.map(cs =>
          cs.id === caseStudyId ? { ...cs, downloads: cs.downloads + 1 } : cs
        ));
      }
    } catch (err) {
      setError('Error al descargar el caso de estudio');
    }
  };

  const trackView = async (caseStudyId: string) => {
    try {
      setCaseStudies(prev => prev.map(cs =>
        cs.id === caseStudyId ? { ...cs, views: cs.views + 1 } : cs
      ));
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const getRelatedCaseStudies = (caseStudyId: string, limit = 3): CaseStudy[] => {
    const currentCaseStudy = caseStudies.find(cs => cs.id === caseStudyId);
    if (!currentCaseStudy) return [];

    return caseStudies
      .filter(cs => 
        cs.id !== caseStudyId && 
        (cs.industry === currentCaseStudy.industry || 
         cs.tags.some(tag => currentCaseStudy.tags.includes(tag)))
      )
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  const getFeaturedCaseStudies = (limit = 3): CaseStudy[] => {
    return caseStudies
      .filter(cs => cs.featured)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  const getCaseStudiesByIndustry = (industry: string, limit = 5): CaseStudy[] => {
    return caseStudies
      .filter(cs => cs.industry === industry)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  };

  const value: CaseStudyContextType = {
    caseStudies,
    loading,
    error,
    currentCaseStudy,
    filters,
    searchQuery,
    filteredCaseStudies,
    industries,
    tools,
    resultTypes,
    fetchCaseStudies,
    fetchCaseStudy,
    setFilters,
    setSearchQuery,
    downloadCaseStudy,
    trackView,
    getRelatedCaseStudies,
    getFeaturedCaseStudies,
    getCaseStudiesByIndustry
  };

  return (
    <CaseStudyContext.Provider value={value}>
      {children}
    </CaseStudyContext.Provider>
  );
}