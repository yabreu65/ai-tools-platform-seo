'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Flag, Edit, Trash2,
  Send, X, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import { StarRating, RatingSummary } from './StarRating';
import { useFeedback } from '@/contexts/FeedbackContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface FeedbackWidgetProps {
  toolName: string;
  className?: string;
  showSummary?: boolean;
  compact?: boolean;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  toolName,
  className = '',
  showSummary = true,
  compact = false
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const {
    userRatings,
    getRatingsForTool,
    getStatsForTool,
    submitRating,
    updateRating,
    deleteRating,
    reportRating,
    voteHelpful,
    isLoading
  } = useFeedback();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [reportingRating, setReportingRating] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  const userRating = userRatings[toolName];
  const toolRatings = getRatingsForTool(toolName);
  const stats = getStatsForTool(toolName);

  useEffect(() => {
    if (userRating) {
      setNewRating(userRating.rating);
      setNewComment(userRating.comment || '');
    }
  }, [userRating]);

  const handleSubmitRating = async () => {
    if (newRating === 0) {
      showError('Por favor selecciona una valoración');
      return;
    }

    try {
      if (userRating) {
        await updateRating(userRating.id, newRating, newComment);
      } else {
        await submitRating(toolName, newRating, newComment);
      }
      
      setShowRatingForm(false);
      setNewRating(0);
      setNewComment('');
    } catch (error) {
      showError('Error al enviar la valoración');
    }
  };

  const handleDeleteRating = async () => {
    if (!userRating) return;
    
    try {
      await deleteRating(userRating.id);
      setNewRating(0);
      setNewComment('');
    } catch (error) {
      showError('Error al eliminar la valoración');
    }
  };

  const handleReportRating = async (ratingId: string) => {
    if (!reportReason.trim()) {
      showError('Por favor indica el motivo del reporte');
      return;
    }

    try {
      await reportRating(ratingId, reportReason);
      setReportingRating(null);
      setReportReason('');
    } catch (error) {
      showError('Error al reportar la valoración');
    }
  };

  const handleVoteHelpful = async (ratingId: string, helpful: boolean) => {
    try {
      await voteHelpful(ratingId, helpful);
    } catch (error) {
      showError('Error al votar');
    }
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <StarRating rating={stats.averageRating} readonly size="sm" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ({stats.totalRatings})
        </span>
        {user && (
          <button
            onClick={() => setShowRatingForm(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Valorar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Valoraciones y Comentarios
            </h3>
          </div>
          
          {user && (
            <button
              onClick={() => setShowRatingForm(!showRatingForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {userRating ? 'Editar Valoración' : 'Valorar'}
            </button>
          )}
        </div>
      </div>

      {/* Rating Form */}
      <AnimatePresence>
        {showRatingForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tu valoración
                </label>
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                  size="lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comparte tu experiencia con esta herramienta..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newComment.length}/500 caracteres
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {userRating && (
                    <button
                      onClick={handleDeleteRating}
                      className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setShowRatingForm(false);
                      setNewRating(userRating?.rating || 0);
                      setNewComment(userRating?.comment || '');
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmitRating}
                    disabled={isLoading || newRating === 0}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{userRating ? 'Actualizar' : 'Enviar'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {showSummary && stats.totalRatings > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <RatingSummary
            averageRating={stats.averageRating}
            totalRatings={stats.totalRatings}
            distribution={stats.ratingDistribution}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="p-4">
        {toolRatings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aún no hay valoraciones para esta herramienta</p>
            <p className="text-sm mt-1">¡Sé el primero en compartir tu experiencia!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {toolRatings
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, isExpanded ? undefined : 3)
              .map((rating) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {rating.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <StarRating rating={rating.rating} readonly size="sm" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(rating.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {rating.moderated && (
                        <CheckCircle className="w-4 h-4 text-green-500" title="Moderado" />
                      )}
                      {rating.reported && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" title="Reportado" />
                      )}
                      
                      {user && user.id !== rating.userId && (
                        <button
                          onClick={() => setReportingRating(rating.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Reportar"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {rating.comment}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleVoteHelpful(rating.id, true)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Útil ({rating.helpful || 0})</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            
            {toolRatings.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                {isExpanded ? 'Ver menos' : `Ver todas las valoraciones (${toolRatings.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportingRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setReportingRating(null)}
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
                  Reportar Valoración
                </h3>
                <button
                  onClick={() => setReportingRating(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo del reporte
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Selecciona un motivo</option>
                    <option value="spam">Spam</option>
                    <option value="inappropriate">Contenido inapropiado</option>
                    <option value="fake">Valoración falsa</option>
                    <option value="offensive">Lenguaje ofensivo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setReportingRating(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleReportRating(reportingRating)}
                    disabled={!reportReason}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reportar
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

export default FeedbackWidget;