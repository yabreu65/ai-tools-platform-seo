'use client';

import React, { useState, useEffect } from 'react';
import { useOptimization, useImageOptimization, useFontOptimization } from '@/hooks/useOptimization';
import { OptimizedImage } from './ImageOptimizer';
import { toast } from 'sonner';

export function OptimizationTest() {
  const optimization = useOptimization();
  const imageOpt = useImageOptimization();
  const fontOpt = useFontOptimization();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Test functions
  const runTests = async () => {
    const results: Record<string, boolean> = {};

    // Test 1: Performance metrics collection
    try {
      optimization.collectMetrics();
      results.performanceMetrics = true;
      toast.success('✅ Métricas de rendimiento funcionando');
    } catch (error) {
      results.performanceMetrics = false;
      toast.error('❌ Error en métricas de rendimiento');
    }

    // Test 2: Image optimization
    try {
      const format = imageOpt.getOptimalFormat('jpg');
      results.imageOptimization = imageOpt.isSupported && format !== 'jpg';
      if (results.imageOptimization) {
        toast.success(`✅ Optimización de imágenes: ${imageOpt.formats.join(', ')}`);
      } else {
        toast.warning('⚠️ Optimización de imágenes limitada');
      }
    } catch (error) {
      results.imageOptimization = false;
      toast.error('❌ Error en optimización de imágenes');
    }

    // Test 3: Font optimization
    try {
      results.fontOptimization = 'fonts' in document;
      if (results.fontOptimization) {
        toast.success(`✅ Optimización de fuentes: ${fontOpt.fontsLoaded ? 'Cargadas' : 'Cargando'}`);
      } else {
        toast.warning('⚠️ API de fuentes no soportada');
      }
    } catch (error) {
      results.fontOptimization = false;
      toast.error('❌ Error en optimización de fuentes');
    }

    // Test 4: Service Worker
    try {
      results.serviceWorker = 'serviceWorker' in navigator;
      if (results.serviceWorker) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          toast.success('✅ Service Worker activo');
        } else {
          toast.info('ℹ️ Service Worker disponible pero no registrado');
        }
      } else {
        toast.warning('⚠️ Service Worker no soportado');
      }
    } catch (error) {
      results.serviceWorker = false;
      toast.error('❌ Error verificando Service Worker');
    }

    // Test 5: Lazy loading
    try {
      results.lazyLoading = 'IntersectionObserver' in window;
      if (results.lazyLoading) {
        toast.success('✅ Lazy loading disponible');
      } else {
        toast.warning('⚠️ IntersectionObserver no soportado');
      }
    } catch (error) {
      results.lazyLoading = false;
      toast.error('❌ Error en lazy loading');
    }

    // Test 6: Critical CSS
    try {
      const criticalStyles = document.querySelector('style[data-critical]');
      results.criticalCSS = !!criticalStyles;
      if (results.criticalCSS) {
        toast.success('✅ Critical CSS inyectado');
      } else {
        toast.info('ℹ️ Critical CSS no detectado');
      }
    } catch (error) {
      results.criticalCSS = false;
      toast.error('❌ Error verificando Critical CSS');
    }

    // Test 7: Performance Observer
    try {
      results.performanceObserver = 'PerformanceObserver' in window;
      if (results.performanceObserver) {
        toast.success('✅ Performance Observer disponible');
      } else {
        toast.warning('⚠️ Performance Observer no soportado');
      }
    } catch (error) {
      results.performanceObserver = false;
      toast.error('❌ Error en Performance Observer');
    }

    setTestResults(results);

    // Summary
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    if (passedTests === totalTests) {
      toast.success(`🎉 Todas las optimizaciones funcionan (${passedTests}/${totalTests})`);
    } else if (passedTests >= totalTests * 0.8) {
      toast.success(`✅ La mayoría de optimizaciones funcionan (${passedTests}/${totalTests})`);
    } else {
      toast.warning(`⚠️ Algunas optimizaciones necesitan atención (${passedTests}/${totalTests})`);
    }
  };

  const testImages = [
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20web%20performance%20dashboard&image_size=landscape_4_3',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=seo%20tools%20interface&image_size=square',
    'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=optimization%20metrics&image_size=portrait_4_3',
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Prueba de Optimizaciones
        </h1>
        <p className="text-gray-600">
          Verifica que todas las optimizaciones de rendimiento estén funcionando correctamente
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ejecutar Pruebas</h2>
          <button
            onClick={runTests}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ejecutar Todas las Pruebas
          </button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(testResults).map(([test, passed]) => (
              <div
                key={test}
                className={`p-3 rounded-lg border ${
                  passed 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {passed ? '✅' : '❌'}
                  </span>
                  <span className="font-medium capitalize">
                    {test.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Métricas de Rendimiento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {optimization.metrics.performanceScore}
            </div>
            <div className="text-sm text-gray-600">Puntuación</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(optimization.metrics.loadTime / 1000).toFixed(2)}s
            </div>
            <div className="text-sm text-gray-600">Tiempo de Carga</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {optimization.metrics.resourceCount}
            </div>
            <div className="text-sm text-gray-600">Recursos</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {optimization.metrics.cacheHitRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Cache Hit Rate</div>
          </div>
        </div>
      </div>

      {/* Image Optimization Test */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Prueba de Optimización de Imágenes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testImages.map((src, index) => (
            <div key={index} className="space-y-2">
              <OptimizedImage
                src={src}
                alt={`Test image ${index + 1}`}
                width={300}
                height={200}
                className="rounded-lg"
                priority={index === 0}
              />
              <p className="text-sm text-gray-600 text-center">
                Imagen {index + 1} - Optimizada
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Estado de Optimización de Imágenes:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Formatos soportados: {imageOpt.formats.join(', ') || 'Ninguno'}</li>
            <li>• WebP soportado: {imageOpt.formats.includes('webp') ? '✅' : '❌'}</li>
            <li>• AVIF soportado: {imageOpt.formats.includes('avif') ? '✅' : '❌'}</li>
          </ul>
        </div>
      </div>

      {/* Font Optimization Test */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Prueba de Optimización de Fuentes</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg font-sans">
              <h3 className="font-bold mb-2">Inter (Sans-serif)</h3>
              <p className="text-sm">Esta es una prueba de la fuente Inter optimizada.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg font-mono">
              <h3 className="font-bold mb-2">Roboto Mono</h3>
              <p className="text-sm">Esta es una prueba de la fuente monoespaciada.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <h3 className="font-bold mb-2">Poppins</h3>
              <p className="text-sm">Esta es una prueba de la fuente Poppins.</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Estado de Fuentes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fuentes cargadas: {fontOpt.fontsLoaded ? '✅' : '⏳ Cargando...'}</li>
              <li>• Fuentes en carga: {fontOpt.loadingFonts.length > 0 ? fontOpt.loadingFonts.join(', ') : 'Ninguna'}</li>
              <li>• API de fuentes: {'fonts' in document ? '✅ Soportada' : '❌ No soportada'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {optimization.suggestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Sugerencias de Optimización</h2>
          <ul className="space-y-2">
            {optimization.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">💡</span>
                <span className="text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={optimization.refreshMetrics}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar Métricas
        </button>
        <button
          onClick={optimization.exportMetrics}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Exportar Métricas
        </button>
        <button
          onClick={optimization.clearMessages}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Limpiar Mensajes
        </button>
      </div>
    </div>
  );
}