'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, CheckCircle, X, Eye, EyeOff,
  Filter, Search, Calendar, User, MessageSquare, Flag
} from 'lucide-react';
import { StarRating } from './StarRating';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationPanelProps {
  className?: string;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { ratings, moderateRating, isLoading } = useFeedback();
  
  const [filter, setFilter] = useState<'all' | 'reported' | 'pending' | 'moderated'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  // Solo mostrar si el usuario es administrador
  if (!user || user.role !== 'admin') {
    return null;
  }

  const filteredRatings = ratings.filter(rating => {
    // Filtro por estado
    if (filter === 'reported' && !rating.reported) return false;
    if (filter === 'pending' && (rating.moderated || !rating.reported)) return false;
    if (filter === 'moderated' && !rating.moderated) return false;
    
    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        rating.toolName.toLowerCase().includes(searchLower) ||
        rating.comment?.toLowerCase().includes(searchLower) ||
        rating.userId.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleModerate = async (ratingId: string, action: 'approve' | 'reject') => {
    try {
      await moderateRating(ratingId, action, moderationNote);
      setSelectedRating(null);
      setModerationNote('');
    } catch (error) {
      console.error('Error moderating rating:', error);
    }
  };

  const getStatusBadge = (rating: any) => {
    if (rating.moderated) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Moderado
        </span>
      );
    }
    
    if (rating.reported) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Reportado
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        <Eye className="w-3 h-3 mr-1" />
        Público
      </span>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Panel de Moderación
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona valoraciones y comentarios reportados
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {ratings.filter(r => r.reported && !r.moderated).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {ratings.filter(r => r.reported).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Reportados</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {ratings.filter(r => r.moderated).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Moderados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'reported', label: 'Reportados' },
                { key: 'pending', label: 'Pendientes' },
                { key: 'moderated', label: 'Moderados' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por herramienta, usuario o comentario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-80"
            />
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="p-6">
        {filteredRatings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay valoraciones que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRatings.map((rating) => (
              <motion.div
                key={rating.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {rating.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {rating.userId}
                        </span>
                        {getStatusBadge(rating)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <StarRating rating={rating.rating} readonly size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {rating.toolName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(rating.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {rating.helpful && rating.helpful > 0 && (
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {rating.helpful} útil{rating.helpful !== 1 ? 'es' : ''}
                      </span>
                    )}
                    
                    {!rating.moderated && rating.reported && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleModerate(rating.id, 'approve')}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedRating(rating.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                          title="Rechazar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {rating.comment && (
                  <div className="mb-3">
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg">
                      {rating.comment}
                    </p>
                  </div>
                )}
                
                {rating.moderatorNote && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Nota del moderador:
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {rating.moderatorNote}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      <AnimatePresence>
        {selectedRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedRating(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rechazar Valoración
                </h3>
                <button
                  onClick={() => setSelectedRating(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nota de moderación (opcional)
                  </label>
                  <textarea
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    placeholder="Explica el motivo del rechazo..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setSelectedRating(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleModerate(selectedRating, 'reject')}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModerationPanel;