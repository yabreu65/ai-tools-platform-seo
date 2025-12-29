'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface PlanLimits {
  analysesPerMonth: number;
  exportsPerMonth: number;
  savedAnalyses: number;
  contentAnalysesPerMonth: number;
  imageCompressionPerMonth: number;
  maxImageSize: number; // en bytes
  maxImagesPerBatch: number;
  toolsAccess: string[];
  features: string[];
}

export interface UserPlan {
  id: string;
  name: string;
  type: 'free' | 'pro' | 'enterprise';
  limits: PlanLimits;
  price: number;
}

export interface PlanUsage {
  analysesThisMonth: number;
  exportsThisMonth: number;
  savedAnalysesCount: number;
  contentAnalysesThisMonth: number;
  imageCompressionsThisMonth: number;
  lastResetDate: string;
}

interface PlanContextType {
  currentPlan: UserPlan | null;
  usage: PlanUsage | null;
  canUseFeature: (feature: string) => boolean;
  canCreateAnalysis: () => boolean;
  canCreateContentAnalysis: () => boolean;
  canCompressImages: (imageCount: number) => boolean;
  canExport: () => boolean;
  canSaveAnalysis: () => boolean;
  incrementUsage: (type: 'analysis' | 'export' | 'save' | 'content-analysis' | 'image-compression') => void;
  loading: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// Planes predefinidos
const PLANS: Record<string, UserPlan> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    type: 'free',
    limits: {
      analysesPerMonth: 10,
      exportsPerMonth: 3,
      savedAnalyses: 5,
      contentAnalysesPerMonth: 2, // 2 verificaciones por mes para detector de contenido duplicado
      imageCompressionPerMonth: 10, // 10 compresiones por mes
      maxImageSize: 2 * 1024 * 1024, // 2MB por imagen
      maxImagesPerBatch: 3, // máximo 3 imágenes por lote
      toolsAccess: ['generador-titulo-seo', 'keyword-scraper', 'seo-audit', 'optimizador-contenido', 'detector-contenido-duplicado', 'compresor-imagenes'],
      features: ['basic-analysis', 'basic-export', 'content-analysis', 'duplicate-detection', 'image-compression']
    },
    price: 0
  },
  pro: {
    id: 'pro',
    name: 'Profesional',
    type: 'pro',
    limits: {
      analysesPerMonth: 100,
      exportsPerMonth: 50,
      savedAnalyses: 100,
      contentAnalysesPerMonth: -1, // Ilimitado
      imageCompressionPerMonth: 100, // 100 compresiones por mes
      maxImageSize: 5 * 1024 * 1024, // 5MB por imagen
      maxImagesPerBatch: 10, // máximo 10 imágenes por lote
      toolsAccess: ['*'], // Acceso a todas las herramientas
      features: ['advanced-analysis', 'premium-export', 'custom-templates', 'priority-support', 'premium-content-analysis', 'duplicate-detection', 'deep-duplicate-analysis', 'detailed-duplicate-reports', 'rewrite-suggestions', 'continuous-monitoring', 'image-compression']
    },
    price: 29
  },
  enterprise: {
    id: 'enterprise',
    name: 'Empresarial',
    type: 'enterprise',
    limits: {
      analysesPerMonth: -1, // Ilimitado
      exportsPerMonth: -1, // Ilimitado
      savedAnalyses: -1, // Ilimitado
      contentAnalysesPerMonth: -1, // Ilimitado
      imageCompressionPerMonth: -1, // Ilimitado
      maxImageSize: 20 * 1024 * 1024, // 20MB por imagen
      maxImagesPerBatch: 50, // máximo 50 imágenes por lote
      toolsAccess: ['*'],
      features: ['unlimited-analysis', 'white-label', 'api-access', 'dedicated-support', 'premium-content-analysis', 'duplicate-detection', 'deep-duplicate-analysis', 'detailed-duplicate-reports', 'rewrite-suggestions', 'continuous-monitoring', 'image-compression']
    },
    price: 99
  }
};

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // En una implementación real, esto vendría de la API
      const userPlanType = user.plan || 'free';
      const plan = PLANS[userPlanType];
      setCurrentPlan(plan);

      // Cargar uso actual del usuario
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
      
      // En una implementación real, esto vendría de la API
      const mockUsage: PlanUsage = {
        analysesThisMonth: 3,
        exportsThisMonth: 1,
        savedAnalysesCount: 2,
        contentAnalysesThisMonth: 1,
        imageCompressionsThisMonth: 2,
        lastResetDate: currentMonth
      };

      setUsage(mockUsage);
    } else {
      setCurrentPlan(null);
      setUsage(null);
    }
    setLoading(false);
  }, [user]);

  const canUseFeature = (feature: string): boolean => {
    if (!currentPlan) return false;
    return currentPlan.limits.features.includes(feature);
  };

  const canCreateAnalysis = (): boolean => {
    if (!currentPlan || !usage) return false;
    if (currentPlan.limits.analysesPerMonth === -1) return true; // Ilimitado
    return usage.analysesThisMonth < currentPlan.limits.analysesPerMonth;
  };

  const canCreateContentAnalysis = (): boolean => {
    if (!currentPlan || !usage) return false;
    if (currentPlan.limits.contentAnalysesPerMonth === -1) return true; // Ilimitado
    return usage.contentAnalysesThisMonth < currentPlan.limits.contentAnalysesPerMonth;
  };

  const canCompressImages = (imageCount: number): boolean => {
    if (!currentPlan || !usage) return false;
    
    // Verificar límite mensual
    const monthlyLimit = currentPlan.limits.imageCompressionPerMonth;
    if (monthlyLimit !== -1 && usage.imageCompressionsThisMonth + imageCount > monthlyLimit) {
      return false;
    }
    
    // Verificar límite por lote
    const batchLimit = currentPlan.limits.maxImagesPerBatch;
    if (imageCount > batchLimit) {
      return false;
    }
    
    return true;
  };

  const canExport = (): boolean => {
    if (!currentPlan || !usage) return false;
    if (currentPlan.limits.exportsPerMonth === -1) return true; // Ilimitado
    return usage.exportsThisMonth < currentPlan.limits.exportsPerMonth;
  };

  const canSaveAnalysis = (): boolean => {
    if (!currentPlan || !usage) return false;
    if (currentPlan.limits.savedAnalyses === -1) return true; // Ilimitado
    return usage.savedAnalysesCount < currentPlan.limits.savedAnalyses;
  };

  const incrementUsage = (type: 'analysis' | 'export' | 'save' | 'content-analysis' | 'image-compression') => {
    if (!usage) return;

    setUsage(prev => {
      if (!prev) return prev;
      
      switch (type) {
        case 'analysis':
          return { ...prev, analysesThisMonth: prev.analysesThisMonth + 1 };
        case 'export':
          return { ...prev, exportsThisMonth: prev.exportsThisMonth + 1 };
        case 'save':
          return { ...prev, savedAnalysesCount: prev.savedAnalysesCount + 1 };
        case 'content-analysis':
          return { ...prev, contentAnalysesThisMonth: prev.contentAnalysesThisMonth + 1 };
        case 'image-compression':
          return { ...prev, imageCompressionsThisMonth: prev.imageCompressionsThisMonth + 1 };
        default:
          return prev;
      }
    });
  };

  const value: PlanContextType = {
    currentPlan,
    usage,
    canUseFeature,
    canCreateAnalysis,
    canCreateContentAnalysis,
    canCompressImages,
    canExport,
    canSaveAnalysis,
    incrementUsage,
    loading
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}