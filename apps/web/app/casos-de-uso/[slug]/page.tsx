'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Building,
  Calendar,
  Download,
  Eye,
  Star,
  Target,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useCaseStudy } from '@/contexts/CaseStudyContext';
import { CaseStudy } from '@/types/content';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const {
    currentCaseStudy,
    loading,
    error,
    fetchCaseStudy,
    downloadCaseStudy,
    trackView,
    getRelatedCaseStudies
  } = useCaseStudy();

  const [activeTab, setActiveTab] = useState<'overview' | 'process' | 'results' | 'testimonial'>('overview');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCaseStudy(slug).then(caseStudy => {
        if (caseStudy) {
          trackView(caseStudy.id);
        }
      });
    }
  }, [slug]);

  const handleDownload = async () => {
    if (currentCaseStudy) {
      await downloadCaseStudy(currentCaseStudy.id);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getImprovementColor = (value: number) => {
    if (value >= 100) return 'text-green-600';
    if (value >= 50) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getImprovementBg = (value: number) => {
    if (value >= 100) return 'bg-green-50 border-green-200';
    if (value >= 50) return 'bg-blue-50 border-blue-200';
    return 'bg-orange-50 border-orange-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentCaseStudy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Caso de uso no encontrado'}
          </h2>
          <Link
            href="/casos-de-uso"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Volver a casos de uso
          </Link>
        </div>
      </div>
    );
  }

  const relatedCases = getRelatedCaseStudies(currentCaseStudy.id, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/casos-de-uso"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a casos de uso
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {currentCaseStudy.industry}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{(currentCaseStudy as any).rating || '5.0'}</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {currentCaseStudy.title}
              </h1>

              <p className="text-xl text-gray-600 mb-6">
                {currentCaseStudy.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>{(currentCaseStudy as any).client?.name || 'Cliente Confidencial'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate((currentCaseStudy as any).publishedAt || new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{(currentCaseStudy as any).duration || '3 meses'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{currentCaseStudy.views.toLocaleString()} vistas</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Resultados Clave
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getImprovementBg((currentCaseStudy as any).metrics?.trafficIncrease || 150)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tráfico Orgánico</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className={`text-2xl font-bold ${getImprovementColor((currentCaseStudy as any).metrics?.trafficIncrease || 150)}`}>
                    +{(currentCaseStudy as any).metrics?.trafficIncrease || 150}%
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${getImprovementBg((currentCaseStudy as any).metrics?.rankingImprovement || 25)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Posicionamiento</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className={`text-2xl font-bold ${getImprovementColor((currentCaseStudy as any).metrics?.rankingImprovement || 25)}`}>
                    +{(currentCaseStudy as any).metrics?.rankingImprovement || 25} posiciones
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${getImprovementBg((currentCaseStudy as any).metrics?.conversionIncrease || 85)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Conversiones</span>
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className={`text-2xl font-bold ${getImprovementColor((currentCaseStudy as any).metrics?.conversionIncrease || 85)}`}>
                    +{(currentCaseStudy as any).metrics?.conversionIncrease || 85}%
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  className={`p-2 rounded-lg transition-colors ${
                    liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8"
            >
              <Image
                src={(currentCaseStudy as any).image || currentCaseStudy.images?.[0] || '/default-case-study.jpg'}
                alt={currentCaseStudy.title}
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'overview', label: 'Resumen', icon: BarChart3 },
                    { id: 'process', label: 'Proceso', icon: CheckCircle },
                    { id: 'results', label: 'Resultados', icon: TrendingUp },
                    { id: 'testimonial', label: 'Testimonio', icon: MessageCircle }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 md:p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Desafío
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {currentCaseStudy.challenge}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Solución
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {currentCaseStudy.solution}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Herramientas Utilizadas
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {((currentCaseStudy as any).toolsUsed || ['SEMrush', 'Google Analytics', 'Search Console']).map((tool: string) => (
                              <span
                                key={tool}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Duración del Proyecto
                          </h4>
                          <p className="text-gray-700">{(currentCaseStudy as any).duration || '3 meses'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Información del Cliente
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <Image
                            src={(currentCaseStudy as any).client?.logo || '/default-client-logo.png'}
                            alt={(currentCaseStudy as any).client?.name || 'Cliente'}
                            width={48}
                            height={48}
                            className="rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {(currentCaseStudy as any).client?.name || 'Cliente Confidencial'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {currentCaseStudy.industry}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {(currentCaseStudy as any).client?.description || 'Descripción del cliente no disponible.'}
                        </p>
                        {(currentCaseStudy as any).client?.website && (
                          <a
                            href={(currentCaseStudy as any).client?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mt-2"
                          >
                            Visitar sitio web
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Process Tab */}
                {activeTab === 'process' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Proceso de Implementación
                    </h3>
                    
                    <div className="space-y-6">
                      {((currentCaseStudy as any).process || [
                        { title: 'Análisis inicial', description: 'Evaluación completa del sitio web y competencia' },
                        { title: 'Estrategia SEO', description: 'Desarrollo de plan de optimización personalizado' },
                        { title: 'Implementación', description: 'Ejecución de mejoras técnicas y de contenido' },
                        { title: 'Monitoreo', description: 'Seguimiento continuo de resultados y ajustes' }
                      ]).map((step: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {step.title}
                            </h4>
                            <p className="text-gray-700 mb-3">
                              {step.description}
                            </p>
                            {step.tools && step.tools.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {step.tools.map((tool: string) => (
                                  <span
                                    key={tool}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Resultados Detallados
                    </h3>
                    
                    {/* Before/After Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h4 className="font-medium text-red-900 mb-4 flex items-center gap-2">
                          📉 Antes
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-red-700">Tráfico mensual:</span>
                            <span className="font-medium text-red-900">
                              {((currentCaseStudy as any).beforeAfter?.before?.traffic || 5000).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-red-700">Posición promedio:</span>
                            <span className="font-medium text-red-900">
                              #{(currentCaseStudy as any).beforeAfter?.before?.ranking || 45}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-red-700">Conversiones:</span>
                            <span className="font-medium text-red-900">
                              {(currentCaseStudy as any).beforeAfter?.before?.conversions || 25}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h4 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                          📈 Después
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700">Tráfico mensual:</span>
                            <span className="font-medium text-green-900">
                              {((currentCaseStudy as any).beforeAfter?.after?.traffic || 12500).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700">Posición promedio:</span>
                            <span className="font-medium text-green-900">
                              #{(currentCaseStudy as any).beforeAfter?.after?.ranking || 8}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-green-700">Conversiones:</span>
                            <span className="font-medium text-green-900">
                              {(currentCaseStudy as any).beforeAfter?.after?.conversions || 46}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Key Achievements */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">
                        Logros Principales
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {((currentCaseStudy as any).keyAchievements || [
                          'Incremento del 150% en tráfico orgánico',
                          'Mejora de 25 posiciones en ranking promedio',
                          'Aumento del 85% en conversiones',
                          'Reducción del 40% en costo por adquisición'
                        ]).map((achievement: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-blue-900">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Testimonial Tab */}
                {activeTab === 'testimonial' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {currentCaseStudy.testimonial ? (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
                        <div className="text-center mb-6">
                          <div className="flex justify-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-6 h-6 ${
                                  i < ((currentCaseStudy.testimonial as any)?.rating || 5)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <blockquote className="text-xl text-gray-900 font-medium mb-6 italic">
                            "{(currentCaseStudy.testimonial as any)?.content || currentCaseStudy.testimonial?.quote || 'Excelente trabajo realizado por el equipo. Los resultados superaron nuestras expectativas.'}"
                          </blockquote>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4">
                          <Image
                            src={(currentCaseStudy.testimonial as any)?.author?.avatar || '/default-avatar.jpg'}
                            alt={(currentCaseStudy.testimonial as any)?.author?.name || currentCaseStudy.testimonial?.author || 'Cliente'}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                          <div className="text-center">
                            <div className="font-medium text-gray-900">
                              {(currentCaseStudy.testimonial as any)?.author?.name || currentCaseStudy.testimonial?.author || 'Cliente'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {(currentCaseStudy.testimonial as any)?.author?.position || currentCaseStudy.testimonial?.position || 'Director General'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(currentCaseStudy as any).client?.name || 'Cliente Confidencial'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay testimonio disponible para este caso.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Cases */}
              {relatedCases.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Casos Relacionados
                  </h4>
                  <div className="space-y-4">
                    {relatedCases.map(caseStudy => (
                      <Link key={caseStudy.id} href={`/casos-de-uso/${caseStudy.slug}`}>
                        <div className="flex gap-3 group cursor-pointer">
                          <div className="flex-shrink-0 w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={caseStudy.images?.[0] || '/default-case-study.jpg'}
                              alt={caseStudy.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                              {caseStudy.title}
                            </h5>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Building className="w-3 h-3" />
                              {caseStudy.industry}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                              <TrendingUp className="w-3 h-3" />
                              +{(caseStudy as any).metrics?.trafficIncrease || 150}% tráfico
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center"
              >
                <Award className="w-8 h-8 mx-auto mb-3" />
                <h4 className="font-bold mb-2">
                  ¿Quieres resultados similares?
                </h4>
                <p className="text-blue-100 text-sm mb-4">
                  Comienza a usar nuestras herramientas SEO y ve la diferencia.
                </p>
                <Link
                  href="/generador-sitemap"
                  className="block w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Probar gratis
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}