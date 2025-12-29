'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Eye,
  EyeOff,
  Type,
  Zap,
  RotateCcw,
  X,
  Contrast,
  Volume2,
  Keyboard,
  Palette
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

export function AccessibilityMenu() {
  const {
    settings,
    updateSetting,
    resetSettings,
    isAccessibilityMenuOpen,
    setIsAccessibilityMenuOpen
  } = useAccessibility();

  const fontSizeLabels = {
    'small': 'Pequeño',
    'medium': 'Mediano',
    'large': 'Grande',
    'extra-large': 'Extra Grande'
  };

  const settingsGroups = [
    {
      title: 'Visual',
      icon: Eye,
      settings: [
        {
          key: 'highContrast' as const,
          label: 'Alto Contraste',
          description: 'Mejora la visibilidad con colores de alto contraste',
          icon: Contrast,
          type: 'toggle' as const
        },
        {
          key: 'fontSize' as const,
          label: 'Tamaño de Texto',
          description: 'Ajusta el tamaño de la fuente para mejor legibilidad',
          icon: Type,
          type: 'select' as const,
          options: [
            { value: 'small', label: 'Pequeño' },
            { value: 'medium', label: 'Mediano' },
            { value: 'large', label: 'Grande' },
            { value: 'extra-large', label: 'Extra Grande' }
          ]
        },
        {
          key: 'colorBlindFriendly' as const,
          label: 'Amigable para Daltonismo',
          description: 'Usa patrones y formas además de colores',
          icon: Palette,
          type: 'toggle' as const
        }
      ]
    },
    {
      title: 'Movimiento',
      icon: Zap,
      settings: [
        {
          key: 'reducedMotion' as const,
          label: 'Movimiento Reducido',
          description: 'Reduce animaciones y transiciones',
          icon: EyeOff,
          type: 'toggle' as const
        }
      ]
    },
    {
      title: 'Navegación',
      icon: Keyboard,
      settings: [
        {
          key: 'focusVisible' as const,
          label: 'Indicadores de Foco',
          description: 'Muestra claramente el elemento enfocado',
          icon: Eye,
          type: 'toggle' as const
        },
        {
          key: 'keyboardNavigation' as const,
          label: 'Navegación por Teclado',
          description: 'Optimiza la navegación con teclado',
          icon: Keyboard,
          type: 'toggle' as const
        }
      ]
    },
    {
      title: 'Screen Reader',
      icon: Volume2,
      settings: [
        {
          key: 'screenReaderOptimized' as const,
          label: 'Optimizado para Lectores',
          description: 'Mejora la experiencia con lectores de pantalla',
          icon: Volume2,
          type: 'toggle' as const
        }
      ]
    }
  ];

  if (!isAccessibilityMenuOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={() => setIsAccessibilityMenuOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="accessibility-menu-title"
          aria-describedby="accessibility-menu-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Accessibility className="w-6 h-6 text-blue-500" />
              <div>
                <h2 id="accessibility-menu-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Configuración de Accesibilidad
                </h2>
                <p id="accessibility-menu-description" className="text-sm text-gray-600 dark:text-gray-400">
                  Personaliza la experiencia según tus necesidades
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetSettings}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Restablecer configuración"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
              <button
                onClick={() => setIsAccessibilityMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                aria-label="Cerrar menú de accesibilidad"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {settingsGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <group.icon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {group.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 pl-8">
                    {group.settings.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-start space-x-3 flex-1">
                          <setting.icon className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <label
                              htmlFor={`setting-${setting.key}`}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                            >
                              {setting.label}
                            </label>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {setting.type === 'toggle' && (
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                id={`setting-${setting.key}`}
                                type="checkbox"
                                checked={settings[setting.key] as boolean}
                                onChange={(e) => updateSetting(setting.key, e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                          )}
                          
                          {setting.type === 'select' && setting.options && (
                            <select
                              id={`setting-${setting.key}`}
                              value={settings[setting.key] as string}
                              onChange={(e) => updateSetting(setting.key, e.target.value as any)}
                              className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {setting.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Alt</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">A</kbd>
                  <span>para abrir este menú</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Alt</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">C</kbd>
                  <span>alto contraste</span>
                </div>
              </div>
              <div className="text-xs">
                Configuración guardada automáticamente
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Botón flotante para abrir el menú de accesibilidad
export function AccessibilityButton() {
  const { setIsAccessibilityMenuOpen } = useAccessibility();

  return (
    <button
      onClick={() => setIsAccessibilityMenuOpen(true)}
      className="fixed bottom-4 right-4 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
      title="Abrir configuración de accesibilidad (Alt + A)"
      aria-label="Abrir configuración de accesibilidad"
    >
      <Accessibility className="w-6 h-6" />
    </button>
  );
}