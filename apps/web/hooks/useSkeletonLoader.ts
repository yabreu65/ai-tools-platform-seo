'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { useEffect, useState } from 'react';

interface UseSkeletonLoaderOptions {
  key: string;
  minLoadingTime?: number;
  delay?: number;
}

export const useSkeletonLoader = ({ 
  key, 
  minLoadingTime = 500,
  delay = 0 
}: UseSkeletonLoaderOptions) => {
  const { isLoading, setLoading } = useLoading();
  const [showSkeleton, setShowSkeleton] = useState(false);

  const startLoading = () => {
    if (delay > 0) {
      setTimeout(() => {
        setLoading(key, true);
        setShowSkeleton(true);
      }, delay);
    } else {
      setLoading(key, true);
      setShowSkeleton(true);
    }
  };

  const stopLoading = () => {
    const startTime = Date.now();
    
    setTimeout(() => {
      setLoading(key, false);
      setShowSkeleton(false);
    }, Math.max(0, minLoadingTime - (Date.now() - startTime)));
  };

  return {
    isLoading: isLoading(key),
    showSkeleton,
    startLoading,
    stopLoading
  };
};

// Hook específico para páginas de herramientas
export const useToolPageLoader = (toolName: string) => {
  return useSkeletonLoader({
    key: `tool-${toolName}`,
    minLoadingTime: 800,
    delay: 100
  });
};

// Hook para dashboard
export const useDashboardLoader = () => {
  return useSkeletonLoader({
    key: 'dashboard',
    minLoadingTime: 600
  });
};

// Hook para análisis
export const useAnalysisLoader = (analysisType: string) => {
  return useSkeletonLoader({
    key: `analysis-${analysisType}`,
    minLoadingTime: 1000,
    delay: 200
  });
};