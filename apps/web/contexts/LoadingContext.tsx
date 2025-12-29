'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string): boolean => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = (): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  };

  const clearAllLoading = () => {
    setLoadingStates({});
  };

  return (
    <LoadingContext.Provider value={{
      loadingStates,
      setLoading,
      isLoading,
      isAnyLoading,
      clearAllLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};