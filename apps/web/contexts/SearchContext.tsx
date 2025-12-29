'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: 'tool' | 'page' | 'content';
  icon?: ReactNode;
  keywords: string[];
  popularity?: number;
}

export interface SearchFilter {
  category?: string;
  type?: 'tool' | 'page' | 'content';
  sortBy?: 'relevance' | 'popularity' | 'alphabetical';
}

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  filters: SearchFilter;
  setFilters: (filters: SearchFilter) => void;
  recentSearches: string[];
  suggestions: string[];
  search: (query: string, filters?: SearchFilter) => void;
  clearSearch: () => void;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Base de datos de contenido indexado
const searchDatabase: SearchResult[] = [
  // Herramientas SEO
  {
    id: 'generador-sitemap',
    title: 'Generador de Sitemap',
    description: 'Genera sitemaps XML automáticamente para mejorar el SEO de tu sitio web',
    url: '/generador-sitemap',
    category: 'SEO',
    type: 'tool',
    icon: '🗺️',
    keywords: ['sitemap', 'xml', 'seo', 'indexación', 'google'],
    popularity: 95
  },
  {
    id: 'analizador-seo',
    title: 'Analizador SEO',
    description: 'Analiza y optimiza el SEO de cualquier página web con recomendaciones detalladas',
    url: '/analizador-seo',
    category: 'SEO',
    type: 'tool',
    icon: '🔍',
    keywords: ['seo', 'análisis', 'optimización', 'meta tags', 'rendimiento'],
    popularity: 90
  },
  {
    id: 'optimizador-imagenes',
    title: 'Optimizador de Imágenes',
    description: 'Optimiza imágenes para web reduciendo el tamaño sin perder calidad',
    url: '/optimizador-imagenes',
    category: 'Optimización',
    type: 'tool',
    icon: '🖼️',
    keywords: ['imágenes', 'optimización', 'compresión', 'webp', 'rendimiento'],
    popularity: 85
  },
  {
    id: 'generador-robots',
    title: 'Generador de Robots.txt',
    description: 'Crea archivos robots.txt personalizados para controlar el rastreo de buscadores',
    url: '/generador-robots',
    category: 'SEO',
    type: 'tool',
    icon: '🤖',
    keywords: ['robots', 'txt', 'crawling', 'indexación', 'buscadores'],
    popularity: 75
  },
  {
    id: 'generador-robots-txt',
    title: 'Generador de Robots.txt Automático',
    description: 'Genera archivos robots.txt inteligentes con plantillas predefinidas y validación automática',
    url: '/generador-robots-txt',
    category: 'SEO',
    type: 'tool',
    icon: '🤖',
    keywords: ['robots', 'txt', 'automático', 'plantillas', 'validación', 'crawling', 'seo'],
    popularity: 88
  },
  {
    id: 'generador-sitemap-xml',
    title: 'Generador de Sitemap XML Automático',
    description: 'Crea sitemaps XML automáticamente con crawling inteligente y priorización avanzada',
    url: '/generador-sitemap-xml',
    category: 'SEO',
    type: 'tool',
    icon: '🗺️',
    keywords: ['sitemap', 'xml', 'automático', 'crawling', 'indexación', 'seo', 'google'],
    popularity: 92
  },
  {
    id: 'verificador-ssl',
    title: 'Verificador SSL',
    description: 'Verifica el estado y configuración de certificados SSL/TLS',
    url: '/verificador-ssl',
    category: 'Seguridad',
    type: 'tool',
    icon: '🔒',
    keywords: ['ssl', 'tls', 'certificado', 'seguridad', 'https'],
    popularity: 80
  },
  {
    id: 'analizador-velocidad',
    title: 'Analizador de Velocidad',
    description: 'Mide y analiza la velocidad de carga de páginas web',
    url: '/analizador-velocidad',
    category: 'Rendimiento',
    type: 'tool',
    icon: '⚡',
    keywords: ['velocidad', 'rendimiento', 'core web vitals', 'optimización'],
    popularity: 88
  },
  {
    id: 'generador-meta-tags',
    title: 'Generador de Meta Tags',
    description: 'Genera meta tags optimizados para SEO y redes sociales',
    url: '/generador-meta-tags',
    category: 'SEO',
    type: 'tool',
    icon: '🏷️',
    keywords: ['meta tags', 'open graph', 'twitter cards', 'seo'],
    popularity: 82
  },
  {
    id: 'analizador-palabras-clave',
    title: 'Analizador de Palabras Clave',
    description: 'Analiza y sugiere palabras clave para optimizar tu contenido',
    url: '/analizador-palabras-clave',
    category: 'SEO',
    type: 'tool',
    icon: '🔑',
    keywords: ['keywords', 'palabras clave', 'seo', 'contenido'],
    popularity: 78
  },
  {
    id: 'verificador-enlaces',
    title: 'Verificador de Enlaces',
    description: 'Verifica enlaces rotos y analiza la estructura de enlaces internos',
    url: '/verificador-enlaces',
    category: 'SEO',
    type: 'tool',
    icon: '🔗',
    keywords: ['enlaces', 'links', 'broken links', 'link building'],
    popularity: 70
  },
  {
    id: 'detector-contenido-duplicado',
    title: 'Detector de Contenido Duplicado',
    description: 'Detecta contenido duplicado en la web con IA. Verifica la originalidad de tu texto',
    url: '/detector-contenido-duplicado',
    category: 'SEO',
    type: 'tool',
    icon: '📋',
    keywords: ['contenido duplicado', 'originalidad', 'plagio', 'seo', 'verificar'],
    popularity: 85
  },
  {
    id: 'generador-schema',
    title: 'Generador de Schema',
    description: 'Genera markup de Schema.org para rich snippets',
    url: '/generador-schema',
    category: 'SEO',
    type: 'tool',
    icon: '📋',
    keywords: ['schema', 'structured data', 'rich snippets', 'json-ld'],
    popularity: 65
  },
  // Páginas principales
  {
    id: 'home',
    title: 'Inicio',
    description: 'Página principal de YA Tools - Herramientas SEO profesionales',
    url: '/',
    category: 'Navegación',
    type: 'page',
    icon: '🏠',
    keywords: ['inicio', 'home', 'herramientas', 'seo'],
    popularity: 100
  },
  {
    id: 'herramientas',
    title: 'Herramientas',
    description: 'Catálogo completo de herramientas SEO y optimización web',
    url: '/herramientas',
    category: 'Navegación',
    type: 'page',
    icon: '🛠️',
    keywords: ['herramientas', 'tools', 'seo', 'catálogo'],
    popularity: 95
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Panel de control con métricas y análisis de uso',
    url: '/dashboard',
    category: 'Analytics',
    type: 'page',
    icon: '📊',
    keywords: ['dashboard', 'métricas', 'analytics', 'estadísticas'],
    popularity: 60
  }
];

// Función de búsqueda fuzzy simple
function fuzzySearch(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  if (textLower.includes(queryLower)) {
    return 1;
  }
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score++;
      queryIndex++;
    }
  }
  
  return score / queryLower.length;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ya-tools-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Guardar búsquedas recientes en localStorage
  useEffect(() => {
    localStorage.setItem('ya-tools-recent-searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const search = useCallback((searchQuery: string, searchFilters: SearchFilter = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    // Simular delay de búsqueda
    setTimeout(() => {
      let filteredResults = searchDatabase;

      // Aplicar filtros
      if (searchFilters.category) {
        filteredResults = filteredResults.filter(item => item.category === searchFilters.category);
      }
      if (searchFilters.type) {
        filteredResults = filteredResults.filter(item => item.type === searchFilters.type);
      }

      // Búsqueda fuzzy
      const searchResults = filteredResults
        .map(item => {
          const titleScore = fuzzySearch(searchQuery, item.title) * 3;
          const descriptionScore = fuzzySearch(searchQuery, item.description) * 2;
          const keywordsScore = Math.max(...item.keywords.map(keyword => fuzzySearch(searchQuery, keyword)));
          
          const totalScore = titleScore + descriptionScore + keywordsScore;
          
          return { ...item, score: totalScore };
        })
        .filter(item => item.score > 0.1)
        .sort((a, b) => {
          if (searchFilters.sortBy === 'popularity') {
            return (b.popularity || 0) - (a.popularity || 0);
          }
          if (searchFilters.sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
          }
          return b.score - a.score; // Por defecto, por relevancia
        });

      setResults(searchResults);
      setIsSearching(false);
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setFilters({});
  }, []);

  const addToRecentSearches = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10); // Mantener solo 10 búsquedas recientes
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  // Generar sugerencias basadas en la query actual
  useEffect(() => {
    if (query.length > 1) {
      const newSuggestions = searchDatabase
        .filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5)
        .map(item => item.title);
      
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Realizar búsqueda cuando cambia la query o los filtros
  useEffect(() => {
    if (query) {
      search(query, filters);
    } else {
      setResults([]);
    }
  }, [query, filters, search]);

  const value: SearchContextType = {
    query,
    setQuery,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    filters,
    setFilters,
    recentSearches,
    suggestions,
    search,
    clearSearch,
    addToRecentSearches,
    clearRecentSearches
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}