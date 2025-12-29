'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp, 
  Star, 
  Calendar,
  Building,
  Target,
  Award,
  ArrowRight,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { useCaseStudy } from '@/contexts/CaseStudyContext';
import { CaseStudy } from '@/types/content';
import Link from 'next/link';
import Image from 'next/image';

export default function CaseStudiesPage() {
  const {
    caseStudies,
    loading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    fetchCaseStudies,
    getFeaturedCaseStudies,
    downloadCaseStudy,
    trackView
  } = useCaseStudy();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'rating'>('date');

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const featuredCases = getFeaturedCaseStudies(3);
  
  const industries = [
    'E-commerce',
    'SaaS',
    'Educación',
    'Salud',
    'Finanzas',
    'Marketing',
    'Tecnología',
    'Inmobiliaria'
  ];

  const tools = [
    'Generador de Sitemap',
    'Análisis SEO',
    'Palabras Clave',
    'Meta Tags',
    'Schema Markup',
    'Robots.txt',
    'Redirects',
    'Auditoría SEO'
  ];

  const results = [
    'Aumento de tráfico',
    'Mejora de ranking',
    'Más conversiones',
    'Mejor CTR',
    'Reducción de bounce rate',
    'Aumento de ventas'
  ];

  const handleFilterChange = (type: string, value: string) => {
    const currentFilters = filters as any;
    
    const newFilters = {
      ...currentFilters,
      [type]: currentFilters[type] === value ? undefined : value
    };
    
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  const handleDownload = async (caseStudy: CaseStudy) => {
    await downloadCaseStudy(caseStudy.id);
  };

  const handleView = async (caseStudy: CaseStudy) => {
    await trackView(caseStudy.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getImprovementColor = (value: number) => {
    if (value >= 100) return 'text-green-600';
    if (value >= 50) return 'text-blue-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Casos de Uso
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Descubre cómo nuestras herramientas SEO han ayudado a empresas reales 
              a mejorar su posicionamiento y aumentar su tráfico orgánico.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {caseStudies.length}+
                </div>
                <div className="text-sm text-gray-600">Casos de éxito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  +250%
                </div>
                <div className="text-sm text-gray-600">Mejora promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  8
                </div>
                <div className="text-sm text-gray-600">Industrias</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Cases */}
        {featuredCases.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Casos Destacados
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredCases.map((caseStudy, index) => (
                <motion.div
                  key={caseStudy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={caseStudy.images?.[0] || '/default-case-study.jpg'}
                      alt={caseStudy.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full">
                        ⭐ Destacado
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{caseStudy.industry}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {caseStudy.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {caseStudy.description}
                    </p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className={`text-lg font-bold ${getImprovementColor((caseStudy as any).metrics?.trafficIncrease || 150)}`}>
                          +{(caseStudy as any).metrics?.trafficIncrease || 150}%
                        </div>
                        <div className="text-xs text-gray-600">Tráfico</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className={`text-lg font-bold ${getImprovementColor((caseStudy as any).metrics?.rankingImprovement || 25)}`}>
                          +{(caseStudy as any).metrics?.rankingImprovement || 25}
                        </div>
                        <div className="text-xs text-gray-600">Posiciones</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/casos-de-uso/${caseStudy.slug}`}
                        onClick={() => handleView(caseStudy)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver caso completo
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        {caseStudy.views}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar casos de uso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {(filters.industry || filters.tool || (filters as any).result) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {[filters.industry, filters.tool, (filters as any).result].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'views' | 'rating')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Más recientes</option>
              <option value="views">Más vistos</option>
              <option value="rating">Mejor valorados</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Industry Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Industria</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {industries.map(industry => (
                      <label key={industry} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="industry"
                          checked={filters.industry === industry}
                          onChange={() => handleFilterChange('industry', industry)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tool Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Herramienta</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tools.map(tool => (
                      <label key={tool} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="tool"
                          checked={filters.tool === tool}
                          onChange={() => handleFilterChange('tool', tool)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Result Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Resultado</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {results.map(result => (
                      <label key={result} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="result"
                          checked={(filters as any).result === result}
                          onChange={() => handleFilterChange('result', result)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{result}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Case Studies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {caseStudies.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-48">
                <Image
                  src={caseStudy.images?.[0] || '/default-case-study.jpg'}
                  alt={caseStudy.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => handleDownload(caseStudy)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{caseStudy.industry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{(caseStudy as any).rating || 4.8}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {caseStudy.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {caseStudy.description}
                </p>
                
                {/* Tools Used */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {((caseStudy as any).toolsUsed || ['SEO', 'Analytics']).slice(0, 2).map((tool: string) => (
                    <span
                      key={tool}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tool}
                    </span>
                  ))}
                  {((caseStudy as any).toolsUsed || ['SEO', 'Analytics']).length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{((caseStudy as any).toolsUsed || ['SEO', 'Analytics']).length - 2} más
                    </span>
                  )}
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className={`text-sm font-bold ${getImprovementColor((caseStudy as any).metrics?.trafficIncrease || 150)}`}>
                      +{(caseStudy as any).metrics?.trafficIncrease || 150}%
                    </div>
                    <div className="text-xs text-gray-600">Tráfico</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className={`text-sm font-bold ${getImprovementColor((caseStudy as any).metrics?.rankingImprovement || 25)}`}>
                      +{(caseStudy as any).metrics?.rankingImprovement || 25}
                    </div>
                    <div className="text-xs text-gray-600">Ranking</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className={`text-sm font-bold ${getImprovementColor((caseStudy as any).metrics?.conversionIncrease || 85)}`}>
                      +{(caseStudy as any).metrics?.conversionIncrease || 85}%
                    </div>
                    <div className="text-xs text-gray-600">Conversión</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Link
                    href={`/casos-de-uso/${caseStudy.slug}`}
                    onClick={() => handleView(caseStudy)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Ver detalles
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {caseStudy.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate((caseStudy as any).publishedAt || caseStudy.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {caseStudies.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No se encontraron casos de uso
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar tus filtros o términos de búsqueda.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white mt-12"
        >
          <Zap className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            ¿Quieres ser nuestro próximo caso de éxito?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Únete a cientos de empresas que ya han mejorado su SEO con nuestras herramientas. 
            Comienza gratis y ve los resultados por ti mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generador-sitemap"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Probar herramientas gratis
            </Link>
            <Link
              href="/contacto"
              className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Contactar con expertos
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}