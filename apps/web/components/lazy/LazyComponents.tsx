'use client';

import { lazy } from 'react';
import { dynamicImport } from './LazyWrapper';

// Lazy load all tool pages with retry logic
export const LazySitemapGenerator = lazy(() => 
  dynamicImport(() => import('@/app/generador-sitemap/page'))
);

export const LazyRobotsGenerator = lazy(() => 
  dynamicImport(() => import('@/app/generador-robots/page'))
);

export const LazySEOAnalyzer = lazy(() => 
  dynamicImport(() => import('@/app/analizador-seo/page'))
);

export const LazyImageOptimizer = lazy(() => 
  dynamicImport(() => import('@/app/optimizador-imagenes/page'))
);

export const LazyMetaTagsGenerator = lazy(() => 
  dynamicImport(() => import('@/app/generador-meta-tags/page'))
);

export const LazySchemaGenerator = lazy(() => 
  dynamicImport(() => import('@/app/generador-schema/page'))
);

export const LazyKeywordAnalyzer = lazy(() => 
  dynamicImport(() => import('@/app/analizador-palabras-clave/page'))
);

export const LazyPageSpeedAnalyzer = lazy(() => 
  dynamicImport(() => import('@/app/analizador-velocidad/page'))
);

// Lazy load dashboard components
export const LazyDashboard = lazy(() => 
  dynamicImport(() => import('@/app/dashboard/page'))
);

export const LazyAnalytics = lazy(() => 
  dynamicImport(() => import('@/components/analytics/AnalyticsDashboard'))
);

// Lazy load heavy components
export const LazyChart = lazy(() => 
  dynamicImport(() => import('@/components/ui/chart'))
);

export const LazyDataTable = lazy(() => 
  dynamicImport(() => import('@/components/ui/data-table'))
);

// Lazy load form components
export const LazyAdvancedForm = lazy(() => 
  dynamicImport(() => import('@/components/forms/AdvancedForm'))
);

export const LazyFileUploader = lazy(() => 
  dynamicImport(() => import('@/components/ui/file-uploader'))
);

// Lazy load modal components
export const LazyModal = lazy(() => 
  dynamicImport(() => import('@/components/ui/modal'))
);

export const LazyDialog = lazy(() => 
  dynamicImport(() => import('@/components/ui/dialog'))
);

// Lazy load share components
export const LazyShareDialog = lazy(() => 
  dynamicImport(() => import('@/components/share/ShareDialog'))
);

export const LazyShareButton = lazy(() => 
  dynamicImport(() => import('@/components/share/ShareButton'))
);

// Lazy load feedback components
export const LazyFeedbackForm = lazy(() => 
  dynamicImport(() => import('@/components/feedback/FeedbackForm'))
);

export const LazyRatingComponent = lazy(() => 
  dynamicImport(() => import('@/components/feedback/StarRating'))
);

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be used soon
  import('@/app/dashboard/page').catch(() => {});
  import('@/components/analytics/AnalyticsDashboard').catch(() => {});
  import('@/components/ui/chart').catch(() => {});
};

// Preload tool components based on user behavior
export const preloadToolComponents = (toolName?: string) => {
  const toolImports: Record<string, () => Promise<any>> = {
    'sitemap': () => import('@/app/generador-sitemap/page'),
    'robots': () => import('@/app/generador-robots/page'),
    'seo': () => import('@/app/analizador-seo/page'),
    'images': () => import('@/app/optimizador-imagenes/page'),
    'meta': () => import('@/app/generador-meta-tags/page'),
    'schema': () => import('@/app/generador-schema/page'),
    'keywords': () => import('@/app/analizador-palabras-clave/page'),
    'speed': () => import('@/app/analizador-velocidad/page'),
  };

  if (toolName && toolImports[toolName]) {
    toolImports[toolName]().catch(() => {});
  } else {
    // Preload most popular tools
    toolImports.sitemap().catch(() => {});
    toolImports.seo().catch(() => {});
    toolImports.robots().catch(() => {});
  }
};