'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export interface Rating {
  id: string;
  userId: string;
  toolName: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: number;
  helpful?: number; // votes for helpfulness
  reported?: boolean;
  moderated?: boolean;
  moderatorNote?: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  totalComments: number;
  helpfulVotes: number;
}

export interface FeedbackContextType {
  // Ratings
  ratings: Rating[];
  userRatings: { [toolName: string]: Rating };
  
  // Stats
  feedbackStats: { [toolName: string]: FeedbackStats };
  
  // Actions
  submitRating: (toolName: string, rating: number, comment?: string) => Promise<void>;
  updateRating: (ratingId: string, rating: number, comment?: string) => Promise<void>;
  deleteRating: (ratingId: string) => Promise<void>;
  
  // Moderation
  reportRating: (ratingId: string, reason: string) => Promise<void>;
  moderateRating: (ratingId: string, action: 'approve' | 'reject', note?: string) => Promise<void>;
  
  // Helpfulness
  voteHelpful: (ratingId: string, helpful: boolean) => Promise<void>;
  
  // Data fetching
  getRatingsForTool: (toolName: string) => Rating[];
  getStatsForTool: (toolName: string) => FeedbackStats;
  loadRatings: (toolName?: string) => Promise<void>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRatings, setUserRatings] = useState<{ [toolName: string]: Rating }>({});
  const [feedbackStats, setFeedbackStats] = useState<{ [toolName: string]: FeedbackStats }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular almacenamiento local (en producción sería una API)
  const saveToStorage = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`feedback_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  const loadFromStorage = useCallback((key: string) => {
    try {
      const data = localStorage.getItem(`feedback_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }, []);

  // Calcular estadísticas
  const calculateStats = useCallback((toolRatings: Rating[]): FeedbackStats => {
    if (toolRatings.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {},
        totalComments: 0,
        helpfulVotes: 0
      };
    }

    const totalRatings = toolRatings.length;
    const averageRating = toolRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    const totalComments = toolRatings.filter(r => r.comment && r.comment.trim()).length;
    const helpfulVotes = toolRatings.reduce((sum, r) => sum + (r.helpful || 0), 0);

    const ratingDistribution: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = toolRatings.filter(r => r.rating === i).length;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
      ratingDistribution,
      totalComments,
      helpfulVotes
    };
  }, []);

  // Cargar ratings
  const loadRatings = useCallback(async (toolName?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga desde API/storage
      const allRatings = loadFromStorage('ratings') || [];
      const filteredRatings = toolName 
        ? allRatings.filter((r: Rating) => r.toolName === toolName)
        : allRatings;

      setRatings(filteredRatings);

      // Cargar ratings del usuario actual
      if (user) {
        const userRatingsMap: { [toolName: string]: Rating } = {};
        allRatings
          .filter((r: Rating) => r.userId === user.id)
          .forEach((r: Rating) => {
            userRatingsMap[r.toolName] = r;
          });
        setUserRatings(userRatingsMap);
      }

      // Calcular estadísticas por herramienta
      const statsMap: { [toolName: string]: FeedbackStats } = {};
      const toolNames = [...new Set(allRatings.map((r: Rating) => r.toolName))];
      
      toolNames.forEach(tool => {
        const toolRatings = allRatings.filter((r: Rating) => r.toolName === tool);
        statsMap[tool] = calculateStats(toolRatings);
      });

      setFeedbackStats(statsMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading ratings');
    } finally {
      setIsLoading(false);
    }
  }, [user, loadFromStorage, calculateStats]);

  // Enviar rating
  const submitRating = useCallback(async (toolName: string, rating: number, comment?: string) => {
    if (!user) {
      showError('Debes iniciar sesión para enviar una valoración');
      return;
    }

    if (rating < 1 || rating > 5) {
      showError('La valoración debe estar entre 1 y 5 estrellas');
      return;
    }

    try {
      const newRating: Rating = {
        id: `rating_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: user.id,
        toolName,
        rating,
        comment: comment?.trim(),
        timestamp: Date.now(),
        helpful: 0,
        reported: false,
        moderated: false
      };

      // Actualizar storage
      const allRatings = loadFromStorage('ratings') || [];
      
      // Verificar si el usuario ya tiene un rating para esta herramienta
      const existingIndex = allRatings.findIndex(
        (r: Rating) => r.userId === user.id && r.toolName === toolName
      );

      if (existingIndex >= 0) {
        // Actualizar rating existente
        allRatings[existingIndex] = { ...allRatings[existingIndex], ...newRating };
      } else {
        // Agregar nuevo rating
        allRatings.push(newRating);
      }

      saveToStorage('ratings', allRatings);
      
      // Recargar datos
      await loadRatings();
      
      showSuccess('¡Valoración enviada correctamente!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting rating');
      showError('Error al enviar la valoración');
    }
  }, [user, loadFromStorage, saveToStorage, loadRatings, showSuccess, showError]);

  // Actualizar rating
  const updateRating = useCallback(async (ratingId: string, rating: number, comment?: string) => {
    if (!user) return;

    try {
      const allRatings = loadFromStorage('ratings') || [];
      const ratingIndex = allRatings.findIndex((r: Rating) => r.id === ratingId && r.userId === user.id);

      if (ratingIndex >= 0) {
        allRatings[ratingIndex] = {
          ...allRatings[ratingIndex],
          rating,
          comment: comment?.trim(),
          timestamp: Date.now()
        };

        saveToStorage('ratings', allRatings);
        await loadRatings();
        showSuccess('Valoración actualizada');
      }
    } catch (err) {
      showError('Error al actualizar la valoración');
    }
  }, [user, loadFromStorage, saveToStorage, loadRatings, showSuccess, showError]);

  // Eliminar rating
  const deleteRating = useCallback(async (ratingId: string) => {
    if (!user) return;

    try {
      const allRatings = loadFromStorage('ratings') || [];
      const filteredRatings = allRatings.filter(
        (r: Rating) => !(r.id === ratingId && r.userId === user.id)
      );

      saveToStorage('ratings', filteredRatings);
      await loadRatings();
      showSuccess('Valoración eliminada');
    } catch (err) {
      showError('Error al eliminar la valoración');
    }
  }, [user, loadFromStorage, saveToStorage, loadRatings, showSuccess, showError]);

  // Reportar rating
  const reportRating = useCallback(async (ratingId: string, reason: string) => {
    if (!user) return;

    try {
      const allRatings = loadFromStorage('ratings') || [];
      const ratingIndex = allRatings.findIndex((r: Rating) => r.id === ratingId);

      if (ratingIndex >= 0) {
        allRatings[ratingIndex] = {
          ...allRatings[ratingIndex],
          reported: true
        };

        // Guardar reporte
        const reports = loadFromStorage('reports') || [];
        reports.push({
          id: `report_${Date.now()}`,
          ratingId,
          reporterId: user.id,
          reason,
          timestamp: Date.now()
        });

        saveToStorage('ratings', allRatings);
        saveToStorage('reports', reports);
        
        showSuccess('Reporte enviado. Será revisado por nuestro equipo.');
      }
    } catch (err) {
      showError('Error al reportar la valoración');
    }
  }, [user, loadFromStorage, saveToStorage, showSuccess, showError]);

  // Moderar rating (solo para administradores)
  const moderateRating = useCallback(async (ratingId: string, action: 'approve' | 'reject', note?: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      const allRatings = loadFromStorage('ratings') || [];
      const ratingIndex = allRatings.findIndex((r: Rating) => r.id === ratingId);

      if (ratingIndex >= 0) {
        allRatings[ratingIndex] = {
          ...allRatings[ratingIndex],
          moderated: true,
          moderatorNote: note
        };

        if (action === 'reject') {
          // Marcar como rechazado pero no eliminar para auditoría
          allRatings[ratingIndex].reported = true;
        }

        saveToStorage('ratings', allRatings);
        await loadRatings();
        showSuccess(`Valoración ${action === 'approve' ? 'aprobada' : 'rechazada'}`);
      }
    } catch (err) {
      showError('Error al moderar la valoración');
    }
  }, [user, loadFromStorage, saveToStorage, loadRatings, showSuccess, showError]);

  // Votar utilidad
  const voteHelpful = useCallback(async (ratingId: string, helpful: boolean) => {
    if (!user) return;

    try {
      const allRatings = loadFromStorage('ratings') || [];
      const ratingIndex = allRatings.findIndex((r: Rating) => r.id === ratingId);

      if (ratingIndex >= 0) {
        const currentHelpful = allRatings[ratingIndex].helpful || 0;
        allRatings[ratingIndex].helpful = helpful ? currentHelpful + 1 : Math.max(0, currentHelpful - 1);

        // Guardar voto del usuario
        const votes = loadFromStorage('helpful_votes') || {};
        votes[`${user.id}_${ratingId}`] = helpful;

        saveToStorage('ratings', allRatings);
        saveToStorage('helpful_votes', votes);
        await loadRatings();
      }
    } catch (err) {
      showError('Error al votar');
    }
  }, [user, loadFromStorage, saveToStorage, loadRatings, showError]);

  // Obtener ratings para una herramienta específica
  const getRatingsForTool = useCallback((toolName: string): Rating[] => {
    return ratings.filter(r => r.toolName === toolName && !r.reported);
  }, [ratings]);

  // Obtener estadísticas para una herramienta específica
  const getStatsForTool = useCallback((toolName: string): FeedbackStats => {
    return feedbackStats[toolName] || {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {},
      totalComments: 0,
      helpfulVotes: 0
    };
  }, [feedbackStats]);

  // Cargar datos iniciales
  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const value: FeedbackContextType = {
    ratings,
    userRatings,
    feedbackStats,
    submitRating,
    updateRating,
    deleteRating,
    reportRating,
    moderateRating,
    voteHelpful,
    getRatingsForTool,
    getStatsForTool,
    loadRatings,
    isLoading,
    error
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export default FeedbackContext;