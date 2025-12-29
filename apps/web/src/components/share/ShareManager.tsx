'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Eye, 
  Download, 
  Copy, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Calendar,
  Lock,
  Globe,
  MoreVertical,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Users,
  Link as LinkIcon
} from 'lucide-react';
import { useShare } from '@/contexts/ShareContext';
import { useShareLinks, useShareStats } from '@/hooks/useShare';
import { useNotifications } from '@/hooks/useNotifications';
import { ShareDialog } from './ShareDialog';

interface ShareManagerProps {
  className?: string;
}

export const ShareManager: React.FC<ShareManagerProps> = ({ className = '' }) => {
  const { 
    sharedResults, 
    loadSharedResults, 
    updateShareableResult, 
    deleteShareableResult,
    isLoading 
  } = useShare();
  const { copyToClipboard, revokeLink } = useShareLinks();
  const stats = useShareStats();
  const { showSuccess, showError, showConfirm } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'shares'>('date');
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadSharedResults();
  }, [loadSharedResults]);

  const filteredResults = sharedResults
    .filter(result => {
      const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           result.toolName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'public' && result.metadata.isPublic) ||
                           (filterBy === 'private' && !result.metadata.isPublic);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.stats.views - a.stats.views;
        case 'shares':
          return b.stats.shares - a.stats.shares;
        case 'date':
        default:
          return b.metadata.createdAt - a.metadata.createdAt;
      }
    });

  const handleCopyLink = async (result: any) => {
    const shareUrl = `${window.location.origin}/share/${result.id}`;
    await copyToClipboard(shareUrl);
  };

  const handleEdit = (result: any) => {
    setSelectedResult(result);
    setShowShareDialog(true);
  };

  const handleDelete = async (result: any) => {
    const confirmed = await showConfirm(
      '¿Eliminar resultado compartido?',
      'Esta acción no se puede deshacer. El enlace dejará de funcionar.'
    );

    if (confirmed) {
      try {
        await deleteShareableResult(result.id);
        showSuccess('Resultado eliminado exitosamente');
      } catch (error) {
        showError('Error al eliminar el resultado');
      }
    }
  };

  const handleToggleVisibility = async (result: any) => {
    try {
      await updateShareableResult(result.id, {
        metadata: {
          ...result.metadata,
          isPublic: !result.metadata.isPublic
        }
      });
      showSuccess(`Resultado ${result.metadata.isPublic ? 'hecho privado' : 'hecho público'}`);
    } catch (error) {
      showError('Error al cambiar la visibilidad');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (result: any) => {
    return result.metadata.expiresAt && Date.now() > result.metadata.expiresAt;
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con estadísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resultados Compartidos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tus análisis compartidos y enlaces
            </p>
          </div>
          
          <button
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Compartir nuevo
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Share2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.results}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Resultados
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalViews}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vistas totales
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalShares}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Compartidos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.totalDownloads}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Descargas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar resultados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="public">Públicos</option>
              <option value="private">Privados</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Fecha</option>
              <option value="views">Vistas</option>
              <option value="shares">Compartidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de resultados */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredResults.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border-l-4 ${
                isExpired(result) 
                  ? 'border-red-500' 
                  : result.metadata.isPublic 
                  ? 'border-green-500' 
                  : 'border-orange-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {result.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      {result.metadata.isPublic ? (
                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      )}
                      
                      {isExpired(result) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium rounded-full">
                          Expirado
                        </span>
                      )}
                    </div>
                  </div>

                  {result.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {result.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(result.metadata.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {result.stats.views} vistas
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {result.stats.shares} compartidos
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {result.stats.downloads} descargas
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-medium rounded-full">
                      {result.toolName}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(showDropdown === result.id ? null : result.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showDropdown === result.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10"
                      >
                        <div className="py-2">
                          <button
                            onClick={() => {
                              handleCopyLink(result);
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copiar enlace
                          </button>
                          
                          <button
                            onClick={() => {
                              window.open(`/share/${result.id}`, '_blank');
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver resultado
                          </button>
                          
                          <button
                            onClick={() => {
                              handleEdit(result);
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Editar
                          </button>
                          
                          <button
                            onClick={() => {
                              handleToggleVisibility(result);
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {result.metadata.isPublic ? (
                              <>
                                <Lock className="w-4 h-4" />
                                Hacer privado
                              </>
                            ) : (
                              <>
                                <Globe className="w-4 h-4" />
                                Hacer público
                              </>
                            )}
                          </button>
                          
                          <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                          
                          <button
                            onClick={() => {
                              handleDelete(result);
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay resultados compartidos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'No se encontraron resultados con los filtros aplicados'
                : 'Comparte tu primer análisis para comenzar'
              }
            </p>
            <button
              onClick={() => setShowShareDialog(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Compartir resultado
            </button>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => {
          setShowShareDialog(false);
          setSelectedResult(null);
        }}
        toolName={selectedResult?.toolName || 'seo-analyzer'}
        title={selectedResult?.title || 'Nuevo análisis'}
        data={selectedResult?.data || {}}
        description={selectedResult?.description}
      />
    </div>
  );
};

export default ShareManager;