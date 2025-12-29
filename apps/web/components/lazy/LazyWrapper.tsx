'use client';

import React, { Suspense, ComponentType, lazy } from 'react';
import { ToolPageSkeleton, CardSkeleton } from '@/components/loading/SkeletonLoaders';
import ErrorBoundary from '@/components/error/ErrorBoundary';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Generic lazy wrapper with error boundary and suspense
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <CardSkeleton />,
  errorFallback,
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Tool page lazy wrapper
export const LazyToolWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LazyWrapper
      fallback={<ToolPageSkeleton />}
      errorFallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Error al cargar la herramienta</h2>
            <p className="text-muted-foreground">
              No se pudo cargar esta herramienta. Intenta recargar la página.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return function WrappedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Dynamic import helper with retry logic
export const dynamicImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3,
  delay: number = 1000
): Promise<{ default: T }> => {
  return new Promise((resolve, reject) => {
    const attemptImport = (attempt: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (attempt < retries) {
            console.warn(`Import failed, retrying... (${attempt}/${retries})`, error);
            setTimeout(() => attemptImport(attempt + 1), delay);
          } else {
            console.error('Import failed after all retries:', error);
            reject(error);
          }
        });
    };
    
    attemptImport(1);
  });
};

// Preload helper for critical components
export const preloadComponent = (importFn: () => Promise<any>) => {
  // Start loading the component but don't wait for it
  importFn().catch((error) => {
    console.warn('Preload failed:', error);
  });
};

// Intersection Observer based lazy loading
export const useIntersectionLazyLoad = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
  options: IntersectionObserverInit = { threshold: 0.1 }
) => {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !Component && !isLoading) {
          setIsLoading(true);
          importFn()
            .then((module) => {
              setComponent(() => module.default);
              setError(null);
            })
            .catch((err) => {
              setError(err);
              console.error('Lazy load failed:', err);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }
      },
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [Component, isLoading, importFn, options]);

  return { ref, Component, isLoading, error };
};