'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400 text-sm',
          className
        )}
        style={{ width, height }}
      >
        Error al cargar imagen
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={sizes}
        loading={priority ? undefined : loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : ''
        )}
      />
    </div>
  );
}

// Hook for responsive image sizes
export function useResponsiveImageSizes() {
  const getResponsiveSizes = (breakpoints: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    xl?: number;
  }) => {
    const { mobile = 100, tablet = 50, desktop = 33, xl = 25 } = breakpoints;
    
    return `(max-width: 640px) ${mobile}vw, (max-width: 768px) ${tablet}vw, (max-width: 1024px) ${desktop}vw, ${xl}vw`;
  };

  const getCardImageSizes = () => getResponsiveSizes({ mobile: 100, tablet: 50, desktop: 33 });
  const getHeroImageSizes = () => getResponsiveSizes({ mobile: 100, tablet: 100, desktop: 100 });
  const getThumbnailSizes = () => getResponsiveSizes({ mobile: 25, tablet: 20, desktop: 15 });

  return {
    getResponsiveSizes,
    getCardImageSizes,
    getHeroImageSizes,
    getThumbnailSizes,
  };
}

// Component for lazy loading images with intersection observer
export function LazyImage({ 
  src, 
  alt, 
  className, 
  ...props 
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [imgRef, setImgRef] = useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!imgRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(imgRef);

    return () => observer.disconnect();
  }, [imgRef]);

  return (
    <div ref={setImgRef} className={className}>
      {isInView ? (
        <OptimizedImage src={src} alt={alt} {...props} />
      ) : (
        <div 
          className="bg-gray-100 animate-pulse"
          style={{ width: props.width, height: props.height }}
        />
      )}
    </div>
  );
}

// Image preloader utility
export class ImagePreloader {
  private static cache = new Set<string>();

  static preload(src: string): Promise<void> {
    if (this.cache.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        this.cache.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  static preloadMultiple(sources: string[]): Promise<void[]> {
    return Promise.all(sources.map(src => this.preload(src)));
  }

  static isPreloaded(src: string): boolean {
    return this.cache.has(src);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Hook for image preloading
export function useImagePreloader() {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback(async (src: string) => {
    try {
      await ImagePreloader.preload(src);
      setPreloadedImages(prev => new Set(prev).add(src));
    } catch (error) {
      console.error('Failed to preload image:', src, error);
    }
  }, []);

  const preloadImages = useCallback(async (sources: string[]) => {
    try {
      await ImagePreloader.preloadMultiple(sources);
      setPreloadedImages(prev => {
        const newSet = new Set(prev);
        sources.forEach(src => newSet.add(src));
        return newSet;
      });
    } catch (error) {
      console.error('Failed to preload images:', error);
    }
  }, []);

  const isPreloaded = useCallback((src: string) => {
    return preloadedImages.has(src);
  }, [preloadedImages]);

  return {
    preloadImage,
    preloadImages,
    isPreloaded,
    preloadedCount: preloadedImages.size,
  };
}