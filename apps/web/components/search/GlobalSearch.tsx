'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Clock, TrendingUp, Command } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ placeholder = 'Buscar herramientas...', className = '' }: GlobalSearchProps) {
  const {
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
    addToRecentSearches,
    clearRecentSearches
  } = useSearch();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Manejar Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen, setQuery]);

  // Navegación con teclado en resultados
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const totalResults = results.length + suggestions.length + recentSearches.length;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectResult(selectedIndex);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, suggestions, recentSearches, selectedIndex]);

  const handleSelectResult = (index: number) => {
    if (results[index]) {
      const result = results[index];
      addToRecentSearches(result.title);
      router.push(result.url);
      setIsOpen(false);
      setQuery('');
    } else if (suggestions[index - results.length]) {
      const suggestion = suggestions[index - results.length];
      setQuery(suggestion);
      addToRecentSearches(suggestion);
    } else if (recentSearches[index - results.length - suggestions.length]) {
      const recent = recentSearches[index - results.length - suggestions.length];
      setQuery(recent);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addToRecentSearches(query);
      if (results.length > 0) {
        router.push(results[0].url);
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  const categories = ['Todos', 'SEO', 'Optimización', 'Seguridad', 'Rendimiento', 'Analytics'];
  const types = ['Todos', 'Herramientas', 'Páginas', 'Contenido'];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ${className}`}
        aria-label="Abrir búsqueda global"
      >
        <Search className="w-4 h-4 text-gray-500" />
        <span className="text-gray-500 text-sm">{placeholder}</span>
        <div className="flex items-center space-x-1 ml-auto">
          <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
            <Command className="w-3 h-3 inline" />
          </kbd>
          <kbd className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">K</kbd>
        </div>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Header */}
              <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <form onSubmit={handleSubmit} className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none text-lg"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </form>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    aria-label="Mostrar filtros"
                  >
                    <Filter className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    aria-label="Cerrar búsqueda"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Categoría
                        </label>
                        <select
                          value={filters.category || 'Todos'}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value === 'Todos' ? undefined : e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tipo
                        </label>
                        <select
                          value={filters.type || 'Todos'}
                          onChange={(e) => setFilters({ ...filters, type: e.target.value === 'Todos' ? undefined : e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {types.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Ordenar por
                        </label>
                        <select
                          value={filters.sortBy || 'relevance'}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="relevance">Relevancia</option>
                          <option value="popularity">Popularidad</option>
                          <option value="alphabetical">Alfabético</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Buscando...</span>
                  </div>
                ) : (
                  <>
                    {/* Search Results */}
                    {results.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Resultados ({results.length})
                        </div>
                        {results.map((result, index) => (
                          <button
                            key={result.id}
                            onClick={() => handleSelectResult(index)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                              selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{result.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {result.title}
                                  </h3>
                                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                    {result.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                  {result.description}
                                </p>
                              </div>
                              {result.popularity && result.popularity > 80 && (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && query && (
                      <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Sugerencias
                        </div>
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSelectResult(results.length + index)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                              selectedIndex === results.length + index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Search className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && !query && (
                      <div className="py-2">
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Búsquedas recientes
                          </div>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Limpiar
                          </button>
                        </div>
                        {recentSearches.slice(0, 5).map((search, index) => (
                          <button
                            key={search}
                            onClick={() => handleSelectResult(results.length + suggestions.length + index)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                              selectedIndex === results.length + suggestions.length + index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {query && results.length === 0 && suggestions.length === 0 && !isSearching && (
                      <div className="py-8 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          No se encontraron resultados
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Intenta con otros términos de búsqueda
                        </p>
                      </div>
                    )}

                    {/* Empty State */}
                    {!query && recentSearches.length === 0 && (
                      <div className="py-8 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Busca herramientas y contenido
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Encuentra rápidamente lo que necesitas
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd>
                      <span>navegar</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↵</kbd>
                      <span>seleccionar</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">esc</kbd>
                      <span>cerrar</span>
                    </div>
                  </div>
                  <div>
                    Powered by YA Tools
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}