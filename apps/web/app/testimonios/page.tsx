'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Calendar,
  User,
  Building,
  Award,
  TrendingUp,
  Plus,
  CheckCircle,
  Quote,
  Heart,
  Share2
} from 'lucide-react';
import { useTestimonial } from '@/contexts/TestimonialContext';
import { Testimonial } from '@/types/content';
import Image from 'next/image';

export default function TestimonialsPage() {
  const {
    testimonials,
    loading,
    error,
    filters,
    searchQuery,
    setSearchQuery,
    setFilters,
    fetchTestimonials,
    getFeaturedTestimonials,
    submitTestimonial,
    markAsHelpful,
    getTestimonialsByRating,
    getTestimonialsByTool
  } = useTestimonial();

  const [showFilters, setShowFilters] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [submitForm, setSubmitForm] = useState({
    author: { name: '', email: '', company: '', position: '', avatar: '' },
    content: '',
    rating: 5,
    tool: '',
    verified: false
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const featuredTestimonials = getFeaturedTestimonials(6);
  
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

  const companies = [
    'Startup',
    'Pequeña empresa',
    'Mediana empresa',
    'Gran empresa',
    'Agencia',
    'Freelancer'
  ];

  const handleFilterChange = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type as keyof typeof prev]?.includes(value)
        ? prev[type as keyof typeof prev]?.filter(item => item !== value) || []
        : [...(prev[type as keyof typeof prev] || []), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      tool: [],
      rating: undefined,
      verified: undefined,
      company: []
    });
    setSearchQuery('');
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitForm.content.trim() && submitForm.author.name.trim()) {
      await submitTestimonial({
        ...submitForm,
        author: {
          ...submitForm.author,
          avatar: submitForm.author.avatar || 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar%20friendly&image_size=square'
        }
      });
      setSubmitForm({
        author: { name: '', email: '', company: '', position: '', avatar: '' },
        content: '',
        rating: 5,
        tool: '',
        verified: false
      });
      setShowSubmitForm(false);
    }
  };

  const handleMarkHelpful = async (testimonialId: string) => {
    await markAsHelpful(testimonialId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
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
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
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
              Testimonios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Descubre lo que nuestros usuarios dicen sobre YA Tools y cómo nuestras 
              herramientas SEO han transformado sus negocios.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {testimonials.length}+
                </div>
                <div className="text-sm text-gray-600">Testimonios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  4.9
                </div>
                <div className="text-sm text-gray-600">Calificación promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  98%
                </div>
                <div className="text-sm text-gray-600">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  50+
                </div>
                <div className="text-sm text-gray-600">Empresas</div>
              </div>
            </div>

            <button
              onClick={() => setShowSubmitForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Compartir tu experiencia
            </button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Testimonials */}
        {featuredTestimonials.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Testimonios Destacados
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTestimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow relative"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-100" />
                  
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(testimonial.rating)}
                    {testimonial.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-6 line-clamp-4">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={testimonial.author.avatar}
                      alt={testimonial.author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {testimonial.author.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.author.position}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.author.company}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {testimonial.tool}
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleMarkHelpful(testimonial.id)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {testimonial.helpful}
                      </button>
                      <span>{formatDate(testimonial.createdAt)}</span>
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
                placeholder="Buscar testimonios..."
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
              {(filters.tool.length > 0 || filters.company.length > 0 || filters.rating || filters.verified !== undefined) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {filters.tool.length + filters.company.length + (filters.rating ? 1 : 0) + (filters.verified !== undefined ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Más recientes</option>
              <option value="rating">Mejor calificados</option>
              <option value="helpful">Más útiles</option>
            </select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 pt-6 border-t"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Tool Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Herramienta</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tools.map(tool => (
                      <label key={tool} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.tool.includes(tool)}
                          onChange={() => handleFilterChange('tool', tool)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{tool}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Company Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tipo de empresa</h4>
                  <div className="space-y-2">
                    {companies.map(company => (
                      <label key={company} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.company.includes(company)}
                          onChange={() => handleFilterChange('company', company)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{company}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Calificación</h4>
                  <div className="space-y-2">
                    {[5, 4, 3].map(rating => (
                      <label key={rating} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => setFilters(prev => ({ ...prev, rating }))}
                          className="border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-1">
                          {renderStars(rating, 'sm')}
                          <span className="text-sm text-gray-700">y más</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verified Filter */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Verificación</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.verified === true}
                        onChange={() => setFilters(prev => ({ 
                          ...prev, 
                          verified: prev.verified === true ? undefined : true 
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Solo verificados
                      </span>
                    </label>
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

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow relative group"
            >
              <Quote className="absolute top-4 right-4 w-6 h-6 text-blue-100 group-hover:text-blue-200 transition-colors" />
              
              <div className="flex items-center justify-between mb-4">
                {renderStars(testimonial.rating)}
                {testimonial.verified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Verificado</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-6 line-clamp-4">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src={testimonial.author.avatar}
                  alt={testimonial.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {testimonial.author.name}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {testimonial.author.position}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {testimonial.author.company}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {testimonial.tool}
                </span>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <button
                    onClick={() => handleMarkHelpful(testimonial.id)}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {testimonial.helpful}
                  </button>
                  <span>{formatDate(testimonial.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {testimonials.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No se encontraron testimonios
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
          <Heart className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            ¿Has usado nuestras herramientas?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Comparte tu experiencia y ayuda a otros usuarios a descubrir el poder 
            de nuestras herramientas SEO.
          </p>
          <button
            onClick={() => setShowSubmitForm(true)}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Escribir testimonio
          </button>
        </motion.div>
      </div>

      {/* Submit Testimonial Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Compartir tu experiencia
                </h3>
                <button
                  onClick={() => setShowSubmitForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitTestimonial} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={submitForm.author.name}
                      onChange={(e) => setSubmitForm(prev => ({
                        ...prev,
                        author: { ...prev.author, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={submitForm.author.email}
                      onChange={(e) => setSubmitForm(prev => ({
                        ...prev,
                        author: { ...prev.author, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={submitForm.author.company}
                      onChange={(e) => setSubmitForm(prev => ({
                        ...prev,
                        author: { ...prev.author, company: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={submitForm.author.position}
                      onChange={(e) => setSubmitForm(prev => ({
                        ...prev,
                        author: { ...prev.author, position: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Herramienta utilizada
                  </label>
                  <select
                    value={submitForm.tool}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, tool: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar herramienta</option>
                    {tools.map(tool => (
                      <option key={tool} value={tool}>{tool}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setSubmitForm(prev => ({ ...prev, rating }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= submitForm.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu experiencia *
                  </label>
                  <textarea
                    value={submitForm.content}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Cuéntanos cómo nuestras herramientas te han ayudado..."
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Enviar testimonio
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(false)}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}