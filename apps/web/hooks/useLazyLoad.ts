'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

// Hook for intersection observer based lazy loading
export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
    delay = 0
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsIntersecting(true);
              if (triggerOnce) {
                setHasTriggered(true);
              }
            }, delay);
          } else {
            setIsIntersecting(true);
            if (triggerOnce) {
              setHasTriggered(true);
            }
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay]);

  useEffect(() => {
    if (hasTriggered && elementRef.current) {
      const observer = new IntersectionObserver(() => {});
      observer.unobserve(elementRef.current);
    }
  }, [hasTriggered]);

  return {
    elementRef,
    isIntersecting: triggerOnce ? (hasTriggered || isIntersecting) : isIntersecting,
    hasTriggered,
  };
};

// Hook for preloading resources
export const usePreload = () => {
  const preloadedResources = useRef(new Set<string>());

  const preloadScript = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
    
    preloadedResources.current.add(src);
  }, []);

  const preloadStyle = useCallback((href: string) => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
    
    preloadedResources.current.add(href);
  }, []);

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.current.has(src)) return;

    const img = new Image();
    img.src = src;
    
    preloadedResources.current.add(src);
  }, []);

  const preloadFont = useCallback((href: string, type: string = 'font/woff2') => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = type;
    link.href = href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    preloadedResources.current.add(href);
  }, []);

  return {
    preloadScript,
    preloadStyle,
    preloadImage,
    preloadFont,
  };
};

// Hook for code splitting and dynamic imports
export const useCodeSplitting = () => {
  const [loadedChunks, setLoadedChunks] = useState(new Set<string>());
  const [loadingChunks, setLoadingChunks] = useState(new Set<string>());

  const loadChunk = useCallback(async (
    chunkName: string,
    importFn: () => Promise<any>
  ) => {
    if (loadedChunks.has(chunkName) || loadingChunks.has(chunkName)) {
      return;
    }

    setLoadingChunks(prev => new Set(prev).add(chunkName));

    try {
      await importFn();
      setLoadedChunks(prev => new Set(prev).add(chunkName));
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
    } finally {
      setLoadingChunks(prev => {
        const newSet = new Set(prev);
        newSet.delete(chunkName);
        return newSet;
      });
    }
  }, [loadedChunks, loadingChunks]);

  const isChunkLoaded = useCallback((chunkName: string) => {
    return loadedChunks.has(chunkName);
  }, [loadedChunks]);

  const isChunkLoading = useCallback((chunkName: string) => {
    return loadingChunks.has(chunkName);
  }, [loadingChunks]);

  return {
    loadChunk,
    isChunkLoaded,
    isChunkLoading,
    loadedChunks: Array.from(loadedChunks),
    loadingChunks: Array.from(loadingChunks),
  };
};

// Hook for intelligent preloading based on user behavior
export const useIntelligentPreload = () => {
  const [userBehavior, setUserBehavior] = useState({
    hoveredElements: new Set<string>(),
    clickedElements: new Set<string>(),
    scrollDepth: 0,
    timeOnPage: 0,
  });

  const { preloadScript, preloadImage } = usePreload();

  useEffect(() => {
    const startTime = Date.now();
    
    const updateTimeOnPage = () => {
      setUserBehavior(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime,
      }));
    };

    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setUserBehavior(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollDepth),
      }));
    };

    const interval = setInterval(updateTimeOnPage, 1000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const trackHover = useCallback((elementId: string, preloadAction?: () => void) => {
    setUserBehavior(prev => ({
      ...prev,
      hoveredElements: new Set(prev.hoveredElements).add(elementId),
    }));

    if (preloadAction) {
      // Delay preload slightly to avoid preloading on accidental hovers
      setTimeout(preloadAction, 100);
    }
  }, []);

  const trackClick = useCallback((elementId: string) => {
    setUserBehavior(prev => ({
      ...prev,
      clickedElements: new Set(prev.clickedElements).add(elementId),
    }));
  }, []);

  const shouldPreload = useCallback((elementId: string) => {
    const { hoveredElements, timeOnPage, scrollDepth } = userBehavior;
    
    // Preload if user has hovered over element
    if (hoveredElements.has(elementId)) return true;
    
    // Preload if user has been on page for more than 3 seconds
    if (timeOnPage > 3000) return true;
    
    // Preload if user has scrolled more than 50%
    if (scrollDepth > 50) return true;
    
    return false;
  }, [userBehavior]);

  return {
    trackHover,
    trackClick,
    shouldPreload,
    userBehavior,
  };
};