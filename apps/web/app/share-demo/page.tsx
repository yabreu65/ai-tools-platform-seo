'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShareButton, ShareManager } from '@/components/share';
import { Share2, Eye, Download, Users } from 'lucide-react';

export default function ShareDemoPage() {
  const [activeTab, setActiveTab] = useState<'demo' | 'manager'>('demo');

  // Datos de ejemplo para demostrar el sistema de compartir
  const sampleData = {
    seoAnalysis: {
      score: 85,
      issues: [
        'Falta meta descripción en 3 páginas',
        'Títulos duplicados encontrados',
        'Imágenes sin atributo alt'
      ],
      recommendations: [
        'Optimizar meta descripciones para mejorar CTR',
        'Crear títulos únicos para cada página',
        'Añadir texto alternativo a todas las imágenes',
        'Mejorar velocidad de carga de la página',
        'Implementar datos estructurados'
      ],
      keywords: ['SEO', 'optimización', 'marketing digital'],
      url: 'https://ejemplo.com'
    },
    keywordResearch: {
      keywords: [
        { term: 'herramientas SEO', volume: 12000, difficulty: 45, cpc: 2.50 },
        { term: 'análisis SEO', volume: 8500, difficulty: 38, cpc: 1.80 },
        { term: 'optimización web', volume: 15000, difficulty: 52, cpc: 3.20 },
        { term: 'marketing digital', volume: 25000, difficulty: 68, cpc: 4.10 }
      ],
      totalKeywords: 150,
      avgVolume: 12500,
      avgDifficulty: 48
    }
  };

  const tabs = [
    { id: 'demo', label: 'Demo de Compartir', icon: Share2 },
    { id: 'manager', label: 'Gestor de Compartidos', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema de Compartir Resultados
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comparte tus análisis SEO con enlaces únicos, exporta resultados y gestiona 
            todos tus contenidos compartidos desde un solo lugar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'demo' && (
            <div className="space-y-8">
              {/* Características del sistema */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Características del Sistema de Compartir
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Share2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Enlaces Únicos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Genera enlaces únicos para compartir tus análisis con control de acceso y expiración.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Eye className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Páginas Públicas
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Crea páginas públicas hermosas para mostrar tus resultados con comentarios y feedback.
                    </p>
                  </div>

                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Download className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Múltiples Formatos
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Exporta resultados como imagen, PDF o JSON para diferentes necesidades.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ejemplos de uso */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Análisis SEO */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Análisis SEO Completo
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Puntuación SEO
                        </span>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {sampleData.seoAnalysis.score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${sampleData.seoAnalysis.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Problemas encontrados:
                      </h4>
                      {sampleData.seoAnalysis.issues.slice(0, 2).map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>

                  <ShareButton
                    toolName="seo-analyzer"
                    title="Análisis SEO - ejemplo.com"
                    data={sampleData.seoAnalysis}
                    description="Análisis completo de SEO con recomendaciones de optimización"
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                  />
                </div>

                {/* Investigación de palabras clave */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Investigación de Palabras Clave
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {sampleData.keywordResearch.totalKeywords}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Keywords
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {sampleData.keywordResearch.avgVolume.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Volumen Prom.
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {sampleData.keywordResearch.avgDifficulty}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Dificultad
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Top keywords:
                      </h4>
                      {sampleData.keywordResearch.keywords.slice(0, 2).map((keyword, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {keyword.term}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {keyword.volume.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ShareButton
                    toolName="keyword-research"
                    title="Investigación de Palabras Clave - Marketing Digital"
                    data={sampleData.keywordResearch}
                    description="Análisis completo de palabras clave con métricas de volumen y dificultad"
                    variant="outline"
                    size="md"
                    className="w-full justify-center"
                  />
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Cómo usar el sistema de compartir
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Para desarrolladores:
                    </h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        Importa el componente ShareButton
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        Pasa los datos del análisis como props
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        El sistema maneja automáticamente la generación de enlaces
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Para usuarios:
                    </h4>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        Haz clic en "Compartir" en cualquier resultado
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        Configura la visibilidad y opciones de acceso
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                        Comparte en redes sociales o copia el enlace
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manager' && (
            <ShareManager />
          )}
        </motion.div>
      </div>
    </div>
  );
}