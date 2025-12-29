'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  action: () => void;
  category: string;
  enabled: boolean;
  global?: boolean;
}

interface KeyboardShortcutContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  showShortcutsOverlay: boolean;
  setShowShortcutsOverlay: (show: boolean) => void;
  customShortcuts: Record<string, string[]>;
  updateShortcut: (id: string, keys: string[]) => void;
  resetShortcuts: () => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

// Función para normalizar teclas
const normalizeKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'Meta': 'Cmd',
    'Control': 'Ctrl',
    'Alt': 'Alt',
    'Shift': 'Shift',
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
    'Escape': 'Esc',
    'Backspace': '⌫',
    'Delete': 'Del',
    'Tab': '⇥'
  };
  
  return keyMap[key] || key.toUpperCase();
};

// Función para verificar si una combinación de teclas coincide
const keysMatch = (pressed: string[], shortcut: string[]): boolean => {
  if (pressed.length !== shortcut.length) return false;
  
  const normalizedPressed = pressed.map(normalizeKey).sort();
  const normalizedShortcut = shortcut.map(normalizeKey).sort();
  
  return normalizedPressed.every((key, index) => key === normalizedShortcut[index]);
};

export function KeyboardShortcutProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, string[]>>({});
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Cargar atajos personalizados del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ya-tools-custom-shortcuts');
    if (saved) {
      setCustomShortcuts(JSON.parse(saved));
    }
  }, []);

  // Guardar atajos personalizados en localStorage
  useEffect(() => {
    localStorage.setItem('ya-tools-custom-shortcuts', JSON.stringify(customShortcuts));
  }, [customShortcuts]);

  // Registrar atajos globales por defecto
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        id: 'search',
        keys: ['Cmd', 'K'],
        description: 'Abrir búsqueda global',
        action: () => {
          // Esta acción será manejada por el componente GlobalSearch
          const event = new CustomEvent('open-global-search');
          window.dispatchEvent(event);
        },
        category: 'Navegación',
        enabled: true,
        global: true
      },
      {
        id: 'home',
        keys: ['Cmd', 'H'],
        description: 'Ir al inicio',
        action: () => router.push('/'),
        category: 'Navegación',
        enabled: true,
        global: true
      },
      {
        id: 'tools',
        keys: ['Cmd', 'T'],
        description: 'Ir a herramientas',
        action: () => router.push('/herramientas'),
        category: 'Navegación',
        enabled: true,
        global: true
      },
      {
        id: 'dashboard',
        keys: ['Cmd', 'D'],
        description: 'Ir al dashboard',
        action: () => router.push('/dashboard'),
        category: 'Navegación',
        enabled: true,
        global: true
      },
      {
        id: 'help',
        keys: ['Cmd', '?'],
        description: 'Mostrar atajos de teclado',
        action: () => setShowShortcutsOverlay(true),
        category: 'Ayuda',
        enabled: true,
        global: true
      },
      {
        id: 'close-overlay',
        keys: ['Escape'],
        description: 'Cerrar overlay/modal',
        action: () => {
          setShowShortcutsOverlay(false);
          // Enviar evento para cerrar otros overlays
          const event = new CustomEvent('close-overlays');
          window.dispatchEvent(event);
        },
        category: 'General',
        enabled: true,
        global: true
      },
      {
        id: 'focus-main',
        keys: ['Alt', 'M'],
        description: 'Enfocar contenido principal',
        action: () => {
          const main = document.querySelector('main');
          if (main) {
            (main as HTMLElement).focus();
          }
        },
        category: 'Accesibilidad',
        enabled: true,
        global: true
      },
      {
        id: 'skip-to-content',
        keys: ['Alt', 'S'],
        description: 'Saltar al contenido',
        action: () => {
          const skipLink = document.querySelector('[data-skip-link]');
          if (skipLink) {
            (skipLink as HTMLElement).click();
          }
        },
        category: 'Accesibilidad',
        enabled: true,
        global: true
      }
    ];

    // Registrar atajos por defecto si no existen
    setShortcuts(prev => {
      const existingIds = prev.map(s => s.id);
      const newShortcuts = defaultShortcuts.filter(s => !existingIds.includes(s.id));
      return [...prev, ...newShortcuts];
    });
  }, [router]);

  // Manejar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar atajos cuando se está escribiendo en inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement ||
          (e.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      setPressedKeys(prev => new Set([...prev, e.key]));

      // Buscar atajo coincidente
      const currentKeys = Array.from(pressedKeys).concat(e.key);
      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.enabled && keysMatch(currentKeys, shortcut.keys)
      );

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
        setPressedKeys(new Set());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    // Limpiar teclas presionadas cuando se pierde el foco
    const handleBlur = () => {
      setPressedKeys(new Set());
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [shortcuts, pressedKeys]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      const filtered = prev.filter(s => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  const enableShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: true } : s
    ));
  }, []);

  const disableShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: false } : s
    ));
  }, []);

  const updateShortcut = useCallback((id: string, keys: string[]) => {
    setCustomShortcuts(prev => ({ ...prev, [id]: keys }));
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, keys } : s
    ));
  }, []);

  const resetShortcuts = useCallback(() => {
    setCustomShortcuts({});
    // Recargar atajos por defecto
    window.location.reload();
  }, []);

  const value: KeyboardShortcutContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    enableShortcut,
    disableShortcut,
    showShortcutsOverlay,
    setShowShortcutsOverlay,
    customShortcuts,
    updateShortcut,
    resetShortcuts
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcut() {
  const context = useContext(KeyboardShortcutContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcut must be used within a KeyboardShortcutProvider');
  }
  return context;
}

// Hook para registrar atajos específicos de componente
export function useShortcutRegistration(shortcut: KeyboardShortcut) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcut();

  useEffect(() => {
    registerShortcut(shortcut);
    return () => unregisterShortcut(shortcut.id);
  }, [shortcut, registerShortcut, unregisterShortcut]);
}

// Hook para crear atajos temporales
export function useTemporaryShortcut(
  keys: string[], 
  action: () => void, 
  enabled: boolean = true,
  description: string = 'Atajo temporal'
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcut();

  useEffect(() => {
    if (enabled) {
      const shortcut: KeyboardShortcut = {
        id: `temp-${Date.now()}`,
        keys,
        description,
        action,
        category: 'Temporal',
        enabled: true
      };
      
      registerShortcut(shortcut);
      return () => unregisterShortcut(shortcut.id);
    }
  }, [keys, action, enabled, description, registerShortcut, unregisterShortcut]);
}