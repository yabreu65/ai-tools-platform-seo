'use client';

import React, { useEffect, useState } from 'react';
import { Inter, Roboto_Mono, Poppins } from 'next/font/google';

// Optimized font configurations
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-inter',
});

export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Only preload if used above the fold
  fallback: ['monospace'],
  variable: '--font-roboto-mono',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'arial'],
  variable: '--font-poppins',
});

// Font loading states
interface FontLoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
}

// Hook for font loading management
export function useFontLoader() {
  const [fontStates, setFontStates] = useState<Record<string, FontLoadingState>>({});

  const loadFont = async (fontFamily: string, fontWeight?: string) => {
    const fontKey = `${fontFamily}-${fontWeight || 'normal'}`;
    
    setFontStates(prev => ({
      ...prev,
      [fontKey]: { isLoading: true, isLoaded: false, hasError: false }
    }));

    try {
      if ('fonts' in document) {
        const font = new FontFace(
          fontFamily,
          `url(/fonts/${fontFamily.toLowerCase().replace(/\s+/g, '-')}-${fontWeight || 'normal'}.woff2)`,
          { weight: fontWeight || 'normal' }
        );

        await font.load();
        document.fonts.add(font);

        setFontStates(prev => ({
          ...prev,
          [fontKey]: { isLoading: false, isLoaded: true, hasError: false }
        }));
      }
    } catch (error) {
      console.error(`Failed to load font ${fontFamily}:`, error);
      setFontStates(prev => ({
        ...prev,
        [fontKey]: { isLoading: false, isLoaded: false, hasError: true }
      }));
    }
  };

  const preloadFonts = async (fonts: Array<{ family: string; weight?: string }>) => {
    await Promise.all(
      fonts.map(font => loadFont(font.family, font.weight))
    );
  };

  return {
    fontStates,
    loadFont,
    preloadFonts,
  };
}

// Font display optimization component
export function FontOptimizer({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Check if fonts are already loaded
    if (document.fonts.ready) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }

    // Preload critical fonts
    const preloadCriticalFonts = async () => {
      try {
        // Preload Inter (main font)
        await document.fonts.load('400 16px Inter');
        await document.fonts.load('500 16px Inter');
        await document.fonts.load('600 16px Inter');
        
        setFontsLoaded(true);
      } catch (error) {
        console.error('Failed to preload critical fonts:', error);
        setFontsLoaded(true); // Continue anyway
      }
    };

    preloadCriticalFonts();
  }, []);

  return (
    <div 
      className={`${inter.variable} ${robotoMono.variable} ${poppins.variable}`}
      style={{
        fontDisplay: 'swap',
        // Prevent layout shift during font loading
        fontOpticalSizing: 'auto',
      }}
    >
      {children}
    </div>
  );
}

// Critical font preloader
// Critical Font Preloader Component
export const CriticalFontPreloader: React.FC = () => {
  useEffect(() => {
    // Only preload fonts that are actually used in the application
    const preloadFont = (href: string, crossOrigin: string = 'anonymous') => {
      // Check if the font link already exists
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = crossOrigin;
      link.href = href;
      
      // Add error handling
      link.onerror = () => {
        console.warn(`Failed to preload font: ${href}`);
        // Remove the failed link
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      };
      
      document.head.appendChild(link);
    };

    // Only preload fonts that are actually available in Next.js
    // These paths should match your actual font files
    const fontsToPreload = [
      // Only include fonts that actually exist in your project
      // Remove these if they don't exist:
      // '/_next/static/media/inter-latin-400-normal.woff2',
      // '/_next/static/media/inter-latin-500-normal.woff2',
      // '/_next/static/media/inter-latin-600-normal.woff2',
    ];

    fontsToPreload.forEach(font => preloadFont(font));
  }, []);

  return null;
};

// Font loading indicator
export function FontLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (document.fonts.ready) {
      document.fonts.ready.then(() => {
        setIsLoading(false);
      });
    }

    // Fallback timeout
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }} />
    </div>
  );
}

// Utility for font metrics optimization
export const fontMetrics = {
  inter: {
    ascent: 2728,
    descent: -680,
    lineGap: 0,
    unitsPerEm: 2816,
    xHeight: 1536,
    capHeight: 2048,
  },
  robotoMono: {
    ascent: 2146,
    descent: -555,
    lineGap: 0,
    unitsPerEm: 2048,
    xHeight: 1082,
    capHeight: 1456,
  },
  poppins: {
    ascent: 1050,
    descent: -350,
    lineGap: 100,
    unitsPerEm: 1000,
    xHeight: 548,
    capHeight: 698,
  },
};

// Generate font-face CSS with optimized metrics
export function generateOptimizedFontCSS(
  fontFamily: string,
  fontPath: string,
  fontWeight: string = '400',
  fontStyle: string = 'normal'
) {
  const metrics = fontMetrics[fontFamily as keyof typeof fontMetrics];
  
  if (!metrics) {
    return `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontPath}') format('woff2');
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        font-display: swap;
      }
    `;
  }

  const { ascent, descent, lineGap, unitsPerEm } = metrics;
  const ascentOverride = Math.round((ascent / unitsPerEm) * 100);
  const descentOverride = Math.round(Math.abs(descent) / unitsPerEm * 100);
  const lineGapOverride = Math.round((lineGap / unitsPerEm) * 100);

  return `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontPath}') format('woff2');
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
      font-display: swap;
      ascent-override: ${ascentOverride}%;
      descent-override: ${descentOverride}%;
      line-gap-override: ${lineGapOverride}%;
    }
  `;
}