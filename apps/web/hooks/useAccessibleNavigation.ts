'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationOptions {
  skipToContent?: boolean;
  announceChanges?: boolean;
  focusManagement?: boolean;
  landmarkNavigation?: boolean;
}

export function useAccessibleNavigation(options: NavigationOptions = {}) {
  const router = useRouter();
  const announcementRef = useRef<HTMLDivElement | null>(null);
  const focusHistoryRef = useRef<HTMLElement[]>([]);
  
  const {
    skipToContent = true,
    announceChanges = true,
    focusManagement = true,
    landmarkNavigation = true
  } = options;

  // Crear elemento para anuncios de screen reader
  useEffect(() => {
    if (!announceChanges) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.id = 'accessibility-announcements';
    document.body.appendChild(announcement);
    announcementRef.current = announcement;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, [announceChanges]);

  // Anunciar cambios para screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges || !announcementRef.current) return;

    announcementRef.current.setAttribute('aria-live', priority);
    announcementRef.current.textContent = message;
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = '';
      }
    }, 1000);
  }, [announceChanges]);

  // Gestión de foco
  const saveFocus = useCallback(() => {
    if (!focusManagement) return;
    
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusHistoryRef.current.push(activeElement);
    }
  }, [focusManagement]);

  const restoreFocus = useCallback(() => {
    if (!focusManagement) return;
    
    const lastFocused = focusHistoryRef.current.pop();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
    }
  }, [focusManagement]);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    if (!focusManagement) return;

    const element = typeof selector === 'string' 
      ? document.querySelector(selector) as HTMLElement
      : selector;
    
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusManagement]);

  // Navegación por landmarks
  const navigateToLandmark = useCallback((landmark: string) => {
    if (!landmarkNavigation) return;

    const landmarks = {
      main: 'main, [role="main"]',
      navigation: 'nav, [role="navigation"]',
      banner: 'header, [role="banner"]',
      contentinfo: 'footer, [role="contentinfo"]',
      search: '[role="search"], .search-form',
      complementary: 'aside, [role="complementary"]'
    };

    const selector = landmarks[landmark as keyof typeof landmarks];
    if (selector) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        focusElement(element);
        announce(`Navegando a ${landmark}`);
      }
    }
  }, [landmarkNavigation, focusElement, announce]);

  // Skip links
  const createSkipLinks = useCallback(() => {
    if (!skipToContent) return;

    const existingSkipLinks = document.querySelector('#skip-links');
    if (existingSkipLinks) return;

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.id = 'skip-links';
    skipLinksContainer.className = 'fixed top-0 left-0 z-50 -translate-y-full focus-within:translate-y-0 transition-transform duration-200';

    const skipLinks = [
      { href: '#main-content', text: 'Saltar al contenido principal' },
      { href: '#main-navigation', text: 'Saltar a la navegación' },
      { href: '#search', text: 'Saltar a la búsqueda' }
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'block px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:bg-blue-700 focus:outline-none';
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.href);
        if (target) {
          (target as HTMLElement).focus();
          (target as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        }
      });

      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }, [skipToContent]);

  // Configurar navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + M: Ir al contenido principal
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        navigateToLandmark('main');
      }
      
      // Alt + N: Ir a la navegación
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        navigateToLandmark('navigation');
      }
      
      // Alt + S: Ir a la búsqueda
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        navigateToLandmark('search');
      }
      
      // Alt + H: Ir al header
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        navigateToLandmark('banner');
      }
      
      // Alt + F: Ir al footer
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        navigateToLandmark('contentinfo');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateToLandmark]);

  // Crear skip links al montar
  useEffect(() => {
    createSkipLinks();
  }, [createSkipLinks]);

  // Mejorar el orden de tabulación
  const optimizeTabOrder = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      if (!htmlElement.hasAttribute('tabindex')) {
        htmlElement.setAttribute('tabindex', '0');
      }
    });
  }, []);

  // Gestión de focus trap para modales
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Enfocar el primer elemento
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    announce,
    saveFocus,
    restoreFocus,
    focusElement,
    navigateToLandmark,
    optimizeTabOrder,
    trapFocus,
    router
  };
}