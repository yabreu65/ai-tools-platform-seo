'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  BarChart3,
  Star,
  Mail,
  Eye,
  MessageSquare,
  Download,
  Share2,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  Heart,
  BookOpen,
  Award,
  Zap,
  Target,ArrowRight,
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import { useCaseStudy } from '@/contexts/CaseStudyContext';
import { useTestimonial } from '@/contexts/TestimonialContext';
import { useNewsletter } from '@/contexts/NewsletterContext';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';
import { useAnalytics } from '@/src/contexts/AnalyticsContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ContentDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'blog' | 'cases' | 'testimonials' | 'newsletter' | 'analytics'>('blog');
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const { posts, categories, searchPosts } = useBlog();
  const { caseStudies, getCaseStudiesByIndustry } = useCaseStudy();
  const { testimonials, getTestimonialsByTool } = useTestimonial();
  const { getRecentCampaigns, getSubscriberStats } = useNewsletter();
  const { currentMetrics } = useAnalytics();
  
  const {
    trackBlogView,
    trackCaseStudyView,
    trackTestimonialView,
    trackNewsletterSubscription,
    trackContentSearch,
    trackContentShare
  } = useContentAnalytics();

  const demoSections = [
    {
      id: 'blog',
      title: 'Sistema de Blog',
      icon: FileText,
      description: 'Artículos educativos sobre SEO con sistema de comentarios y compartir',
      color: 'blue',
      features: [
        'Artículos categorizados',
        'Sistema de búsqueda',
        'Comentarios interactivos',
        'Compartir en redes sociales',
        'Tiempo de lectura',
        'Artículos relacionados'
      ]
    },
    {
      id: 'cases',
      title: 'Casos de Uso',
      icon: BarChart3,
      description: 'Ejemplos prácticos con métricas de éxito y descargas',
      color: 'green',
      features: [
        'Filtros por industria',
        'Métricas antes/después',
        'Descargas PDF',
        'Testimonios integrados',
        'Plantillas reutilizables',
        'Casos destacados'
      ]
    },
    {
      id: 'testimonials',
      title: 'Testimonios',
      icon: Star,
      description: 'Reseñas verificadas con calificaciones y filtros',
      color: 'yellow',
      features: [
        'Calificaciones por estrellas',
        'Verificación de usuarios',
        'Filtros por herramienta',
        'Formulario de envío',
        'Moderación automática',
        'Widget destacados'
      ]
    },
    {
      id: 'newsletter',
      title: 'Newsletter',
      icon: Mail,
      description: 'Sistema de suscripción con segmentación y métricas',
      color: 'purple',
      features: [
        'Doble opt-in',
        'Segmentación de audiencia',
        'Plantillas responsivas',
        'Métricas de engagement',
        'Preferencias personalizadas',
        'Dashboard administrativo'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics Integrado',
      icon: TrendingUp,
      description: 'Métricas detalladas de todo el contenido',
      color: 'indigo',
      features: [
        'Tracking de vistas',
        'Engagement por contenido',
        'Conversiones',
        'Tiempo de lectura',
        'Fuentes de tráfico',
        'Reportes automáticos'
      ]
    }
  ];

  const mockStats = {
    blog: {
      totalPosts: posts.length,
      totalViews: 45230,
      avgReadTime: '4.2 min',
      engagement: '8.5%'
    },
    cases: {
      totalCases: caseStudies.length,
      totalDownloads: 1250,
      avgRating: '4.8',
      conversionRate: '12.3%'
    },
    testimonials: {
      totalTestimonials: testimonials.length,
      avgRating: '4.7',
      verifiedRate: '89%',
      helpfulVotes: 2340
    },
    newsletter: {
        subscribers: getSubscriberStats().total,
        openRate: '34.5%',
        clickRate: '8.2%',
        growthRate: '+15.3%'
      }
  };

  const handleDemoAction = (action: string, data?: any) => {
    console.log(`Demo action: ${action}`, data);
    
    switch (action) {
      case 'blog_view':
        trackBlogView({
          contentId: data.id,
          contentType: 'blog',
          title: data.title,
          category: data.category,
          author: data.author?.name
        });
        break;
      case 'case_view':
        trackCaseStudyView({
          contentId: data.id,
          contentType: 'case-study',
          title: data.title,
          category: data.industry
        });
        break;
      case 'testimonial_view':
        trackTestimonialView({
          contentId: data.id,
          contentType: 'testimonial',
          title: `Testimonial de ${data.author.name}`
        });
        break;
      case 'newsletter_subscribe':
        trackNewsletterSubscription(data.email, data.preferences, 'demo');
        break;
      case 'search':
        trackContentSearch(data.query, data.type, data.results);
        break;
      case 'share':
        trackContentShare(data.id, data.type, data.platform, data.title);
        break;
    }
  };

  const startDemo = () => {
    setIsPlaying(true);
    setDemoStep(0);
    
    const demoSteps = [
      () => setActiveDemo('blog'),
      () => handleDemoAction('blog_view', posts[0]),
      () => setActiveDemo('cases'),
      () => handleDemoAction('case_view', caseStudies[0]),
      () => setActiveDemo('testimonials'),
      () => handleDemoAction('testimonial_view', testimonials[0]),
      () => setActiveDemo('newsletter'),
      () => handleDemoAction('newsletter_subscribe', { 
        email: 'demo@example.com', 
        preferences: { seoTips: true, productUpdates: true } 
      }),
      () => setActiveDemo('analytics'),
      () => setIsPlaying(false)
    ];

    const runStep = (step: number) => {
      if (step < demoSteps.length && isPlaying) {
        demoSteps[step]();
        setDemoStep(step + 1);
        setTimeout(() => runStep(step + 1), 2000);
      }
    };

    runStep(0);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setDemoStep(0);
    setActiveDemo('blog');
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Demo: Sistema de Contenido y Marketing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Explora todas las funcionalidades del sistema completo de contenido y marketing 
              de YA Tools con analytics integrado y métricas en tiempo real.
            </p>

            {/* Demo Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={startDemo}
                disabled={isPlaying}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Demo en curso...' : 'Iniciar Demo Automático'}
              </button>
              
              <button
                onClick={resetDemo}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>
            </div>

            {/* Progress Indicator */}
            {isPlaying && (
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(demoStep / 10) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Paso {demoStep} de 10
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
          {demoSections.map((section, index) => (
            <motion.button
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => setActiveDemo(section.id as any)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeDemo === section.id
                  ? getColorClasses(section.color)
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <section.icon className={`w-6 h-6 ${
                  activeDemo === section.id ? '' : 'text-gray-600'
                }`} />
                <h3 className={`font-bold ${
                  activeDemo === section.id ? '' : 'text-gray-900'
                }`}>
                  {section.title}
                </h3>
              </div>
              <p className={`text-sm ${
                activeDemo === section.id ? 'opacity-90' : 'text-gray-600'
              }`}>
                {section.description}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Active Section Content */}
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          {/* Blog Demo */}
          {activeDemo === 'blog' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sistema de Blog
                  </h2>
                  <p className="text-gray-600">
                    Contenido educativo sobre SEO con engagement completo
                  </p>
                </div>
                <Link 
                  href="/blog"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Ver Blog Completo
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(mockStats.blog).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Características</h3>
                  <ul className="space-y-2">
                    {demoSections[0].features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Artículos Recientes</h3>
                  <div className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                      <div 
                        key={post.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => handleDemoAction('blog_view', post)}
                      >
                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{post.category.name}</span>
                          <span>{post.readingTime} min</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {Math.floor(Math.random() * 1000) + 100}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Demo */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Demo Interactivo</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDemoAction('search', { 
                      query: 'SEO técnico', 
                      type: 'blog', 
                      results: 12 
                    })}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-300 transition-colors flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Buscar "SEO técnico"
                  </button>
                  
                  <button
                    onClick={() => handleDemoAction('share', {
                      id: posts[0].id,
                      type: 'blog',
                      platform: 'twitter',
                      title: posts[0].title
                    })}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-300 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir Artículo
                  </button>
                  
                  <button
                    onClick={() => handleDemoAction('blog_view', posts[1])}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-300 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Leer Artículo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cases Demo */}
          {activeDemo === 'cases' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Casos de Uso
                  </h2>
                  <p className="text-gray-600">
                    Ejemplos prácticos con métricas de éxito comprobadas
                  </p>
                </div>
                <Link 
                  href="/casos-de-uso"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Ver Casos Completos
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(mockStats.cases).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Case Studies Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseStudies.slice(0, 2).map((caseStudy) => (
                  <div 
                    key={caseStudy.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => handleDemoAction('case_view', caseStudy)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {caseStudy.industry}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {Array.isArray(caseStudy.tools) ? caseStudy.tools[0] : ''}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-2">
                      {caseStudy.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {caseStudy.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {caseStudy.results.slice(0,3).map((res, index) => (
                        <div key={index}>
                          <div className="text-lg font-bold text-green-600">
                            {res.improvement}
                          </div>
                          <div className="text-xs text-gray-600">
                            {res.metric}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials Demo */}
          {activeDemo === 'testimonials' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Testimonios
                  </h2>
                  <p className="text-gray-600">
                    Reseñas verificadas de usuarios reales
                  </p>
                </div>
                <Link 
                  href="/testimonios"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center gap-2"
                >
                  Ver Todos los Testimonios
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(mockStats.testimonials).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonials Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.slice(0, 2).map((testimonial) => (
                  <div 
                    key={testimonial.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-yellow-300 transition-colors cursor-pointer"
                    onClick={() => handleDemoAction('testimonial_view', testimonial)}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < testimonial.rating 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {testimonial.rating}/5
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 italic">
                      "{testimonial.content.substring(0, 150)}..."
                    </p>
                    
                    <div className="flex items-center gap-3">
                      <Image
                        src={testimonial.author.avatar || 'https://placehold.co/80x80'}
                        alt={testimonial.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {testimonial.author.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {testimonial.author.position} en {testimonial.author.company}
                        </div>
                      </div>
                      {testimonial.author.verified && (
                        <div className="ml-auto">
                          <Award className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Demo */}
          {activeDemo === 'newsletter' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Newsletter
                  </h2>
                  <p className="text-gray-600">
                    Sistema completo de email marketing con segmentación
                  </p>
                </div>
                <Link 
                  href="/newsletter"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Suscribirse
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {Object.entries(mockStats.newsletter).map(([key, value]) => (
                  <div key={key} className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Newsletter Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Funcionalidades</h3>
                  <div className="space-y-4">
                    {demoSections[3].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Campañas Recientes</h3>
                  <div className="space-y-3">
                    {getRecentCampaigns(3).map((campaign) => (
                      <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {campaign.subject}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Intl.DateTimeFormat('es-ES', {
                              month: 'short',
                              day: 'numeric'
                            }).format(campaign.sentAt)}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {Math.round(((campaign.opens || 0) / (campaign.recipients || 1)) * 100)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {Math.round(((campaign.clicks || 0) / (campaign.opens || 1)) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Demo */}
          {activeDemo === 'analytics' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Analytics Integrado
                  </h2>
                  <p className="text-gray-600">
                    Métricas completas de todo el sistema de contenido
                  </p>
                </div>
                <Link 
                  href="/admin/contenido"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Panel Admin
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {posts.length + caseStudies.length + testimonials.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Contenido</div>
                </div>
                
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    52.3K
                  </div>
                  <div className="text-sm text-gray-600">Vistas Totales</div>
                </div>
                
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {getSubscriberStats().total.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Suscriptores</div>
                </div>
                
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    9.2%
                  </div>
                  <div className="text-sm text-gray-600">Tasa Conversión</div>
                </div>
              </div>

              {/* Analytics Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Métricas Tracked</h3>
                  <div className="space-y-3">
                    {[
                      'Vistas de contenido por tipo',
                      'Tiempo de lectura promedio',
                      'Engagement por artículo',
                      'Conversiones de newsletter',
                      'Descargas de casos de uso',
                      'Interacciones con testimonios',
                      'Fuentes de tráfico',
                      'Dispositivos y ubicaciones'
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        <span className="text-gray-700">{metric}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Reportes Automáticos</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Reporte Semanal', status: 'Activo', next: 'Lunes 9:00 AM' },
                      { name: 'Análisis Mensual', status: 'Activo', next: '1er día del mes' },
                      { name: 'Alertas de Engagement', status: 'Activo', next: 'Tiempo real' },
                      { name: 'Resumen de Conversiones', status: 'Activo', next: 'Diario 8:00 AM' }
                    ].map((report, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{report.name}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {report.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Próximo: {report.next}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">
            ¿Listo para explorar el sistema completo?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Navega por todas las secciones del sistema de contenido y marketing, 
            o accede al panel de administración para gestionar todo desde un solo lugar.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/blog"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Explorar Blog
            </Link>
            
            <Link 
              href="/casos-de-uso"
              className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Ver Casos de Uso
            </Link>
            
            <Link 
              href="/testimonios"
              className="px-6 py-3 bg-white text-yellow-600 rounded-lg font-medium hover:bg-yellow-50 transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Leer Testimonios
            </Link>
            
            <Link 
              href="/admin/contenido"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Panel Admin
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}