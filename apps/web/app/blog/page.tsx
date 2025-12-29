'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, User, Clock, Eye, Heart, Tag, TrendingUp } from 'lucide-react';
import { useBlog } from '@/contexts/BlogContext';
import { BlogFilters } from '@/types/content';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const {
    filteredPosts,
    categories,
    authors,
    loading,
    error,
    filters,
    searchQuery,
    setFilters,
    setSearchQuery,
    getPopularPosts,
    getTrendingPosts
  } = useBlog();

  const [showFilters, setShowFilters] = useState(false);
  const popularPosts = getPopularPosts(3);
  const trendingPosts = getTrendingPosts(3);

  const handleFilterChange = (key: keyof BlogFilters, value: any) => {
    setFilters({ [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getReadingTimeColor = (time: number) => {
    if (time <= 5) return 'text-green-600';
    if (time <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el blog</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Blog de <span className="text-blue-600">YA Tools</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre las últimas estrategias SEO, tutoriales prácticos y casos de estudio 
              que te ayudarán a mejorar tu posicionamiento web.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar artículos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  Filtros
                </button>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Autor
                    </label>
                    <select
                      value={filters.author || ''}
                      onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos los autores</option>
                      {authors.map(author => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="newest">Más recientes</option>
                      <option value="oldest">Más antiguos</option>
                      <option value="popular">Más populares</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Posts Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron artículos
                </h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o términos de búsqueda.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={post.featuredImage || '/default-blog-image.jpg'}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className="px-3 py-1 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: post.category.color }}
                          >
                            {post.category.icon} {post.category.name}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-6">
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Image
                              src={post.author.avatar || '/default-avatar.png'}
                              alt={post.author.name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className={`w-4 h-4 ${getReadingTimeColor(post.readingTime)}`} />
                            <span className={getReadingTimeColor(post.readingTime)}>
                              {post.readingTime} min
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.views.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Popular Posts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Artículos Populares
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <div className="flex gap-3 group cursor-pointer">
                        <div className="flex-shrink-0 w-12 h-12 relative rounded-lg overflow-hidden">
                          <Image
                            src={post.featuredImage || '/default-blog-image.jpg'}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            {post.views.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.slug)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm p-6 text-white"
              >
                <h3 className="text-lg font-bold mb-2">
                  ¡No te pierdas nada!
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Suscríbete a nuestro newsletter y recibe los mejores consejos SEO directamente en tu email.
                </p>
                <Link
                  href="/newsletter"
                  className="block w-full bg-white text-blue-600 text-center py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Suscribirse Gratis
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}