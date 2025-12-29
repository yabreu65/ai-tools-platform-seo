'use client';

import React, { useState } from 'react';
import { X, Search, Settings, RotateCcw, Keyboard } from 'lucide-react';
import { useKeyboardShortcut } from '@/contexts/KeyboardShortcutContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ShortcutsOverlay() {
  const {
    shortcuts,
    showShortcutsOverlay,
    setShowShortcutsOverlay,
    enableShortcut,
    disableShortcut,
    updateShortcut,
    resetShortcuts
  } = useKeyboardShortcut();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState<string[]>([]);

  // Agrupar atajos por categoría
  const categories = ['Todos', ...Array.from(new Set(shortcuts.map(s => s.category)))];
  
  const filteredShortcuts = shortcuts.filter(shortcut => {
    const matchesSearch = shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.keys.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || shortcut.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    if (!editingShortcut) return;
    
    e.preventDefault();
    const key = e.key;
    
    if (key === 'Escape') {
      setEditingShortcut(null);
      setNewKeys([]);
      return;
    }
    
    if (key === 'Enter') {
      if (newKeys.length > 0) {
        updateShortcut(editingShortcut, newKeys);
        setEditingShortcut(null);
        setNewKeys([]);
      }
      return;
    }
    
    // Construir combinación de teclas
    const keys: string[] = [];
    if (e.metaKey) keys.push('Cmd');
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    
    if (!['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
      keys.push(key);
    }
    
    setNewKeys(keys);
  };

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      const keyMap: Record<string, string> = {
        'Meta': '⌘',
        'Cmd': '⌘',
        'Control': '⌃',
        'Ctrl': '⌃',
        'Alt': '⌥',
        'Shift': '⇧',
        ' ': 'Space',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowLeft': '←',
        'ArrowRight': '→',
        'Enter': '↵',
        'Escape': '⎋',
        'Backspace': '⌫',
        'Delete': '⌦',
        'Tab': '⇥'
      };
      return keyMap[key] || key.toUpperCase();
    }).join(' + ');
  };

  if (!showShortcutsOverlay) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={() => setShowShortcutsOverlay(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyCapture}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Keyboard className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Atajos de Teclado
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={resetShortcuts}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                title="Restablecer atajos por defecto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
              <button
                onClick={() => setShowShortcutsOverlay(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar atajos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="flex-1 overflow-y-auto p-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {category}
                  <span className="ml-2 text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {categoryShortcuts.length}
                  </span>
                </h3>
                
                <div className="grid gap-3">
                  {categoryShortcuts.map(shortcut => (
                    <div
                      key={shortcut.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                        shortcut.enabled
                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                          : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {editingShortcut === shortcut.id ? (
                              <div className="flex items-center space-x-2">
                                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-mono border-2 border-blue-300 dark:border-blue-600">
                                  {newKeys.length > 0 ? formatKeys(newKeys) : 'Presiona teclas...'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Presiona Enter para guardar, Esc para cancelar
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                {shortcut.keys.map((key, index) => (
                                  <React.Fragment key={index}>
                                    {index > 0 && <span className="text-gray-400 text-sm">+</span>}
                                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-mono">
                                      {formatKeys([key])}
                                    </kbd>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {shortcut.description}
                            </p>
                            {shortcut.global && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                Global
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            if (editingShortcut === shortcut.id) {
                              setEditingShortcut(null);
                              setNewKeys([]);
                            } else {
                              setEditingShortcut(shortcut.id);
                              setNewKeys(shortcut.keys);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          title="Editar atajo"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shortcut.enabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                enableShortcut(shortcut.id);
                              } else {
                                disableShortcut(shortcut.id);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredShortcuts.length === 0 && (
              <div className="text-center py-12">
                <Keyboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No se encontraron atajos
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Intenta con otros términos de búsqueda o cambia la categoría
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">⌘</kbd>
                  <span>+</span>
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">?</kbd>
                  <span>para abrir este panel</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">⎋</kbd>
                  <span>para cerrar</span>
                </div>
              </div>
              <div>
                {shortcuts.filter(s => s.enabled).length} de {shortcuts.length} atajos activos
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}