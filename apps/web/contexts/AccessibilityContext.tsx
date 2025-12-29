'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  focusVisible: boolean;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  colorBlindFriendly: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  applySettings: () => void;
  isAccessibilityMenuOpen: boolean;
  setIsAccessibilityMenuOpen: (open: boolean) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  focusVisible: true,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  colorBlindFriendly: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Error loading accessibility settings:', error);
      }
    }

    // Detectar preferencias del sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast
      }));
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings();
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    // Alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Movimiento reducido
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Tamaño de fuente
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Foco visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Optimización para screen readers
    if (settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }

    // Navegación por teclado
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // Amigable para daltonismo
    if (settings.colorBlindFriendly) {
      root.classList.add('colorblind-friendly');
    } else {
      root.classList.remove('colorblind-friendly');
    }

    // Aplicar CSS custom properties
    root.style.setProperty('--font-scale', getFontScale(settings.fontSize));
  };

  const getFontScale = (fontSize: AccessibilitySettings['fontSize']) => {
    const scales = {
      'small': '0.875',
      'medium': '1',
      'large': '1.125',
      'extra-large': '1.25'
    };
    return scales[fontSize];
  };

  // Configurar listeners para cambios de preferencias del sistema
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];

    const handleMediaChange = () => {
      const prefersReducedMotion = mediaQueries[0].matches;
      const prefersHighContrast = mediaQueries[1].matches;
      
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast
      }));
    };

    mediaQueries.forEach(mq => mq.addEventListener('change', handleMediaChange));
    
    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleMediaChange));
    };
  }, []);

  // Atajos de teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A: Abrir menú de accesibilidad
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsAccessibilityMenuOpen(prev => !prev);
      }
      
      // Alt + C: Toggle alto contraste
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        updateSetting('highContrast', !settings.highContrast);
      }
      
      // Alt + R: Toggle movimiento reducido
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        updateSetting('reducedMotion', !settings.reducedMotion);
      }
      
      // Alt + +: Aumentar tamaño de fuente
      if (e.altKey && e.key === '=') {
        e.preventDefault();
        const sizes: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(settings.fontSize);
        if (currentIndex < sizes.length - 1) {
          updateSetting('fontSize', sizes[currentIndex + 1]);
        }
      }
      
      // Alt + -: Disminuir tamaño de fuente
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        const sizes: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(settings.fontSize);
        if (currentIndex > 0) {
          updateSetting('fontSize', sizes[currentIndex - 1]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings]);

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    applySettings,
    isAccessibilityMenuOpen,
    setIsAccessibilityMenuOpen
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}